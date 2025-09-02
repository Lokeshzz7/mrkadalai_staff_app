import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { apiRequest } from '../utils/api';
import { useOutletDetails } from '../utils/outletUtils';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [inventoryTab, setInventoryTab] = useState('food');
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  // New states for orders functionality
  const [allOrders, setAllOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalAction, setOrderModalAction] = useState('');
  const [orderActionLoading, setOrderActionLoading] = useState(false);

  const navigate = useNavigate();

  // Get outlet ID from utility hook
  const { outletId } = useOutletDetails();

  // Fetch recent orders for notifications
  useEffect(() => {
    if (outletId && activeTab === 'orders') {
      fetchRecentOrders();
    }
  }, [outletId, activeTab]);

  useEffect(() => {
    if (outletId && activeTab === 'inventory') {
      fetchStocks();
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
        // Filter only app orders and transform API data
        const appOrders = response.orders
          .filter(order => order.orderType?.toLowerCase() === 'app')
          .map(order => {
            // Format items string
            const itemsString = order.items.map(item =>
              `${item.name} (${item.quantity})`
            ).join(', ');

            // Format time from createdAt
            const orderTime = new Date(order.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });

            return {
              id: `#${order.billNumber}`,
              customer: order.customerName,
              date: new Date(order.createdAt).toLocaleDateString(),
              time: orderTime,
              items: order.items.map(item => ({
                name: item.name,
                price: `₹${item.unitPrice}`,
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
            };
          });

        setAllOrders(appOrders);
      } else {
        setAllOrders([]);
      }
      setOrdersError('');
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
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!quantity || !selectedItem) {
      setError('Please enter a valid quantity');
      return;
    }

    if (!outletId) {
      setError('Outlet ID not found');
      return;
    }

    setModalLoading(true);
    setError('');
    try {
      const response = await apiRequest('/staff/outlets/add-stock/', {
        method: 'POST',
        body: {
          productId: selectedItem.id,
          outletId,
          addedQuantity: parseInt(quantity)
        }
      });

      console.log('Restock response:', response);

      handleCloseModal();
      await fetchStocks();
      console.log('Stock restocked successfully');

    } catch (err) {
      setError(err.message || 'Error restocking item');
      console.error('Error restocking:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowRestockModal(false);
    setSelectedItem(null);
    setQuantity('');
    setError('');
    setModalLoading(false);
  };

  // Order action handlers
  const handleOrderAction = (order, action) => {
    setSelectedOrder(order);
    setOrderModalAction(action);
    setShowOrderModal(true);
  };

  const handleConfirmOrderAction = async () => {
    if (!selectedOrder || !outletId) return;

    try {
      setOrderActionLoading(true);
      const orderId = selectedOrder.orderId;

      let status;
      switch (orderModalAction) {
        case 'delivered':
          status = 'DELIVERED';
          break;
        case 'cancel':
          status = 'CANCELLED';
          break;
        default:
          return;
      }

      const requestData = {
        orderId: parseInt(orderId),
        outletId: parseInt(outletId),
        status: status
      };

      const response = await apiRequest('/staff/outlets/update-order/', {
        method: 'PUT',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.message) {
        // Update the order status locally (keep all orders in queue)
        setAllOrders(prevOrders =>
          prevOrders.map(order =>
            order.orderId === selectedOrder.orderId
              ? { ...order, status: orderModalAction === 'delivered' ? 'delivered' : 'cancelled' }
              : order
          )
        );

        handleCloseOrderModal();
        console.log('Order updated successfully:', response.message);
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setOrdersError(err.message || 'Error updating order');
    } finally {
      setOrderActionLoading(false);
    }
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
    setOrderModalAction('');
    setOrdersError('');
    setOrderActionLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✓';
      case 'cancelled': return '✕';
      case 'pending': return '';
      default: return '';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-600 border-yellow-300';
      case 'preparing': return 'bg-blue-100 text-blue-600 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-600 border-green-300';
      case 'delivered': return 'bg-white text-green-600 border-green-300';
      case 'cancelled': return 'bg-white text-red-600 border-red-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const isOrderCompleted = (status) => {
    const completedStatuses = ['completed', 'delivered', 'cancelled'];
    return completedStatuses.includes(status.toLowerCase());
  };

  const getStockLevel = (quantity, threshold) => {
    if (quantity <= threshold) {
      return 'Low Stock';
    } else if (quantity <= threshold * 2) {
      return 'Medium Stock';
    } else {
      return 'High Stock';
    }
  };

  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) {
      return 'Out of Stock';
    } else if (quantity <= threshold) {
      return 'Critical';
    } else if (quantity <= threshold * 1.5) {
      return 'Warning';
    } else if (quantity <= threshold * 2) {
      return 'Moderate';
    } else {
      return 'Normal';
    }
  };

  const filterStockByCategory = () => {
    if (loading) return [];

    // Only return food items
    return stockData.filter(item => {
      return ['Meals', 'Starters', 'Desserts', 'Beverages'].includes(item.category);
    });
  };

  const getOrderModalContent = () => {
    switch (orderModalAction) {
      case 'delivered':
        return {
          title: 'Mark as Delivered',
          message: `Are you sure you want to mark order ${selectedOrder?.id} as delivered?`
        };
      case 'cancel':
        return {
          title: 'Cancel Order',
          message: `Are you sure you want to cancel order ${selectedOrder?.id}? This action cannot be undone.`
        };
      default:
        return { title: '', message: '' };
    }
  };

  // Sort orders to implement queue functionality (pending first, then all others)
  const getSortedOrders = () => {
    return [...allOrders].sort((a, b) => {
      // Pending orders first, then others
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      // For same status, sort by creation time
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  };

  const getHeadingText = () => {
    if (activeTab === 'orders') {
      return 'App Orders List';
    } else {
      return 'Inventory';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Error Display */}
      {(error || ordersError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || ordersError}
        </div>
      )}

      {/* Heading and Tabs */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{getHeadingText()}</h2>
        <div className="flex space-x-4">
          <Button
            variant={activeTab === 'orders' ? 'black' : 'secondary'}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'black' : 'secondary'}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </Button>
        </div>
      </div>

      {/* Orders Section */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Orders List Heading */}
          {/* This heading is now managed by getHeadingText and combined with buttons */}

          {/* Loading State */}
          {ordersLoading && (
            <div className="text-center py-4">
              <div className="text-gray-600">Loading orders...</div>
            </div>
          )}

          {/* Recent Order IDs - Stack display with status colors */}
          {!ordersLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {getSortedOrders().slice(0, 6).map((order) => (
                <div
                  key={order.id}
                  className={`border-2 rounded-lg p-2 text-center shadow-sm h-16 flex items-center justify-center ${getStatusColor(order.status)}`}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(order.status) && (
                      <span className="text-sm font-bold">{getStatusIcon(order.status)}</span>
                    )}
                    <span className="text-sm font-medium">{order.id}</span>
                  </div>
                </div>
              ))}
              {allOrders.length === 0 && !ordersLoading && (
                <div className="col-span-full text-center py-4 text-gray-500">
                  No app orders found
                </div>
              )}
            </div>
          )}

          {/* Orders Information */}
          {!ordersLoading && allOrders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto"
              style={{ scrollBehavior: 'smooth' }}>
              {getSortedOrders().map((order, index) => (
                <div
                  key={`${order.id}-${index}`}
                  className="bg-white border border-gray-300 rounded-lg p-4 shadow flex flex-col"
                  style={{ minHeight: '300px' }}
                >
                  {/* Header Line: ID and Customer */}
                  <div className="mb-3">
                    <h4 className="text-md font-bold text-gray-800">
                      {order.id} from {order.customer}
                    </h4>
                    <p className="text-xs text-gray-500">{order.date} at {order.time}</p>
                  </div>

                  {/* Items - Flexible height with smooth scroll */}
                  <div className="flex-grow mb-4">
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2"
                      style={{
                        scrollBehavior: 'smooth',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
                      }}>
                      {order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="border-b border-gray-200 pb-2 last:border-b-0">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            <span className="text-sm font-semibold text-gray-800">{item.price}</span>
                          </div>
                          <p className="text-xs text-gray-500">{item.description}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-t border-gray-300 mb-3" />

                  {/* Footer - Action buttons fixed at bottom */}
                  <div className="flex justify-end items-center mt-auto">
                    <div className="flex space-x-2">
                      <button
                        className="w-8 h-8 bg-white border-2 border-green-500 text-green-500 rounded-lg hover:bg-green-50 shadow-md shadow-green-200 disabled:opacity-50 transition-all duration-200"
                        onClick={() => handleOrderAction(order, 'delivered')}
                        disabled={isOrderCompleted(order.status)}
                      >
                        ✓
                      </button>
                      <button
                        className="w-8 h-8 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 shadow-md shadow-red-200 disabled:opacity-50 transition-all duration-200"
                        onClick={() => handleOrderAction(order, 'cancel')}
                        disabled={isOrderCompleted(order.status)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inventory Section */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Heading */}
          {/* This heading is now managed by getHeadingText and combined with buttons */}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="text-gray-600">Loading inventory data...</div>
            </div>
          )}

          {/* Inventory Cards - Scrollable */}
          {!loading && (
            <div className="max-h-[500px] overflow-y-auto pr-2"
              style={{
                scrollBehavior: 'smooth',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(156, 163, 175, 0.5) transparent'
              }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filterStockByCategory().length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No food items found
                  </div>
                ) : (
                  filterStockByCategory().map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="bg-white border border-gray-300 rounded-lg p-4 shadow space-y-3"
                    >
                      <div className="text-sm font-semibold text-gray-800">
                        {getStockLevel(item.quantity, item.threshold)}
                      </div>
                      <div className="text-sm text-gray-700">
                        Item: <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Stock Level: <span className="font-medium">{item.quantity}</span>
                      </div>
                      <div className="text-sm text-gray-700">
                        Status:{' '}
                        <span
                          className={`font-semibold ${item.quantity <= item.threshold
                            ? 'text-red-600'
                            : item.quantity <= item.threshold * 1.5
                              ? 'text-yellow-600'
                              : 'text-green-600'
                            }`}
                        >
                          {getStockStatus(item.quantity, item.threshold)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <Button
                          size="sm"
                          className="bg-success"
                          variant='success'
                          onClick={() => {
                            setSelectedItem(item);
                            setShowRestockModal(true);
                          }}
                        >
                          Restock
                        </Button>
                        <span
                          className="text-xs text-gray-400 underline cursor-pointer"
                          onClick={() => navigate('/inventory')}
                        >
                          View Inventory
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Action Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={handleCloseOrderModal}
        title={getOrderModalContent().title}
        footer={
          <div className="space-x-2">
            <Button
              variant="secondary"
              onClick={handleCloseOrderModal}
              disabled={orderActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant={orderModalAction === 'delivered' ? 'success' : 'danger'}
              onClick={handleConfirmOrderAction}
              disabled={orderActionLoading}
            >
              {orderActionLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Modal Error Display */}
          {ordersError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
              {ordersError}
            </div>
          )}

          <p className="text-gray-600">{getOrderModalContent().message}</p>

          {selectedOrder && (
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">Order Details:</p>
              <p className="text-sm text-gray-600">Customer: {selectedOrder.customer}</p>
              <p className="text-sm text-gray-600">Items: {selectedOrder.totalItems}</p>
              <p className="text-sm text-gray-600">Time: {selectedOrder.time}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Restock Modal */}
      <Modal
        isOpen={showRestockModal}
        onClose={handleCloseModal}
        title="Restock Item"
        footer={
          <div className="space-x-2">
            <Button
              variant="secondary"
              onClick={handleCloseModal}
              disabled={modalLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleRestock}
              disabled={modalLoading || !quantity}
            >
              {modalLoading ? 'Processing...' : 'Add Stock'}
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            {/* Modal Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            {/* Table-style display for item details */}
            <table className="w-full text-sm border border-gray-300 rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border border-gray-300 text-left">Item</th>
                  <th className="p-2 border border-gray-300 text-left">Category</th>
                  <th className="p-2 border border-gray-300 text-left">Current Stock</th>
                  <th className="p-2 border border-gray-300 text-left">Threshold</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-gray-300">{selectedItem.name}</td>
                  <td className="p-2 border border-gray-300">{selectedItem.category}</td>
                  <td className="p-2 border border-gray-300">{selectedItem.quantity}</td>
                  <td className="p-2 border border-gray-300">{selectedItem.threshold}</td>
                </tr>
              </tbody>
            </table>

            {/* Quantity input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity to Add
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter quantity to add"
                min="1"
                disabled={modalLoading}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;