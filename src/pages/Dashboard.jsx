import Card from '../components/ui/Card'
import Table from '../components/ui/Table'

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <h3 className="text-lg font-semibold">Today's Orders</h3>
                    <p className="text-3xl font-bold text-blue-600">24</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold">Total Customers</h3>
                    <p className="text-3xl font-bold text-green-600">156</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold">Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600">₹12,450</p>
                </Card>
                <Card>
                    <h3 className="text-lg font-semibold">Low Stock Items</h3>
                    <p className="text-3xl font-bold text-red-600">3</p>
                </Card>
            </div>

            {/* Recent Orders */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
                <Table
                    headers={['Order ID', 'Customer', 'Items', 'Total', 'Status']}
                    data={[
                        ['#001', 'John Doe', '2 items', '₹450', 'Completed'],
                        ['#002', 'Jane Smith', '1 item', '₹200', 'Pending'],
                        ['#003', 'Mike Johnson', '3 items', '₹650', 'In Progress']
                    ]}
                />
            </Card>
        </div>
    )
}

export default Dashboard