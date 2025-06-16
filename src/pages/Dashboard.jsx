import React, { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import { apiRequest } from '../utils/api'
import { useOutletDetails } from '../utils/outletUtils'

const Dashboard = () => {
    const [orderInput, setOrderInput] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [allOrders, setAllOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    //! Create orders object for lookup functionality (should replace with actual logic) 
    const orders = {}
    allOrders.forEach(order => {
        const cleanId = order.id.replace('#', '')

        const total = order.originalItems.reduce((sum, item) => {
            const itemPrice = item.price || 10.00
            return sum + (itemPrice * item.quantity)
        }, 0)

        orders[cleanId] = {
            id: order.id,
            customer: order.customer,
            items: order.originalItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price || 10.00 // Default price if not available
            })),
            time: order.time,
            status: order.status,
            total: total,
            phone: '+1 234-567-8900', // Default phone - replace with real data if available
            address: '123 Main St, City, State', // Default address - replace with real data if available
            orderType: order.orderType,
            paymentMode: order.paymentMode,
            createdAt: order.createdAt
        }
    })

    const handleButtonClick = (value) => {
        if (value === 'clear') {
            setOrderInput('')
            setSelectedOrder(null)
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

    const searchOrder = () => {
        const cleanId = orderInput.replace('#', '')
        if (orders[cleanId]) {
            setSelectedOrder(orders[cleanId])
        } else {
            setSelectedOrder({ notFound: true })
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            searchOrder()
        }
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
                        <Card
                            title='Order Look UP'
                        >

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
                                <button
                                    onClick={() => handleButtonClick('0')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold text-xl"
                                >
                                    0
                                </button>

                                {[1, 2, 3].map(num => (
                                    <button
                                        key={num}
                                        onClick={() => handleButtonClick(num.toString())}
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded font-semibold text-xl"
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Order Details Section */}
                        <Card
                            title='Order Details'
                        >

                            {!selectedOrder ? (
                                <Card className="bg-gray-50 p-8 rounded-lg text-center">
                                    <div className="text-gray-400 text-4xl mb-2">📋</div>
                                    <p className="text-gray-500">Enter an Order ID to view details</p>
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
                                                <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                                                {selectedOrder.orderType && (
                                                    <p className="text-sm text-blue-500">Type: {selectedOrder.orderType}</p>
                                                )}
                                                {selectedOrder.paymentMode && (
                                                    <p className="text-sm text-green-500">Payment: {selectedOrder.paymentMode}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={getStatusVariant(selectedOrder.status)}>
                                                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                                </Badge>
                                                <p className="text-sm text-gray-500 mt-1">{selectedOrder.time}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                        <h5 className="font-medium mb-3">Items Ordered:</h5>
                                        <div className="space-y-2">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                                    <div>
                                                        <span className="font-medium">{item.name}</span>
                                                        <span className="text-gray-500 ml-2">×{item.quantity}</span>
                                                    </div>
                                                    <span className="font-medium">${item.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                            <span className="font-semibold text-lg">Total:</span>
                                            <span className="font-bold text-lg text-green-600">${selectedOrder.total.toFixed(2)}</span>
                                        </div>

                                        {/* Address */}
                                        <Card className="mt-4 bg-gray-50">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address:</p>
                                            <p className="text-sm text-gray-600">{selectedOrder.address}</p>
                                        </Card>
                                    </div>
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
        </div>
    )
}

export default Dashboard