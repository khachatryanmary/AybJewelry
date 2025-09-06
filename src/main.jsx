import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { store } from "./Toolkit/store.js";
import { Provider } from "react-redux";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n"; // Import i18n instance
import { UserProvider } from "./Providers/UserContext.jsx";
import { CartProvider } from "./Providers/CartContext.jsx";
import {WishlistProvider} from "./Providers/WishlistContext.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <Provider store={store}>
            <I18nextProvider i18n={i18n}>
                <UserProvider>
                    <CartProvider>
                        <WishlistProvider>
                             <App />
                        </WishlistProvider>
                    </CartProvider>
                </UserProvider>
            </I18nextProvider>
        </Provider>
    </BrowserRouter>
);