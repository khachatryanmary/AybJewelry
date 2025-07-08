import React, { useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';

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
    };

    return (
        <div className="text-black flex w-full justify-center items-center gap-[100px] border-b border-gray-400 mb-[20px] pb-[20px]">
            <p className="font-semibold text-[black] text-[20px]">
                {t('sortBy')}
            </p>            <ul className="flex gap-[20px] font-bold justify-around items-center ">
                <li className="cursor-pointer hover:text-[gray] text-[20px] transition">{t('popularity')}</li>
                <li className="cursor-pointer hover:text-[gray] text-[20px] transition">{t('type')}</li>
                <li className="cursor-pointer hover:text-[gray] text-[20px] transition  " onClick={openPrice}>{t('price')}</li>
                {showPriceInputs && (
                    <div>
                        <div className="flex gap-[5px]">
                            <input
                                type="number"
                                placeholder={t('minPricePlaceholder')}
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="p-[10px] rounded-[20px] border border-[gray] w-[200px] h-[30px]"
                            />
                            <input
                                type="number"
                                placeholder={t('maxPricePlaceholder')}
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="p-[10px] rounded-[20px] border border-[gray] w-[200px] h-[30px]"
                            />
                        </div>
                        <button
                            onClick={() => filterPrice(minPrice, maxPrice)}
                            className="flex justify-center items-center w-[100%] h-[30px] transition duration-500 text-[gray] hover:text-[white] hover:bg-[#0a0a39] border rounded-[20px] mt-[5px]"
                        >
                            {t('apply')}
                        </button>
                    </div>
                )}
            </ul>
        </div>
    );
};

export default Filter;
