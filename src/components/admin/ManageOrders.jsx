import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-toastify';

const toastStyles = `
  @media (max-width: 639px) {
    .Toastify__toast {
      width: 280px;
      font-size: 14px;
      padding: 8px 12px;
      line-height: 1.4;
    }
    .Toastify__toast-body {
      padding: 4px;
    }
    .Toastify__close-button {
      font-size: 14px;
    }
  }
  @media (min-width: 640px) and (max-width: 767px) {
    .Toastify__toast {
      width: 320px;
      font-size: 15px;
      padding: 10px 14px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 6px;
    }
    .Toastify__close-button {
      font-size: 15px;
    }
  }
  @media (min-width: 768px) {
    .Toastify__toast {
      width: 360px;
      font-size: 16px;
      padding: 12px 16px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 8px;
    }
    .Toastify__close-button {
      font-size: 16px;
    }
  }
`;

const ManageOrders = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        trackingNumber: '',
        adminNotes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL;

    const statusOptions = [
        { value: 'pending', label: t('status.pending', { defaultValue: 'Pending' }), color: 'bg-yellow-100 text-yellow-800' },
        { value: 'confirmed', label: t('status.confirmed', { defaultValue: 'Confirmed' }), color: 'bg-blue-100 text-blue-800' },
        { value: 'processing', label: t('status.processing', { defaultValue: 'Processing' }), color: 'bg-purple-100 text-purple-800' },
        { value: 'shipped', label: t('status.shipped', { defaultValue: 'Shipped' }), color: 'bg-indigo-100 text-indigo-800' },
        { value: 'delivered', label: t('status.delivered', { defaultValue: 'Delivered' }), color: 'bg-green-100 text-green-800' },
        { value: 'cancelled', label: t('status.cancelled', { defaultValue: 'Cancelled' }), color: 'bg-red-100 text-red-800' },
        { value: 'refunded', label: t('status.refunded', { defaultValue: 'Refunded' }), color: 'bg-gray-100 text-gray-800' }
    ];
    useEffect(() => {
        fetchOrders();
    }, [filters]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/api/admin/orders?${queryParams}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setOrders(response.data.orders);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(t('error.fetchOrders', { defaultValue: 'Failed to fetch orders' }));        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handleStatusFilter = (status) => {
        setFilters({ ...filters, status, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const openOrderModal = async (order) => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/orders/${order._id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setSelectedOrder(response.data);
            setStatusUpdate({
                status: response.data.status || 'pending',
                trackingNumber: response.data.trackingNumber || '',
                adminNotes: response.data.adminNotes || ''
            });
            setShowOrderModal(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError(t('error.fetchOrderDetails', { defaultValue: 'Failed to fetch order details' }));
        }
    };

    const closeOrderModal = () => {
        setShowOrderModal(false);
        setSelectedOrder(null);
        setStatusUpdate({ status: '', trackingNumber: '', adminNotes: '' });
    };

    const handleUpdateOrderStatus = async () => {
        if (!selectedOrder) return;

        try {
            const response = await axios.put(
                `${API_URL}/api/admin/orders/${selectedOrder._id}/status`,
                statusUpdate,
                { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
            );

            setOrders(orders.map(order =>
                order._id === selectedOrder._id ? response.data : order
            ));

            closeOrderModal();
            toast.success(t('success.orderUpdated', { defaultValue: 'Order status updated successfully' }));
        } catch (error) {
            console.error('Error updating order status:', error);
            setError(t('error.updateOrderStatus', { defaultValue: 'Failed to update order status' }));        }
    };

    const getStatusColor = (status) => {
        const statusOption = statusOptions.find(opt => opt.value === status);
        return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">{t('admin.orders.loading', { defaultValue: 'Loading orders...' })}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-semibold text-[#0e0e53]">
                        {t('admin.orders.title', { defaultValue: 'Manage Orders' })}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        {t('admin.orders.subtitle', { defaultValue: 'View and manage customer orders, update statuses, and track shipments' })}
                    </p>
                </div>
                <div className="text-sm text-gray-600">
                    {t('admin.loggedInAs', { defaultValue: 'Logged in as: ' })}
                    <span className="font-medium">{localStorage.getItem('adminName') || 'Admin'}</span>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search by order number, email, or name..."
                            value={filters.search}
                            onChange={handleSearch}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={filters.status}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filters.limit}
                            onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value), page: 1 })}
                            className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">
                        Orders ({pagination.totalItems || 0})
                    </h3>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.orderNumber || `#${order._id.slice(-8)}`}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.firstName} {order.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">{order.email}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.cartItems?.length || 0} items
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.total?.toLocaleString()} AMD
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                                        {statusOptions.find(opt => opt.value === (order.status || 'pending'))?.label || 'Pending'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => openOrderModal(order)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile-friendly order cards */}
                <div className="sm:hidden p-4">
                    <div className="grid grid-cols-1 gap-4">
                        {orders.map((order) => (
                            <div key={order._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-4">
                                    <h4 className="font-medium text-gray-900 truncate" title={order.orderNumber || `#${order._id.slice(-8)}`}>
                                        {order.orderNumber || `#${order._id.slice(-8)}`}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {order.firstName} {order.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500">{order.email}</p>
                                    <p className="text-sm text-gray-900 mt-1">
                                        Items: {order.cartItems?.length || 0}
                                    </p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {order.total?.toLocaleString()} AMD
                                    </p>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                                            {statusOptions.find(opt => opt.value === (order.status || 'pending'))?.label || 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Date: {new Date(order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-3 border-t border-gray-100">
                                    <button
                                        onClick={() => openOrderModal(order)}
                                        className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {orders.length === 0 && !loading && (
                        <div className="text-center py-8">
                            <div className="text-gray-500">No orders found</div>
                        </div>
                    )}
                </div>

                {orders.length === 0 && !loading && (
                    <div className="hidden sm:block text-center py-8">
                        <div className="text-gray-500">No orders found</div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="p-4 lg:p-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-gray-700">
                            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                                const pageNum = Math.max(1, pagination.currentPage - 2) + i;
                                if (pageNum > pagination.totalPages) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                                            pagination.currentPage === pageNum
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700 border-gray-300'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg sm:text-xl font-semibold">
                                Order Details: {selectedOrder.orderNumber || `#${selectedOrder._id.slice(-8)}`}
                            </h3>
                            <button
                                onClick={closeOrderModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Customer Information</h4>
                                <div className="space-y-2 text-sm">
                                    <div><span className="font-medium">Name:</span> {selectedOrder.firstName} {selectedOrder.lastName}</div>
                                    <div><span className="font-medium">Email:</span> {selectedOrder.email}</div>
                                    <div><span className="font-medium">Phone:</span> {selectedOrder.phone}</div>
                                    {selectedOrder.deliveryMethod === 'delivery' && (
                                        <>
                                            <div><span className="font-medium">Address:</span> {selectedOrder.address}</div>
                                            <div><span className="font-medium">Region:</span> {selectedOrder.region}</div>
                                            <div><span className="font-medium">Postal Code:</span> {selectedOrder.postalCode}</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold mb-3">Update Status</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Status</label>
                                        <select
                                            value={statusUpdate.status}
                                            onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {statusUpdate.status === 'shipped' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Tracking Number</label>
                                            <input
                                                type="text"
                                                value={statusUpdate.trackingNumber}
                                                onChange={(e) => setStatusUpdate({ ...statusUpdate, trackingNumber: e.target.value })}
                                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter tracking number"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Admin Notes</label>
                                        <textarea
                                            value={statusUpdate.adminNotes}
                                            onChange={(e) => setStatusUpdate({ ...statusUpdate, adminNotes: e.target.value })}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows="3"
                                            placeholder="Internal notes about this order..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Order Items</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-3">
                                    {selectedOrder.cartItems?.map((item, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-2 border-b border-gray-200 last:border-b-0">
                                            <div className="flex items-center space-x-3">
                                                {item.image && (
                                                    <img
                                                        src={`${API_URL}${item.image}`}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Quantity: {item.quantity || 1}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-left sm:text-right mt-2 sm:mt-0">
                                                <div className="font-medium">
                                                    {(item.price * (item.quantity || 1)).toLocaleString()} AMD
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {item.price.toLocaleString()} AMD each
                                                </div>
                                            </div>
                                        </div>
                                    )) || <div className="text-gray-500">No items found</div>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center font-semibold text-lg">
                                        <span>Total:</span>
                                        <span>{selectedOrder.total?.toLocaleString()} AMD</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3">Order Timeline</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Order Created:</span>
                                        <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                    </div>
                                    {selectedOrder.shippedAt && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Shipped:</span>
                                            <span>{new Date(selectedOrder.shippedAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedOrder.deliveredAt && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Delivered:</span>
                                            <span>{new Date(selectedOrder.deliveredAt).toLocaleString()}</span>
                                        </div>
                                    )}
                                    {selectedOrder.trackingNumber && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Tracking Number:</span>
                                            <span className="font-mono">{selectedOrder.trackingNumber}</span>
                                        </div>
                                    )}
                                    {selectedOrder.adminNotes && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <span className="font-medium">Admin Notes:</span>
                                            <p className="mt-1 text-gray-600">{selectedOrder.adminNotes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6 pt-6 border-t border-gray-200">
                            <button
                                onClick={closeOrderModal}
                                className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleUpdateOrderStatus}
                                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Update Order
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageOrders;