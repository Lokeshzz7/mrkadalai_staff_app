import React, { useState } from 'react'

import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'


const ManualOrder = () => {
    const [selectedItems, setSelectedItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [currentPage, setCurrentPage] = useState('menu') // 'menu' or 'payment'
    const [currentOrder, setCurrentOrder] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('')
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)

    const menuItems = [
        { id: 1, name: 'Spring Rolls', price: 120, category: 'meals', img: 'https://via.placeholder.com/100' },
        { id: 2, name: 'Chicken Wings', price: 180, category: 'meals', img: 'https://via.placeholder.com/100' },
        { id: 3, name: 'Chicken Biryani', price: 250, category: 'meals', img: 'https://via.placeholder.com/100' },
        { id: 4, name: 'Veg Fried Rice', price: 180, category: 'meals', img: 'https://via.placeholder.com/100' },
        { id: 5, name: 'Butter Chicken', price: 280, category: 'meals', img: 'https://via.placeholder.com/100' },
        { id: 6, name: 'Ice Cream', price: 80, category: 'desserts', img: 'https://via.placeholder.com/100' },
        { id: 7, name: 'Gulab Jamun', price: 60, category: 'desserts', img: 'https://via.placeholder.com/100' },
        { id: 8, name: 'Coke', price: 50, category: 'beverages', img: 'https://via.placeholder.com/100' },
        { id: 9, name: 'Lassi', price: 70, category: 'beverages', img: 'https://via.placeholder.com/100' }
    ]

    // Generate unique order ID
    const generateOrderId = () => {
        const timestamp = Date.now()
        const randomNum = Math.floor(Math.random() * 1000)
        return `ORD${timestamp.toString().slice(-6)}${randomNum.toString().padStart(3, '0')}`
    }

    const addToOrder = (item) => {
        const exists = selectedItems.find(i => i.id === item.id)
        if (exists) {
            setSelectedItems(selectedItems.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ))
        } else {
            setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
        }
    }

    const removeFromOrder = (itemId) => {
        setSelectedItems(selectedItems.filter(item => item.id !== itemId))
    }

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity === 0) {
            removeFromOrder(itemId)
        } else {
            setSelectedItems(selectedItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ))
        }
    }

    const getTotalAmount = () => {
        return selectedItems.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const handlePlaceOrder = () => {
        if (selectedItems.length === 0) return
        setShowConfirmModal(true)
    }

    const handleConfirmOrder = () => {
        const orderId = generateOrderId()
        const order = {
            id: orderId,
            items: selectedItems,
            total: getTotalAmount(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        }
        setCurrentOrder(order)
        setShowConfirmModal(false)
        setCurrentPage('payment')
    }

    const handleCancelOrder = () => {
        setShowConfirmModal(false)
    }

    const handlePaymentComplete = () => {
        setIsProcessingPayment(true)
        // Simulate payment processing
        setTimeout(() => {
            setIsProcessingPayment(false)
            alert(`Payment successful! Order ${currentOrder.id} has been placed.`)
            // Reset everything
            setSelectedItems([])
            setCurrentOrder(null)
            setPaymentMethod('')
            setCurrentPage('menu')
        }, 2000)
    }

    const handleBackToMenu = () => {
        setCurrentPage('menu')
        setPaymentMethod('')
    }

    const filteredMenuItems = menuItems.filter(item =>
        (activeCategory === 'all' || item.category === activeCategory) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Payment Page Component
    const PaymentPage = () => (
        <div className="grid grid-cols-1 lg:grid-cols-2 h-screen gap-4 p-4">
            {/* Left: Bill Details */}
            <div className="overflow-y-auto">
                <Card title={`Order #${currentOrder?.id}`}>
                    <div className="space-y-4">
                        <div className="text-sm text-gray-600 mb-4">
                            Order Time: {new Date(currentOrder?.timestamp).toLocaleString()}
                        </div>

                        <div className="space-y-3">
                            {currentOrder?.items.map(item => (
                                <div key={item.id} className="border-b pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-3">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-600">
                                                ₹{item.price} × {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-sm">₹{item.price * item.quantity}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total Amount:</span>
                                <span>₹{currentOrder?.total}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Right: Payment Methods */}
            <div className="overflow-y-auto">
                <Card title="Choose Payment Method">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: 'cash', name: 'Cash', icon: '💵' },
                                { id: 'upi', name: 'UPI', icon: '📱' },
                                { id: 'card', name: 'Credit Card', icon: '💳' },
                                { id: 'wallet', name: 'Wallet', icon: '👛' }
                            ].map(method => (
                                <div
                                    key={method.id}
                                    className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === method.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setPaymentMethod(method.id)}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">{method.icon}</div>
                                        <p className="font-medium text-sm">{method.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {paymentMethod && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-2">Selected: {
                                    paymentMethod === 'cash' ? 'Cash Payment' :
                                        paymentMethod === 'upi' ? 'UPI Payment' :
                                            paymentMethod === 'card' ? 'Credit Card Payment' :
                                                'Wallet Payment'
                                }</h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Amount to pay: ₹{currentOrder?.total}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={handleBackToMenu}
                                className="flex-1"
                            >
                                Back to Menu
                            </Button>
                            <Button
                                variant="success"
                                onClick={handlePaymentComplete}
                                disabled={!paymentMethod || isProcessingPayment}
                                className="flex-1"
                            >
                                {isProcessingPayment ? 'Processing...' : 'Complete Payment'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )

    // Main Menu Page Component
    const MenuPage = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 h-screen overflow-hidden gap-4">
            {/* Left: Order Summary */}
            <div className="lg:col-span-1 overflow-y-auto p-4">
                <Card title="Your Order">
                    <div className="space-y-3">
                        {selectedItems.map(item => (
                            <div key={item.id} className="border rounded-lg p-3">
                                {/* Item Name and Price */}
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="font-medium text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-gray-600">₹{item.price} each</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">₹{item.price * item.quantity}</p>
                                    </div>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 p-0 text-xs"
                                        >
                                            -
                                        </Button>
                                        <span className="mx-2 font-medium min-w-[20px] text-center text-sm">
                                            {item.quantity}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 p-0 text-xs"
                                        >
                                            +
                                        </Button>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => removeFromOrder(item.id)}
                                        className="w-8 h-8 p-0 text-xs"
                                    >
                                        ×
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {selectedItems.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No items added</p>
                            </div>
                        )}

                        {selectedItems.length > 0 && (
                            <>
                                <hr className="my-4" />
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center font-bold text-lg">
                                        <span>Total:</span>
                                        <span className="text-green-600">₹{getTotalAmount()}</span>
                                    </div>
                                </div>
                            </>
                        )}

                        <Button
                            className="w-full mt-4"
                            variant="success"
                            disabled={selectedItems.length === 0}
                            onClick={handlePlaceOrder}
                        >
                            Place Order ({selectedItems.length} items)
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Right: Menu Items */}
            <div className="lg:col-span-2 bg-white h-full overflow-y-auto p-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full md:w-1/2 p-2 border rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button
                            variant={activeCategory === 'all' ? 'black' : 'secondary'}
                            onClick={() => setActiveCategory('all')}
                            size="sm"
                        >All</Button>
                        <Button
                            variant={activeCategory === 'meals' ? 'black' : 'secondary'}
                            onClick={() => setActiveCategory('meals')}
                            size="sm"
                        >Meals</Button>
                        <Button
                            variant={activeCategory === 'desserts' ? 'black' : 'secondary'}
                            onClick={() => setActiveCategory('desserts')}
                            size="sm"
                        >Desserts</Button>
                        <Button
                            variant={activeCategory === 'beverages' ? 'black' : 'secondary'}
                            onClick={() => setActiveCategory('beverages')}
                            size="sm"
                        >Beverages</Button>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenuItems.map(item => (
                        <div key={item.id} className="border rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                            <img src={item.img} alt={item.name} className="w-24 h-24 object-cover mb-2 rounded" />
                            <h4 className="font-semibold">{item.name}</h4>
                            <p className="text-lg font-bold text-green-600 mb-2">₹{item.price}</p>
                            <Button size="sm" onClick={() => addToOrder(item)}>Add to Order</Button>
                        </div>
                    ))}
                    {filteredMenuItems.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-8">No items found</p>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {currentPage === 'menu' ? <MenuPage /> : <PaymentPage />}

            {/* Order Confirmation Modal */}
            <Modal
                isOpen={showConfirmModal}
                onClose={handleCancelOrder}
                title="Confirm Order"
                footer={
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={handleCancelOrder}>
                            Cancel
                        </Button>
                        <Button variant="success" onClick={handleConfirmOrder}>
                            Proceed to Payment
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <p className="text-gray-600">Please confirm your order details:</p>
                    <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                        {selectedItems.map(item => (
                            <div key={item.id} className="flex justify-between py-1 text-sm">
                                <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                                <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>₹{getTotalAmount()}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        Would you like to proceed with payment or cancel this order?
                    </p>
                </div>
            </Modal>
        </div>
    )
}

export default ManualOrder