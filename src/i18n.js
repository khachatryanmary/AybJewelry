import i18next from "i18next";
import I18NextHttpBackend from "i18next-http-backend";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18next
    .use(I18NextHttpBackend)
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
        lng: "en",
        supportedLngs: ["am", "ru", "en"],
        fallbackLng: "en",
        debug: process.env.NODE_ENV === "development", // Only enable debug in development
        backend: {
            loadPath: "/locales/{{lng}}/translation.json",
        },
        react: {
            useSuspense: false,
        },
    });

export default i18next;