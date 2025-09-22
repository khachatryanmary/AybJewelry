import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Compressor from 'compressorjs';

const ManageProducts = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState(['Classic']);
    const [form, setForm] = useState({
        name: '',
        price: '',
        category: '',
        image: '',
        productCollection: '',
        images: [],
        alt: '',
        description: '',
        details: [{ material: '', stone: '', finish: '', design: '', fit: '' }],
    });
    const [editingId, setEditingId] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [sliderFiles, setSliderFiles] = useState([]);
    const [sliderPreviews, setSliderPreviews] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showImageManager, setShowImageManager] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [adminName, setAdminName] = useState('Admin');
    const [imageError, setImageError] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const storedAdminName = localStorage.getItem('adminName') || 'Admin';
        setAdminName(storedAdminName);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');

            const [productsRes, assetsRes] = await Promise.all([
                axios.get(`${API_URL}/api/products`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${API_URL}/api/homepage-assets`, {
                    headers: { Authorization: `Bearer ${token}` },
                }).catch(() => ({ data: { collectionName: 'Spring 2025' } }))
            ]);

            setProducts(productsRes.data || []);

            const featuredCollection = assetsRes.data.collectionName || 'Spring 2025';
            const existingCollections = [...new Set(productsRes.data.map(product => product.productCollection).filter(Boolean))];
            const allCollections = [...new Set([featuredCollection, 'Classic', ...existingCollections])];

            setCollections(allCollections);
            setForm(prev => ({ ...prev, productCollection: featuredCollection }));
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error fetching data: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processImageFile(file, 'main');
        }
    };

    const handleSliderFilesChange = (e) => {
        const files = Array.from(e.target.files);
        processMultipleImageFiles(files);
    };

    const processImageFile = (file, type) => {
        if (file.size > 100 * 1024 * 1024) {
            setImageError(t('admin.products.imageSizeError', { defaultValue: 'File size should be less than 100MB' }));
            return;
        }
        if (!file.type.startsWith('image/')) {
            setImageError(t('admin.products.imageTypeError', { defaultValue: 'Please select an image file' }));
            return;
        }

        new Compressor(file, {
            quality: 0.7,
            maxWidth: 1920,
            success(compressedFile) {
                setImageError('');
                if (type === 'main') {
                    setImageFile(compressedFile);
                    const reader = new FileReader();
                    reader.onload = (e) => setImagePreview(e.target.result);
                    reader.readAsDataURL(compressedFile);
                }
                console.log(`Compressed ${type} image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            },
            error(err) {
                console.error('Compression error:', err);
                setImageError(t('admin.products.compressionError', { defaultValue: 'Failed to compress image' }));
            }
        });
    };

    const processMultipleImageFiles = (files) => {
        const validFiles = files.filter(file => {
            if (file.size > 100 * 1024 * 1024) {
                alert(t('admin.products.imageSizeErrorSlider', { defaultValue: `File ${file.name} is too large. Maximum size is 100MB` }));
                return false;
            }
            if (!file.type.startsWith('image/')) {
                alert(t('admin.products.imageTypeErrorSlider', { defaultValue: `File ${file.name} is not an image` }));
                return false;
            }
            return true;
        });

        validFiles.forEach(file => {
            new Compressor(file, {
                quality: 0.7,
                maxWidth: 1920,
                success(compressedFile) {
                    setSliderFiles(prev => [...prev, compressedFile]);
                    console.log(`Compressed slider image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        setSliderPreviews(prev => [...prev, { file: compressedFile.name, url: e.target.result }]);
                    };
                    reader.readAsDataURL(compressedFile);
                },
                error(err) {
                    console.error('Compression error:', err);
                    alert(t('admin.products.compressionError', { defaultValue: `Failed to compress ${file.name}` }));
                }
            });
        });
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files);

        if (type === 'main') {
            if (files.length > 1) {
                setImageError(t('admin.products.singleImageError', { defaultValue: 'Please drop only one image for the main product image' }));
                return;
            }
            processImageFile(files[0], 'main');
        } else if (type === 'slider') {
            processMultipleImageFiles(files);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeSliderFile = (index) => {
        const fileToRemove = sliderFiles[index];
        setSliderFiles(sliderFiles.filter((_, i) => i !== index));
        setSliderPreviews(sliderPreviews.filter(preview => preview.file !== fileToRemove.name));
    };

    const removeExistingSliderImage = async (imageUrl) => {
        try {
            const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
            await axios.delete(`${API_URL}/api/upload/cloudinary`, {
                data: { public_id: publicId },
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            setForm(prev => ({
                ...prev,
                images: prev.images.filter(img => img !== imageUrl)
            }));
            alert(t('admin.products.deleteSuccess', { defaultValue: 'Image deleted successfully!' }));
        } catch (error) {
            console.error('Error deleting slider image:', error);
            alert(t('admin.products.errorDeletingImage', { defaultValue: 'Error deleting image: ' }) + (error.response?.data?.message || error.message));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('folder', form.category ? `${form.category}s` : 'general');
        formData.append('public_id', `hero-${editingId || Date.now()}`);

        try {
            setUploading(true);
            setUploadProgress(0);
            const response = await axios.post(`${API_URL}/api/upload/cloudinary`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
                timeout: 300000,
            });

            return response.data.secure_url;
        } catch (error) {
            console.error('Error uploading image:', error);
            setImageError('Error uploading image: ' + (error.response?.data?.error || error.message));
            return null;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const uploadSliderImages = async () => {
        if (sliderFiles.length === 0) return [];
        const formData = new FormData();
        sliderFiles.forEach((file, index) => {
            formData.append('images', file);
        });
        formData.append('folder', form.category ? `${form.category}sDetails` : 'generalDetails');
        formData.append('productId', editingId || Date.now());

        try {
            setUploading(true);
            const response = await axios.post(`${API_URL}/api/upload/cloudinary`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
                timeout: 300000
            });
            return response.data.images ? response.data.images.map(img => img.secure_url) : [];
        } catch (error) {
            console.error('Error uploading slider images:', error);
            const errorMsg = error.response?.status === 500
                ? t('admin.products.serverError', { defaultValue: 'Server error uploading images. Check server logs or file size.' })
                : t('admin.products.sliderUploadFailed', { defaultValue: 'Error uploading slider images: ' }) + (error.response?.data?.error || error.message);
            alert(errorMsg);
            return [];
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!editingId && !imageFile) {
            setImageError(t('admin.products.imageRequired', { defaultValue: 'Main product image is required' }));
            return;
        }

        if (!form.name || !form.price || !form.category) {
            alert(t('admin.products.formIncomplete', { defaultValue: 'Please fill in all required fields' }));
            return;
        }

        try {
            setUploading(true);
            let imagePath = form.image;
            let sliderImagePaths = [...form.images];

            if (imageFile) {
                imagePath = await uploadImage();
                if (!imagePath) {
                    return;
                }
            }

            if (sliderFiles.length > 0) {
                const newSliderPaths = await uploadSliderImages();
                sliderImagePaths = [...sliderImagePaths, ...newSliderPaths];
            }

            const cleanDetails = form.details.map(detail => {
                const cleanDetail = {};
                Object.keys(detail).forEach(key => {
                    if (key !== '_id' && detail[key] && detail[key].trim() !== '') {
                        cleanDetail[key] = detail[key].trim();
                    }
                });
                return cleanDetail;
            }).filter(detail => Object.keys(detail).length > 0);

            const productData = {
                ...form,
                image: imagePath,
                images: sliderImagePaths,
                details: cleanDetails,
            };

            if (editingId) {
                const response = await axios.put(`${API_URL}/api/products/${editingId}`, productData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                });
                setProducts(products.map(p => (p._id === editingId ? response.data : p)));
                setEditingId(null);
                alert(t('admin.products.updateSuccess', { defaultValue: 'Product updated successfully!' }));
                if (form.productCollection && !collections.includes(form.productCollection)) {
                    setCollections(prev => [...prev, form.productCollection]);
                }
            } else {
                const response = await axios.post(`${API_URL}/api/products`, productData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                });
                setProducts([response.data, ...products]);
                alert(t('admin.products.addSuccess', { defaultValue: 'Product added successfully!' }));
            }

            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
            alert(t('admin.products.errorSaving', { defaultValue: 'Error saving product: ' }) + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            price: '',
            category: '',
            image: '',
            productCollection: '',
            images: [],
            alt: '',
            description: '',
            details: [{ material: '', stone: '', finish: '', design: '', fit: '' }],
        });
        setImageFile(null);
        setImagePreview(null);
        setSliderFiles([]);
        setSliderPreviews([]);
        setImageError('');
        setUploadProgress(0);
        setEditingId(null);
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name || '',
            price: product.price || '',
            category: product.category || '',
            image: product.image || '',
            productCollection: product.productCollection || '',
            images: product.images || [],
            alt: product.alt || '',
            description: product.description || '',
            details: product.details || [{ material: '', stone: '', finish: '', design: '', fit: '' }],
        });
        setEditingId(product._id);
        setImagePreview(product.image || null);
        setImageFile(null);
        setSliderFiles([]);
        setSliderPreviews([]);
        setImageError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm(t('admin.products.confirmDelete', { defaultValue: 'Are you sure you want to delete this product?' }))) return;

        try {
            const product = products.find(p => p._id === id);
            if (product) {
                if (product.image) {
                    const publicId = product.image.split('/').slice(-2).join('/').split('.')[0];
                    await axios.delete(`${API_URL}/api/upload/cloudinary`, {
                        data: { public_id: publicId },
                        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                    });
                }
                if (product.images && product.images.length > 0) {
                    for (const imageUrl of product.images) {
                        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
                        await axios.delete(`${API_URL}/api/upload/cloudinary`, {
                            data: { public_id: publicId },
                            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                        });
                    }
                }
            }

            await axios.delete(`${API_URL}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            setProducts(products.filter(p => p._id !== id));
            alert(t('admin.products.deleteSuccess', { defaultValue: 'Product deleted successfully!' }));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(t('admin.products.errorDeleting', { defaultValue: 'Error deleting product: ' }) + (error.response?.data?.message || error.message));
        }
    };

    const addDetailField = () => {
        setForm({
            ...form,
            details: [...form.details, { material: '', stone: '', finish: '', design: '', fit: '' }]
        });
    };

    const removeDetailField = (index) => {
        setForm({
            ...form,
            details: form.details.filter((_, i) => i !== index)
        });
    };

    const updateDetailField = (index, field, value) => {
        const newDetails = [...form.details];
        newDetails[index][field] = value;
        setForm({ ...form, details: newDetails });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-gray-600">Loading products...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl lg:text-2xl font-semibold text-[#0e0e53]">
                    {t('admin.products.title', { defaultValue: 'Manage Products' })}
                </h2>
                <div className="text-sm text-gray-600">
                    {t('admin.products.loggedInAs', { defaultValue: 'Logged in as: ' })}
                    <span className="font-medium">{adminName}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Enter product name"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price (AMD) *
                            </label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm({ ...form, price: e.target.value })}
                                placeholder="0"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category *
                            </label>
                            <select
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">Select Category</option>
                                <option value="necklace">Necklace</option>
                                <option value="ring">Ring</option>
                                <option value="earring">Earring</option>
                                <option value="bracelet">Bracelet</option>
                                <option value="hairclip">Hairclip</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Collection
                            </label>
                            <input
                                type="text"
                                value={form.productCollection}
                                onChange={e => setForm({ ...form, productCollection: e.target.value })}
                                placeholder="Enter collection name or select existing"
                                list="collections-list"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <datalist id="collections-list">
                                {collections.map(collection => (
                                    <option key={collection} value={collection} />
                                ))}
                            </datalist>
                            <p className="text-xs text-gray-500 mt-1">
                                Type a custom collection name or select from existing ones
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Image Alt Text
                            </label>
                            <input
                                type="text"
                                value={form.alt}
                                onChange={e => setForm({ ...form, alt: e.target.value })}
                                placeholder="Describe the image"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Product description"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Details
                        </label>
                        {form.details.map((detail, index) => (
                            <div key={index} className="mb-3 p-3 border border-gray-200 rounded-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={detail.material}
                                        onChange={e => updateDetailField(index, 'material', e.target.value)}
                                        placeholder="Material"
                                        className="p-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={detail.stone}
                                        onChange={e => updateDetailField(index, 'stone', e.target.value)}
                                        placeholder="Stone"
                                        className="p-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={detail.finish}
                                        onChange={e => updateDetailField(index, 'finish', e.target.value)}
                                        placeholder="Finish"
                                        className="p-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={detail.design}
                                        onChange={e => updateDetailField(index, 'design', e.target.value)}
                                        placeholder="Design"
                                        className="p-2 border border-gray-300 rounded text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={detail.fit}
                                        onChange={e => updateDetailField(index, 'fit', e.target.value)}
                                        placeholder="Fit"
                                        className="p-2 border border-gray-300 rounded text-sm"
                                    />
                                </div>
                                {form.details.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeDetailField(index)}
                                        className="mt-2 text-red-600 text-sm hover:underline"
                                    >
                                        Remove Detail
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addDetailField}
                            className="text-blue-600 text-sm hover:underline"
                        >
                            + Add Detail
                        </button>
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-lg p-4 ${imageError ? 'border-red-300' : 'border-gray-300'} hover:border-blue-400 transition-colors`}
                        onDrop={(e) => handleDrop(e, 'main')}
                        onDragOver={handleDragOver}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Main Product Image {!editingId && '*'}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                        />
                        {imageError && (
                            <p className="text-red-500 text-sm mt-1">{imageError}</p>
                        )}
                        {imagePreview && (
                            <div className="mt-3">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded border"
                                />
                            </div>
                        )}
                        {uploading && uploadProgress > 0 && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                            Drag and drop an image here, or click to select. Max 100MB.
                        </p>
                    </div>

                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors"
                        onDrop={(e) => handleDrop(e, 'slider')}
                        onDragOver={handleDragOver}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Images (Slider)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleSliderFilesChange}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Select multiple images for the product gallery. Max 100MB each.
                        </p>
                    </div>

                    {form.images && form.images.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Images ({form.images.length})
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {form.images.map((imagePath, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={imagePath}
                                            alt={`Slider ${index + 1}`}
                                            className="w-full h-16 sm:h-20 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingSliderImage(imagePath)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {sliderPreviews.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Images to Upload ({sliderPreviews.length})
                            </label>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {sliderPreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={preview.url}
                                            alt={`New slider ${index + 1}`}
                                            className="w-full h-16 sm:h-20 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSliderFile(index)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            disabled={uploading}
                        >
                            {uploading
                                ? `Uploading... ${uploadProgress}%`
                                : editingId
                                    ? 'Update Product'
                                    : 'Add Product'
                            }
                        </button>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            {editingId ? 'Cancel Edit' : 'Clear Form'}
                        </button>
                    </div>
                </div>
            </form>

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">
                        Existing Products ({products.length})
                    </h3>
                </div>

                <div className="p-4 lg:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map(product => (
                            <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative group">
                                    <img
                                        src={product.image}
                                        alt={product.alt || product.name}
                                        className="w-full h-40 sm:h-48 object-cover"
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                                                title="Edit Product"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                                title="Delete Product"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {product.images && product.images.length > 0 && (
                                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                                            +{product.images.length}
                                        </div>
                                    )}
                                </div>

                                <div className="p-4">
                                    <h4 className="font-medium text-gray-900 truncate" title={product.name}>
                                        {product.name}
                                    </h4>
                                    <p className="text-lg font-bold text-blue-600">
                                        {Number(product.price).toLocaleString()} AMD
                                    </p>
                                    <p className="text-sm text-gray-600 capitalize">
                                        {product.category}
                                    </p>
                                    {product.productCollection && (
                                        <p className="text-sm text-gray-500">
                                            {product.productCollection}
                                        </p>
                                    )}
                                </div>

                                <div className="p-3 border-t border-gray-100 sm:hidden">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">No products found. Add your first product above.</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageProducts;