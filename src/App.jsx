import './i18n';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/fonts.css';

import React, { useState, useEffect, Suspense } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';

// Static imports for lightweight components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Search from './components/Search.jsx';

// Lazy-load heavy components
const HomePage = React.lazy(() => import('./components/HomePage.jsx'));
const SectionAboutUs = React.lazy(() => import('./components/SectionAboutUs.jsx'));
const SectionGallery = React.lazy(() => import('./components/SectionGallery.jsx'));
const NecklaceGallery = React.lazy(() => import('./components/NecklaceGallery.jsx'));
const NecklaceDetail = React.lazy(() => import('./components/NecklaceDetail.jsx'));
const RingsGallery = React.lazy(() => import('./components/RingsGallery.jsx'));
const RingDetail = React.lazy(() => import('./components/RingDetail.jsx'));
const EarringsGallery = React.lazy(() => import('./components/EarringsGallery.jsx'));
const EarringsDetail = React.lazy(() => import('./components/EarringsDetail.jsx'));
const BraceletsGallery = React.lazy(() => import('./components/BraceletsGallery.jsx'));
const BraceletsDetail = React.lazy(() => import('./components/BraceletsDetail.jsx'));
const HairclipsGallery = React.lazy(() => import('./components/HairclipsGallery.jsx'));
const HairclipsDetail = React.lazy(() => import('./components/HairclipsDetail.jsx'));
const AllProducts = React.lazy(() => import('./components/AllProducts.jsx'));
const Contact = React.lazy(() => import('./components/Contact.jsx'));
const Login = React.lazy(() => import('./components/Login.jsx'));
const Cart = React.lazy(() => import('./components/Cart.jsx'));
const Wishlist = React.lazy(() => import('./components/Wishlist.jsx'));
const Register = React.lazy(() => import('./components/Register.jsx'));
const Profile = React.lazy(() => import('./components/Profile.jsx'));
const CheckOut = React.lazy(() => import('./components/CheckOut.jsx'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword.jsx'));
const ResetPassword = React.lazy(() => import('./components/ResetPassword.jsx'));
const CheckoutSuccess = React.lazy(() => import('./components/CheckoutSuccess.jsx'));
const FeaturedCollection = React.lazy(() => import('./components/FeaturedCollection.jsx'));
const AdminLogin = React.lazy(() => import('./components/admin/AdminLogin.jsx'));
const AdminDashboard = React.lazy(() => import('./components/admin/AdminDashboard.jsx'));
const AdminOverview = React.lazy(() => import('./components/admin/AdminOverview.jsx'));
const ManageProducts = React.lazy(() => import('./components/admin/ManageProducts.jsx'));
const ManageCategories = React.lazy(() => import('./components/admin/ManageCategories.jsx'));
const ManageCollections = React.lazy(() => import('./components/admin/ManageCollections.jsx'));
const ManageOrders = React.lazy(() => import('./components/admin/ManageOrders.jsx'));
const ManageCustomers = React.lazy(() => import('./components/admin/ManageCustomers.jsx'));
// FIXED: Changed from ManageAnalytics to AdminAnalytics to match actual file name
const AdminAnalytics = React.lazy(() => import('./components/admin/AdminAnalytics.jsx'));
const ManageHomepageAssets = React.lazy(() => import('./components/admin/ManageHomepageAssets.jsx'));
const ManageUsers = React.lazy(() => import('./components/admin/ManageUsers.jsx'));
const ProtectedRoute = React.lazy(() => import('./components/admin/ProtectedRoute.jsx'));

function App() {
    const [searchActive, setSearchActive] = useState(false);
    const location = useLocation();
    const { i18n } = useTranslation();
    const [collectionSlug, setCollectionSlug] = useState('spring-2025');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const lng = location.pathname.split('/')[1] || 'en';

    useEffect(() => {
        const firstSegment = location.pathname.split('/')[1];
        if (!['am', 'en', 'ru'].includes(firstSegment) && firstSegment !== 'admin') {
            const newPath = `/en${location.pathname}`;
            window.location.replace(newPath);
        } else if (['am', 'en', 'ru'].includes(firstSegment)) {
            i18n.changeLanguage(firstSegment);
        }
    }, [location.pathname, i18n]);

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
                                        { index: true, element: <Navigate to="overview" replace /> },
                                        { path: 'overview', element: <AdminOverview /> },
                                        { path: 'products', element: <ManageProducts /> },
                                        { path: 'categories', element: <ManageCategories /> },
                                        { path: 'collections', element: <ManageCollections /> },
                                        { path: 'orders', element: <ManageOrders /> },
                                        { path: 'customers', element: <ManageCustomers /> },
                                        { path: 'analytics', element: <AdminAnalytics /> },
                                        { path: 'homepage-assets', element: <ManageHomepageAssets /> },
                                        { path: 'users', element: <ManageUsers /> },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                { path: ':collectionSlug', element: <FeaturedCollection /> },
            ],
        },
        { path: 'admin/*', element: <Navigate to="/en/admin/login" replace /> },
        { path: '*', element: <Navigate to="/en" replace /> },
    ]);

    const isAdminRoute = location.pathname.includes('/admin') && ['am', 'en', 'ru'].includes(lng);

    return (
        <div className="w-full min-h-screen flex flex-col">
            {!isAdminRoute && <Header setSearchActive={setSearchActive} />}
            {!isAdminRoute && <Search searchActive={searchActive} setSearchActive={setSearchActive} lng={lng} />}
            <main className="flex-grow">
                <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
                    {router}
                </Suspense>
            </main>
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