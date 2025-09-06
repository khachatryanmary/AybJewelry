import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import debounce from 'lodash/debounce';

function Search({ searchActive, setSearchActive, lng }) {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');
    const [search, setSearch] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imageLoadingStates, setImageLoadingStates] = useState({});
    const searchRef = useRef(null);

    const API_URL = import.meta.env.VITE_API_URL;

    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "am" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    // Fetch products once on mount
    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/api/products`)
            .then(res => res.json())
            .then(data => {
                setAllProducts(data);
                setImageLoadingStates(
                    data.reduce((acc, item) => ({ ...acc, [item._id]: true }), {})
                );
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [API_URL]);

    useEffect(() => {
        if (searchActive) {
            // Calculate scrollbar width
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
            document.documentElement.style.setProperty('--scrollbar-width', '0px');
        }
        return () => {
            document.body.classList.remove('no-scroll');
            document.documentElement.style.setProperty('--scrollbar-width', '0px');
        };
    }, [searchActive]);

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setSearchActive(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [setSearchActive]);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (searchActive) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [searchActive]);

    // Debounce search filtering
    const debouncedSearch = useMemo(
        () => debounce((val) => setSearch(val), 300),
        []
    );

    useEffect(() => {
        debouncedSearch(inputValue);
    }, [inputValue, debouncedSearch]);

    // Category keywords mapping to item.category
    const categoryKeywords = {
        ring: 'ring',
        rings: 'ring',
        necklace: 'necklace',
        necklaces: 'necklace',
        earring: 'earring',
        earrings: 'earring',
        bracelet: 'bracelet',
        bracelets: 'bracelet',
        brooch: 'brooch',
        brooches: 'brooch'
    };

    const filteredProducts = useMemo(() => {
        if (search.trim() === '') return [];

        const searchLower = search.toLowerCase();
        const category = categoryKeywords[searchLower];

        if (category) {
            return allProducts
                .filter(item => item.category.toLowerCase() === category)
                .slice(0, 10);
        } else {
            return allProducts
                .filter(item => item.name.toLowerCase().includes(searchLower))
                .slice(0, 10);
        }
    }, [search, allProducts]);

    const modalVariants = {
        hidden: {
            opacity: 0,
            y: "-100%",
            transition: { duration: 0.3, ease: "easeOut" }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeIn" }
        }
    };

    const categoryPathMap = {
        ring: "rings",
        bracelet: "bracelets",
        earring: "earrings",
        brooch: "brooches",
        necklace: "necklaces"
    };

    const handleImageLoad = (id) => {
        setImageLoadingStates(prev => {
            if (!prev[id]) return prev;
            return { ...prev, [id]: false };
        });
    };

    return (
        <AnimatePresence>
            {searchActive && (
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 w-full h-full bg-white z-50 flex justify-center items-start"
                    style={{ willChange: 'transform, opacity' }}
                >
                    <button
                        onClick={() => setSearchActive(false)}
                        className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-[#0e0e53] hover:text-[#df7a7a] transition text-[24px] sm:text-[28px] md:text-[30px]"
                    >
                        <i className="bi bi-x"></i>
                    </button>
                    <div
                        ref={searchRef}
                        className="w-full pt-[40px] sm:pt-[50px] md:pt-[60px] pb-4 sm:pb-5 md:pb-6 flex flex-col items-center space-y-4 sm:space-y-5 md:space-y-6"
                    >
                        <h2 className="font-[Against] text-[20px] sm:text-[22px] md:text-[25px] text-[#0e0e53]">
                            {t('search.title')}
                        </h2>

                        <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[400px]">
                            <input
                                type="text"
                                placeholder={t('search.placeholder')}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoFocus
                                className="w-full h-[36px] sm:h-[38px] md:h-[40px] rounded-[30px] border border-[#0e0e53] p-[16px] sm:p-[18px] md:p-[20px] text-[#0e0e53] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0a0a39] transition"
                            />
                        </div>

                        {loading && (
                            <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                        )}

                        {!loading && search.trim() !== '' && (
                            <ul className="w-full max-w-[90%] sm:max-w-[80%] md:max-w-[600px] flex flex-col gap-[16px] sm:gap-[18px] md:gap-[20px] h-[calc(100vh-120px)] sm:h-[calc(100vh-130px)] md:h-[calc(100vh-140px)] overflow-y-auto pb-[16px] sm:pb-[18px] md:pb-[20px] scroll-pb-[16px] sm:scroll-pb-[18px] md:scroll-pb-[20px]">
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((item) => (
                                        <Link
                                            key={item._id}
                                            to={`/${lng}/${categoryPathMap[item.category]}/${item._id}`}
                                            className="flex items-center gap-3 sm:gap-3.5 md:gap-4 bg-[#efeeee] rounded-lg p-3 sm:p-3.5 md:p-4 transition"
                                            onClick={() => setSearchActive(false)}
                                        >
                                            <div className="relative w-[150px] sm:w-[180px] md:w-[200px] h-[120px] sm:h-[135px] md:h-[150px] bg-[#efeeee] rounded">
                                                {imageLoadingStates[item._id] && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                                    </div>
                                                )}
                                                <img
                                                    src={`${API_URL}${item.image}`}
                                                    alt={item.alt || item.name}
                                                    className={`w-full h-full object-cover rounded ${imageLoadingStates[item._id] ? 'opacity-0' : 'opacity-100'}`}
                                                    onLoad={() => handleImageLoad(item._id)}
                                                />
                                            </div>
                                            <div className="text-left pl-[16px] sm:pl-[18px] md:pl-[20px]">
                                                <span className="block font-Against text-[16px] sm:text-[17px] md:text-[18px] font-semibold">
                                                    {item.name}
                                                </span>
                                                <span className="block text-[14px] sm:text-[15px] md:text-[16px] text-gray-400">
                                                    {numberFormatter.format(item.price)} {t("checkout.currency", { defaultValue: "AMD" })}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <li className="text-[#0e0e53] text-[14px] sm:text-[15px] md:text-[16px]">
                                        {t('search.noResults')}
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default Search;