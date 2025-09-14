import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { apiRequest } from '../utils/api'
import Loader from '../components/ui/Loader'

const Reports = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    })

    // State for all chart data
    const [salesTrendData, setSalesTrendData] = useState([])
    const [orderTypeData, setOrderTypeData] = useState([])
    const [newCustomersData, setNewCustomersData] = useState([])
    const [categoryBreakdownData, setCategoryBreakdownData] = useState([])
    const [deliveryTimeData, setDeliveryTimeData] = useState([])
    const [cancellationRefundData, setCancellationRefundData] = useState([])
    const [quantitySoldData, setQuantitySoldData] = useState([])

    const outletId = localStorage.getItem('outletId')

    useEffect(() => {
        if (outletId) {
            fetchAllData()
        }
    }, [outletId, dateRange])

    const fetchAllData = async () => {
        try {
            setLoading(true)
            setError(null)

            await Promise.all([
                fetchSalesTrend(),
                fetchOrderTypeBreakdown(),
                fetchNewCustomers(),
                fetchCategoryBreakdown(),
                fetchDeliveryTimeOrders(),
                fetchCancellationRefunds(),
                fetchQuantitySold()
            ])
        } catch (err) {
            setError(err.message || 'Failed to fetch data')
            console.error('Error fetching data:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchSalesTrend = async () => {
        try {
            const response = await apiRequest(`/staff/outlets/sales-trend/${outletId}/`, {
                method: 'POST',
                body: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            })
            setSalesTrendData(response || [])
        } catch (error) {
            console.error('Error fetching sales trend:', error)
            setSalesTrendData([])
        }
    }

    const fetchOrderTypeBreakdown = async () => {
        try {
            const response = await apiRequest(`/staff/outlets/order-type-breakdown/${outletId}/`, {
                method: 'POST',
                body: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            })
            setOrderTypeData(response || [])
        } catch (error) {
            console.error('Error fetching order type breakdown:', error)
            setOrderTypeData([])
        }
    }

    const fetchNewCustomers = async () => {
        try {
            const response = await apiRequest(`/staff/outlets/new-customers-trend/${outletId}/`, {
                method: 'POST',
                body: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            })
            setNewCustomersData(response || [])
        } catch (error) {
            console.error('Error fetching new customers:', error)
            setNewCustomersData([])
        }
    }

    const fetchCategoryBreakdown = async () => {
        try {
            const response = await apiRequest(`/staff/outlets/category-breakdown/${outletId}/`, {
                method: 'POST',
                body: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            })
            setCategoryBreakdownData(response || [])
        } catch (error) {
            console.error('Error fetching category breakdown:', error)
            setCategoryBreakdownData([])
        }
    }

    const fetchDeliveryTimeOrders = async () => {
        try {
            const response = await apiRequest(`/staff/outlets/delivery-time-orders/${outletId}/`, {
                method: 'POST',
                body: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            })
            setDeliveryTimeData(response || [])
        } catch (error) {
            console.error('Error fetching delivery time orders:', error)
            setDeliveryTimeData([])
        }
    }

    const fetchCancellationRefunds = async () => {
        try {
            const response = await apiRequest(`/staff/outlets/cancellation-refunds/${outletId}/`, {
                method: 'POST',
                body: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            })
            setCancellationRefundData(response || [])
        } catch (error) {
            console.error('Error fetching cancellation refunds:', error)
            setCancellationRefundData([])
        }
    }

    const fetchQuantitySold = async () => {
        try {
            const response = await apiRequest(`/staff/outlets/quantity-sold/${outletId}/`, {
                method: 'POST',
                body: {
                    from: dateRange.from,
                    to: dateRange.to
                }
            })
            setQuantitySoldData(response || [])
        } catch (error) {
            console.error('Error fetching quantity sold:', error)
            setQuantitySoldData([])
        }
    }

    const formatCurrency = (amount) => {
        return `₹${amount || 0}`
    }

    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDeliverySlot = (slot) => {
        const slotMap = {
            'SLOT_11_12': '11:00-12:00',
            'SLOT_12_13': '12:00-13:00',
            'SLOT_13_14': '13:00-14:00',
            'SLOT_14_15': '14:00-15:00',
            'SLOT_15_16': '15:00-16:00',
            'SLOT_16_17': '16:00-17:00'
        }
        return slotMap[slot] || slot
    }

    const handleDateRangeChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const setQuickDateRange = (days) => {
        const to = new Date().toISOString().split('T')[0]
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        setDateRange({ from, to })
    }

    const isQuickDateRangeActive = (days) => {
        const expectedFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const expectedTo = new Date().toISOString().split('T')[0]
        return dateRange.from === expectedFrom && dateRange.to === expectedTo
    }

    // Custom Tooltips
    const SalesTrendTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{`Date: ${formatDateForDisplay(label)}`}</p>
                    <p className="text-blue-600">Revenue: {formatCurrency(payload[0].value)}</p>
                </div>
            )
        }
        return null
    }

    const OrderTypeTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-blue-600">Orders: {payload[0].value}</p>
                </div>
            )
        }
        return null
    }

    const NewCustomersTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{`Date: ${formatDateForDisplay(label)}`}</p>
                    <p className="text-green-600">New Customers: {payload[0].value}</p>
                </div>
            )
        }
        return null
    }

    const CategoryTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{payload[0].name}</p>
                    <p className="text-purple-600">Orders: {payload[0].value}</p>
                </div>
            )
        }
        return null
    }

    const DeliveryTimeTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{`Time: ${formatDeliverySlot(label)}`}</p>
                    <p className="text-indigo-600">Orders: {payload[0].value}</p>
                </div>
            )
        }
        return null
    }

    const CancellationRefundTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{`Date: ${formatDateForDisplay(label)}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }}>
                            {`${entry.name}: ${entry.value}`}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    const QuantitySoldTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                    <p className="font-semibold">{label}</p>
                    <p className="text-orange-600">Quantity Sold: {payload[0].value}</p>
                </div>
            )
        }
        return null
    }

    // Chart data preparation
    const getOrderTypePieData = () => {
        if (!orderTypeData) return []
        return [
            { name: 'App Orders', value: orderTypeData.appOrders || 0, color: '#3b82f6' },
            { name: 'Manual Orders', value: orderTypeData.manualOrders || 0, color: '#10b981' }
        ].filter(item => item.value > 0)
    }

    const getCategoryPieData = () => {
        return categoryBreakdownData.map(item => ({
            name: item.category,
            value: item.orderCount,
            color: getCategoryColor(item.category)
        })).filter(item => item.value > 0)
    }

    const getCategoryColor = (category) => {
        const colors = {
            'Meals': '#3b82f6',
            'Starters': '#10b981',
            'Desserts': '#f59e0b',
            'Beverages': '#8b5cf6'
        }
        return colors[category] || '#6b7280'
    }

    const getDeliveryTimeLineData = () => {
        return deliveryTimeData.map(item => ({
            ...item,
            time: formatDeliverySlot(item.deliverySlot)
        }))
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-4xl font-bold">Staff Reports</h1>
                </div>
                <div className="flex justify-center items-center h-64">
                    <Loader/>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Staff Reports</h1>
                <Button variant="black">
                    Download Report
                </Button>
            </div>

            {/* Date Range Controls */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-700">Date Range:</span>
                    <div className="flex space-x-2">
                        <Button
                            variant={isQuickDateRangeActive(7) ? 'black' : 'secondary'}
                            onClick={() => setQuickDateRange(7)}
                            className="text-sm px-3 py-1"
                        >
                            7 Days
                        </Button>
                        <Button
                            variant={isQuickDateRangeActive(30) ? 'black' : 'secondary'}
                            onClick={() => setQuickDateRange(30)}
                            className="text-sm px-3 py-1"
                        >
                            30 Days
                        </Button>
                        <Button
                            variant={isQuickDateRangeActive(90) ? 'black' : 'secondary'}
                            onClick={() => setQuickDateRange(90)}
                            className="text-sm px-3 py-1"
                        >
                            90 Days
                        </Button>
                    </div>
                </div>

                {/* Custom Date Range */}
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Custom:</span>
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => handleDateRangeChange('from', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => handleDateRangeChange('to', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="text-red-700 text-sm">
                        Error: {error}
                    </div>
                </div>
            )}

            {/* Row 1: Sales Trend + Order Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Trend */}
                <Card title="Sales Trend">
                    {salesTrendData && salesTrendData.length > 0 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={salesTrendData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                                        height={80}
                                        interval={0}
                                        tickFormatter={formatDateForDisplay}
                                    />
                                    <YAxis
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Revenue (₹)', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={<SalesTrendTooltip />} />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            No sales trend data found for the selected date range
                        </div>
                    )}
                </Card>

                {/* Order Type Breakdown */}
                <Card title="Order Type Breakdown">
                    {getOrderTypePieData().length > 0 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={getOrderTypePieData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {getOrderTypePieData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<OrderTypeTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            No order type data found for the selected date range
                        </div>
                    )}
                </Card>
            </div>

            {/* Row 2: New Customers + Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* New Customers vs Dates */}
                <Card title="New Customers Trend">
                    {newCustomersData && newCustomersData.length > 0 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={newCustomersData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                                        height={80}
                                        interval={0}
                                        tickFormatter={formatDateForDisplay}
                                    />
                                    <YAxis
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'New Customers', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={<NewCustomersTooltip />} />
                                    <Bar
                                        dataKey="newCustomers"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            No new customers data found for the selected date range
                        </div>
                    )}
                </Card>

                {/* Category Breakdown */}
                <Card title="Category Wise Breakdown">
                    {getCategoryPieData().length > 0 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={getCategoryPieData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        innerRadius={40}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {getCategoryPieData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CategoryTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            No category breakdown data found for the selected date range
                        </div>
                    )}
                </Card>
            </div>

            {/* Row 3: Delivery Time Orders + Cancellation/Refunds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delivery Time Orders */}
                <Card title="Orders by Delivery Time">
                    {deliveryTimeData && deliveryTimeData.length > 0 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={getDeliveryTimeLineData()}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                                        height={80}
                                        interval={0}
                                    />
                                    <YAxis
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Number of Orders', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={<DeliveryTimeTooltip />} />
                                    <Line
                                        type="monotone"
                                        dataKey="orderCount"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            No delivery time data found for the selected date range
                        </div>
                    )}
                </Card>

                {/* Cancellation and Refunds */}
                <Card title="Cancellations and Refunds">
                    {cancellationRefundData && cancellationRefundData.length > 0 ? (
                        <div className="h-96 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={cancellationRefundData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                                        height={80}
                                        interval={0}
                                        tickFormatter={formatDateForDisplay}
                                    />
                                    <YAxis
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12 }}
                                        label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
                                    />
                                    <Tooltip content={<CancellationRefundTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="cancellations"
                                        fill="#ef4444"
                                        name="Cancellations"
                                        radius={[2, 2, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="refunds"
                                        fill="#2563eb"
                                        name="Refunds"
                                        radius={[2, 2, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            No cancellation/refund data found for the selected date range
                        </div>
                    )}
                </Card>
            </div>

            {/* Row 4: Quantity Sold (Full Width) */}
            <Card title="Quantity Sold by Dishes">
                {quantitySoldData && quantitySoldData.length > 0 ? (
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={quantitySoldData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="productName"
                                    axisLine={true}
                                    tickLine={true}
                                    tick={{ fontSize: 12, angle: -45, textAnchor: 'end' }}
                                    height={120}
                                    interval={0}
                                />
                                <YAxis
                                    axisLine={true}
                                    tickLine={true}
                                    tick={{ fontSize: 12 }}
                                    label={{ value: 'Quantity Sold', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip content={<QuantitySoldTooltip />} />
                                <Bar
                                    dataKey="quantitySold"
                                    fill="#f59e0b"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-16 text-gray-500">
                        No quantity sold data found for the selected date range
                    </div>
                )}
            </Card>
        </div>
    )
}

export default Reports