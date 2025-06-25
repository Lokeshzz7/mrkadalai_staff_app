import React, { useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import dayjs from 'dayjs'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import { apiRequest } from '../utils/api'
import { useOutletDetails } from '../utils/outletUtils'

const OrderHistory = () => {
    const [baseDate, setBaseDate] = useState(dayjs().startOf('day'))
    const [selectedDate, setSelectedDate] = useState(dayjs().startOf('day'))
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Calculate the 4 dates based on baseDate (if selected) or today
    const referenceDate = baseDate || dayjs().startOf('day')
    const yesterday = referenceDate.subtract(1, 'day')
    const today = referenceDate
    const tomorrow = referenceDate.add(1, 'day')
    const dayAfterTomorrow = referenceDate.add(2, 'day')

    const {outletId} = useOutletDetails();

    const fetchOrders = async (date) => {
        setLoading(true)
        setError(null)
        
        try {
            const response = await apiRequest(
                `/staff/outlets/get-order-history/?outletId=${outletId}&date=${date.format('YYYY-MM-DD')}`
            )
            
            setOrders(response.orders || [])
        } catch (err) {
            setError('Failed to fetch orders: ' + err.message)
            setOrders([])
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if (selectedDate && outletId) {
            fetchOrders(selectedDate)
        }
    }, [selectedDate, outletId])

    const handleDatePickerChange = (event) => {
        const selectedDateString = event.target.value
        if (selectedDateString) {
            const newBaseDate = dayjs(selectedDateString).startOf('day')
            setBaseDate(newBaseDate)
            setSelectedDate(newBaseDate)
        } else {
            setBaseDate(null)
            setSelectedDate(dayjs().startOf('day')) 
        }
    }
    const downloadExcel = async () => {
        try {
            const response = await apiRequest(
                `/staff/outlets/get-order-history/?outletId=${outletId}&date=${selectedDate.format('YYYY-MM-DD')}`
            )
            
            const ordersData = response.orders || []
            
            if (ordersData.length === 0) {
                alert('No orders found for the selected date')
                return
            }
            const headers = ['Order ID', 'Customer Name', 'Order Type', 'Time', 'Items', 'Status']
            const csvContent = [
                headers.join(','),
                ...ordersData.map(order => [
                    order.orderId,
                    `"${order.customerName}"`,
                    order.orderType,
                    `"${dayjs(order.createdAt).format('hh:mm A')}"`,
                    `"${order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}"`,
                    order.status
                ].join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;' 
            })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `orders_${selectedDate.format('YYYY-MM-DD')}.xlsx`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            alert('Failed to download Excel: ' + err.message)
        }
    }

    // Transform orders data for table
    const orderTableData = orders.map(order => ([
        order.orderId,
        order.customerName,
        order.orderType,
        dayjs(order.createdAt).format('hh:mm A'),
        order.items.map(item => `${item.quantity}x ${item.name}`).join(', '),
        <Badge
            key={order.orderId}
            variant={order.status.toLowerCase()}
        >
            {order.status}
        </Badge>,
        <Button key={`view-${order.orderId}`}>View</Button>
    ]))

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Order History</h1>

            {/* Date Picker */}
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Select Date:</label>
                <input
                    type="date"
                    value={baseDate ? baseDate.format('YYYY-MM-DD') : ''}
                    onChange={handleDatePickerChange}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        variant={selectedDate.isSame(yesterday, 'day') ? 'black' : 'secondary'}
                        onClick={() => setSelectedDate(yesterday)}
                    >
                        {yesterday.format('DD MMM')}
                    </Button>
                    <Button
                        variant={selectedDate.isSame(today, 'day') ? 'black' : 'secondary'}
                        onClick={() => setSelectedDate(today)}
                    >
                        {today.format('DD MMM')}
                    </Button>
                    <Button
                        variant={selectedDate.isSame(tomorrow, 'day') ? 'black' : 'secondary'}
                        onClick={() => setSelectedDate(tomorrow)}
                    >
                        {tomorrow.format('DD MMM')}
                    </Button>
                    <Button
                        variant={selectedDate.isSame(dayAfterTomorrow, 'day') ? 'black' : 'secondary'}
                        onClick={() => setSelectedDate(dayAfterTomorrow)}
                    >
                        {dayAfterTomorrow.format('DD MMM')}
                    </Button>
                </div>

                <div className="flex gap-2 items-center">
                    <Button
                        variant="secondary"
                        onClick={downloadExcel}
                        disabled={loading || orders.length === 0}
                    >
                        Download Excel
                    </Button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    {loading && (
                        <div className="text-center py-4">
                            <p>Loading orders...</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="text-center py-4 text-red-600">
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {!loading && !error && (
                        <Table
                            headers={['Order ID', 'Customer Name', 'Order Type', 'Time', 'Items', 'Status', 'Action']}
                            data={orderTableData}
                        />
                    )}

                    {!loading && !error && orders.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>No orders found for {selectedDate.format('DD MMM YYYY')}</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default OrderHistory