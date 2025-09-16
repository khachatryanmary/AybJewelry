import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import LocaleSwitcher from "../LocaleSwitcher.jsx";
import '/src/styles/AdminDashboard.css';

const AdminDashboard = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState('');
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        customers: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // More robust language detection
    const lng = React.useMemo(() => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const detectedLng = pathSegments[0];

        console.log('🌐 Path segments:', pathSegments);
        console.log('🌐 Detected language:', detectedLng);

        // Validate if it's a supported language
        if (['am', 'ru', 'en'].includes(detectedLng)) {
            return detectedLng;
        }
        return 'en'; // fallback
    }, [location.pathname]);

    const isActive = (path) => location.pathname.includes(`/admin/${path}`);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        console.log('🔍 Frontend Debug - Admin Token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
        console.log('🌐 Current language:', lng);
        console.log('🌐 i18n language:', i18n.language);
        console.log('🌐 Full pathname:', location.pathname);

        if (!token) {
            toast.error(t('admin.sessionExpired', { defaultValue: 'Session expired, please log in again' }));
            navigate(`/${lng}/admin/login`);
            return;
        }

        // Ensure i18n is synced with URL
        if (i18n.language !== lng) {
            console.log('🔄 Syncing i18n language from', i18n.language, 'to', lng);
            i18n.changeLanguage(lng).catch(error => {
                console.error('Failed to change language:', error);
            });
        }

        const storedAdminName = localStorage.getItem('adminName') || 'Admin';
        setAdminName(storedAdminName);
        fetchDashboardStats();
    }, [lng, navigate, t, i18n, location.pathname]);


    const fetchDashboardStats = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            console.log('📊 Fetching dashboard stats with token:', token ? 'Token exists' : 'No token');

            const [productsRes, ordersRes, usersRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/stats/products`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/api/admin/stats/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_URL}/api/admin/stats/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setStats({
                products: productsRes.data.total,
                orders: ordersRes.data.total,
                customers: usersRes.data.total,
                revenue: ordersRes.data.totalRevenue || 0
            });

            console.log('✅ Dashboard stats loaded successfully');
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
            }
            if (error.response?.status === 401 || error.response?.status === 403) {
                toast.error(t('admin.sessionExpired', { defaultValue: 'Session expired, please log in again' }));
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminName');
                navigate(`/${lng}/admin/login`);
            } else {
                toast.error(t('admin.stats.fetchError', { defaultValue: 'Failed to load dashboard data' }));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        navigate(`/${lng}/admin/login`);
    };

    const handleQuickAction = (path) => {
        navigate(`/${lng}/admin/${path}`);
        setSidebarOpen(false);
    };

    const navigationItems = [
        {
            path: 'overview',
            label: t('admin.nav.overview', { defaultValue: 'Dashboard Overview' }),
            icon: '📊'
        },
        {
            path: 'products',
            label: t('admin.nav.products', { defaultValue: 'Manage Products' }),
            icon: '💎'
        },
        {
            path: 'categories',
            label: t('admin.nav.categories', { defaultValue: 'Categories' }),
            icon: '📂'
        },
        {
            path: 'collections',
            label: t('admin.nav.collections', { defaultValue: 'Collections' }),
            icon: '📚'
        },
        {
            path: 'orders',
            label: t('admin.nav.ordersTitle', { defaultValue: 'Orders' }),
            icon: '🛍️'
        },
        {
            path: 'customers',
            label: t('admin.nav.customersTitle', { defaultValue: 'Customers' }),
            icon: '👥'
        },
        {
            path: 'analytics',
            label: t('admin.nav.analytics', { defaultValue: 'Analytics' }),
            icon: '📈'
        },
        {
            path: 'homepage-assets',
            label: t('admin.nav.homepage', { defaultValue: 'Homepage Assets' }),
            icon: '🏠'
        },
        {
            path: 'users',
            label: t('admin.nav.users', { defaultValue: 'Users' }),
            icon: '👤'
        }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden fixed top-4 left-4 z-50 bg-[#0e0e53] text-white p-2 rounded-md shadow-lg ${sidebarOpen ? 'hidden' : ''}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out fixed lg:static inset-y-0 left-0 z-40 w-full sm:w-80 lg:w-64 bg-[#0e0e53] text-white shadow-lg overflow-y-auto`}>
                <div className="p-4 lg:p-6 border-b border-[#213547]">
                    <div className="flex items-center justify-between lg:block">
                        <h2 className="text-xl lg:text-2xl font-semibold text-white mb-0 lg:mb-4">
                            {t('admin.dashboard.title', { defaultValue: 'Admin Panel' })}
                        </h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-white p-1"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="text-sm bg-[#213547] rounded-lg px-3 lg:px-4 py-2 lg:py-3 mt-4 lg:mt-0">
                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-full flex items-center justify-center">
                                <span className="text-[#0e0e53] text-sm lg:text-base font-bold">
                                    {adminName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-300 text-xs">{t('admin.loggedInAs', { defaultValue: 'Logged in as' })}:</span>
                                <div className="font-semibold text-white text-sm lg:text-base">{adminName}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 lg:p-6 border-b border-[#213547]">
                    <div className="text-xs font-semibold text-gray-300 mb-3 lg:mb-4 uppercase tracking-wide">
                        {t('admin.quickStats', { defaultValue: 'Quick Stats' })}
                    </div>
                    <div className="grid grid-cols-2 gap-2 lg:gap-4">
                        <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm text-center">
                            <div className="text-base lg:text-lg font-bold text-[#0e0e53]">{loading ? '...' : stats.products}</div>
                            <div className="text-xs font-semibold text-gray-600">{t('admin.productsCount', { defaultValue: 'Products' })}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm text-center">
                            <div className="text-base lg:text-lg font-bold text-[#0e0e53]">{loading ? '...' : stats.orders}</div>
                            <div className="text-xs font-semibold text-gray-600">{t('admin.orders', { defaultValue: 'Orders' })}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm text-center">
                            <div className="text-base lg:text-lg font-bold text-[#0e0e53]">{loading ? '...' : stats.customers}</div>
                            <div className="text-xs font-semibold text-gray-600">{t('admin.customersTitle', { defaultValue: 'Customers' })}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 lg:p-4 shadow-sm text-center">
                            <div className="text-xs lg:text-sm font-bold text-[#0e0e53]">
                                {loading ? '...' : `${stats.revenue.toLocaleString()} AMD`}
                            </div>
                            <div className="text-xs font-semibold text-gray-600">{t('admin.revenue', { defaultValue: 'Revenue' })}</div>
                        </div>
                    </div>
                </div>

                <nav className="flex flex-col p-4 lg:p-6 space-y-1 lg:space-y-2 flex-1">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.path}
                            to={`/${lng}/admin/${item.path}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-2 lg:gap-3 py-3 lg:py-3 px-4 lg:px-4 rounded-lg transition-colors hover:bg-[#213547] font-semibold text-sm lg:text-base ${
                                isActive(item.path) ? 'bg-[#213547] border-l-4 border-white' : ''
                            }`}
                        >
                            <span className="text-base lg:text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                    <div className="admin-locale-switcher mt-4 pt-4 border-t border-[#213547]">
                        <div className="text-xs font-semibold text-gray-300 mb-2 uppercase tracking-wide">
                            {t('admin.language', { defaultValue: 'Language' })}
                        </div>
                        <LocaleSwitcher />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="lg:hidden mt-6 flex items-center gap-3 py-3 px-4 rounded-lg bg-red-600 hover:bg-red-700 transition-colors font-semibold text-sm"
                    >
                        <span className="text-base">🚪</span>
                        <span>{t('admin.dashboard.logout', { defaultValue: 'Log Out' })}</span>
                    </button>
                </nav>
            </div>

            <div className="flex-1 flex flex-col lg:ml-0">
                <div className="bg-white shadow-sm border-b border-gray-200 px-4 lg:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="ml-12 lg:ml-0">
                            <h1 className="text-xl lg:text-2xl font-semibold text-[#0e0e53]">
                                {t(`admin.nav.${location.pathname.split('/').pop()}`, {
                                    defaultValue: location.pathname.split('/').pop().charAt(0).toUpperCase() +
                                        location.pathname.split('/').pop().slice(1).replace('-', ' ')
                                })}
                            </h1>
                            <p className="text-gray-600 text-sm font-semibold">
                                {t('admin.manageStore', { defaultValue: 'Manage your jewelry store from here' })}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-4">
                            <div className="text-xs lg:text-sm text-gray-600 font-semibold">
                                {new Date().toLocaleDateString(lng === 'ru' ? 'ru-RU' : lng === 'am' ? 'hy-AM' : 'en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:block px-3 lg:px-4 py-2 bg-[#f7f7f7] text-[#0e0e53] rounded-lg font-semibold text-xs lg:text-sm hover:bg-[#0e0e53] hover:text-white transition duration-300"
                            >
                                {t('admin.dashboard.logout', { defaultValue: 'Log Out' })}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 lg:p-6">
                    <Outlet context={{ handleQuickAction }} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;