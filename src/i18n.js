import i18next from 'i18next';
import I18NextHttpBackend from 'i18next-http-backend';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Function to update font based on language
const updateFontForLanguage = (lng) => {
    const htmlElement = document.documentElement;

    // Remove existing language attributes
    htmlElement.removeAttribute('data-lang');

    // Set new language attribute
    htmlElement.setAttribute('data-lang', lng);
    htmlElement.setAttribute('lang', lng);

    // Optional: Add body class for additional styling
    document.body.classList.remove('lang-en', 'lang-ru', 'lang-am');
    document.body.classList.add(`lang-${lng}`);

    console.log(`Font updated for language: ${lng}`);
};

i18next
    .use(I18NextHttpBackend)
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        supportedLngs: ['am', 'ru', 'en'],
        fallbackLng: 'en',
        debug: false, // disables console logs
        saveMissing: false, // don’t log missing keys
        // debug: process.env.NODE_ENV === 'development',
        ns: ['translation'],
        defaultNS: 'translation',
        detection: {
            order: ['path', 'localStorage', 'navigator'],
            lookupFromPathIndex: 0,
            caches: ['localStorage'],
            // Convert language codes if needed
            convertDetectedLanguage: (lng) => {
                // Handle common variations
                const languageMap = {
                    'hy': 'am',  // Armenian ISO code conversion
                    'hy-AM': 'am',
                    'ru-RU': 'ru',
                    'en-US': 'en',
                    'en-GB': 'en'
                };
                return languageMap[lng] || lng;
            }
        },
        backend: {
            loadPath: '/locales/{{lng}}/translation.json',
            request: (options, url, payload, callback) => {
                fetch(url)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`Failed to load ${url}: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then((data) => callback(null, { status: 200, data }))
                    .catch((error) => {
                        console.error('i18next-http-backend error:', error);
                        // Fallback to empty object to prevent crashes
                        callback(null, { status: 200, data: {} });
                    });
            },
        },
        react: {
            useSuspense: false,
            bindI18n: 'languageChanged loaded',
            bindI18nStore: 'added removed',
        },
        interpolation: {
            escapeValue: false, // React already does escaping
        },
        // Add resource loading timeout
        load: 'languageOnly', // Only load language without region
        preload: ['en'], // Preload default language
    })
    .then((t) => {
        // Update font for initial language
        updateFontForLanguage(i18next.language);
        console.log('i18next initialized successfully');
    })
    .catch((error) => {
        console.error('i18next initialization failed:', error);
        // Set default language font as fallback
        updateFontForLanguage('en');
    });

// Listen for language changes and update fonts
i18next.on('languageChanged', (lng) => {
    updateFontForLanguage(lng);
});

// Export helper function for manual language switching
export const changeLanguage = async (lng) => {
    try {
        isChangingLanguage = true;
        await i18next.changeLanguage(lng);
        updateFontForLanguage(lng);

        // Update URL if needed (for path-based detection) - but prevent loops
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/en/') ||
            currentPath.startsWith('/ru/') ||
            currentPath.startsWith('/am/')) {
            const newPath = currentPath.replace(/^\/(en|ru|am)/, `/${lng}`);
            if (newPath !== currentPath) {
                window.history.replaceState(null, '', newPath);
            }
        }

        setTimeout(() => {
            isChangingLanguage = false;
        }, 100);

        return true;
    } catch (error) {
        console.error('Failed to change language:', error);
        isChangingLanguage = false;
        return false;
    }
};

// Export current language getter
export const getCurrentLanguage = () => i18next.language || 'en';

// Export supported languages
export const supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'am', name: 'Հայերեն', flag: '🇦🇲' }
];

export default i18next;