import './i18n'; // only import it, no need to re-initialize
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import {AuthProvider} from "./Providers/AuthContext.jsx";
import {CartProvider} from "./Providers/CartProvider.jsx";
import {WishlistProvider} from "./Providers/WishlistProvider.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
            <CartProvider>
                <WishlistProvider>
                    <AuthProvider>
                        <App />
                    </AuthProvider>
                </WishlistProvider>
            </CartProvider>
    </BrowserRouter>
);
