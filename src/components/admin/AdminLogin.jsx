import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    // Get current language from URL
    const lng = location.pathname.split('/')[1] || 'en';

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value.trim() });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError(t('admin.login.invalidEmail', { defaultValue: 'Please enter a valid email address' }));
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting login with:', { email: form.email, password: form.password });
            const response = await axios.post(`${API_URL}/api/admin/auth/login`, {
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });

            console.log('Login successful, token received');
            localStorage.setItem('adminToken', response.data.token);

            // Redirect to admin dashboard with current language
            navigate(`/${lng}/admin`);
        } catch (err) {
            console.error('Login error:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || t('admin.login.error', { defaultValue: 'Login failed' });
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-semibold text-[#0e0e53] mb-6 text-center">
                    {t('admin.login.title', { defaultValue: 'Admin Login' })}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        name="email"
                        placeholder={t('admin.login.email', { defaultValue: 'Email' })}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0e0e53]"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t('admin.login.password', { defaultValue: 'Password' })}
                        className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0e0e53]"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {loading && (
                        <div className="flex justify-center">
                            <div className="w-6 h-6 border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-[#0e0e53] text-white p-3 rounded-lg hover:bg-[#213547] transition disabled:opacity-50"
                        disabled={loading}
                    >
                        {t('admin.login.button', { defaultValue: 'Log In' })}
                    </button>
                </form>

                {/* Debug info - remove this in production */}
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                    <p>Debug: Use ad@gmail.com / ad123</p>
                    <p>Current language: {lng}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;