import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import {Link} from "react-router-dom";

const AdminOverview = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        customers: 0,
        revenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('30d');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/stats/overview`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setStats(response.data.stats);
            setRecentOrders(response.data.recentOrders || []);
            setTopProducts(response.data.topProducts || []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/admin/analytics/sales?period=${period}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setSalesData(response.data.salesData || []);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            refunded: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Products</p>
                            <p className="text-3xl font-bold">{stats.products}</p>
                        </div>
                        <div className="text-4xl opacity-80">💎</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Orders</p>
                            <p className="text-3xl font-bold">{stats.orders}</p>
                        </div>
                        <div className="text-4xl opacity-80">📦</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Customers</p>
                            <p className="text-3xl font-bold">{stats.customers}</p>
                        </div>
                        <div className="text-4xl opacity-80">👥</div>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-yellow-100 text-sm font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold">{stats.revenue.toLocaleString()}</p>
                            <p className="text-xs text-yellow-100">AMD</p>
                        </div>
                        <div className="text-4xl opacity-80">💰</div>
                    </div>
                </div>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Sales Analytics</h3>
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg text-sm"
                        >
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                            <option value="1y">Last year</option>
                        </select>
                    </div>

                    {salesData.length > 0 ? (
                        <div className="space-y-4">
                            {/* Simple bar chart representation */}
                            <div className="h-64 flex items-end space-x-2">
                                {salesData.slice(-7).map((data, index) => {
                                    const maxRevenue = Math.max(...salesData.map(d => d.revenue));
                                    const height = (data.revenue / maxRevenue) * 100;
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div
                                                className="w-full bg-blue-500 rounded-t"
                                                style={{ height: `${height}%` }}
                                                title={`${data.revenue.toLocaleString()} AMD`}
                                            />
                                            <div className="text-xs text-gray-500 mt-2 text-center">
                                                {data._id.day}/{data._id.month}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="text-center text-sm text-gray-600">
                                Revenue over time (AMD)
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No sales data available for this period
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold mb-4">Products by Category</h3>
                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="capitalize font-medium">
                                        {product._id || 'Uncategorized'}
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{
                                                    width: `${(product.count / Math.max(...topProducts.map(p => p.count))) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-semibold w-8 text-right">
                                            {product.count}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500">No product data available</div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold">Recent Orders</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentOrders.length > 0 ? (
                            recentOrders.map((order) => (
                                <div key={order._id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                #{order._id.slice(-8)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {order.firstName} {order.lastName}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium">
                                                {order.total?.toLocaleString()} AMD
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status || 'pending')}`}>
                                                {order.status || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-6 text-gray-500 text-center">
                                No recent orders
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold">Quick Actions</h3>
                    </div>
                    <div className="p-6 space-y-4 flex flex-col">
                        <Link to="/admin/products"
                            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
                            Add New Product
                        </Link>
                        <Link to="/admin/collections"
                            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors">
                            Create Collection
                        </Link>
                        <Link to="/admin/orders"
                            className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 transition-colors">
                            View All Orders
                        </Link>
                        <Link to="/admin/categories"
                            className="w-full bg-yellow-600 text-white p-3 rounded-lg hover:bg-yellow-700 transition-colors">
                            Manage Categories
                        </Link>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Database Connection</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Payment Gateway</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Image Upload Service</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;