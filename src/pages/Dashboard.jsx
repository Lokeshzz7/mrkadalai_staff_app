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
    const [allOrders, setAllOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedItems, setSelectedItems] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [modalAction, setModalAction] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    const { outletId } = useOutletDetails()

    // ! Fake Data for low stock (should be replaced with API)
    const lowStockItems = [
        ['Tomatoes', '5 kg', '10 kg', <Badge variant="danger">Low</Badge>],
        ['Cheese', '2 kg', '8 kg', <Badge variant="danger">Critical</Badge>],
        ['Bread', '15 units', '20 units', <Badge variant="warning">Low</Badge>]
    ]

    // Fetch recent orders from API
    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!outletId) {
                setError('Outlet ID not found')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const response = await apiRequest(`/staff/outlets/get-recent-orders/${outletId}/`)

                if (response.orders) {
                    // Transform API data to match the expected format
                    const transformedOrders = response.orders.map(order => {
                        // Format items string
                        const itemsString = order.items.map(item =>
                            `${item.name} (${item.quantity})`
                        ).join(', ')

                        // Format time from createdAt
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

                    setAllOrders(transformedOrders)
                } else {
                    setAllOrders([])
                }
                setError(null)
            } catch (err) {
                console.error('Error fetching recent orders:', err)
                setError('Failed to fetch recent orders')
                setAllOrders([])
            } finally {
                setLoading(false)
            }
        }

        fetchRecentOrders()
    }, [outletId])

    // Filter orders based on search query
    const filteredOrders = allOrders.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getStatusVariant = (status) => {
        switch (status) {
            case 'pending': return 'pending'
            case 'preparing': return 'info'
            case 'completed': return 'success'
            case 'delivered': return 'success'
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
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
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
        if (isOrderCompleted() && action !== 'cancel') return
        if (action === 'cancel' || selectedItems.length > 0) {
            setModalAction(action)
            setShowModal(true)
        }
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
            let orderItemId = null

            switch (modalAction) {
                case 'delivered':
                    status = 'DELIVERED'
                    break
                case 'partially':
                    status = 'PARTIALLY_DELIVERED'
                    if (selectedItems.length === 1) {
                        orderItemId = selectedItems[0]
                    }
                    break
                case 'cancel':
                    status = 'CANCELLED'
                    break
                default:
                    return
            }

            const requestData = {
                orderId: parseInt(orderId),
                outletId: parseInt(outletId),
                status: status
            }

            if (orderItemId) {
                requestData.orderItemId = parseInt(orderItemId)
            }

            const response = await apiRequest('/staff/outlets/update-order/', {
                method: 'PUT',
                body: JSON.stringify(requestData),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.message) {
                // Update the order status locally instead of calling searchOrder
                setSelectedOrder(prevOrder => ({
                    ...prevOrder,
                    status: modalAction === 'delivered' ? 'delivered' : 
                           modalAction === 'cancel' ? 'cancelled' : prevOrder.status,
                    items: modalAction === 'delivered' ? 
                           prevOrder.items.map(item => ({ ...item, status: 'delivered' })) :
                           modalAction === 'partially' && orderItemId ?
                           prevOrder.items.map(item => 
                               selectedItems.includes(item.id) ? 
                               { ...item, status: 'delivered' } : item
                           ) :
                           prevOrder.items
                }))
                
                setSelectedItems([])
                closeModal()
                
                // Refresh recent orders list in background
                const fetchRecentOrders = async () => {
                    try {
                        const recentResponse = await apiRequest(`/staff/outlets/get-recent-orders/${outletId}/`)
                        if (recentResponse.orders) {
                            const transformedOrders = recentResponse.orders.map(order => {
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
                            setAllOrders(transformedOrders)
                        }
                    } catch (err) {
                        console.error('Error refreshing recent orders:', err)
                    }
                }
                
                // Don't await this - let it run in background
                fetchRecentOrders()
                console.log('Order updated successfully:', response.message)
            }
        } catch (err) {
            console.error('Error updating order:', err)
            // You could add an error toast here
        } finally {
            setActionLoading(false)
        }
    }

    const getModalContent = () => {
        switch (modalAction) {
            case 'delivered':
                return {
                    title: 'Mark as Delivered',
                    message: 'Are you sure you want to mark all selected items as delivered?'
                }
            case 'partially':
                const selectedItemNames = selectedOrder.items
                    .filter(item => selectedItems.includes(item.id))
                    .map(item => item.name)
                
                const remainingItemNames = selectedOrder.items
                    .filter(item => !selectedItems.includes(item.id) && !isItemDelivered(item.status))
                    .map(item => item.name)

                return {
                    title: 'Mark as Partially Delivered',
                    message: `You are about to mark only the selected items in order ${selectedOrder.id} as delivered. Remaining items will stay not delivered until further action.\n\nDelivered items will be updated:\n${selectedItemNames.map(name => `• ${name} will be delivered`).join('\n')}\n\n${remainingItemNames.length > 0 ? `Items that need more time to deliver:\n${remainingItemNames.map(name => `• ${name} needs some time to deliver`).join('\n')}` : ''}\n\nAre you sure you want to proceed?`
                }
            case 'cancel':
                return {
                    title: 'Cancel Order',
                    message: 'Are you sure you want to cancel this entire order? This action cannot be undone.'
                }
            default:
                return { title: '', message: '' }
        }
    }

    const getRemainingUndeliveredItemsCount = () => {
        if (!selectedOrder) return 0
        return selectedOrder.items.filter(item => !isItemDelivered(item.status)).length
    }


    const getSelectableItemsCount = () => {
        if (!selectedOrder) return 0
        return selectedOrder.items.filter(canSelectItem).length
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <Card Black className="text-center">
                    <p className="text-gray-600">Today's Sales</p>
                    <h2 className="text-2xl font-bold text-blue-600">45</h2>
                </Card>
                <Card Black className="text-center">
                    <p className="text-gray-600">Manual Orders</p>
                    <h2 className="text-2xl font-bold text-green-600">340</h2>
                </Card>
                <Card Black className="text-center">
                    <p className="text-gray-600">App Orders</p>
                    <h2 className="text-2xl font-bold text-orange-600">23</h2>
                </Card>
                <Card Black className="text-center">
                    <p className="text-gray-600">Wallet Recharges</p>
                    <h2 className="text-2xl font-bold text-yellow-600">12</h2>
                </Card>
                <Card Black className="text-center">
                    <p className="text-gray-600">Low Stock Items</p>
                    <h2 className="text-2xl font-bold text-red-600">3</h2>
                </Card>
                <Card Black className="text-center">
                    <p className="text-gray-600">Refund Requests</p>
                    <h2 className="text-2xl font-bold text-purple-600">64</h2>
                </Card>
                <Card Black className="text-center">
                    <p className="text-gray-600">Best Seller</p>
                    <h2 className="text-2xl font-bold text-pink-600">Biryani</h2>
                </Card>
                <Card Black className="text-center">
                    <p className="text-gray-600">Peak Order Time</p>
                    <h2 className="text-2xl font-bold text-cyan-600">11 am - 1 pm</h2>
                </Card>
            </div>

            <div>
                <Card>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Calculator Section */}
                        <Card title='Order Look UP'>
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
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold text-xl"
                                    >
                                        {num}
                                    </button>
                                ))}

                                {[4, 5, 6].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handleButtonClick(num.toString())}
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold text-xl"
                                    >
                                        {num}
                                    </button>
                                ))}

                                {[1, 2, 3].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handleButtonClick(num.toString())}
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold text-xl"
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => handleButtonClick('0')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold text-xl"
                                >
                                    0
                                </button>
                            </div>
                        </Card>

                        {/* Order Details Section */}
                        <Card title='Order Details'>
                            {!selectedOrder ? (
                                <Card className="bg-gray-50 p-8 rounded-lg text-center">
                                    <div className="text-gray-400 text-4xl mb-2">📋</div>
                                    <p className="text-gray-500">Enter an Order ID to view details</p>
                                </Card>
                            ) : selectedOrder.loading ? (
                                <Card className="bg-blue-50 p-8 rounded-lg text-center">
                                    <div className="text-blue-400 text-4xl mb-2">⏳</div>
                                    <p className="text-blue-600">Loading order details...</p>
                                </Card>
                            ) : selectedOrder.notFound ? (
                                <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
                                    <div className="text-red-400 text-4xl mb-2">❌</div>
                                    <p className="text-red-600 font-semibold">Order Not Found</p>
                                    <p className="text-red-500 text-sm mt-1">Please check the Order ID and try again</p>
                                </div>
                            ) : (
                                <Card className="overflow-hidden">
                                    {/* Order Header */}
                                    <div className="bg-gray-50 p-4 border-b -m-6 mb-6">
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
                                                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                                </Badge>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(selectedOrder.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Item Selection Controls */}
                                    {!isOrderCompleted() && getSelectableItemsCount() > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h5 className="font-medium">Items Ordered:</h5>
                                                <button
                                                    onClick={handleSelectAll}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    {selectedItems.length === getSelectableItemsCount() ? 'Deselect All' : 'Select All'}
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
                                                 selectedOrder.status === 'cancelled' ? 'This order has been cancelled.' : 
                                                 'This order has been completed.'}
                                            </p>
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

                                    {/* Action Buttons - Only show if order is not completed */}
                                    {!isOrderCompleted() && (
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => openModal('delivered')}
                                                disabled={selectedItems.length === 0}
                                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                            >
                                                Mark Delivered
                                            </Button>
                                            <Button
                                                onClick={() => openModal('partially')}
                                                disabled={selectedItems.length === 0 ||getRemainingUndeliveredItemsCount() <= 1}
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                                            >
                                                Partially Delivered
                                            </Button>
                                            <Button
                                                onClick={() => openModal('cancel')}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                                            >
                                                Cancel Order
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            )}
                        </Card>
                    </div>
                </Card>
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
                        <Table
                            headers={['Order ID', 'Customer', 'Items', 'Time', 'Status']}
                            data={recentOrders}
                        />
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
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                        >
                            {actionLoading ? 'Processing...' : 'Confirm'}
                        </Button>
                    </div>
                }
            >
                <div className="text-gray-600">
                    <p className="whitespace-pre-line">{getModalContent().message}</p>
                    {selectedItems.length > 0 && modalAction !== 'cancel' && modalAction !== 'partially' && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="font-medium">Selected Items:</p>
                            <ul className="list-disc list-inside mt-1">
                                {selectedOrder.items
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