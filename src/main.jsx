import './i18n'; // only import it, no need to re-initialize
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import {AuthProvider} from "./components/AuthContext.jsx";
import {ThemeProvider} from "./Providers/useTheme.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ThemeProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
);
