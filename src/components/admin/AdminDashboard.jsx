import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [adminName, setAdminName] = useState('');

    // Get current language from URL
    const lng = location.pathname.split('/')[1] || 'en';

    useEffect(() => {
        // Get admin info from localStorage or make API call
        const token = localStorage.getItem('adminToken');
        if (token) {
            try {
                // Decode JWT token to get admin info (you might need to install jwt-decode)
                // For now, using localStorage for admin name
                const storedAdminName = localStorage.getItem('adminName') || 'Admin';
                setAdminName(storedAdminName);
            } catch (error) {
                console.error('Error getting admin info:', error);
                setAdminName('Admin');
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        window.location.href = `/${lng}/admin/login`;
    };

    return (
        <div className="flex min-h-screen">
            <div className="w-1/4 bg-[#0e0e53] text-white p-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-semibold mb-2">
                        {t('admin.dashboard.title', { defaultValue: 'Admin Panel' })}
                    </h2>
                    <div className="text-sm bg-[#213547] rounded px-3 py-2">
                        <span className="text-gray-300">Welcome, </span>
                        <span className="font-medium text-white">{adminName}</span>
                    </div>
                </div>
                <nav className="flex flex-col gap-4">
                    <Link
                        to={`/${lng}/admin/products`}
                        className="py-2 hover:bg-[#213547] rounded px-4 transition"
                    >
                        {t('admin.dashboard.products', { defaultValue: 'Manage Products' })}
                    </Link>
                    <Link
                        to={`/${lng}/admin/homepage-assets`}
                        className="py-2 hover:bg-[#213547] rounded px-4 transition"
                    >
                        {t('admin.dashboard.homepageAssets', { defaultValue: 'Manage Homepage Assets' })}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="py-2 hover:bg-[#213547] rounded px-4 transition text-left"
                    >
                        {t('admin.dashboard.logout', { defaultValue: 'Log Out' })}
                    </button>
                </nav>
            </div>
            <div className="w-3/4 p-6 bg-gray-100">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminDashboard;