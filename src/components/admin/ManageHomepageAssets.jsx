import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Compressor from 'compressorjs';
import { toast } from "react-toastify";

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


const ManageHomepageAssets = () => {
    const { t } = useTranslation();
    const [form, setForm] = useState({
        collectionName: 'Spring 2025',
        imageUrl: '',
        videoUrls: [''],
        title: '',
        description: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageError, setImageError] = useState('');
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                console.log('Fetching assets with token:', localStorage.getItem('adminToken'));
                const res = await axios.get(`${API_URL}/api/homepage-assets`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
                });
                console.log('Response:', res.data);
                setForm({
                    collectionName: res.data.collectionName || 'Spring 2025',
                    imageUrl: res.data.imageUrl || '',
                    videoUrls: res.data.videoUrls.length > 0 ? res.data.videoUrls : [''],
                    title: res.data.title || '',
                    description: res.data.description || '',
                });
                if (res.data.imageUrl) {
                    setImagePreview(`${API_URL}${res.data.imageUrl}`);
                }
            } catch (error) {
                console.error('Error fetching homepage assets:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    message: error.message,
                });
                if (error.response?.status === 401) {
                    toast.error('Unauthorized: Please log in again');
                    // Optionally redirect to login page
                    // window.location.href = '/admin/login';
                }
            }
        };
        fetchAssets();
    }, [API_URL]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                setImageError(t('admin.homepageAssets.imageSizeError', { defaultValue: 'File size should be less than 100MB' }));
                return;
            }
            if (!file.type.startsWith('image/')) {
                setImageError(t('admin.homepageAssets.imageTypeError', { defaultValue: 'Please select an image file' }));
                return;
            }
            new Compressor(file, {
                quality: 0.7,
                maxWidth: 1920,
                success(compressedFile) {
                    setImageError('');
                    setImageFile(compressedFile);
                    console.log(`Compressed hero image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                    const reader = new FileReader();
                    reader.onload = (e) => setImagePreview(e.target.result);
                    reader.readAsDataURL(compressedFile);
                },
                error(err) {
                    console.error('Compression error:', err);
                    setImageError(t('admin.homepageAssets.compressionError', { defaultValue: 'Failed to compress image' }));
                }
            });
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        const files = Array.from(e.dataTransfer.files);

        if (files.length > 1) {
            setImageError(t('admin.homepageAssets.singleImageError', { defaultValue: 'Please drop only one image' }));
            return;
        }

        const file = files[0];
        if (file.size > 100 * 1024 * 1024) {
            setImageError(t('admin.homepageAssets.imageSizeError', { defaultValue: 'File size should be less than 100MB' }));
            return;
        }
        if (!file.type.startsWith('image/')) {
            setImageError(t('admin.homepageAssets.imageTypeError', { defaultValue: 'Please select an image file' }));
            return;
        }

        new Compressor(file, {
            quality: 0.7,
            maxWidth: 1920,
            success(compressedFile) {
                setImageError('');
                setImageFile(compressedFile);
                console.log(`Compressed dropped hero image: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                const reader = new FileReader();
                reader.onload = (e) => setImagePreview(e.target.result);
                reader.readAsDataURL(compressedFile);
            },
            error(err) {
                console.error('Compression error:', err);
                setImageError(t('admin.homepageAssets.compressionError', { defaultValue: 'Failed to compress image' }));
            }
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
    };

    const uploadImage = async () => {
        if (!imageFile) return null;
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('category', 'homepage');
        formData.append('productId', 'homepage-hero');

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
            console.log('Hero image upload response:', response.data);
            return response.data.imagePath;
        } catch (error) {
            console.error('Error uploading hero image:', error.message, error.response?.data);
            const errorMsg = error.response?.status === 500
                ? t('admin.homepageAssets.serverError', { defaultValue: 'Server error uploading image. Check server logs or file size.' })
                : t('admin.homepageAssets.imageUploadFailed', { defaultValue: 'Error uploading image: ' }) + (error.response?.data?.error || error.message);
            setImageError(errorMsg);
            return null;
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleVideoUrlChange = (index, value) => {
        const newVideoUrls = [...form.videoUrls];
        newVideoUrls[index] = value;
        setForm({ ...form, videoUrls: newVideoUrls });
    };

    const addVideoUrlField = () => {
        setForm({ ...form, videoUrls: [...form.videoUrls, ''] });
    };

    const removeVideoUrlField = (index) => {
        setForm({ ...form, videoUrls: form.videoUrls.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setUploading(true);
            let imageUrl = form.imageUrl;

            // Upload new image if one was selected
            if (imageFile) {
                imageUrl = await uploadImage();
                if (!imageUrl) {
                    setImageError(t('admin.homepageAssets.imageUploadFailed', { defaultValue: 'Failed to upload hero image' }));
                    return;
                }
            }

            const assetsData = {
                ...form,
                imageUrl: imageUrl,
                videoUrls: form.videoUrls.filter(url => url.trim() !== ''), // Remove empty URLs
            };

            console.log('Submitting homepage assets:', assetsData);

            await axios.put(`${API_URL}/api/homepage-assets`, assetsData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
            });

            toast.success(t('admin.homepageAssets.success', { defaultValue: 'Homepage assets updated successfully!' }));
            setImageFile(null);
            setImageError('');
        } catch (error) {
            console.error('Error updating homepage assets:', error);
            toast.error(t('admin.homepageAssets.error', { defaultValue: 'Error updating homepage assets: ' }) + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <style>{toastStyles}</style>
            <h2 className="text-2xl font-semibold text-[#0e0e53] mb-6">
                {t('admin.homepageAssets.title', { defaultValue: 'Manage Homepage Assets' })}
            </h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                <div className="grid grid-cols-1 gap-4">
                    <input
                        type="text"
                        value={form.collectionName}
                        onChange={e => setForm({ ...form, collectionName: e.target.value })}
                        placeholder={t('admin.homepageAssets.collectionName', { defaultValue: 'Collection Name' })}
                        className="p-3 border border-gray-300 rounded-lg"
                        required
                    />

                    <div
                        className={`flex flex-col border-2 ${imageError ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 hover:border-[#0e0e53] transition-colors`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <label className="mb-2 text-sm font-medium text-gray-700">
                            {t('admin.homepageAssets.heroImage', { defaultValue: 'Hero Image' })} *
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
                                    alt="Hero Preview"
                                    className="w-32 h-32 object-cover rounded border"
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
                            {t('admin.homepageAssets.dragDropHero', { defaultValue: 'Drag and drop an image here or click to select (max 100MB, compressed to ~5MB)' })}
                        </p>
                    </div>

                    {form.videoUrls.map((url, index) => (
                        <div key={index} className="flex gap-2 items-center">
                            <input
                                type="text"
                                value={url}
                                onChange={e => handleVideoUrlChange(index, e.target.value)}
                                placeholder={t('admin.homepageAssets.videoUrl', { defaultValue: `Video URL ${index + 1}` })}
                                className="p-3 border border-gray-300 rounded-lg flex-1"
                            />
                            {form.videoUrls.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeVideoUrlField(index)}
                                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                                >
                                    {t('admin.homepageAssets.removeVideo', { defaultValue: 'Remove' })}
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addVideoUrlField}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        {t('admin.homepageAssets.addVideo', { defaultValue: 'Add Video URL' })}
                    </button>
                    <input
                        type="text"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder={t('admin.homepageAssets.titlePlaceholder', { defaultValue: 'Collection Title' })}
                        className="p-3 border border-gray-300 rounded-lg"
                        required
                    />
                    <textarea
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                        placeholder={t('admin.homepageAssets.description', { defaultValue: 'Collection Description' })}
                        className="p-3 border border-gray-300 rounded-lg"
                        rows="4"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-[#0e0e53] text-white p-3 rounded-lg hover:bg-[#213547] transition"
                        disabled={uploading}
                    >
                        {uploading
                            ? t('admin.homepageAssets.updating', { defaultValue: 'Updating...' })
                            : t('admin.homepageAssets.updateButton', { defaultValue: 'Update Assets' })}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ManageHomepageAssets;