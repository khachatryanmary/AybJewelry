import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { changeLanguage } from 'i18next';

const LocaleSwitcher = () => {
    const locales = ["am", "ru", "en"];
    const languageLabels = {
        am: "Armenian",
        ru: "Russian",
        en: "English",
    };

    const location = useLocation();
    const navigate = useNavigate();
    const lng = location.pathname.split("/")[1];

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const locale = localStorage.getItem('i18nextLng');
        if (locale !== lng) {
            changeLanguage(lng);
        }
    }, [lng]);

    const handleLanguageChange = (lang) => {
        const pathParts = location.pathname.split('/');
        pathParts[1] = lang;
        const newPath = pathParts.join('/') || '/';
        changeLanguage(lang);
        navigate(newPath);
        setIsOpen(false);
    };

    return (
        <div className="relative text-[#0e0e53] font-sans select-none">
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-[#efeeee] transition text-sm sm:text-base"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium">{languageLabels[lng]}</span>
                <i className={`bi bi-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-1  bg-[#efeeee] shadow-md rounded-md overflow-hidden z-50 w-32 sm:w-40">
                    {locales
                        .filter((l) => l !== lng)
                        .map((l) => (
                            <div
                                key={l}
                                onClick={() => handleLanguageChange(l)}
                                className="px-3 py-2 hover:bg-[#0a0a39] hover:text-white cursor-pointer text-sm sm:text-base transition-colors"
                            >
                                {languageLabels[l]}
                            </div>
                        ))}
                </div>
            )}
        </div>
    );
};

export default LocaleSwitcher;