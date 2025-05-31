import React, { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('pending')

    {/*
        // ! Fake Data for the notification  and should be replaced with the API call
    */}

    const notifications = {
        pending: [
            { id: '#12345', customer: 'John Doe', items: 'Pizza, Burger', time: '2:30 PM', table: 'A1' },
            { id: '#12346', customer: 'Jane Smith', items: 'Pasta', time: '2:25 PM', table: 'B3' }
        ],
        inProcess: [
            { id: '#12347', customer: 'Mike Johnson', items: 'Sandwich', time: '2:20 PM', table: 'C2' }
        ],
        completed: [
            { id: '#12348', customer: 'Sarah Wilson', items: 'Salad, Juice', time: '2:15 PM', table: 'A2' }
        ]
    }

    const tabs = [
        { key: 'pending', label: 'Pending Orders', variant: 'warning' },
        { key: 'inProcess', label: 'In Process', variant: 'info' },
        { key: 'completed', label: 'Completed', variant: 'success' }
    ]

    return (
        <div className="space-y-6">
            {/* 
                // * Tab Navigation
            */}
            <div className="flex space-x-4">
                {tabs.map(tab => (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'primary' : 'secondary'}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label} ({notifications[tab.key].length})
                    </Button>
                ))}
            </div>

            {/* 
                // * Notifications List
            */}
            <div className="space-y-4">
                {notifications[activeTab].map(order => (
                    <Card key={order.id} className="flex items-center justify-between p-4">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4">
                                <div>
                                    <h4 className="font-semibold">{order.id}</h4>
                                    <p className="text-sm text-gray-600">{order.customer} - Table {order.table}</p>
                                </div>
                                <div>
                                    <p className="text-sm">{order.items}</p>
                                    <p className="text-xs text-gray-500">{order.time}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {/* 
                                // TODO - need to implement the button functionalites 
                            */}
                            {activeTab === 'pending' && (
                                <>
                                    <Button size="sm" variant="success">Accept</Button>
                                    <Button size="sm" variant="danger">Reject</Button>
                                </>
                            )}
                            {activeTab === 'inProcess' && (
                                <Button size="sm" variant="primary">Mark Complete</Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Notifications