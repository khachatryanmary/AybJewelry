// components/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ManageUsers = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
        page: 1,
        limit: 20
    });
    const [pagination, setPagination] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/api/admin/customers?${queryParams}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setUsers(response.data.customers);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setFilters({ ...filters, search: e.target.value, page: 1 });
    };

    const handleSort = (field) => {
        const newOrder = filters.sortBy === field && filters.sortOrder === 'asc' ? 'desc' : 'asc';
        setFilters({ ...filters, sortBy: field, sortOrder: newOrder, page: 1 });
    };

    const handlePageChange = (newPage) => {
        setFilters({ ...filters, page: newPage });
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setNewRole(user.role || 'user');
        setShowRoleModal(true);
    };

    const closeRoleModal = () => {
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
    };

    const handleChangeRole = async () => {
        if (!selectedUser) return;

        try {
            const response = await axios.put(
                `${API_URL}/api/admin/users/${selectedUser._id}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
            );

            setUsers(users.map(user =>
                user._id === selectedUser._id ? { ...user, role: response.data.user.role } : user
            ));

            closeRoleModal();
            alert(`User role updated to ${newRole} successfully`);
        } catch (error) {
            console.error('Error updating user role:', error);
            setError('Failed to update user role');
        }
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-semibold text-[#0e0e53]">
                        {t('admin.users.title', { defaultValue: 'Manage Users' })}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        View and manage user roles and account status
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

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={filters.search}
                            onChange={handleSearch}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
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

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">
                        Users ({pagination.totalItems || 0})
                    </h3>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('name')}
                            >
                                User {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('email')}
                            >
                                Email {filters.sortBy === 'email' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Orders
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Spent
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                onClick={() => handleSort('createdAt')}
                            >
                                Joined {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.name} {user.surname || ''}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            ID: {user._id.slice(-8)}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{user.orderCount || 0}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {(user.totalSpent || 0).toLocaleString()} AMD
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        user.role === 'admin'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {user.role || 'user'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => openRoleModal(user)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        Change Role
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile-friendly user cards */}
                <div className="sm:hidden p-4">
                    <div className="grid grid-cols-1 gap-4">
                        {users.map((user) => (
                            <div key={user._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-4">
                                    <h4 className="font-medium text-gray-900 truncate" title={`${user.name} ${user.surname || ''}`}>
                                        {user.name} {user.surname || ''}
                                    </h4>
                                    <p className="text-sm text-gray-500">ID: {user._id.slice(-8)}</p>
                                    <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                                    <p className="text-sm text-gray-900 mt-1">Orders: {user.orderCount || 0}</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        {(user.totalSpent || 0).toLocaleString()} AMD
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                                    </p>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.role === 'admin'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role || 'user'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-3 border-t border-gray-100">
                                    <button
                                        onClick={() => openRoleModal(user)}
                                        className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                    >
                                        Change Role
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {users.length === 0 && !loading && (
                        <div className="text-center py-8">
                            <div className="text-gray-500">No users found</div>
                        </div>
                    )}
                </div>

                {users.length === 0 && !loading && (
                    <div className="hidden sm:block text-center py-8">
                        <div className="text-gray-500">No users found</div>
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

            {/* Role Change Modal */}
            {showRoleModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            Change Role for {selectedUser.name} {selectedUser.surname}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Email: {selectedUser.email}
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Role
                            </label>
                            <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                onClick={closeRoleModal}
                                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangeRole}
                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Update Role
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;