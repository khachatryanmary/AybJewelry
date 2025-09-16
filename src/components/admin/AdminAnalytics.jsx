    import React, { useState, useEffect } from 'react';
    import { useTranslation } from 'react-i18next';
    import axios from 'axios';

    const AdminAnalytics = () => {
        const { t } = useTranslation();
        const [analytics, setAnalytics] = useState({
            salesData: [],
            categoryStats: []
        });
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');
        const [period, setPeriod] = useState('30d');

        const API_URL = import.meta.env.VITE_API_URL;

        useEffect(() => {
            fetchAnalytics();
        }, [period]);

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/admin/analytics/sales?period=${period}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                });
                setAnalytics(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
                setError('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };

        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="text-lg text-gray-600">Loading analytics...</div>
                </div>
            );
        }

        return (
            <div className="p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {t('admin.analytics.title', { defaultValue: 'Analytics & Reports' })}
                    </h2>
                    <p className="text-gray-600">
                        Detailed insights into your jewelry store performance
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Period Selector */}
                <div className="mb-6">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>

                {/* Sales Chart */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Sales Over Time</h3>
                    {analytics.salesData.length > 0 ? (
                        <div className="space-y-4">
                            <div className="h-64 flex items-end space-x-2">
                                {analytics.salesData.slice(-10).map((data, index) => {
                                    const maxRevenue = Math.max(...analytics.salesData.map(d => d.revenue));
                                    const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0;
                                    return (
                                        <div key={index} className="flex-1 flex flex-col items-center">
                                            <div
                                                className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                                                style={{ height: `${Math.max(height, 2)}%` }}
                                                title={`${data.revenue.toLocaleString()} AMD - ${data.orders} orders`}
                                            />
                                            <div className="text-xs text-gray-500 mt-2 text-center">
                                                {data._id.day}/{data._id.month}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="text-center text-sm text-gray-600">
                                Revenue (AMD) and Order Count
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No sales data available for this period
                        </div>
                    )}
                </div>

                {/* Category Performance */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
                    {analytics.categoryStats.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.categoryStats.map((category, index) => (
                                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium capitalize text-gray-900">
                                            {category._id || 'Uncategorized'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {category.count} items sold
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-32 bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-green-500 h-3 rounded-full"
                                                style={{
                                                    width: `${(category.revenue / Math.max(...analytics.categoryStats.map(c => c.revenue))) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <div className="font-semibold text-gray-900">
                                                {category.revenue.toLocaleString()} AMD
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-8">
                            No category data available
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                {analytics.salesData.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h4 className="font-semibold text-gray-700 mb-2">Total Revenue</h4>
                            <div className="text-2xl font-bold text-green-600">
                                {analytics.salesData.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()} AMD
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h4 className="font-semibold text-gray-700 mb-2">Total Orders</h4>
                            <div className="text-2xl font-bold text-blue-600">
                                {analytics.salesData.reduce((sum, day) => sum + day.orders, 0)}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h4 className="font-semibold text-gray-700 mb-2">Average Order Value</h4>
                            <div className="text-2xl font-bold text-purple-600">
                                {analytics.salesData.reduce((sum, day) => sum + day.orders, 0) > 0
                                    ? Math.round(analytics.salesData.reduce((sum, day) => sum + day.revenue, 0) / analytics.salesData.reduce((sum, day) => sum + day.orders, 0)).toLocaleString()
                                    : 0} AMD
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default AdminAnalytics;