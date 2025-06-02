import React, { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

const Inventory = () => {
    const [showAddModal, setShowAddModal] = useState(false)
    const [activeTab, setActiveTab] = useState('stock')

    {/*
        // ! Fake Data for the STock table and should be replaced with the API call
    */}
    const stockData = [
        ['Tomatoes', '5 kg', '10 kg', '20 kg', <Badge variant="danger">Low</Badge>],
        ['Onions', '15 kg', '10 kg', '25 kg', <Badge variant="success">Sufficient</Badge>],
        ['Chicken', '8 kg', '5 kg', '15 kg', <Badge variant="success">Sufficient</Badge>],
        ['Rice', '3 kg', '10 kg', '30 kg', <Badge variant="danger">Critical</Badge>]
    ]

    {/*
        // ! Fake Data for the Activity table and should be replaced with the API call
    */}

    const activityData = [
        ['Added', 'Tomatoes', '10 kg', '2024-01-15', 'Admin'],
        ['Deducted', 'Chicken', '2 kg', '2024-01-15', 'Kitchen'],
        ['Added', 'Rice', '5 kg', '2024-01-14', 'Admin'],
        ['Deducted', 'Onions', '3 kg', '2024-01-14', 'Kitchen']
    ]

    return (
        <div className="space-y-6">
            {/* 
                // * Button with Actions
            */}
            <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                    <Button
                        variant={activeTab === 'stock' ? 'black' : 'secondary'}
                        onClick={() => setActiveTab('stock')}
                    >
                        Stock Availability
                    </Button>
                    <Button
                        variant={activeTab === 'activity' ? 'black' : 'secondary'}
                        onClick={() => setActiveTab('activity')}
                    >
                        Activity Log
                    </Button>
                </div>
                <div className="flex space-x-2">
                <Button
                    className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium"
                    onClick={() => setShowAddModal(true)}
                >
                    Add Stock
                </Button>
                <Button
                    className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium"
                    onClick={() => alert('Detect Stock clicked')}
                >
                    Detect Stock
                </Button>
            </div>
            </div>


            {/* 
                // *Content (active tab) 
            */}
            {activeTab === 'stock' && (
                <Card title="Current Stock Status">
                    <Table
                        headers={['Item Name', 'Current Qty', 'Threshold', 'Standard Qty', 'Status']}
                        data={stockData}
                    />
                </Card>
            )}

            {activeTab === 'activity' && (
                <Card title="Recent Activities">
                    <Table
                        headers={['Action', 'Item Name', 'Quantity', 'Date', 'Logged By']}
                        data={activityData}
                    />
                </Card>
            )}

            {/* 
                //TODO should add an stock form to get the stock details 
            
                // ! This modal is for time being and should be removed afterwards
            */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add Stock"
                footer={
                    <div className="space-x-2">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button>Add Stock</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <select className="w-full p-2 border rounded">
                            <option>Select Item</option>
                            <option>Tomatoes</option>
                            <option>Onions</option>
                            <option>Chicken</option>
                            <option>Rice</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" className="w-full p-2 border rounded" placeholder="Enter quantity" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <select className="w-full p-2 border rounded">
                            <option>kg</option>
                            <option>grams</option>
                            <option>pieces</option>
                            <option>liters</option>
                        </select>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Inventory
