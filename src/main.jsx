import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import {AuthProvider} from "./Providers/AuthContext.jsx";
import {store} from "./Toolkit/store.js";
import {Provider} from "react-redux";
import {I18nextProvider} from "react-i18next";

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <AuthProvider>
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <App />
                </I18nextProvider>
            </Provider>
        </AuthProvider>
    </BrowserRouter>
);
