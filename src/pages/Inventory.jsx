import { useState } from 'react'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

const Notifications = () => {
    const [activeTab, setActiveTab] = useState('pending')

    const orders = {
        pending: [
            { id: '#001', customer: 'John Doe', time: '10:30 AM', items: '2 items' },
            { id: '#002', customer: 'Jane Smith', time: '10:45 AM', items: '1 item' }
        ],
        inProcess: [
            { id: '#003', customer: 'Mike Johnson', time: '10:15 AM', items: '3 items' }
        ],
        completed: [
            { id: '#004', customer: 'Sarah Wilson', time: '10:00 AM', items: '2 items' }
        ]
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Order Notifications</h1>

            {/* Tabs */}
            <div className="flex space-x-4 border-b">
                {['pending', 'inProcess', 'completed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-2 px-1 border-b-2 font-medium capitalize ${activeTab === tab
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500'
                            }`}
                    >
                        {tab.replace('inProcess', 'In Process')}
                    </button>
                ))}
            </div>

            {/* Order Cards */}
            <div className="space-y-4">
                {orders[activeTab].map(order => (
                    <Card key={order.id} className="p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold">{order.id} - {order.customer}</h3>
                                <p className="text-gray-600">{order.items} • {order.time}</p>
                            </div>
                            <Badge variant={activeTab === 'pending' ? 'warning' : activeTab === 'inProcess' ? 'info' : 'success'}>
                                {activeTab.replace('inProcess', 'In Process')}
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default Notifications