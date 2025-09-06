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

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const storedAdminName = localStorage.getItem('adminName') || 'Admin';
        setAdminName(storedAdminName);

        const fetchData = async () => {
            try {
                const [productsRes, assetsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/products`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                    }),
                    axios.get(`${API_URL}/api/homepage-assets`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                    }),
                ]);

                setProducts(productsRes.data);

                // Get featured collection from homepage assets
                const featuredCollection = assetsRes.data.collectionName || 'Spring 2025';

                // Get unique collections from existing products
                const existingCollections = [...new Set(productsRes.data.map(product => product.productCollection).filter(Boolean))];

                // Combine featured collection with existing collections and Classic
                const allCollections = [...new Set([featuredCollection, 'Classic', ...existingCollections])];

                setCollections(allCollections);
                setForm(prev => ({ ...prev, productCollection: featuredCollection }));
            } catch (error) {
                console.error('Error fetching data:', error);
                alert(t('admin.products.errorFetching', { defaultValue: 'Error fetching data: ' }) + error.response?.data?.message);
            }
        };
        fetchData();
    }, [API_URL, t]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
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
                    setImageFile(compressedFile);
                    console.log(`Compressed main image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                    const reader = new FileReader();
                    reader.onload = (e) => setImagePreview(e.target.result);
                    reader.readAsDataURL(compressedFile);
                },
                error(err) {
                    console.error('Compression error:', err);
                    setImageError(t('admin.products.compressionError', { defaultValue: 'Failed to compress image' }));
                }
            });
        }
    };

    const handleSliderFilesChange = (e) => {
        const files = Array.from(e.target.files);
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
        e.dataTransfer.dropEffect = 'copy';
        const files = Array.from(e.dataTransfer.files);
        if (type === 'main') {
            if (files.length > 1) {
                setImageError(t('admin.products.singleImageError', { defaultValue: 'Please drop only one image for the main product image' }));
                return;
            }
            const file = files[0];
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
                    setImageFile(compressedFile);
                    console.log(`Compressed dropped main image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                    const reader = new FileReader();
                    reader.onload = (e) => setImagePreview(e.target.result);
                    reader.readAsDataURL(compressedFile);
                },
                error(err) {
                    console.error('Compression error:', err);
                    setImageError(t('admin.products.compressionError', { defaultValue: 'Failed to compress image' }));
                }
            });
        } else if (type === 'slider') {
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
                        console.log(`Compressed dropped slider image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
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
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    const removeSliderFile = (index) => {
        const fileToRemove = sliderFiles[index];
        setSliderFiles(sliderFiles.filter((_, i) => i !== index));
        setSliderPreviews(sliderPreviews.filter(preview => preview.file !== fileToRemove.name));
    };

    const removeExistingSliderImage = async (imagePath) => {
        try {
            await axios.delete(`${API_URL}/api/upload/delete`, {
                data: { imagePath },
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            setForm(prev => ({
                ...prev,
                images: prev.images.filter(img => img !== imagePath)
            }));
        } catch (error) {
            console.error('Error deleting slider image:', error);
            alert(t('admin.products.errorDeletingImage', { defaultValue: 'Error deleting image: ' }) + error.response?.data?.message);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('category', form.category ? form.category + 's' : 'general');
        formData.append('productId', editingId || Date.now());
        try {
            setUploading(true);
            setUploadProgress(0);
            const response = await axios.post(`${API_URL}/api/upload/single`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
                timeout: 300000 // 5 minutes timeout
            });
            console.log('Image upload response:', response.data);
            return response.data.imagePath;
        } catch (error) {
            console.error('Error uploading image:', error.message, error.response?.data);
            const errorMsg = error.response?.status === 500
                ? t('admin.products.serverError', { defaultValue: 'Server error uploading image. Check server logs or file size.' })
                : t('admin.products.imageUploadFailed', { defaultValue: 'Error uploading image: ' }) + (error.response?.data?.error || error.message);
            setImageError(errorMsg);
            return null;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const uploadSliderImages = async () => {
        if (sliderFiles.length === 0) return [];
        const formData = new FormData();
        sliderFiles.forEach(file => {
            formData.append('images', file);
        });
        formData.append('category', form.category ? form.category + 's' : 'general');
        formData.append('productId', editingId || Date.now());
        try {
            setUploading(true);
            setUploadProgress(0);
            const response = await axios.post(`${API_URL}/api/upload/multiple`, formData, {
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
            console.log('Slider images upload response:', response.data);
            return response.data.images.map(img => img.path);
        } catch (error) {
            console.error('Error uploading slider images:', error.message, error.response?.data);
            const errorMsg = error.response?.status === 500
                ? t('admin.products.serverError', { defaultValue: 'Server error uploading images. Check server logs or file size.' })
                : t('admin.products.sliderUploadFailed', { defaultValue: 'Error uploading slider images: ' }) + (error.response?.data?.error || error.message);
            alert(errorMsg);
            return [];
        } finally {
            setUploading(false);
            setUploadProgress(0);
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
                    setImageError(t('admin.products.imageUploadFailed', { defaultValue: 'Failed to upload main image' }));
                    return;
                }
            } else if (!editingId && !imagePath) {
                setImageError(t('admin.products.imageRequired', { defaultValue: 'Main product image is required' }));
                return;
            }

            if (sliderFiles.length > 0) {
                const newSliderPaths = await uploadSliderImages();
                sliderImagePaths = [...sliderImagePaths, ...newSliderPaths];
            }

            // Remove empty fields and _id from details
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

            console.log('Submitting product data:', productData);

            if (editingId) {
                await axios.put(`${API_URL}/api/products/${editingId}`, productData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                });
                setProducts(products.map(p => (p._id === editingId ? { ...p, ...productData } : p)));
                setEditingId(null);
                alert(t('admin.products.updateSuccess', { defaultValue: 'Product updated successfully!' }));
            } else {
                const res = await axios.post(`${API_URL}/api/products`, productData, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                });
                setProducts([res.data, ...products]);
                alert(t('admin.products.addSuccess', { defaultValue: 'Product added successfully!' }));
            }

            resetForm();
            setImageError('');
        } catch (error) {
            console.error('Error saving product:', error.message, error.response?.data);
            alert(t('admin.products.errorSaving', { defaultValue: 'Error saving product: ' }) + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            price: '',
            category: '',
            image: '',
            productCollection: collections[0] || '',
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
    };

    const handleEdit = (product) => {
        setForm({
            name: product.name,
            price: product.price,
            category: product.category,
            image: product.image,
            productCollection: product.productCollection,
            images: product.images || [],
            alt: product.alt || '',
            description: product.description || '',
            details: product.details || [{ material: '', stone: '', finish: '', design: '', fit: '' }],
        });
        setEditingId(product._id);
        setImagePreview(product.image ? `${API_URL}${product.image}` : null);
        setImageFile(null);
        setSliderFiles([]);
        setSliderPreviews([]);
        setImageError('');
        setUploadProgress(0);
    };

    const handleDelete = async (id) => {
        if (!confirm(t('admin.products.confirmDelete', { defaultValue: 'Are you sure you want to delete this product?' }))) return;

        try {
            await axios.delete(`${API_URL}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });
            setProducts(products.filter(p => p._id !== id));
            alert(t('admin.products.deleteSuccess', { defaultValue: 'Product deleted successfully!' }));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert(t('admin.products.errorDeleting', { defaultValue: 'Error deleting product: ' }) + error.response?.data?.message);
        }
    };

    const openImageManager = (product) => {
        setSelectedProduct(product);
        setShowImageManager(true);
    };

    const closeImageManager = () => {
        setShowImageManager(false);
        setSelectedProduct(null);
    };

    const handleImageManagerUpdate = (updatedProduct) => {
        setProducts(products.map(p => (p._id === updatedProduct._id ? updatedProduct : p)));
        alert(t('admin.products.imagesUpdated', { defaultValue: 'Product images updated successfully!' }));
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px]">
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-[#0e0e53]">
                    {t('admin.products.title', { defaultValue: 'Manage Products' })}
                </h2>
                <div className="text-sm text-gray-600">
                    {t('admin.products.loggedInAs', { defaultValue: 'Logged in as: ' })}
                    <span className="font-medium">{adminName}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder={t('admin.products.name', { defaultValue: 'Product Name' })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                            type="text"
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            placeholder={t('admin.products.price', { defaultValue: 'Price' })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                            required
                        />

                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                            required
                        >
                            <option value="">{t('admin.products.selectCategory', { defaultValue: 'Select Category' })}</option>
                            <option value="necklace">{t('admin.products.necklace', { defaultValue: 'Necklace' })}</option>
                            <option value="ring">{t('admin.products.ring', { defaultValue: 'Ring' })}</option>
                            <option value="earring">{t('admin.products.earring', { defaultValue: 'Earring' })}</option>
                            <option value="bracelet">{t('admin.products.bracelet', { defaultValue: 'Bracelet' })}</option>
                            <option value="hairclip">{t('admin.products.hairclip', { defaultValue: 'Hairclip' })}</option>
                        </select>
                    </div>

                    <select
                        value={form.productCollection}
                        onChange={e => setForm({ ...form, productCollection: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                    >
                        <option value="">{t('admin.products.selectCollection', { defaultValue: 'Select Collection' })}</option>
                        {collections.map(collection => (
                            <option key={collection} value={collection}>{collection}</option>
                        ))}
                    </select>

                    <div>
                        <input
                            type="text"
                            value={form.alt}
                            onChange={e => setForm({ ...form, alt: e.target.value })}
                            placeholder={t('admin.products.alt', { defaultValue: 'Image Alt Text' })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                        />
                    </div>

                    <div>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder={t('admin.products.description', { defaultValue: 'Description' })}
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm sm:text-base"
                            rows="4"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.products.details', { defaultValue: 'Product Details' })}
                        </label>
                        {form.details.map((detail, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                                <input
                                    type="text"
                                    value={detail.material}
                                    onChange={e => {
                                        const newDetails = [...form.details];
                                        newDetails[index].material = e.target.value;
                                        setForm({ ...form, details: newDetails });
                                    }}
                                    placeholder={t('admin.products.material', { defaultValue: 'Material' })}
                                    className="p-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    value={detail.stone}
                                    onChange={e => {
                                        const newDetails = [...form.details];
                                        newDetails[index].stone = e.target.value;
                                        setForm({ ...form, details: newDetails });
                                    }}
                                    placeholder={t('admin.products.stone', { defaultValue: 'Stone' })}
                                    className="p-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <input
                                    type="text"
                                    value={detail.finish}
                                    onChange={e => {
                                        const newDetails = [...form.details];
                                        newDetails[index].finish = e.target.value;
                                        setForm({ ...form, details: newDetails });
                                    }}
                                    placeholder={t('admin.products.finish', { defaultValue: 'Finish' })}
                                    className="p-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, details: [...form.details, { material: '', stone: '', finish: '', design: '', fit: '' }] })}
                            className="text-sm text-[#0e0e53] hover:underline"
                        >
                            {t('admin.products.addDetail', { defaultValue: 'Add Detail' })}
                        </button>
                    </div>

                    <div
                        className={`flex flex-col border-2 ${imageError ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 hover:border-[#0e0e53] transition-colors`}
                        onDrop={(e) => handleDrop(e, 'main')}
                        onDragOver={handleDragOver}
                    >
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            {t('admin.products.mainImage', { defaultValue: 'Main Product Image' })} *
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="p-3 border border-gray-300 rounded-lg text-sm"
                        />
                        {imageError && (
                            <p className="text-red-500 text-xs sm:text-sm mt-2">{imageError}</p>
                        )}
                        {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded border"
                                />
                            </div>
                        )}
                        {uploading && uploadProgress > 0 && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-[#0e0e53] h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            {t('admin.products.dragDropMain', { defaultValue: 'Drag and drop an image here or click to select (max 100MB, compressed to ~5MB)' })}
                        </p>
                    </div>

                    <div
                        className="flex flex-col border-2 border-gray-300 rounded-lg p-4 hover:border-[#0e0e53] transition-colors"
                        onDrop={(e) => handleDrop(e, 'slider')}
                        onDragOver={handleDragOver}
                    >
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            {t('admin.products.sliderImages', { defaultValue: 'Slider Images (Multiple)' })}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleSliderFilesChange}
                            className="p-3 border border-gray-300 rounded-lg text-sm"
                        />
                        {uploading && uploadProgress > 0 && (
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-[#0e0e53] h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        )}
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                            {t('admin.products.dragDropSlider', { defaultValue: 'Drag and drop images here or click to select (max 100MB each, compressed to ~5MB)' })}
                        </p>
                    </div>
                </div>

                {form.images.length > 0 && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.products.currentSliderImages', { defaultValue: 'Current Slider Images' })} ({form.images.length})
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {form.images.map((imagePath, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={`${API_URL}${imagePath}`}
                                        alt={`Slider ${index + 1}`}
                                        className="w-full h-16 sm:h-20 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingSliderImage(imagePath)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {sliderPreviews.length > 0 && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('admin.products.newSliderImages', { defaultValue: 'New Slider Images' })} ({sliderPreviews.length})
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
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
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <button
                        type="submit"
                        className="w-full sm:w-auto bg-[#0e0e53] text-white px-6 py-3 rounded-lg hover:bg-[#1a1a7e] transition-colors"
                        disabled={uploading}
                    >
                        {uploading
                            ? t('admin.products.uploading', { defaultValue: 'Uploading...' })
                            : editingId
                                ? t('admin.products.updateProduct', { defaultValue: 'Update Product' })
                                : t('admin.products.addProduct', { defaultValue: 'Add Product' })}
                    </button>
                    <button
                        type="button"
                        onClick={resetForm}
                        className="w-full sm:w-auto bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        {t('admin.products.clearForm', { defaultValue: 'Clear Form' })}
                    </button>
                </div>
            </form>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="text-lg sm:text-xl font-semibold text-[#0e0e53] mb-4">
                    {t('admin.products.existingProducts', { defaultValue: 'Existing Products' })}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(product => (
                        <div key={product._id} className="border rounded-lg p-4 relative group">
                            <img
                                src={`${API_URL}${product.image}`}
                                alt={product.alt || product.name}
                                className="w-full h-32 sm:h-40 object-cover rounded mb-2"
                            />
                            <h4 className="text-sm sm:text-base font-medium">{product.name}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">{product.price} AMD</p>
                            <p className="text-xs sm:text-sm text-gray-600">{product.category}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{product.productCollection}</p>
                            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="bg-[#0e0e53] text-white p-2 rounded hover:bg-[#1a1a7e]"
                                >
                                    {t('admin.products.edit', { defaultValue: 'Edit' })}
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                >
                                    {t('admin.products.delete', { defaultValue: 'Delete' })}
                                </button>
                                <button
                                    onClick={() => openImageManager(product)}
                                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                                >
                                    {t('admin.products.manageImages', { defaultValue: 'Images' })}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showImageManager && selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 sm:p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-semibold mb-4">
                            {t('admin.products.imageManager', { defaultValue: 'Manage Images for ' })} {selectedProduct.name}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {selectedProduct.images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={`${API_URL}${image}`}
                                        alt={`Slider ${index + 1}`}
                                        className="w-full h-24 object-cover rounded"
                                    />
                                    <button
                                        onClick={() => removeExistingSliderImage(image)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('admin.products.addNewImages', { defaultValue: 'Add New Images' })}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleSliderFilesChange}
                                className="p-3 border border-gray-300 rounded-lg text-sm"
                            />
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button
                                onClick={closeImageManager}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                {t('admin.products.close', { defaultValue: 'Close' })}
                            </button>
                            <button
                                onClick={async () => {
                                    const newImages = await uploadSliderImages();
                                    if (newImages.length > 0) {
                                        const updatedProduct = {
                                            ...selectedProduct,
                                            images: [...selectedProduct.images, ...newImages]
                                        };
                                        try {
                                            await axios.put(`${API_URL}/api/products/${selectedProduct._id}`, updatedProduct, {
                                                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                                            });
                                            handleImageManagerUpdate(updatedProduct);
                                            closeImageManager();
                                        } catch (error) {
                                            console.error('Error updating images:', error);
                                            alert(t('admin.products.errorUpdatingImages', { defaultValue: 'Error updating images: ' }) + error.response?.data?.message);
                                        }
                                    }
                                }}
                                className="bg-[#0e0e53] text-white px-4 py-2 rounded-lg hover:bg-[#1a1a7e]"
                                disabled={uploading}
                            >
                                {uploading
                                    ? t('admin.products.uploading', { defaultValue: 'Uploading...' })
                                    : t('admin.products.saveImages', { defaultValue: 'Save Images' })}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageProducts;