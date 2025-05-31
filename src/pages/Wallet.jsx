import React, { useState } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'

const Wallet = () => {
    const [showRechargeModal, setShowRechargeModal] = useState(false)

    {/*
        // ! Fake Data for the transaction data table and should be replaced with the API call
    */}
    const transactionData = [
        ['#TXN001', 'John Doe', '2:30 PM', '₹500', <Badge variant="success">Success</Badge>],
        ['#TXN002', 'Jane Smith', '2:25 PM', '₹300', <Badge variant="success">Success</Badge>],
        ['#TXN003', 'Mike Johnson', '2:20 PM', '₹250', <Badge variant="pending">Pending</Badge>],
        ['#TXN004', 'Sarah Wilson', '2:15 PM', '₹400', <Badge variant="success">Success</Badge>]
    ]

    return (
        <div className="space-y-6">
            {/*
                // * Summary Cards
            */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-green-600">₹25,340</h3>
                    <p className="text-gray-600">Total Recharges Today</p>
                </Card>
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-blue-600">45</h3>
                    <p className="text-gray-600">Total Transactions</p>
                </Card>
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-orange-600">3</h3>
                    <p className="text-gray-600">Pending Recharges</p>
                </Card>
                <Card className="text-center">
                    <h3 className="text-2xl font-bold text-purple-600">₹567</h3>
                    <p className="text-gray-600">Average Recharge</p>
                </Card>
            </div>

            {/*
                 //  * Transactions Table
            */}
            <Card
                title="Recent Transactions"
                className="relative"
            >
                <div className="absolute top-4 right-4">
                    <Button onClick={() => setShowRechargeModal(true)}>Manual Recharge</Button>
                </div>
                <Table
                    headers={['Transaction ID', 'Student Name', 'Time', 'Amount', 'Status']}
                    data={transactionData}
                />
            </Card>

            {/* 
                //TODO should add an Recharge  form to add the recharge  details 
            
                // ! This modal is for time being and should be removed afterwards
            */}
            <Modal
                isOpen={showRechargeModal}
                onClose={() => setShowRechargeModal(false)}
                title="Manual Recharge"
                footer={
                    <div className="space-x-2">
                        <Button variant="secondary" onClick={() => setShowRechargeModal(false)}>Cancel</Button>
                        <Button>Process Recharge</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID/Name</label>
                        <input type="text" className="w-full p-2 border rounded" placeholder="Enter student ID or name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input type="number" className="w-full p-2 border rounded" placeholder="Enter amount" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select className="w-full p-2 border rounded">
                            <option>Cash</option>
                            <option>Card</option>
                            <option>UPI</option>
                            <option>Net Banking</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea className="w-full p-2 border rounded" rows="3" placeholder="Additional notes"></textarea>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Wallet