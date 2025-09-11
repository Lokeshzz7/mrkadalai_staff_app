import React, { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { apiRequest } from '../utils/api'
import { useOutletDetails } from '../utils/outletUtils'

const Dashboard = () => {
    const [orderInput, setOrderInput] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [orders, setOrders] = useState([]) // Orders for the current page
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [modalAction, setModalAction] = useState('')
    const [actionLoading, setActionLoading] = useState(false)
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const [ordersPerPage] = useState(10) // 10 orders per page
    const [totalOrdersCount, setTotalOrdersCount] = useState(0)
    
    // New state for home data
    const [homeData, setHomeData] = useState({
        totalRevenue: 0,
        appOrders: 0,
        manualOrders: 0,
        peakSlot: null,
        bestSellerProduct: null,
        totalRechargedAmount: 0,
        lowStockProducts: [],
        ticketsCount: 0 // Added tickets count
    })
    const [homeDataLoading, setHomeDataLoading] = useState(true)

    const { outletId } = useOutletDetails()

    // Fetch home data from API
    useEffect(() => {
        const fetchHomeData = async () => {
            if (!outletId) {
                setHomeDataLoading(false)
                return
            }

            try {
                setHomeDataLoading(true)
                const [homeResponse, ticketsResponse] = await Promise.all([
                    apiRequest('/staff/outlets/get-home-data/'),
                    apiRequest('/staff/tickets/count/') // New endpoint for ticket count
                ])
                
                if (homeResponse) {
                    setHomeData({
                        totalRevenue: homeResponse.totalRevenue || 0,
                        appOrders: homeResponse.appOrders || 0,
                        manualOrders: homeResponse.manualOrders || 0,
                        peakSlot: homeResponse.peakSlot || null,
                        bestSellerProduct: homeResponse.bestSellerProduct || null,
                        totalRechargedAmount: homeResponse.totalRechargedAmount || 0,
                        lowStockProducts: homeResponse.lowStockProducts || [],
                        ticketsCount: ticketsResponse?.count || 0
                    })
                }
            } catch (err) {
                console.error('Error fetching home data:', err)
                // Fallback if tickets endpoint fails
                try {
                    const homeResponse = await apiRequest('/staff/outlets/get-home-data/')
                    if (homeResponse) {
                        setHomeData({
                            ...homeResponse,
                            ticketsCount: 0
                        })
                    }
                } catch (fallbackErr) {
                    console.error('Error fetching fallback home data:', fallbackErr)
                }
            } finally {
                setHomeDataLoading(false)
            }
        }

        fetchHomeData()
    }, [outletId])

    // Fetch recent orders with pagination
    const fetchRecentOrders = async (page = currentPage) => {
        if (!outletId) {
            setError('Outlet ID not found')
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const response = await apiRequest(`/staff/outlets/get-recent-orders/${outletId}/?page=${page}&limit=${ordersPerPage}`)

            if (response.orders) {
                const transformedOrders = response.orders.map(order => {
                    const itemsString = order.items.map(item =>
                        `${item.name} (${item.quantity})`
                    ).join(', ')

                    const orderTime = new Date(order.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })

                    return {
                        id: `#${order.billNumber}`,
                        customer: order.customerName,
                        items: itemsString,
                        time: orderTime,
                        status: order.status.toLowerCase(),
                        billNumber: order.billNumber,
                        orderType: order.orderType,
                        paymentMode: order.paymentMode,
                        originalItems: order.items,
                        createdAt: order.createdAt
                    }
                })

                setOrders(transformedOrders)
                setTotalOrdersCount(response.total)
                setCurrentPage(response.currentPage)
            } else {
                setOrders([])
            }
            setError(null)
        } catch (err) {
            console.error('Error fetching recent orders:', err)
            setError('Failed to fetch recent orders')
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    // Initial fetch and fetch when page changes
    useEffect(() => {
        fetchRecentOrders(currentPage)
    }, [outletId, currentPage])

    // Filter orders based on search query
    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'pending'
            case 'preparing': return 'info'
            case 'completed': return 'success'
            case 'delivered': return 'success'
            case 'partially_delivered': return 'warning'
            case 'cancelled': return 'danger'
            default: return 'default'
        }
    }

    // Transform filtered orders for table display
    const recentOrders = filteredOrders.map(order => ([
        order.id,
        order.customer,
        order.items,
        order.time,
        <Badge variant={getStatusVariant(order.status)} key={order.billNumber}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
        </Badge>
    ]))

    const handleButtonClick = (value) => {
        if (value === 'clear') {
            setOrderInput('')
            setSelectedOrder(null)
            setSelectedItems([])
        } else if (value === 'backspace') {
            setOrderInput(prev => prev.slice(0, -1))
        } else if (value === 'search') {
            searchOrder()
        } else {
            setOrderInput(prev => prev + value)
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        // Only allow numbers and # symbol
        if (/^[#0-9]*$/.test(value)) {
            setOrderInput(value)
        }
    }

    const searchOrder = async () => {
        const cleanId = orderInput.replace('#', '')
        if (!cleanId) return

        try {
            setSelectedOrder({ loading: true })
            const response = await apiRequest(`/staff/outlets/get-order/${outletId}/${cleanId}/`)

            if (response.order) {
                const order = response.order
                setSelectedOrder({
                    id: `#${order.orderId}`,
                    customer: order.customerName,
                    items: order.items.map(item => ({
                        id: item.id,
                        name: item.productName,
                        quantity: item.quantity,
                        price: item.unitPrice,
                        totalPrice: item.totalPrice,
                        status: item.itemStatus,
                        description: item.productDescription
                    })),
                    status: order.orderStatus.toLowerCase(),
                    total: order.totalPrice,
                    createdAt: order.createdAt,
                    outletName: order.outletName
                })
                setSelectedItems([])
            }
        } catch (err) {
            console.error('Error fetching order:', err)
            setSelectedOrder({ notFound: true })
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchOrder()
        }
    }

    // Check if an item is delivered or if the whole order is completed
    const isItemDelivered = (itemStatus) => {
        const deliveredStatuses = ['delivered', 'completed']
        return deliveredStatuses.includes(itemStatus?.toLowerCase())
    }

    const isOrderCompleted = () => {
        if (!selectedOrder) return false
        const completedStatuses = ['completed', 'delivered', 'cancelled']
        return completedStatuses.includes(selectedOrder.status.toLowerCase())
    }

    const isOrderPartiallyDelivered = () => {
        if (!selectedOrder) return false
        return selectedOrder.status.toLowerCase() === 'partially_delivered'
    }

    const canSelectItem = (item) => {
        return !isItemDelivered(item.status) && !isOrderCompleted()
    }

    const handleItemSelection = (itemId) => {
        const item = selectedOrder.items.find(item => item.id === itemId)
        if (!canSelectItem(item)) return

        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId)
            } else {
                return [...prev, itemId]
            }
        })
    }

    const handleSelectAll = () => {
        if (isOrderCompleted()) return

        const selectableItems = selectedOrder.items.filter(canSelectItem)
        const selectableItemIds = selectableItems.map(item => item.id)

        if (selectedItems.length === selectableItemIds.length) {
            setSelectedItems([])
        } else {
            setSelectedItems(selectableItemIds)
        }
    }

    const openModal = (action) => {
        if (isOrderCompleted() && action !== 'cancel' && action !== 'partialCancel') return
        
        // Ensure there are selected items for delivery/partial delivery actions
        if ((action === 'delivered' || action === 'partially') && selectedItems.length === 0) {
            return
        }

        setModalAction(action)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setModalAction('')
    }

    const handleOrderAction = async () => {
        if (!selectedOrder || !outletId) return

        try {
            setActionLoading(true)
            const orderId = selectedOrder.id.replace('#', '')

            let status
            let requestData = {
                orderId: parseInt(orderId),
                outletId: parseInt(outletId)
            }

            switch (modalAction) {
                case 'delivered':
                    status = 'DELIVERED'
                    requestData.orderItemIds = selectedItems.map(id => parseInt(id)) // Send multiple IDs
                    break
                case 'partially':
                    status = 'PARTIALLY_DELIVERED'
                    requestData.orderItemIds = selectedItems.map(id => parseInt(id)) // Send multiple IDs
                    break
                case 'cancel':
                    status = 'CANCELLED'
                    break
                case 'partialCancel':
                    status = 'PARTIAL_CANCEL'
                    break
                default:
                    return
            }

            requestData.status = status

            const response = await apiRequest('/staff/outlets/update-order/', {
                method: 'PUT',
                body: JSON.stringify(requestData),
            })

            if (response.message) {
                console.log('Order updated successfully:', response.message)
                // Dynamically re-fetch the order to reflect the changes
                searchOrder()
                // Refresh recent orders list in background
                fetchRecentOrders(1, false)
            }
        } catch (err) {
            console.error('Error updating order:', err)
            // You could add an error toast here
        } finally {
            setActionLoading(false)
            closeModal()
        }
    }

    const getModalContent = () => {
        // Add a null check here as a safety measure
        if (!selectedOrder) return { title: '', message: '' };

        switch (modalAction) {
            case 'delivered':
                return {
                    title: 'Mark All Delivered',
                    message: 'Are you sure you want to mark all undelivered items as delivered? This will complete the order.'
                }
            case 'partially':
                const selectedItemNames = selectedOrder.items
                    .filter(item => selectedItems.includes(item.id))
                    .map(item => item.name)

                const remainingItemNames = selectedOrder.items
                    .filter(item => !selectedItems.includes(item.id) && !isItemDelivered(item.status))
                    .map(item => item.name)

                return {
                    title: 'Deliver Selected Items',
                    message: `You are about to mark only the selected items in order ${selectedOrder.id} as delivered.\n\nDelivering:\n${selectedItemNames.map(name => `• ${name}`).join('\n')}\n\n${remainingItemNames.length > 0 ? `Remaining undelivered items:\n${remainingItemNames.map(name => `• ${name}`).join('\n')}` : ''}\n\nAre you sure you want to proceed?`
                }
            case 'cancel':
                return {
                    title: 'Cancel Order',
                    message: 'Are you sure you want to cancel this entire order? This will refund the full amount and restore all item quantities to stock. This action cannot be undone.'
                }
            case 'partialCancel':
                const undeliveredItems = selectedOrder.items.filter(item => !isItemDelivered(item.status))
                const undeliveredItemNames = undeliveredItems.map(item => item.name)
                const refundAmount = undeliveredItems.reduce((total, item) => total + (item.price * item.quantity), 0)
                
                return {
                    title: 'Cancel Remaining Items',
                    message: `You are about to cancel the undelivered items in this partially delivered order. This will:\n\n• Refund ₹${refundAmount.toFixed(2)} for undelivered items\n• Restore stock for cancelled items\n• Mark order as completed\n\nItems to be cancelled:\n${undeliveredItemNames.map(name => `• ${name}`).join('\n')}\n\nDelivered items will remain delivered. This action cannot be undone.`
                }
            default:
                return { title: '', message: '' }
        }
    }
    
    // ADDED NULL CHECKS TO ALL HELPER FUNCTIONS
    const getRemainingUndeliveredItemsCount = () => {
        if (!selectedOrder || !selectedOrder.items) return 0;
        return selectedOrder.items.filter(item => !isItemDelivered(item.status)).length
    }

    const getSelectableItemsCount = () => {
        if (!selectedOrder || !selectedOrder.items) return 0;
        return selectedOrder.items.filter(canSelectItem).length;
    }

    const getDeliveredItemsCount = () => {
        if (!selectedOrder || !selectedOrder.items) return 0;
        return selectedOrder.items.filter(item => isItemDelivered(item.status)).length;
    }

    // Helper function to format currency
    const formatCurrency = (amount) => {
        if (amount === 0 || amount === null || amount === undefined) return '0'
        return amount.toLocaleString('en-IN')
    }

    const DeliverySlot = {
        SLOT_11_12: '11:00-12:00',
        SLOT_12_13: '12:00-13:00',
        SLOT_13_14: '13:00-14:00',
        SLOT_14_15: '14:00-15:00',
        SLOT_15_16: '15:00-16:00',
        SLOT_16_17: '16:00-17:00',
    };

    const formatPeakSlot = (slot) => {
        if (!slot) return 'N/A'
        return DeliverySlot[slot] || 'Invalid Slot';
    }

    const totalPages = Math.ceil(totalOrdersCount / ordersPerPage)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <Card Black className="text-center">
                    <p className="text-gray-600">Total Revenue</p>
                    <h2 className="text-2xl font-bold text-blue-600">
                        {homeDataLoading ? '...' : `₹${formatCurrency(homeData.totalRevenue)}`}
                    </h2>
                </Card>
                
                <Card Black className="text-center">
                    <p className="text-gray-600">Manual Orders</p>
                    <h2 className="text-2xl font-bold text-green-600">
                        {homeDataLoading ? '...' : homeData.manualOrders}
                    </h2>
                </Card>
                
                <Card Black className="text-center">
                    <p className="text-gray-600">App Orders</p>
                    <h2 className="text-2xl font-bold text-orange-600">
                        {homeDataLoading ? '...' : homeData.appOrders}
                    </h2>
                </Card>
                
                <Card Black className="text-center">
                    <p className="text-gray-600">Wallet Recharges</p>
                    <h2 className="text-2xl font-bold text-yellow-600">
                        {homeDataLoading ? '...' : `₹${formatCurrency(homeData.totalRechargedAmount)}`}
                    </h2>
                </Card>
                
                <Card Black className="text-center">
                    <p className="text-gray-600">Low Stock Items</p>
                    <h2 className="text-2xl font-bold text-red-600">
                        {homeDataLoading ? '...' : homeData.lowStockProducts.length}
                    </h2>
                </Card>
                
                <Card Black className="text-center">
                    <p className="text-gray-600">Tickets Raised</p>
                    <h2 className="text-2xl font-bold text-purple-600">
                        {homeDataLoading ? '...' : homeData.ticketsCount}
                    </h2>
                </Card>
                
                <Card Black className="text-center">
                    <p className="text-gray-600">Best Seller</p>
                    <h2 className="text-2xl font-bold text-pink-600">
                        {homeDataLoading ? '...' : (homeData.bestSellerProduct?.name || 'N/A')}
                    </h2>
                </Card>
                
                <Card Black className="text-center">
                    <p className="text-gray-600">Peak Order Time</p>
                    <h2 className="text-2xl font-bold text-cyan-600">
                        {homeDataLoading ? '...' : formatPeakSlot(homeData.peakSlot)}
                    </h2>
                </Card>
            </div>

            <div>
                <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6">
                    {/* Calculator Section */}
                    <Card title='Order Look UP' >
                        {/* Display Screen */}
                        <div className="bg-gray-900 text-white p-4 rounded-lg mb-4">
                            <input
                                type="text"
                                value={orderInput}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter Order ID"
                                className="w-full bg-transparent text-2xl font-mono text-right border-none outline-none placeholder-gray-400"
                                maxLength={10}
                            />
                        </div>

                        {/* Calculator Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {/* First Row */}
                            <button
                                onClick={() => handleButtonClick('clear')}
                                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded font-semibold"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => handleButtonClick('backspace')}
                                className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded font-semibold"
                            >
                                ⌫
                            </button>
                            <button
                                onClick={() => handleButtonClick('#')}
                                className="bg-gray-500 hover:bg-gray-600 text-white p-3 rounded font-semibold text-xl"
                            >
                                #
                            </button>
                            <button
                                onClick={() => handleButtonClick('search')}
                                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded font-semibold row-span-2"
                            >
                                Search
                            </button>

                            {/* Number Buttons */}
                            {[7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleButtonClick(num.toString())}
                                    className="bg-gray-300 hover:bg-gray-400 text-black p-3 rounded font-semibold text-xl"
                                >
                                    {num}
                                </button>
                            ))}

                            {[4, 5, 6].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleButtonClick(num.toString())}
                                    className="bg-gray-300 hover:bg-gray-400 text-black p-3 rounded font-semibold text-xl"
                                >
                                    {num}
                                </button>
                            ))}

                            {[0, 2, 3].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleButtonClick(num.toString())}
                                    className="bg-gray-300 hover:bg-gray-400 text-black p-3 rounded font-semibold text-xl"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={() => handleButtonClick('1')}
                                className="bg-gray-300 hover:bg-gray-400 text-black p-3 rounded font-semibold text-xl"
                            >
                                1
                            </button>
                        </div>
                    </Card>

                    {/* Order Details Section */}
                    <Card title='Order Details' >
                        {!selectedOrder ? (
                            <div>
                                <div className="text-gray-400 text-4xl mb-2"></div>
                                <p className="text-gray-500">Enter an Order ID to view details</p>
                            </div>
                        ) : selectedOrder.loading ? (
                            <div>
                                <div className="text-blue-400 text-4xl mb-2">⏳</div>
                                <p className="text-blue-600">Loading order details...</p>
                            </div>
                        ) : selectedOrder.notFound ? (
                            <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
                                <div className="text-red-400 text-4xl mb-2">❌</div>
                                <p className="text-red-600 font-semibold">Order Not Found</p>
                                <p className="text-red-500 text-sm mt-1">Please check the Order ID and try again</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden">
                                {/* The lines below are the key to the fix. We are only calculating these variables if selectedOrder exists. */}
                                {(() => {
                                        const selectableItemsCount = getSelectableItemsCount()
                                        const isDeliverAllDisabled = selectedItems.length === 0 || selectedItems.length < selectableItemsCount
                                        const isPartiallyDeliverDisabled = selectedItems.length === 0 || selectedItems.length === selectableItemsCount

                                        return (
                                            <>
                                                {/* Order Header */}
                                                <div className="bg-gray-50 p-8 border-b -m-6 mb-6">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-semibold text-lg">{selectedOrder.id}</h4>
                                                            <p className="text-gray-600">{selectedOrder.customer}</p>
                                                            {selectedOrder.outletName && (
                                                                <p className="text-sm text-blue-500">Outlet: {selectedOrder.outletName}</p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant={getStatusVariant(selectedOrder.status)}>
                                                                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1).replace('_', ' ')}
                                                            </Badge>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {new Date(selectedOrder.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Item Selection Controls */}
                                                {!isOrderCompleted() && selectableItemsCount > 0 && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="font-medium">Items Ordered:</h5>
                                                            <button
                                                                onClick={handleSelectAll}
                                                                className="text-sm text-blue-600 hover:text-blue-800"
                                                            >
                                                                {selectedItems.length === selectableItemsCount ? 'Deselect All' : 'Select All'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Show completed order message */}
                                                {isOrderCompleted() && (
                                                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                                        <div className="text-green-500 text-3xl mb-2">✅</div>
                                                        <p className="text-green-700 font-medium text-lg">
                                                            This order has been {selectedOrder.status === 'delivered' ? 'delivered' : selectedOrder.status === 'cancelled' ? 'cancelled' : 'completed'} successfully!
                                                        </p>
                                                        <p className="text-green-600 text-sm mt-1">
                                                            {selectedOrder.status === 'delivered' ? 'All items have been delivered to the customer.' :
                                                                selectedOrder.status === 'cancelled' ? 'This order has been cancelled and stock has been restored.' :
                                                                    'This order has been completed.'}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Show partially delivered order message */}
                                                {isOrderPartiallyDelivered() && !isOrderCompleted() && (
                                                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="text-yellow-500 text-2xl">⚠️</div>
                                                            <div>
                                                                <p className="text-yellow-700 font-medium">Partially Delivered Order</p>
                                                                <p className="text-yellow-600 text-sm mt-1">
                                                                    {getDeliveredItemsCount()} of {selectedOrder.items.length} items delivered. 
                                                                    {selectedOrder && selectedOrder.items && getRemainingUndeliveredItemsCount() > 0 && (
                                                                        <span> You can cancel the remaining {getRemainingUndeliveredItemsCount()} undelivered item{getRemainingUndeliveredItemsCount() > 1 ? 's' : ''} if needed.</span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Order Items with Checkboxes */}
                                                <div className="space-y-2 mb-4">
                                                    {selectedOrder.items.map((item, index) => (
                                                        <div key={index} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                                                            {!isOrderCompleted() && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedItems.includes(item.id)}
                                                                    onChange={() => handleItemSelection(item.id)}
                                                                    disabled={!canSelectItem(item)}
                                                                    className={`w-4 h-4 text-blue-600 rounded ${!canSelectItem(item) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                />
                                                            )}
                                                            <div className="flex-1 flex justify-between items-center">
                                                                <div>
                                                                    <span className={`font-medium ${isItemDelivered(item.status) ? 'text-gray-500' : ''}`}>
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="text-gray-500 ml-2">×{item.quantity}</span>
                                                                    {item.status && (
                                                                        <Badge variant={getStatusVariant(item.status.toLowerCase())} className="ml-2 text-xs">
                                                                            {item.status}
                                                                        </Badge>
                                                                    )}
                                                                    {isItemDelivered(item.status) && (
                                                                        <span className="ml-2 text-green-600 text-xs">✓</span>
                                                                    )}
                                                                </div>
                                                                <span className={`font-medium ${isItemDelivered(item.status) ? 'text-gray-500' : ''}`}>
                                                                    ₹ {item.price.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Total - Moved above action buttons */}
                                                <div className="flex justify-between items-center py-3 border-t border-gray-200 mb-4">
                                                    <span className="font-semibold text-lg">Total:</span>
                                                    <span className="font-bold text-lg text-green-600">₹ {selectedOrder.total.toFixed(2)}</span>
                                                </div>

                                                {/* Action Buttons - Show different buttons based on order status */}
                                                {!isOrderCompleted() && (
                                                    <div className="space-y-2">
                                                        {/* Normal order actions (PENDING status) */}
                                                        {selectedOrder.status.toLowerCase() === 'pending' && (
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    onClick={() => openModal('delivered')}
                                                                    disabled={isDeliverAllDisabled}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                                                >
                                                                    Mark All Delivered
                                                                </Button>
                                                                <Button
                                                                    onClick={() => openModal('partially')}
                                                                    disabled={isPartiallyDeliverDisabled}
                                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                                                >
                                                                    Deliver Selected Items
                                                                </Button>
                                                                <Button
                                                                    onClick={() => openModal('cancel')}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                                                >
                                                                    Cancel Order
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Partially delivered order actions */}
                                                        {isOrderPartiallyDelivered() && (
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    onClick={() => openModal('delivered')}
                                                                    disabled={isDeliverAllDisabled}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                                                >
                                                                    Mark All Delivered
                                                                </Button>
                                                                <Button
                                                                    onClick={() => openModal('partially')}
                                                                    disabled={isPartiallyDeliverDisabled}
                                                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                                                >
                                                                    Deliver Selected Items
                                                                </Button>
                                                                <Button
                                                                    onClick={() => openModal('partialCancel')}
                                                                    disabled={getRemainingUndeliveredItemsCount() === 0}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                                                >
                                                                    Cancel Remaining Items
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {/* Info text for partially delivered orders */}
                                                        {isOrderPartiallyDelivered() && (
                                                            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                                                                <p><strong>Tip:</strong> Use "Cancel Remaining Items" to refund and restore stock for all undelivered items, completing this order.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )
                                })()}
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div>
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Recent Orders</h2>
                        <input
                            type="text"
                            placeholder="Search by ID or Customer..."
                            className="border px-3 py-1 rounded"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">Loading recent orders...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-red-500">{error}</p>
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                {searchQuery ? 'No orders found matching your search.' : 'No recent orders found.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table
                                headers={['Order ID', 'Customer', 'Items', 'Time', 'Status']}
                                data={recentOrders}
                            />
                            
                            {/* Pagination Controls */}
                            <div className="flex justify-center items-center gap-4 mt-4">
                                <Button
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                     &lt;
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    disabled={currentPage === totalPages}
                                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    &gt;
                                </Button>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title={getModalContent().title}
                footer={
                    <div className="flex space-x-2">
                        <Button
                            onClick={closeModal}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleOrderAction}
                            disabled={actionLoading}
                            className={`px-4 py-2 rounded disabled:bg-gray-300 text-white ${
                                modalAction === 'cancel' || modalAction === 'partialCancel' 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {actionLoading ? 'Processing...' : 'Confirm'}
                        </Button>
                    </div>
                }
            >
                <div className="text-gray-600">
                    <p className="whitespace-pre-line">{getModalContent().message}</p>
                    {selectedItems.length > 0 && modalAction !== 'cancel' && modalAction !== 'partialCancel' && selectedOrder && selectedOrder.items && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="font-medium">Selected Items:</p>
                            <ul className="list-disc list-inside mt-1">
                                {selectedOrder && selectedOrder.items // ADD NULL CHECK HERE
                                    .filter(item => selectedItems.includes(item.id))
                                    .map((item, index) => (
                                        <li key={index} className="text-sm">{item.name} (×{item.quantity})</li>
                                    ))
                                }
                            </ul>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}

export default Dashboard