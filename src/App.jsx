import './i18n';
import './index.css';

import React, { useState } from 'react';
import { Navigate, useParams, useRoutes } from 'react-router-dom';

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


function App() {
    const [searchActive, setSearchActive] = useState(false);
    const params = useParams(); // Get route params
    const lng = params.lng || 'am'; // Default to 'am' if no lng param

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
                { path: "rings", element: <RingsGallery /> },
                { path: "earrings", element: <EarringsGallery /> },
                { path: "bracelets", element: <BraceletsGallery /> },
                { path: "brooches", element: <BroochesGallery /> },
                { path: "contact", element: <Contact /> },
                { path: "login", element: <Login /> },
                { path: "cart", element: <Cart /> },
                { path: "wishlist", element: <Wishlist /> },
                {path: "register", element: <Register /> },
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
        </div>
    );
}

export default App;
