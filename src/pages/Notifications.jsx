import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Marquee from 'react-fast-marquee';
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
  const navigate = useNavigate();

  // Get outlet ID from utility hook
  const { outletId } = useOutletDetails();

  // ! Fake Data for recent orders (should be replaced with API)
  const recentOrderIds = ['#12345', '#12346', '#12347', '#12348', '#12349', '#12350'];

  // ! Fake Data for orders (should be replaced with API)
  const orders = [
    {
      id: '#12345',
      customer: 'John Doe',
      date: '2025-06-05',
      time: '2:30 PM',
      items: [
        { name: 'Pizza', price: '₹300', description: 'Cheesy with toppings', qty: 1 },
        { name: 'Burger', price: '₹200', description: 'Grilled beef burger', qty: 1 },
      ],
      totalItems: 2,
    },
    {
      id: '#12346',
      customer: 'Jane Smith',
      date: '2025-06-05',
      time: '2:25 PM',
      items: [
        { name: 'Pasta', price: '₹250', description: 'Creamy Alfredo', qty: 1 },
      ],
      totalItems: 1,
    },
    // Additional duplicate entries...
  ];

  useEffect(() => {
    if (outletId && activeTab === 'inventory') {
      fetchStocks();
    }
  }, [outletId, activeTab]);

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

  const getTimeAgo = (updatedAt) => {
    if (!updatedAt) return 'Unknown';
    
    const now = new Date();
    const updated = new Date(updatedAt);
    const diffInMinutes = Math.floor((now - updated) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Heading */}
      <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>

      {/* Marquee Section */}
      <div className="w-full bg-white rounded-lg shadow-inner border border-gray-300 overflow-hidden">
        <Marquee gradient={false} speed={50} pauseOnHover={true}>
          <div className="flex gap-6 px-4 py-2">
            <span className="text-sm text-gray-700">New order received from Table A1</span>
            <span className="text-sm text-gray-700">Inventory updated: Tomatoes low stock</span>
            <span className="text-sm text-gray-700">Order #12345 delivered successfully</span>
          </div>
        </Marquee>
      </div>

      {/* Tabs */}
      <div className="flex justify-end space-x-4">
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

      {/* Orders Section */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Orders List Heading */}
          <h3 className="text-xl font-semibold text-gray-800">Orders List</h3>

          {/* Recent Order IDs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recentOrderIds.map((orderId) => (
              <div
                key={orderId}
                className="bg-white border border-gray-300 rounded-lg p-4 text-center shadow"
              >
                <span className="text-sm font-medium text-gray-700">{orderId}</span>
              </div>
            ))}
          </div>

          {/* Orders Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto scrollbar-hide">
            {orders.map((order, index) => (
              <div
                key={`${order.id}-${index}`}
                className="bg-white border border-gray-300 rounded-lg p-4 shadow space-y-3"
              >
                {/* Header Line: ID and Customer */}
                <div>
                  <h4 className="text-md font-bold text-gray-800">
                    {order.id} from {order.customer}
                  </h4>
                  <p className="text-xs text-gray-500">{order.date} at {order.time}</p>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border-b border-gray-200 pb-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-semibold text-gray-800">{item.price}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.description}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <hr className="border-t border-gray-300" />

                {/* Footer */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-700 font-medium">
                    Total Items: {order.totalItems}
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="success">✓</Button>
                    <Button size="sm" variant="danger">✕</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Section */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Heading */}
          <h3 className="text-xl font-semibold text-gray-800">Inventory</h3>

          {/* No sub-tabs needed - only showing food items */}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <div className="text-gray-600">Loading inventory data...</div>
            </div>
          )}

          {/* Inventory Cards - Scrollable */}
          {!loading && (
            <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-hide scrollbar-track-gray-200">
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
                          className={`font-semibold ${
                            item.quantity <= item.threshold 
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