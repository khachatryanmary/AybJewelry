import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ManageCollections = () => {
    const { t } = useTranslation();
    const [collections, setCollections] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        image: '',
        isFeatured: false,
        startDate: '',
        endDate: '',
        isActive: true,
        sortOrder: 0
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchCollections();
    }, []);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const response = await axios.get(`${API_URL}/api/admin/collections`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(response.data || []);
        } catch (error) {
            console.error('Error fetching collections:', error);
            // Try alternative endpoint
            try {
                const response = await axios.get(`${API_URL}/api/collections`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                });
                setCollections(response.data || []);
            } catch (fallbackError) {
                setError('Failed to fetch collections');
                console.error('Fallback also failed:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('File size should be less than 10MB');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('category', 'collections');

        try {
            setUploading(true);
            const response = await axios.post(`${API_URL}/api/upload/single`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
            });
            return response.data.imagePath;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!form.name.trim()) {
            setError('Collection name is required');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            let imagePath = form.image;
            if (imageFile) {
                imagePath = await uploadImage();
            }

            const collectionData = {
                ...form,
                image: imagePath,
                startDate: form.startDate || null,
                endDate: form.endDate || null
            };

            let response;
            if (editingId) {
                response = await axios.put(
                    `${API_URL}/api/admin/collections/${editingId}`,
                    collectionData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCollections(collections.map(col =>
                    col._id === editingId ? response.data : col
                ));
                setEditingId(null);
            } else {
                response = await axios.post(
                    `${API_URL}/api/admin/collections`,
                    collectionData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCollections([response.data, ...collections]);
            }

            resetForm();
            alert(editingId ? 'Collection updated successfully!' : 'Collection created successfully!');
        } catch (error) {
            console.error('Error saving collection:', error);
            setError(error.response?.data?.message || 'Failed to save collection');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (collection) => {
        setForm({
            name: collection.name || '',
            description: collection.description || '',
            image: collection.image || '',
            isFeatured: collection.isFeatured || false,
            startDate: collection.startDate ? new Date(collection.startDate).toISOString().split('T')[0] : '',
            endDate: collection.endDate ? new Date(collection.endDate).toISOString().split('T')[0] : '',
            isActive: collection.isActive !== false,
            sortOrder: collection.sortOrder || 0
        });
        setEditingId(collection._id);
        setImagePreview(collection.image ? `${API_URL}${collection.image}` : null);
        setImageFile(null);
        setError('');
        // Scroll to form on mobile
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this collection?')) return;

        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            await axios.delete(`${API_URL}/api/admin/collections/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCollections(collections.filter(col => col._id !== id));
            alert('Collection deleted successfully!');
        } catch (error) {
            console.error('Error deleting collection:', error);
            setError(error.response?.data?.message || 'Failed to delete collection');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            description: '',
            image: '',
            isFeatured: false,
            startDate: '',
            endDate: '',
            isActive: true,
            sortOrder: 0
        });
        setEditingId(null);
        setImageFile(null);
        setImagePreview(null);
        setError('');
    };

    const toggleStatus = async (id, field, currentValue) => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await axios.put(
                `${API_URL}/api/admin/collections/${id}`,
                { [field]: !currentValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCollections(collections.map(col =>
                col._id === id ? response.data : col
            ));
        } catch (error) {
            console.error('Error updating collection:', error);
            setError('Failed to update collection');
        }
    };

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                    {t('admin.collections.title', { defaultValue: 'Manage Collections' })}
                </h2>
                <p className="text-gray-600">
                    Create and manage jewelry collections for seasonal or themed product groupings
                </p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {/* Collection Form */}
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <h3 className="text-lg font-semibold mb-4">
                    {editingId ? 'Edit Collection' : 'Add New Collection'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name and Sort Order */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Collection Name *
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g., Spring 2025"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                value={form.sortOrder}
                                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Brief description of this collection"
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Collection Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {imagePreview && (
                            <div className="mt-3">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={form.isFeatured}
                                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">Featured Collection</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">Active Collection</span>
                        </label>
                    </div>

                    {/* Form Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading || uploading ? 'Saving...' : editingId ? 'Update Collection' : 'Add Collection'}
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
                </form>
            </div>

            {/* Collections List */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Existing Collections ({collections.length})</h3>
                </div>

                {/* Mobile-friendly layout */}
                <div className="p-4 lg:p-6">
                    {collections.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500">No collections found. Create your first collection above.</div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Collection
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Period
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Featured
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sort
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {collections.map((collection) => (
                                        <tr key={collection._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {collection.image && (
                                                        <img
                                                            className="h-10 w-10 rounded-full mr-3 object-cover"
                                                            src={`${API_URL}${collection.image}`}
                                                            alt={collection.name}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {collection.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 max-w-xs truncate">
                                                            {collection.description || 'No description'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {collection.startDate && collection.endDate ? (
                                                    <div>
                                                        <div>{new Date(collection.startDate).toLocaleDateString()}</div>
                                                        <div>to {new Date(collection.endDate).toLocaleDateString()}</div>
                                                    </div>
                                                ) : collection.startDate ? (
                                                    `From ${new Date(collection.startDate).toLocaleDateString()}`
                                                ) : collection.endDate ? (
                                                    `Until ${new Date(collection.endDate).toLocaleDateString()}`
                                                ) : (
                                                    'No dates set'
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(collection._id, 'isActive', collection.isActive)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        collection.isActive !== false
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {collection.isActive !== false ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => toggleStatus(collection._id, 'isFeatured', collection.isFeatured)}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        collection.isFeatured
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {collection.isFeatured ? 'Featured' : 'Not Featured'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {collection.sortOrder}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEdit(collection)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(collection._id)}
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

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-4">
                                {collections.map((collection) => (
                                    <div key={collection._id} className="border rounded-lg p-4">
                                        <div className="flex items-start space-x-3">
                                            {collection.image && (
                                                <img
                                                    className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                                                    src={`${API_URL}${collection.image}`}
                                                    alt={collection.name}
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                                    {collection.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {collection.description || 'No description'}
                                                </p>

                                                {/* Status badges */}
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <button
                                                        onClick={() => toggleStatus(collection._id, 'isActive', collection.isActive)}
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            collection.isActive !== false
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                        }`}
                                                    >
                                                        {collection.isActive !== false ? 'Active' : 'Inactive'}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleStatus(collection._id, 'isFeatured', collection.isFeatured)}
                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            collection.isFeatured
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}
                                                    >
                                                        {collection.isFeatured ? 'Featured' : 'Not Featured'}
                                                    </button>
                                                </div>

                                                {/* Date info */}
                                                {(collection.startDate || collection.endDate) && (
                                                    <div className="text-xs text-gray-400 mt-2">
                                                        {collection.startDate && collection.endDate ? (
                                                            `${new Date(collection.startDate).toLocaleDateString()} - ${new Date(collection.endDate).toLocaleDateString()}`
                                                        ) : collection.startDate ? (
                                                            `From ${new Date(collection.startDate).toLocaleDateString()}`
                                                        ) : (
                                                            `Until ${new Date(collection.endDate).toLocaleDateString()}`
                                                        )}
                                                    </div>
                                                )}

                                                {/* Sort order */}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Sort: {collection.sortOrder}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex space-x-2 mt-3">
                                            <button
                                                onClick={() => handleEdit(collection)}
                                                className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(collection._id)}
                                                className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCollections;