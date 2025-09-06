import React, { useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from "framer-motion";

const Filter = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const minParam = searchParams.get("min") || "";
    const maxParam = searchParams.get("max") || "";
    const [minPrice, setMinPrice] = useState(minParam);
    const [maxPrice, setMaxPrice] = useState(maxParam);
    const [showPriceInputs, setShowPriceInputs] = useState(false);

    const openPrice = () => {
        setShowPriceInputs(!showPriceInputs);
    };

    const filterPrice = (min, max) => {
        const newParams = {};
        if (min) newParams.min = min;
        if (max) newParams.max = max;
        setSearchParams(newParams);
        setShowPriceInputs(false);
    };

    const dropdownVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            height: 0,
            transition: { duration: 0.3, ease: "easeOut" }
        },
        visible: {
            opacity: 1,
            y: 0,
            height: "auto",
            transition: { duration: 0.3, ease: "easeIn" }
        }
    };

    return (
        <div className="flex w-full justify-center items-center py-4 px-2 sm:px-4">
            <div className="relative flex justify-center items-center w-full max-w-xs sm:max-w-sm md:max-w-md">
                <button
                    onClick={openPrice}
                    className="w-[60%] bg-[#f7f7f7] text-[#0a0a39] transition duration-300 border-none cursor-pointer py-2 px-4 font-semibold rounded-lg hover:bg-[#0a0a39] hover:text-white text-sm sm:text-base"
                >
                    {t('sort.sortByPrice')}
                </button>
                <AnimatePresence>
                    {showPriceInputs && (
                        <motion.div
                            variants={dropdownVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="absolute top-full mt-2 bg-[#efeeee] rounded-lg shadow-lg p-4 z-10 w-full sm:w-80 md:w-96"
                        >
                            <div className="flex flex-col gap-3">
                                <input
                                    type="number"
                                    placeholder={t('sort.minPricePlaceholder')}
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full p-2 rounded-full text-[#0e0e53] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0a0a39] transition"
                                />
                                <input
                                    type="number"
                                    placeholder={t('sort.maxPricePlaceholder')}
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full p-2 rounded-full text-[#0e0e53] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#0a0a39] transition"
                                />
                                <button
                                    onClick={() => filterPrice(minPrice, maxPrice)}
                                    className="w-full bg-white py-2 rounded-full text-[#0e0e53] text-sm sm:text-base focus:ring-2 focus:ring-[#0a0a39] hover:text-white hover:bg-[#0a0a39] transition"
                                >
                                    {t('sort.apply')}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Filter;