import './i18n';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

import React, { useState, useEffect } from 'react';
import { Navigate, useRoutes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Search from "./components/Search.jsx";

import HomePage from "./components/HomePage.jsx";
import SectionAboutUs from "./components/SectionAboutUs.jsx";
import SectionGallery from "./components/SectionGallery.jsx";
import NecklaceGallery from "./components/NecklaceGallery.jsx";
import NecklaceDetail from "./components/NecklaceDetail.jsx";
import RingsGallery from "./components/RingsGallery.jsx";
import EarringsGallery from "./components/EarringsGallery.jsx";
import BraceletsGallery from "./components/BraceletsGallery.jsx";
import BroochesGallery from "./components/BroochesGallery.jsx";
import Contact from "./components/Contact.jsx";
import Login from "./components/Login.jsx";
import Cart from "./components/Cart.jsx";
import Wishlist from "./components/Wishlist.jsx";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";
import RingDetail from "./components/RingDetail.jsx";
import EarringsDetail from "./components/EarringsDetail.jsx";
import BraceletsDetail from "./components/BraceletsDetail.jsx";
import BroochesDetail from "./components/BroochesDetail.jsx";
import AllProducts from "./components/AllProducts.jsx";
import {ToastContainer} from "react-toastify";

function App() {
    const [searchActive, setSearchActive] = useState(false);
    const location = useLocation();
    const { i18n } = useTranslation();

    const lng = location.pathname.split("/")[1] || 'am';

    // Automatically update i18n language when lng in URL changes
    useEffect(() => {
        if (['am', 'en', 'ru'].includes(lng)) {
            i18n.changeLanguage(lng);
        }
    }, [lng, i18n]);

    const router = useRoutes([
        {
            path: ":lng",
            children: [
                { index: true, element: <HomePage /> },
                { path: "aboutUs", element: <SectionAboutUs /> },
                { path: "sectionGallery", element: <SectionGallery /> },

                {
                    path: "necklaces",
                    children: [
                        { index: true, element: <NecklaceGallery /> },
                        { path: ":id", element: <NecklaceDetail /> }
                    ]
                },

                {
                    path: "rings",
                    children: [
                        { index: true, element: <RingsGallery /> },
                        { path: ":id", element: <RingDetail /> }
                    ]
                },
                {
                    path: "earrings",
                    children: [
                        { index: true, element: <EarringsGallery /> },
                        { path: ":id", element: <EarringsDetail /> }
                    ]
                },
                {
                    path: "bracelets",
                    children: [
                        { index: true, element: <BraceletsGallery /> },
                        { path: ":id", element: <BraceletsDetail /> }
                    ]
                },
                {
                    path: "brooches",
                    children: [
                        { index: true, element: <BroochesGallery /> },
                        { path: ":id", element: <BroochesDetail /> }
                    ]
                },

                { path: "all-products", element: <AllProducts /> },
                { path: "earrings", element: <EarringsGallery /> },
                { path: "bracelets", element: <BraceletsGallery /> },
                { path: "brooches", element: <BroochesGallery /> },
                { path: "contact", element: <Contact /> },
                { path: "login", element: <Login /> },
                { path: "cart", element: <Cart /> },
                { path: "wishlist", element: <Wishlist /> },
                { path: "register", element: <Register /> },
                { path: "profile", element: <Profile /> }
            ]
        },
        {
            path: '*',
            element: <Navigate to="/en" />
        }
    ]);

    return (
        <div className="w-full min-h-screen flex flex-col justify-between">
            <Header setSearchActive={setSearchActive} />
            <Search searchActive={searchActive} setSearchActive={setSearchActive} lng={lng} />
            {router}
            <Footer />
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
