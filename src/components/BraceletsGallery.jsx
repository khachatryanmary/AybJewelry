import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import Filter from "./Filter.jsx";
import { useFilteredProduct } from "./useFilteredProduct.jsx";
import { useTranslation } from "react-i18next";

const BraceletsGallery = () => {
    const { t } = useTranslation();
    const { setProduct, filteredProduct } = useFilteredProduct();

    useEffect(() => {
        const getBracelets = async () => {
            try {
                const res = await axios.get("http://localhost:4000/bracelets");
                setProduct(res.data);
            } catch (error) {
                console.log(error.message);
            }
        };

        getBracelets();
    }, [setProduct]);

    return (
        <div className="w-full">
            <div className="w-[90%] flex flex-col justify-center items-center mx-auto">
                <div className="my-[30px] flex flex-col justify-center items-center text-[#0e0e53] text-center font-[Against] italic font-light">
                    <h2 className="text-[30px]">{t('braceletsGallery.title')}</h2>
                </div>

                <Filter />

                <div className="mt-[50px] mb-[50px] w-full flex justify-center items-center flex-wrap gap-[50px]">
                    {filteredProduct && filteredProduct.map(({ id, image, name, price }, i) => (
                        <Link to={`${id}`} key={`${id}-${i}`}>
                            <div className="w-[280px] h-[280px] flex flex-col items-center relative">
                                <img src={image} alt={name || 'image'} className="w-[280px] h-[180px] object-cover" />
                                <p className="w-full flex flex-col items-start justify-start pl-[30px] text-left">
                                    <span className="text-[20px] font-bold text-[#213547]">{name}</span>
                                    <span className="text-[15px] text-[gray]">{price} AMD</span>
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BraceletsGallery;
