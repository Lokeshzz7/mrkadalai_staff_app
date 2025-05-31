import React from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'

const Dashboard = () => {

    {/*
        // ! Fake Data for the recent order table and should be replaced with the API call
    */}
    const recentOrders = [
        ['#12345', 'John Doe', 'Pizza, Burger', '2:30 PM', <Badge variant="pending">Pending</Badge>],
        ['#12346', 'Jane Smith', 'Pasta, Salad', '2:25 PM', <Badge variant="success">Completed</Badge>],
        ['#12347', 'Mike Johnson', 'Sandwich', '2:20 PM', <Badge variant="warning">In Progress</Badge>]
    ]

    {/*
        // ! Fake Data for the Low stock table and should be replaced with the API call
    */}
    const lowStockItems = [
        ['Tomatoes', '5 kg', '10 kg', <Badge variant="danger">Low</Badge>],
        ['Cheese', '2 kg', '8 kg', <Badge variant="danger">Critical</Badge>],
        ['Bread', '15 units', '20 units', <Badge variant="warning">Low</Badge>]
    ]

    return (
        <div className="space-y-6">
            {/* 
                // * Stats Cards
             */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-blue-600">45</h3>
                    <p className="text-gray-600">Today's Orders</p>
                </Card>
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-green-600">₹12,340</h3>
                    <p className="text-gray-600">Today's Revenue</p>
                </Card>
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-orange-600">23</h3>
                    <p className="text-gray-600">Active Orders</p>
                </Card>
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-red-600">3</h3>
                    <p className="text-gray-600">Low Stock Items</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 
                    // * Recent Orders Table
                */}
                <Card title="Recent Orders">
                    <Table
                        headers={['Order ID', 'Customer', 'Items', 'Time', 'Status']}
                        data={recentOrders}
                    />
                </Card>

                {/* 
                    // * Low Stock Table
                */}
                <Card title="Low Stock Alert">
                    <Table
                        headers={['Item', 'Current', 'Threshold', 'Status']}
                        data={lowStockItems}
                    />
                </Card>
            </div>
        </div>
    )
}

export default Dashboard