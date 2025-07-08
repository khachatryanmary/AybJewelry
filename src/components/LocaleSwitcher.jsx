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
                className="flex items-center gap-1 px-[12px] py-[6px] rounded-md cursor-pointer hover:bg-[#efeeee] transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-sm font-medium">{languageLabels[lng]}</span>
                <i className={`bi bi-chevron-down text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 bg-[#efeeee] shadow-md rounded-md overflow-hidden z-50 w-[150px]">
                    {locales
                        .filter((l) => l !== lng)
                        .map((l) => (
                            <div
                                key={l}
                                onClick={() => handleLanguageChange(l)}
                                className="px-[12px] py-[8px] hover:bg-[#0a0a39] hover:text-[white] cursor-pointer text-sm transition-colors"
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
