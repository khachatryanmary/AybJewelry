import './i18n';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/fonts.css';

import React, { useState, useEffect } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Search from './components/Search.jsx';
import HomePage from './components/HomePage.jsx';
import SectionAboutUs from './components/SectionAboutUs.jsx';
import SectionGallery from './components/SectionGallery.jsx';
import NecklaceGallery from './components/NecklaceGallery.jsx';
import NecklaceDetail from './components/NecklaceDetail.jsx';
import RingsGallery from './components/RingsGallery.jsx';
import EarringsGallery from './components/EarringsGallery.jsx';
import BraceletsGallery from './components/BraceletsGallery.jsx';
import HairclipsGallery from './components/HairclipsGallery.jsx';
import Contact from './components/Contact.jsx';
import Login from './components/Login.jsx';
import Cart from './components/Cart.jsx';
import Wishlist from './components/Wishlist.jsx';
import Register from './components/Register.jsx';
import Profile from './components/Profile.jsx';
import RingDetail from './components/RingDetail.jsx';
import EarringsDetail from './components/EarringsDetail.jsx';
import BraceletsDetail from './components/BraceletsDetail.jsx';
import HairclipsDetail from './components/HairclipsDetail.jsx';
import AllProducts from './components/AllProducts.jsx';
import { ToastContainer } from 'react-toastify';
import CheckOut from './components/CheckOut.jsx';
import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import CheckoutSuccess from './components/CheckoutSuccess.jsx';
import FeaturedCollection from './components/FeaturedCollection.jsx';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageProducts from './components/admin/ManageProducts';
import ManageHomepageAssets from './components/admin/ManageHomepageAssets';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
    const [searchActive, setSearchActive] = useState(false);
    const location = useLocation();
    const { i18n } = useTranslation();
    const [collectionSlug, setCollectionSlug] = useState('spring-2025');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const lng = location.pathname.split('/')[1] || 'am';

    useEffect(() => {
        if (['am', 'en', 'ru'].includes(lng)) {
            i18n.changeLanguage(lng);
        }
    }, [lng, i18n]);

    useEffect(() => {
        const fetchCollectionName = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/homepage-assets`);
                const collectionName = res.data.collectionName || 'Spring 2025';
                setCollectionSlug(collectionName.toLowerCase().replace(/\s+/g, '-'));
            } catch (error) {
                console.error('Error fetching collection name:', error);
                setCollectionSlug('spring-2025');
            }
        };
        fetchCollectionName();
    }, [API_URL]);

    const router = useRoutes([
        {
            path: ':lng',
            children: [
                { index: true, element: <HomePage /> },
                { path: 'aboutUs', element: <SectionAboutUs /> },
                { path: 'sectionGallery', element: <SectionGallery /> },
                {
                    path: 'necklaces',
                    children: [
                        { index: true, element: <NecklaceGallery /> },
                        { path: ':id', element: <NecklaceDetail /> },
                    ],
                },
                {
                    path: 'rings',
                    children: [
                        { index: true, element: <RingsGallery /> },
                        { path: ':id', element: <RingDetail /> },
                    ],
                },
                {
                    path: 'earrings',
                    children: [
                        { index: true, element: <EarringsGallery /> },
                        { path: ':id', element: <EarringsDetail /> },
                    ],
                },
                {
                    path: 'bracelets',
                    children: [
                        { index: true, element: <BraceletsGallery /> },
                        { path: ':id', element: <BraceletsDetail /> },
                    ],
                },
                {
                    path: 'hairclips',
                    children: [
                        { index: true, element: <HairclipsGallery /> },
                        { path: ':id', element: <HairclipsDetail /> },
                    ],
                },
                { path: 'all-products', element: <AllProducts /> },
                { path: 'contact', element: <Contact /> },
                { path: 'login', element: <Login /> },
                { path: 'cart', element: <Cart /> },
                { path: 'wishlist', element: <Wishlist /> },
                { path: 'register', element: <Register /> },
                { path: 'profile', element: <Profile /> },
                { path: 'checkout', element: <CheckOut /> },
                { path: 'forgot-password', element: <ForgotPassword /> },
                { path: 'reset-password/:token', element: <ResetPassword /> },
                { path: 'checkout/success', element: <CheckoutSuccess /> },

                // MOVE ADMIN ROUTES BEFORE THE COLLECTION SLUG ROUTE
                {
                    path: 'admin',
                    children: [
                        { path: 'login', element: <AdminLogin /> },
                        {
                            element: <ProtectedRoute />,
                            children: [
                                {
                                    path: '',
                                    element: <AdminDashboard />,
                                    children: [
                                        {
                                            index: true,
                                            element: (
                                                <div className="text-center">
                                                    <h1 className="text-3xl font-semibold text-[#0e0e53] mb-4">
                                                        Welcome to Admin Dashboard
                                                    </h1>
                                                    <p className="text-gray-600">
                                                        Select an option from the sidebar to manage your jewelry website.
                                                    </p>
                                                </div>
                                            )
                                        },
                                        { path: 'products', element: <ManageProducts /> },
                                        { path: 'homepage-assets', element: <ManageHomepageAssets /> },
                                    ],
                                },
                            ],
                        },
                    ],
                },

                // Collection slug route MUST come AFTER admin routes
                { path: ':collectionSlug', element: <FeaturedCollection /> },
            ],
        },
        // Admin routes without language prefix (fallback)
        {
            path: 'admin',
            children: [
                { path: 'login', element: <AdminLogin /> },
                {
                    element: <ProtectedRoute />,
                    children: [
                        {
                            path: '',
                            element: <AdminDashboard />,
                            children: [
                                {
                                    index: true,
                                    element: (
                                        <div className="text-center">
                                            <h1 className="text-3xl font-semibold text-[#0e0e53] mb-4">
                                                Welcome to Admin Dashboard
                                            </h1>
                                            <p className="text-gray-600">
                                                Select an option from the sidebar to manage your jewelry website.
                                            </p>
                                        </div>
                                    )
                                },
                                { path: 'products', element: <ManageProducts /> },
                                { path: 'homepage-assets', element: <ManageHomepageAssets /> },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            path: '*',
            element: <Navigate to='/en' />,
        },
    ]);

    // Check if current route is admin-related to hide header/footer
    const isAdminRoute = location.pathname.includes('/admin');

    return (
        <div className="w-full min-h-screen flex flex-col">
            {!isAdminRoute && <Header setSearchActive={setSearchActive} />}
            {!isAdminRoute && <Search searchActive={searchActive} setSearchActive={setSearchActive} lng={lng} />}
            <main className="flex-grow">{router}</main>
            {!isAdminRoute && <Footer />}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
}

export default App;