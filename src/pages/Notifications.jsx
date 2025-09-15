import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { apiRequest } from '../utils/api';
import { useOutletDetails } from '../utils/outletUtils';
import { toast } from 'react-hot-toast';
import Loader from '../components/ui/Loader';

const Notifications = () => {
    // --- All your existing state and logic remains unchanged ---
    const [activeTab, setActiveTab] = useState('orders');
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [allOrders, setAllOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState('');
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderModalAction, setOrderModalAction] = useState('');
    const [orderActionLoading, setOrderActionLoading] = useState(false);

    const navigate = useNavigate();
    const { outletId } = useOutletDetails();
    const orderRefs = useRef({}); // Ref for scrolling to orders

    useEffect(() => {
        if (outletId) {
            if (activeTab === 'orders') {
                fetchRecentOrders();
            } else if (activeTab === 'inventory') {
                fetchStocks();
            }
        }
    }, [outletId, activeTab]);

    const fetchRecentOrders = async () => {
        if (!outletId) {
            setOrdersError('Outlet ID not found');
            return;
        }
        setOrdersLoading(true);
        setOrdersError('');
        try {
            const response = await apiRequest(`/staff/outlets/get-recent-orders/${outletId}/`);
            if (response.orders) {
                const appOrders = response.orders
                    .filter(order => order.orderType?.toLowerCase() === 'app')
                    .map(order => ({
                        id: `#${order.billNumber}`,
                        customer: order.customerName,
                        date: new Date(order.createdAt).toLocaleDateString(),
                        time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        items: order.items.map(item => ({
                            name: item.name,
                            price: `₹${item.unitPrice.toFixed(2)}`,
                            description: item.description || 'No description',
                            qty: item.quantity
                        })),
                        totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
                        status: order.status.toLowerCase(),
                        billNumber: order.billNumber,
                        orderType: order.orderType,
                        paymentMode: order.paymentMode,
                        originalItems: order.items,
                        createdAt: order.createdAt,
                        orderId: order.billNumber
                    }));
                setAllOrders(appOrders);
            } else {
                setAllOrders([]);
            }
        } catch (err) {
            console.error('Error fetching recent orders:', err);
            setOrdersError('Failed to fetch recent orders');
            setAllOrders([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchStocks = async () => {
        if (!outletId) {
            setError('Outlet ID not found');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await apiRequest(`/staff/outlets/get-stocks/${outletId}/`);
            if (response.stocks) {
                setStockData(response.stocks);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // --- All your handler functions remain unchanged ---
    const handleRestock = async () => {
        if (!quantity || !selectedItem || !outletId) {
            setError('Please enter a valid quantity');
            return;
        }
        setModalLoading(true);
        try {
            await apiRequest('/staff/outlets/add-stock/', {
                method: 'POST',
                body: { productId: selectedItem.id, outletId, addedQuantity: parseInt(quantity) }
            });
            handleCloseModal();
            await fetchStocks();
            toast.success(`${selectedItem.name} restocked successfully!`);
        } catch (err) {
            toast.error(err.message || 'Error restocking item');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowRestockModal(false);
        setSelectedItem(null);
        setQuantity('');
        setError('');
    };

    const handleOrderAction = (order, action) => {
        setSelectedOrder(order);
        setOrderModalAction(action);
        setShowOrderModal(true);
    };
    
    const handleConfirmOrderAction = async () => {
        if (!selectedOrder || !outletId) return;
        setOrderActionLoading(true);
        try {
            const status = orderModalAction === 'delivered' ? 'DELIVERED' : 'CANCELLED';
            await apiRequest('/staff/outlets/update-order/', {
                method: 'PUT',
                body: JSON.stringify({
                    orderId: parseInt(selectedOrder.orderId),
                    outletId: parseInt(outletId),
                    status
                }),
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success(`Order ${selectedOrder.id} marked as ${status.toLowerCase()}.`);
            fetchRecentOrders(); // Re-fetch to get the latest list
            handleCloseOrderModal();
        } catch (err) {
            toast.error(err.message || 'Error updating order');
        } finally {
            setOrderActionLoading(false);
        }
    };

    const handleCloseOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
        setOrderModalAction('');
    };
    
    // --- Helper functions for UI and Logic ---
    const isOrderCompleted = (status) => ['completed', 'delivered', 'cancelled'].includes(status.toLowerCase());

    const getSortedOrders = () => {
        return [...allOrders].sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    };
    
    const filterStockByCategory = () => {
        return stockData.filter(item => ['Meals', 'Starters', 'Desserts', 'Beverages'].includes(item.category));
    };
    
    // NEW: Function to handle clicking on the top order IDs
    const handleOrderStackClick = (orderId) => {
        const ref = orderRefs.current[orderId];
        if (ref) {
            ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight for better UX
            ref.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2');
            setTimeout(() => {
                ref.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2');
            }, 1500);
        }
    };

    // --- Function to handle refresh logic---
    const handleRefresh = () => {
        if (activeTab === 'orders') {
            fetchRecentOrders();
        } else if (activeTab === 'inventory') {
            fetchStocks();
        }
    };
    

    return (
        <div className="space-y-6 p-6">
            {(error || ordersError) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error || ordersError}</div>
            )}

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                       {activeTab === 'orders' ? 'App Orders List' : 'Inventory'}
                    </h2>
                    <Button
                        variant="black"
                       onClick={handleRefresh}
                        disabled={loading || ordersLoading}
                    >
                        {loading || ordersLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
                <div className="flex space-x-4">
                    <Button variant={activeTab === 'orders' ? 'black' : 'secondary'} onClick={() => setActiveTab('orders')}>Orders</Button>
                    <Button variant={activeTab === 'inventory' ? 'black' : 'secondary'} onClick={() => setActiveTab('inventory')}>Inventory</Button>
                </div>
            </div>

            {activeTab === 'orders' && (
                <div className="space-y-6">
                    {ordersLoading && <div className="flex justify-center items-center text-center py-4 text-gray-600"><Loader/></div>}
                    
                    {!ordersLoading && allOrders.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                            {getSortedOrders().slice(0, 6).map((order) => {
                                const statusColors = {
                                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                                    delivered: 'bg-green-100 text-green-800 border-green-300',
                                    cancelled: 'bg-red-100 text-red-800 border-red-300'
                                };
                                return (
                                    <div
                                        key={order.id}
                                        onClick={() => handleOrderStackClick(order.id)}
                                        className={`border-2 rounded-lg p-2 text-center shadow-sm h-16 flex items-center justify-center cursor-pointer transition-transform transform hover:scale-105 ${statusColors[order.status] || 'bg-gray-100'}`}
                                    >
                                        <span className="text-sm font-semibold">{order.id}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!ordersLoading && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-h-[65vh] overflow-y-auto scrollbar-hide p-1">
                            {getSortedOrders().length === 0 ? (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-lg font-semibold text-gray-700">All caught up!</p>
                                    <p className="text-gray-500">No new app orders at the moment.</p>
                                </div>
                            ) : (
                                getSortedOrders().map((order, index) => (
                                    <div
                                        key={`${order.id}-${index}`}
                                        ref={el => (orderRefs.current[order.id] = el)}
                                        className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all duration-300"
                                    >
                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{order.id}</h3>
                                                    <p className="text-sm text-gray-500">by {order.customer}</p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${ { pending: 'bg-yellow-100 text-yellow-800', delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }[order.status] || 'bg-gray-100' }`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-4">{order.date} at {order.time}</p>
                                        </div>
                                        <div className="flex-grow p-5 pt-0 space-y-3">
                                            {order.items.slice(0, 3).map((item, itemIndex) => (
                                                <div key={itemIndex} className="flex justify-between items-center text-sm">
                                                    <p className="text-gray-600">{item.name} <span className="text-gray-400">×{item.qty}</span></p>
                                                    <p className="font-medium text-gray-800">{item.price}</p>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && <p className="text-sm text-gray-400 text-center pt-1">+ {order.items.length - 3} more items</p>}
                                        </div>
                                        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                                            {order.status === 'pending' ? (
                                                <div className="flex space-x-3">
                                                    <Button variant="success" className="w-full" onClick={() => handleOrderAction(order, 'delivered')}>Delivered</Button>
                                                    <Button variant="danger" className="w-full" onClick={() => handleOrderAction(order, 'cancel')}>Cancel</Button>
                                                </div>
                                            ) : (
                                                <p className="text-center text-sm font-medium text-gray-500">Order was {order.status}.</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {/* --- INVENTORY SECTION (UNCHANGED) --- */}
            {activeTab === 'inventory' && (
                <div className="space-y-6">
                    {loading && <div className="flex justify-center items-center text-center py-4"><Loader/></div>}
                    {!loading && (
                        <div className="max-h-[500px] overflow-y-auto pr-2" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'thin', scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filterStockByCategory().length === 0 ? (
                                    <div className="col-span-full text-center py-8 text-gray-500">No food items found</div>
                                ) : (
                                    filterStockByCategory().map((item, idx) => (
                                        <div key={`${item.id}-${idx}`} className="bg-white border border-gray-300 rounded-lg p-4 shadow space-y-3">
                                            <div className="text-sm font-semibold text-gray-800">{item.quantity <= item.threshold ? 'Low Stock' : 'Sufficient Stock'}</div>
                                            <div className="text-sm text-gray-700">Item: <span className="font-medium">{item.name}</span></div>
                                            <div className="text-sm text-gray-700">Stock Level: <span className="font-medium">{item.quantity}</span></div>
                                            <div className="text-sm text-gray-700">Status:{' '}
                                                <span className={`font-semibold ${item.quantity <= item.threshold ? 'text-red-600' : item.quantity <= item.threshold * 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {item.quantity === 0 ? 'Out of Stock' : item.quantity <= item.threshold ? 'Critical' : 'Normal'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <Button size="sm" variant='success' onClick={() => { setSelectedItem(item); setShowRestockModal(true); }}>Restock</Button>
                                                <span className="text-xs text-gray-400 underline cursor-pointer" onClick={() => navigate('/inventory')}>View Inventory</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- All Modals are Unchanged --- */}
            <Modal isOpen={showOrderModal} onClose={handleCloseOrderModal} title={orderModalAction === 'delivered' ? 'Confirm Delivery' : 'Confirm Cancellation'} footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={handleCloseOrderModal} disabled={orderActionLoading}>Cancel</Button>
                    <Button variant={orderModalAction === 'delivered' ? 'success' : 'danger'} onClick={handleConfirmOrderAction} disabled={orderActionLoading}>
                        {orderActionLoading ? 'Processing...' : 'Confirm'}
                    </Button>
                </div>
            }>
                <p className="text-gray-600">{orderModalAction === 'delivered' ? `Mark order ${selectedOrder?.id} as delivered?` : `Cancel order ${selectedOrder?.id}?`}</p>
            </Modal>
            <Modal isOpen={showRestockModal} onClose={handleCloseModal} title={`Restock: ${selectedItem?.name}`} footer={
                <div className="space-x-2">
                    <Button variant="secondary" onClick={handleCloseModal} disabled={modalLoading}>Cancel</Button>
                    <Button variant="success" onClick={handleRestock} disabled={modalLoading || !quantity}>
                        {modalLoading ? 'Processing...' : 'Add Stock'}
                    </Button>
                </div>
            }>
                {selectedItem && (
                    <div className="space-y-4">
                        <table className="w-full text-sm border border-gray-300 rounded">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border border-gray-300 text-left">Item</th>
                                    <th className="p-2 border border-gray-300 text-left">Current Stock</th>
                                    <th className="p-2 border border-gray-300 text-left">Threshold</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-2 border border-gray-300">{selectedItem.name}</td>
                                    <td className="p-2 border border-gray-300">{selectedItem.quantity}</td>
                                    <td className="p-2 border border-gray-300">{selectedItem.threshold}</td>
                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                            <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-2 border rounded" placeholder="Enter quantity to add" min="1" disabled={modalLoading} />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Notifications;