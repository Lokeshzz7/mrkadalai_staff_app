import React, { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import dayjs from 'dayjs'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'

const OrderHistory = () => {
    const today = dayjs().startOf('day')
    const [selectedDate, setSelectedDate] = useState(today)

    const previousDate = today.subtract(1, 'day')
    const nextDate = today.add(1, 'day')

    // Sample order data (replace with API later)
    const orders = [
        {
            id: 'ORD001',
            date: today.format('YYYY-MM-DD'),
            customer: 'John Doe',
            type: 'Dine-In',
            time: '12:30 PM',
            items: '2x Biryani, 1x Coke',
            status: 'delivered'
        },
        {
            id: 'ORD002',
            date: previousDate.format('YYYY-MM-DD'),
            customer: 'Alice',
            type: 'Takeaway',
            time: '1:15 PM',
            items: '1x Butter Chicken',
            status: 'cancelled'
        },
        {
            id: 'ORD003',
            date: nextDate.format('YYYY-MM-DD'),
            customer: 'Bob',
            type: 'Delivery',
            time: '7:45 PM',
            items: '3x Ice Cream',
            status: 'scheduled'
        }
    ]

    const filteredOrders = orders.filter(order => order.date === selectedDate.format('YYYY-MM-DD'))


    const orderTableData = filteredOrders.map(order => ([
        order.id,
        order.customer,
        order.type,
        order.time,
        order.items,
        <Badge
            variant={order.status}
        >
            {order.status}

        </Badge>,
        <Button >View</Button>
    ]))


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Order History</h1>

            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex gap-2">
                    <Button
                        variant={selectedDate.isSame(previousDate, 'day') ? 'black' : 'secondary'}
                        onClick={() => setSelectedDate(previousDate)}
                    >
                        {previousDate.format('DD MMM')}
                    </Button>
                    <Button
                        variant={selectedDate.isSame(today, 'day') ? 'black' : 'secondary'}
                        onClick={() => setSelectedDate(today)}
                    >
                        {today.format('DD MMM')}
                    </Button>
                    <Button
                        variant={selectedDate.isSame(nextDate, 'day') ? 'black' : 'secondary'}
                        onClick={() => setSelectedDate(nextDate)}
                    >
                        {nextDate.format('DD MMM')}
                    </Button>
                </div>

            </div>

            <Card>
                <div className="overflow-x-auto">
                    <Table
                        headers={['Order id', 'Customer name', 'Order Type', 'Time', 'items', 'status', 'Action']}
                        data={orderTableData}
                    />

                </div>
            </Card>
        </div>
    )
}

export default OrderHistory
