import React, { useState, useEffect } from 'react'

import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { apiRequest } from '../utils/api'
import { useOutletDetails } from '../utils/outletUtils'
import { toast } from 'react-hot-toast';


const ManualOrder = () => {
    const [selectedItems, setSelectedItems] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [currentPage, setCurrentPage] = useState('menu') // 'menu' or 'payment'
    const [currentOrder, setCurrentOrder] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState('')
    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [menuItems, setMenuItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const { outletId } = useOutletDetails()

    // Fetch products from backend
    useEffect(() => {
        const fetchProducts = async () => {
            if (!outletId) return

            try {
                setIsLoading(true)
                setError(null)
                const response = await apiRequest(`/staff/outlets/get-products-in-stock/${outletId}`)
                
                // Transform backend data to match frontend structure
                const transformedProducts = response.products.map(product => ({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    category: product.category.toLowerCase(),
                    img: product.imageUrl || 'https://via.placeholder.com/100',
                    description: product.description,
                    quantityAvailable: product.quantityAvailable
                }))
                
                setMenuItems(transformedProducts)
            } catch (error) {
                console.error('Error fetching products:', error)
                setError('Failed to load products. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProducts()
    }, [outletId])

    // Generate unique order ID
    const generateOrderId = () => {
        const timestamp = Date.now()
        const randomNum = Math.floor(Math.random() * 1000)
        return `ORD${timestamp.toString().slice(-6)}${randomNum.toString().padStart(3, '0')}`
    }

    const addToOrder = (item) => {
        const exists = selectedItems.find(i => i.id === item.id)
        if (exists) {
            // Check if we can add more (don't exceed available quantity)
            if (exists.quantity < item.quantityAvailable) {
                setSelectedItems(selectedItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                ))
            } else {
                toast.success(`Only ${item.quantityAvailable} units available for ${item.name}`)
            }
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
            const item = menuItems.find(i => i.id === itemId)
            if (newQuantity > item.quantityAvailable) {
                toast.success(`Only ${item.quantityAvailable} units available for ${item.name}`)
                return
            }
            setSelectedItems(selectedItems.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            ))
        }
    }

    const getTotalAmount = () => {
        const total = selectedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
        return Math.round(total * 100) / 100;
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

    const handlePaymentComplete = async () => {
        if (!paymentMethod || !currentOrder) return

        setIsProcessingPayment(true)
        
        try {
            // Prepare order data for backend
            const orderData = {
                outletId: outletId,
                totalAmount: currentOrder.total,
                paymentMethod: paymentMethod.toUpperCase(),
                items: currentOrder.items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                }))
            }

            // Submit order to backend
            const response = await apiRequest('/staff/outlets/add-manual-order/', {
                method: 'POST',
                body: orderData
            })

            // Success
            toast.success(`Payment successful! Order ${response.order.id} has been placed.`)
            
            // Reset everything
            setSelectedItems([])
            setCurrentOrder(null)
            setPaymentMethod('')
            setCurrentPage('menu')
            
            // Refresh products to update available quantities
            const productsResponse = await apiRequest(`/staff/outlets/get-products-in-stock/${outletId}`)
            const transformedProducts = productsResponse.products.map(product => ({
                id: product.id,
                name: product.name,
                price: product.price,
                category: product.category.toLowerCase(),
                img: product.imageUrl || 'https://via.placeholder.com/100',
                description: product.description,
                quantityAvailable: product.quantityAvailable
            }))
            setMenuItems(transformedProducts)

        } catch (error) {
            console.error('Error placing order:', error)
            toast.error(`Failed to place order: ${error.message}`)
        } finally {
            setIsProcessingPayment(false)
        }
    }

    const handleBackToMenu = () => {
        setCurrentPage('menu')
        setPaymentMethod('')
    }

    const filteredMenuItems = menuItems.filter(item =>
        (activeCategory === 'all' || item.category === activeCategory) &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Get unique categories from menuItems
    const categories = [...new Set(menuItems.map(item => item.category))]

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
                                            <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
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
                                { id: 'CASH', name: 'Cash', icon: '💵' },
                                { id: 'UPI', name: 'UPI', icon: '📱' },
                                { id: 'CARD', name: 'Credit Card', icon: '💳' },
                                { id: 'WALLET', name: 'Wallet', icon: '👛' }
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
                                        <p className="font-medium text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
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
                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">Loading products...</div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-500 text-center">
                            <p>{error}</p>
                            <Button 
                                onClick={() => window.location.reload()} 
                                className="mt-2"
                                size="sm"
                            >
                                Retry
                            </Button>
                        </div>
                    </div>
                )}

                {/* Menu Content */}
                {!isLoading && !error && (
                    <>
                        {/* Filters */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Search items..."
                                className="w-full md:w-1/2 p-2 border rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="flex gap-2 flex-wrap">
                                <Button
                                    variant={activeCategory === 'all' ? 'black' : 'secondary'}
                                    onClick={() => setActiveCategory('all')}
                                    size="sm"
                                >All</Button>
                                {categories.map(category => (
                                    <Button
                                        key={category}
                                        variant={activeCategory === category ? 'black' : 'secondary'}
                                        onClick={() => setActiveCategory(category)}
                                        size="sm"
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredMenuItems.map(item => (
                                <div key={item.id} className="border rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                                    <img src={item.img} alt={item.name} className="w-24 h-24 object-cover mb-2 rounded" />
                                    <h4 className="font-semibold">{item.name}</h4>
                                    <p className="text-lg font-bold text-green-600 mb-1">₹{item.price}</p>
                                    <p className="text-xs text-gray-500 mb-2">
                                        {item.quantityAvailable} units available
                                    </p>
                                    <Button 
                                        size="sm" 
                                        onClick={() => addToOrder(item)}
                                        disabled={item.quantityAvailable === 0}
                                    >
                                        {item.quantityAvailable === 0 ? 'Out of Stock' : 'Add to Order'}
                                    </Button>
                                </div>
                            ))}
                            {filteredMenuItems.length === 0 && (
                                <p className="col-span-full text-center text-gray-500 py-8">No items found</p>
                            )}
                        </div>
                    </>
                )}
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
                                <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
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