import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ManageCategories = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        isActive: true,
        sortOrder: 0
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/admin/categories`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim()) {
            setError('Category name is required');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            if (editingId) {
                const response = await axios.put(
                    `${API_URL}/api/admin/categories/${editingId}`,
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCategories(categories.map(cat =>
                    cat._id === editingId ? response.data : cat
                ));
                setEditingId(null);
            } else {
                const response = await axios.post(
                    `${API_URL}/api/admin/categories`,
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCategories([response.data, ...categories]);
            }

            resetForm();
            alert(editingId ? 'Category updated successfully!' : 'Category created successfully!');
        } catch (error) {
            console.error('Error saving category:', error);
            setError(error.response?.data?.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category) => {
        setForm({
            name: category.name,
            description: category.description || '',
            isActive: category.isActive,
            sortOrder: category.sortOrder || 0
        });
        setEditingId(category._id);
        setError('');
        // Scroll to form on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            setLoading(true);
            await axios.delete(`${API_URL}/api/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            setCategories(categories.filter(cat => cat._id !== id));
            alert('Category deleted successfully!');
        } catch (error) {
            console.error('Error deleting category:', error);
            setError(error.response?.data?.message || 'Failed to delete category');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            isActive: true,
            sortOrder: 0
        });
        setEditingId(null);
        setError('');
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const response = await axios.put(
                `${API_URL}/api/admin/categories/${id}`,
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
            );
            setCategories(categories.map(cat =>
                cat._id === id ? response.data : cat
            ));
        } catch (error) {
            console.error('Error updating category status:', error);
            setError('Failed to update category status');
        }
    };

    if (loading && categories.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading categories...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div>
                    <h2 className="text-xl lg:text-2xl font-semibold text-[#0e0e53]">
                        {t('admin.categories.title', { defaultValue: 'Manage Categories' })}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Create and manage product categories for your jewelry store
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

            {/* Category Form */}
            <form onSubmit={handleSubmit} className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                    {editingId ? 'Edit Category' : 'Add New Category'}
                </h3>

                <div className="space-y-4">
                    {/* Category Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g., Necklaces"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/* Sort Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort Order
                        </label>
                        <input
                            type="number"
                            value={form.sortOrder}
                            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description of this category"
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active Category</span>
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Saving...' : editingId ? 'Update Category' : 'Add Category'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Existing Categories ({categories.length})</h3>
                </div>

                {/* Desktop Table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sort Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {category.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-xs truncate">
                                        {category.description || 'No description'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => toggleStatus(category._id, category.isActive)}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            category.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {category.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.sortOrder}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile-friendly category cards */}
                <div className="sm:hidden p-4">
                    <div className="grid grid-cols-1 gap-4">
                        {categories.map((category) => (
                            <div key={category._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="p-4">
                                    <h4 className="font-medium text-gray-900 truncate" title={category.name}>
                                        {category.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1 truncate">
                                        {category.description || 'No description'}
                                    </p>
                                    <div className="mt-2">
                                        <button
                                            onClick={() => toggleStatus(category._id, category.isActive)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                category.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {category.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Sort Order: {category.sortOrder}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Created: {new Date(category.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-3 border-t border-gray-100">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(category)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {categories.length === 0 && (
                        <div className="text-center py-8">
                            <div className="text-gray-500">No categories found. Create your first category above.</div>
                        </div>
                    )}
                </div>

                {categories.length === 0 && (
                    <div className="hidden sm:block text-center py-8">
                        <div className="text-gray-500">No categories found. Create your first category above.</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageCategories;