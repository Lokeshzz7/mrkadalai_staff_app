import { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const ManualOrder = () => {
    const [cart, setCart] = useState([])
    const [customer, setCustomer] = useState('')

    const menuItems = [
        { id: 1, name: 'Burger', price: 200, category: 'Main' },
        { id: 2, name: 'Pizza', price: 400, category: 'Main' },
        { id: 3, name: 'Coke', price: 50, category: 'Drinks' },
        { id: 4, name: 'Fries', price: 100, category: 'Sides' }
    ]

    const addToCart = (item) => {
        setCart([...cart, item])
    }

    const total = cart.reduce((sum, item) => sum + item.price, 0)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu Items */}
            <div className="lg:col-span-2">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Menu Items</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {menuItems.map(item => (
                        <Card key={item.id} className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">{item.name}</h3>
                                    <p className="text-gray-600">₹{item.price}</p>
                                </div>
                                <Button onClick={() => addToCart(item)}>Add</Button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Order Summary */}
            <div>
                <Card className="p-4">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                    <input
                        type="text"
                        placeholder="Customer Name"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                    />

                    <div className="space-y-2 mb-4">
                        {cart.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{item.name}</span>
                                <span>₹{item.price}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-2 mb-4">
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                    </div>

                    <Button className="w-full" disabled={!customer || cart.length === 0}>
                        Place Order
                    </Button>
                </Card>
            </div>
        </div>
    )
}

export default ManualOrder