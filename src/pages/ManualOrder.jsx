import React, { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const ManualOrder = () => {
    const [selectedItems, setSelectedItems] = useState([])
    const [customerInfo, setCustomerInfo] = useState({ name: '', table: '', phone: '' })

    {/*
        // ! Fake Data for the Menu table and should be replaced with the API call
    */}
    const menuCategories = {
        appetizers: [
            { id: 1, name: 'Spring Rolls', price: 120 },
            { id: 2, name: 'Chicken Wings', price: 180 }
        ],
        mains: [
            { id: 3, name: 'Chicken Biryani', price: 250 },
            { id: 4, name: 'Veg Fried Rice', price: 180 },
            { id: 5, name: 'Butter Chicken', price: 280 }
        ],
        desserts: [
            { id: 6, name: 'Ice Cream', price: 80 },
            { id: 7, name: 'Gulab Jamun', price: 60 }
        ]
    }

    {/*
        // TODO -  Implement an {POST} and {PUT} and {GET} and {DELETE} request to handle the items data    
    */}

    const addToOrder = (item) => {
        const existing = selectedItems.find(i => i.id === item.id)
        if (existing) {
            setSelectedItems(selectedItems.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ))
        } else {
            setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
        }
    }

    {/*
        // ? Need to calculate the total amount and use an {PUT} request to store in the DB else use {GET} request to get the value from the DB
    */ }
    const getTotalAmount = () => {
        return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/*
                // * Menu items in the side 
            */}
            <div className="lg:col-span-2 space-y-6">
                {Object.entries(menuCategories).map(([category, items]) => (
                    <Card key={category} title={category.charAt(0).toUpperCase() + category.slice(1)}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* 
                                // * Each item in the Menu 
                            */}
                            {items.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                        <h4 className="font-medium">{item.name}</h4>
                                        <p className="text-sm text-gray-600">₹{item.price}</p>
                                    </div>
                                    <Button size="sm" onClick={() => addToOrder(item)}>Add</Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            {/* 
                // * Customer Detials 
             */}

            <div className="space-y-6">
                <Card title="Customer Information">
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Customer Name"
                            className="w-full p-2 border rounded"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Table Number"
                            className="w-full p-2 border rounded"
                            value={customerInfo.table}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, table: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Phone Number"
                            className="w-full p-2 border rounded"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        />
                    </div>
                </Card>

                {/* 
                    // * Items Added 
                */}

                <Card title="Items">
                    <div className="space-y-3">
                        {selectedItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">₹{item.price} x {item.quantity}</p>
                                </div>
                                <p className="font-medium">₹{item.price * item.quantity}</p>
                            </div>
                        ))}
                        {selectedItems.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No items selected</p>
                        )}
                        <hr />
                        <div className="flex justify-between font-bold">
                            <span>Total:</span>
                            <span>₹{getTotalAmount()}</span>
                        </div>
                        {/* 
                                // TODO - need to implement the button functionalites 
                        */}
                        <Button
                            className="w-full mt-4"
                            disabled={selectedItems.length === 0 || !customerInfo.name || !customerInfo.table}
                        >
                            Place Order
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default ManualOrder