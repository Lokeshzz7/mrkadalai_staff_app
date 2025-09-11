import React, { useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import dayjs from 'dayjs'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { apiRequest } from '../utils/api'
import { useOutletDetails } from '../utils/outletUtils'
import { toast } from 'react-hot-toast'
import Modal from '../components/ui/Modal'

const OrderHistory = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs().startOf('day'))
    const [orders, setOrders] = useState([])
    const [availableDates, setAvailableDates] = useState([])
    const [loading, setLoading] = useState(false)
    const [datesLoading, setDatesLoading] = useState(false)
    const [error, setError] = useState(null)
    const [datesError, setDatesError] = useState(null)
    const [datePickerValue, setDatePickerValue] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null) // for modal

    const { outletId } = useOutletDetails()

    // Function to fetch orders for a specific date
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

    // Function to fetch available dates from the new endpoint
    const fetchAvailableDates = async () => {
        if (!outletId) return

        setDatesLoading(true)
        setDatesError(null)

        try {
            const response = await apiRequest(`/staff/outlets/get-orderdates/${outletId}`)
            const fetchedDates = response.data.map(dateObj => dayjs(dateObj.date))
            setAvailableDates(fetchedDates)

            if (fetchedDates.length > 0 && !fetchedDates.some(date => date.isSame(selectedDate, 'day'))) {
                setSelectedDate(fetchedDates[0])
            }
        } catch (err) {
            setDatesError('Failed to fetch available dates: ' + err.message)
            setAvailableDates([])
        } finally {
            setDatesLoading(false)
        }
    }

    // Effect to fetch orders when selectedDate or outletId changes
    useEffect(() => {
        if (selectedDate && outletId) {
            fetchOrders(selectedDate)
        }
    }, [selectedDate, outletId])

    // Effect to fetch available dates on component mount or when outletId changes
    useEffect(() => {
        fetchAvailableDates()
    }, [outletId])

    const handleDatePickerChange = (event) => {
        const selectedDateString = event.target.value
        setDatePickerValue(selectedDateString)
        if (selectedDateString) {
            const newDate = dayjs(selectedDateString).startOf('day')
            setSelectedDate(newDate)
        }
    }

    const downloadExcel = async () => {
        try {
            const response = await apiRequest(
                `/staff/outlets/get-order-history/?outletId=${outletId}&date=${selectedDate.format('YYYY-MM-DD')}`
            )

            const ordersData = response.orders || []

            if (ordersData.length === 0) {
                toast.error('No orders found for the selected date')
                return
            }

            const worksheetData = [
                ['Order ID', 'Customer Name', 'Order Type', 'Time', 'Items', 'Status'],
                ...ordersData.map(order => [
                    order.orderId,
                    order.customerName,
                    order.orderType,
                    dayjs(order.createdAt).format('hh:mm A'),
                    order.items.map(item => `${item.quantity}x ${item.name}`).join(', '),
                    order.status
                ])
            ]

            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')

            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
            const blob = new Blob([wbout], { type: 'application/octet-stream' })

            saveAs(blob, `orders_${selectedDate.format('YYYY-MM-DD')}.xlsx`)
        } catch (err) {
            toast.error('Failed to download Excel: ' + err.message)
        }
    }

    // Transform orders data for table
    const orderTableData = orders.map(order => {
        const itemDisplay =
            order.items.length > 2
                ? order.items
                      .slice(0, 2)
                      .map(item => `${item.quantity}x ${item.name}`)
                      .join(', ') + ` +${order.items.length - 2} more`
                : order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')

        return [
            order.orderId,
            order.customerName,
            order.orderType,
            dayjs(order.createdAt).format('hh:mm A'),
            itemDisplay,
            <Badge key={order.orderId} variant={order.status.toLowerCase()}>
                {order.status}
            </Badge>,
            <Button key={`view-${order.orderId}`} onClick={() => setSelectedOrder(order)}>
                View
            </Button>
        ]
    })

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Order History</h1>

            <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex overflow-x-auto whitespace-nowrap gap-2 pb-2 scrollbar-hide">
                        {datesLoading && <p>Loading dates...</p>}
                        {datesError && <p className="text-red-600">{datesError}</p>}
                        {!datesLoading &&
                            !datesError &&
                            availableDates.map(date => (
                                <Button
                                    key={date.toISOString()}
                                    variant={selectedDate.isSame(date, 'day') ? 'black' : 'secondary'}
                                    onClick={() => setSelectedDate(date)}
                                    className="flex-shrink-0"
                                >
                                    {date.format('DD MMM')}
                                </Button>
                            ))}
                    </div>
                </div>

                <div className="flex gap-2 items-center flex-shrink-0">
                    <label className="text-sm font-medium text-gray-700">Select Date:</label>
                    <input
                        type="date"
                        value={datePickerValue || (selectedDate ? selectedDate.format('YYYY-MM-DD') : '')}
                        onChange={handleDatePickerChange}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                            headers={[
                                'Order ID',
                                'Customer Name',
                                'Order Type',
                                'Time',
                                'Items',
                                'Status',
                                'Action'
                            ]}
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

            {/* Order Details Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={`Order Details - ${selectedOrder?.orderId || ''}`}
                footer={
                    <Button variant="secondary" onClick={() => setSelectedOrder(null)}>
                        Close
                    </Button>
                }
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <p>
                            <strong>Customer:</strong> {selectedOrder.customerName}
                        </p>
                        <p>
                            <strong>Order Type:</strong> {selectedOrder.orderType}
                        </p>
                        <p>
                            <strong>Time:</strong>{' '}
                            {dayjs(selectedOrder.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </p>
                        <p>
                            <strong>Status:</strong>{' '}
                            <Badge variant={selectedOrder.status.toLowerCase()}>
                                {selectedOrder.status}
                            </Badge>
                        </p>
                        <div>
                            <strong>Items:</strong>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {selectedOrder.items.map((item, idx) => (
                                    <li key={idx}>
                                        {item.quantity}x {item.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default OrderHistory
