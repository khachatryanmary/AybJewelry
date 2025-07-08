// RingDetail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useCart } from "../Providers/CartProvider.jsx";
import { useWishlist } from "../Providers/WishlistProvider.jsx";

const RingDetail = () => {
    const { addToCart } = useCart();
    const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];

    const [ring, setRing] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [isWished, setIsWished] = useState(false);

    useEffect(() => {
        const fetchRingDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/rings?id=${id}`);
                const product = res.data[0];
                setRing(product);
                setIsWished(wishlist.some(item => item.id === product.id));
            } catch (error) {
                console.log('Failed to fetch ring:', error.message);
            }
        };
        fetchRingDetail();
    }, [id, location.pathname, wishlist]);

    const toggleWishlist = () => {
        if (isWished) {
            removeFromWishlist(ring.id);
        } else {
            addToWishlist(ring);
        }
        setIsWished(!isWished);
    };

    return (
        <div className="flex w-[90%] mx-auto pt-[40px] mt-[20px] h-[700px] bg-[#efeeee] justify-center items-start gap-[40px]">
            <div className="flex items-start justify-start">
                <img
                    id="detailImage"
                    src={ring.image}
                    alt={ring.name || 'image'}
                    className="w-[450px] h-auto rounded-[8px] object-cover shadow-md"
                />
            </div>

            <div className="flex flex-col justify-center items-start gap-[40px] w-[50%]">
                <Link to={`/${lng}/rings/`}>
                    <button className="bg-[#f7f7f7] text-[#0a0a39] transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] hover:bg-[#0a0a39] hover:text-[white]">
                        {t('ringDetail.backToSelection')}
                    </button>
                </Link>

                <div className="flex flex-col w-full">
                    <div className="flex justify-between w-full">
                        <span className="text-[25px] font-bold text-[#213547]">{ring.name}</span>
                        <span
                            onClick={toggleWishlist}
                            className={`text-[28px] cursor-pointer transition-all duration-300 ${
                                isWished ? 'text-[#0a0a39]' : 'text-gray-400'
                            }`}
                            title={t('addToWishlist')}
                        >
                            <i className={`bi ${isWished ? 'bi-heart-fill' : 'bi-heart'} transition-all duration-300`}></i>
                        </span>
                    </div>

                    <span className="text-[20px] text-[#666] font-semibold my-[10px] mb-[20px]">
                        {ring.price} AMD
                    </span>

                    <p className="text-[16px] leading-[1.5] text-[#444] mb-[20px]">{ring.description}</p>

                    <button
                        id="addBtn"
                        onClick={() => addToCart(ring)}
                        className="transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] bg-[#f7f7f7] text-[#0a0a39] hover:bg-[#0a0a39] hover:text-[white]"
                    >
                        {t('ringDetail.add')}
                    </button>

                    <div className="mt-[20px] w-full bg-[white] rounded-[8px] shadow-md overflow-hidden">
                        <div
                            className={`text-[18px] font-bold flex justify-between items-center px-[20px] py-[12px] bg-[#f7f7f7] border-b border-[#ddd] cursor-pointer select-none ${
                                openDetails ? 'open' : ''
                            }`}
                            onClick={() => setOpenDetails(!openDetails)}
                        >
                            <span>{t('ringDetail.details')}</span>
                            <i className={`bi bi-chevron-double-down transition-transform duration-300 ${openDetails ? 'rotate-180' : ''}`}></i>
                        </div>

                        {openDetails && (
                            <ul className="list-none m-0 p-[15px] px-[25px] flex flex-col gap-[14px] max-h-[300px] overflow-y-auto">
                                {ring.details?.length > 0 &&
                                    Object.entries(ring.details[0]).map(([key, value], index) => (
                                        <li
                                            key={index}
                                            className="flex justify-start items-center w-full gap-[20px] text-left"
                                        >
                                            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RingDetail;
