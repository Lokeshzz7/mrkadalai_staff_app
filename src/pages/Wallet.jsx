import React, { useState, useEffect } from 'react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { apiRequest } from '../utils/api'
import { useOutletDetails } from '../utils/outletUtils'
import { toast } from 'react-hot-toast';
import Loader from '../components/ui/Loader'


const Wallet = () => {
    const [showRechargeModal, setShowRechargeModal] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [transactionData, setTransactionData] = useState([])
    const [loading, setLoading] = useState(true)
    const [rechargeLoading, setRechargeLoading] = useState(false)
    const [error, setError] = useState('')
    
    // Form state for manual recharge
    const [rechargeForm, setRechargeForm] = useState({
        customerId: '',
        amount: '',
        method: 'CASH',
        notes: ''
    })

    const { outletId } = useOutletDetails()

    // Fetch recharge history
    const fetchRechargeHistory = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await apiRequest(`/staff/outlets/get-recharge-history/${outletId}/`)
            
            const formattedData = response.recharges.map(recharge => ({
                id: `#TXN${String(recharge.transactionId).padStart(3, '0')}`,
                name: recharge.customerName,
                date: new Date(recharge.time).toLocaleDateString('en-IN'),
                amount: `₹${recharge.amount}`
            }))
            
            setTransactionData(formattedData)
        } catch (error) {
            console.error('Error fetching recharge history:', error)
            setError('Failed to fetch recharge history')
        } finally {
            setLoading(false)
        }
    }

    // Handle manual recharge
    const handleManualRecharge = async () => {
        if (!rechargeForm.customerId || !rechargeForm.amount) {
            setError('Customer ID and Amount are required')
            return
        }

        try {
            setRechargeLoading(true)
            setError('')
            
            const rechargeData = {
                customerId: parseInt(rechargeForm.customerId),
                amount: parseFloat(rechargeForm.amount),
                method: rechargeForm.method
            }

            await apiRequest('/staff/outlets/recharge-wallet/', {
                method: 'POST',
                body: rechargeData
            })

            // Reset form and close modal
            setRechargeForm({
                customerId: '',
                amount: '',
                method: 'CASH',
                notes: ''
            })
            setShowRechargeModal(false)
            
            // Refresh the transaction history
            fetchRechargeHistory()
            
            // Show success message (you can replace this with a toast notification)
            toast.success('Recharge processed successfully!')
            
        } catch (error) {
            console.error('Error processing recharge:', error)
            setError(error.message || 'Failed to process recharge')
        } finally {
            setRechargeLoading(false)
        }
    }

    // Handle form input changes
    const handleFormChange = (field, value) => {
        setRechargeForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Fetch data on component mount
    useEffect(() => {
        if (outletId) {
            fetchRechargeHistory()
        }
    }, [outletId])

    // Filtered data based on search input
    const filteredTransactions = transactionData.filter(txn =>
        txn.id.toLowerCase().includes(searchText.toLowerCase()) ||
        txn.name.toLowerCase().includes(searchText.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Header Row: Wallet Recharge + Manual Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Wallet Recharge</h2>
                <Button variant='success' onClick={() => setShowRechargeModal(true)}>Manual Recharge</Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Summary Cards
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
            </div> */}

            {/* Header Row: Recharge History + Search */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recharge History</h2>
                <input
                    type="text"
                    placeholder="Search by ID or Name"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="border rounded p-2 w-64"
                />
            </div>

            {/* Transactions Table */}
            <Card>
                {loading ? (
                    <div className="text-center py-8">
                        <Loader/>
                    </div>
                ) : (
                    <Table
                        headers={['Transaction ID', 'Student Name', 'Date', 'Amount']}
                        data={filteredTransactions.map(txn => [
                            txn.id,
                            txn.name,
                            txn.date,
                            txn.amount
                        ])}
                    />
                )}
            </Card>

            {/* Manual Recharge Modal */}
            <Modal
                isOpen={showRechargeModal}
                onClose={() => {
                    setShowRechargeModal(false)
                    setError('')
                    setRechargeForm({
                        customerId: '',
                        amount: '',
                        method: 'CASH',
                        notes: ''
                    })
                }}
                title="Manual Recharge"
                footer={
                    <div className="space-x-2">
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setShowRechargeModal(false)
                                setError('')
                                setRechargeForm({
                                    customerId: '',
                                    amount: '',
                                    method: 'CASH',
                                    notes: ''
                                })
                            }}
                            disabled={rechargeLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleManualRecharge}
                            disabled={rechargeLoading}
                        >
                            {rechargeLoading ? 'Processing...' : 'Process Recharge'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded" 
                            placeholder="Enter customer ID" 
                            value={rechargeForm.customerId}
                            onChange={(e) => handleFormChange('customerId', e.target.value)}
                            disabled={rechargeLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                        <input 
                            type="number" 
                            className="w-full p-2 border rounded" 
                            placeholder="Enter amount" 
                            value={rechargeForm.amount}
                            onChange={(e) => handleFormChange('amount', e.target.value)}
                            disabled={rechargeLoading}
                            min="1"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select 
                            className="w-full p-2 border rounded"
                            value={rechargeForm.method}
                            onChange={(e) => handleFormChange('method', e.target.value)}
                            disabled={rechargeLoading}
                        >
                            <option value="CASH">CASH</option>
                            <option value="CARD">CARD</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                        <textarea 
                            className="w-full p-2 border rounded" 
                            rows="3" 
                            placeholder="Additional notes"
                            value={rechargeForm.notes}
                            onChange={(e) => handleFormChange('notes', e.target.value)}
                            disabled={rechargeLoading}
                        ></textarea>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Wallet