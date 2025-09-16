// components/AdminLogin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';

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

const AdminLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Get current language from URL with fallback
    const getLngFromPath = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const supportedLanguages = ['en', 'ru', 'am'];

        // Check if first segment is a supported language
        if (pathSegments[0] && supportedLanguages.includes(pathSegments[0])) {
            return pathSegments[0];
        }
        return 'en'; // Default fallback
    };

    const lng = getLngFromPath();

    // Prevent multiple redirects/refreshes
    useEffect(() => {
        if (!initialized) {
            // Check if admin is already logged in
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                // Redirect to admin dashboard without causing refresh loops
                const targetPath = `/${lng}/admin`;
                if (location.pathname !== targetPath) {
                    navigate(targetPath, { replace: true });
                    return;
                }
            }
            setInitialized(true);
        }
    }, [lng, location.pathname, navigate, initialized]);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value.trim() }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            const errorMsg = t('admin.login.invalidEmail', { defaultValue: 'Please enter a valid email address' });
            setError(errorMsg);
            toast.error(errorMsg);
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting admin login with:', { email: form.email, password: '***' });
            const response = await axios.post(`${API_URL}/api/admin/auth/login`, {
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });

            console.log('Admin login successful:', response.data);

            // Store token and admin info
            localStorage.setItem('adminToken', response.data.token);
            localStorage.setItem('adminName', response.data.admin?.name || response.data.admin?.email || 'Admin');

            // Show success message
            toast.success(t('admin.login.success', { defaultValue: 'Admin login successful!' }));

            // Redirect to admin dashboard
            navigate(`/${lng}/admin`, { replace: true });
        } catch (err) {
            console.error('Admin login error:', err.response?.data || err.message);

            let errorMessage;
            if (err.response?.status === 403) {
                errorMessage = err.response.data.message || t('admin.login.forbidden', { defaultValue: 'Access denied. Admin privileges required.' });
                toast.error(errorMessage, {
                    autoClose: 8000,
                    closeOnClick: true,
                    pauseOnHover: true
                });
            } else if (err.response?.status === 401) {
                errorMessage = t('admin.login.unauthorized', { defaultValue: 'Invalid admin credentials' });
                toast.error(errorMessage);
            } else {
                errorMessage = err.response?.data?.message || t('admin.login.error', { defaultValue: 'Admin login failed' });
                toast.error(errorMessage);
            }

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Don't render until initialized to prevent flash
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-[24px] h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto py-[12px] sm:py-[16px] md:py-[20px] flex flex-col items-center justify-center">
            <style>{toastStyles}</style>

            <div className="text-center w-full">
                <h2 className="font-[Against] text-[24px] sm:text-[28px] md:text-[32px] p-[12px] sm:p-[16px] md:p-[20px] text-[#0e0e53]">
                    {t('admin.login.pageTitle', { defaultValue: 'Admin Panel' })}
                </h2>
            </div>

            <div className="bg-[#efeeee] p-[16px] sm:p-[24px] md:p-[32px] m-[12px] sm:m-[16px] md:m-[20px] w-full max-w-[95%] sm:max-w-[90%] md:max-w-[500px] flex items-center justify-center rounded-[8px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                        {t('admin.login.title', { defaultValue: 'Admin Login' })}
                    </h2>

                    <input
                        type="email"
                        name="email"
                        placeholder={t('admin.login.email', { defaultValue: 'Admin Email' })}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder={t('admin.login.password', { defaultValue: 'Admin Password' })}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />

                    {/* Admin-specific options */}
                    <div className="flex w-full items-center justify-center text-center text-[12px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                        <div className="flex items-center justify-center gap-[8px]">
                            <input
                                type="checkbox"
                                className="w-[16px] sm:w-[18px] md:w-[20px] h-[16px] sm:h-[18px] md:h-[20px]"
                            />
                            <span>{t('admin.login.rememberMe', { defaultValue: 'Keep me logged in' })}</span>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-600 text-[12px] sm:text-[13px] md:text-[14px] text-center px-2">
                            {error}
                        </p>
                    )}

                    {loading && (
                        <div className="flex justify-center items-center">
                            <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-[white] border-none rounded-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full transition duration-500 hover:text-white hover:bg-[#0a0a39] py-[8px] sm:py-[10px] md:py-[12px] font-semibold text-[#0e0e53] text-[14px] sm:text-[15px] md:text-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ?
                            t('admin.login.loggingIn', { defaultValue: 'Logging in...' }) :
                            t('admin.login.button', { defaultValue: 'Admin Login' })
                        }
                    </button>

                    {/* Back to main site link */}
                    <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                        <span
                            className="text-[#df7a7a] cursor-pointer hover:text-[#0a0a39] transition duration-300"
                            onClick={() => navigate(`/${lng}`)}
                        >
                            {t('admin.login.backToSite', { defaultValue: '← Back to main site' })}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;