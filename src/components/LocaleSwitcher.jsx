import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const LocaleSwitcher = () => {
    const locales = ['am', 'ru', 'en'];
    const languageLabels = {
        am: 'Armenian',
        ru: 'Russian',
        en: 'English',
    };
    const location = useLocation();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const lng = location.pathname.split('/')[1] || 'en';
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (i18n.language !== lng) {
            i18next.changeLanguage(lng).catch((error) => {
                console.error('Failed to change language:', error);
            });
        }
    }, [lng, i18n]);

    const handleLanguageChange = async (lang) => {
        try {
            await i18next.changeLanguage(lang);

            // Better path reconstruction logic
            const pathParts = location.pathname.split('/');
            console.log('Current path parts:', pathParts);
            console.log('Current language:', lng);
            console.log('New language:', lang);

            // Replace the language part (index 1)
            if (pathParts.length > 1) {
                pathParts[1] = lang;
            } else {
                // If no language in path, add it
                pathParts.splice(1, 0, lang);
            }

            // Reconstruct the path, ensuring it starts with /
            let newPath = pathParts.join('/');

            // Handle edge cases
            if (!newPath.startsWith('/')) {
                newPath = '/' + newPath;
            }

            // Remove any double slashes
            newPath = newPath.replace(/\/+/g, '/');

            // Ensure we don't end up with just the language (add trailing slash if needed)
            if (newPath === `/${lang}`) {
                newPath = `/${lang}/`;
            }

            console.log('New path:', newPath);

            navigate(newPath);
            setIsOpen(false);
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    return (
        <div className="relative text-[#0e0e53] font-sans select-none">
            <div
                className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition text-sm sm:text-base"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium">{languageLabels[lng]}</span>
                <i className={`bi bi-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </div>
            {isOpen && (
                <div className="text-[#0e0e53] absolute top-full mt-1 bg-white shadow-md rounded-md overflow-hidden z-50 w-32 sm:w-40">
                    {locales
                        .filter((l) => l !== lng)
                        .map((l) => (
                            <div
                                key={l}
                                onClick={() => handleLanguageChange(l)}
                                className="px-3 py-2 text-[#0e0e53] hover:bg-[#0e0e53] hover:text-white cursor-pointer text-sm sm:text-base transition-colors text-[#0e0e53]"
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