import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axios from "axios";
import Filter from "./Filter.jsx";
import { useFilteredProduct } from "./useFilteredProduct.jsx";
import { useTranslation } from "react-i18next";
import { useLocation } from 'react-router-dom';


function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

const AllProductsGallery = () => {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();
    const { setProduct, filteredProduct } = useFilteredProduct();

    const [visibleCount, setVisibleCount] = useState(8); // Start by showing 8 items

    useEffect(() => {
        const getAllProducts = async () => {
            try {
                const endpoints = [
                    "http://localhost:4000/necklaces",
                    "http://localhost:4000/rings",
                    "http://localhost:4000/bracelets",
                    "http://localhost:4000/earrings",
                    "http://localhost:4000/brooches"
                ];

                const responses = await Promise.all(endpoints.map(url => axios.get(url)));

                const categories = ['necklace', 'ring', 'bracelet', 'earring', 'brooch'];
                const allItems = responses.flatMap((res, index) =>
                    res.data.map(item => ({ ...item, category: categories[index] }))
                );

                setProduct(shuffleArray(allItems));
            } catch (error) {
                console.log("Error fetching products:", error.message);
            }
        };

        getAllProducts();
    }, [setProduct]);

    const visibleProducts = filteredProduct?.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 8);
    };

    return (
        <div className="w-full">
            <div className="w-[90%] flex flex-col justify-center items-center mx-auto">
                <div className="my-[30px] flex flex-col justify-center items-center text-[#0e0e53] text-center font-[Against] italic font-light">
                    <h2 className="text-[30px]">{t('allProductsGallery.title')}</h2>
                </div>

                <Filter />

                <div className="mt-[50px] mb-[30px] w-full flex justify-center items-center flex-wrap gap-[50px]">
                    {visibleProducts && visibleProducts.map(({ id, image, name, price, category }, i) => (
                        <Link to={`/${lng}/${category}s/${id}`} key={`${id}-${i}`}>
                            <div className="w-[280px] h-[280px] flex flex-col items-center relative">
                                <img src={image} alt={name || 'image'} className="w-[280px] h-[180px] object-cover" />
                                <p className="w-full flex flex-col items-start justify-start pl-[30px] text-left">
                                    <span className="text-[20px] font-bold text-[#213547]">{name}</span>
                                    <span className="text-[15px] text-[gray]">{price} AMD</span>
                                    <span className="text-[13px] text-[#999] italic">{category}</span>
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {visibleProducts && filteredProduct && visibleCount < filteredProduct.length && (
                    <button
                        onClick={handleLoadMore}
                        className="mb-[50px] px-6 py-2 border border-[#0e0e53] text-[#0e0e53] hover:bg-[#0e0e53] hover:text-white transition-all rounded"
                    >
                        {t('allProductsGallery.loadMore') || 'Load More'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AllProductsGallery;
