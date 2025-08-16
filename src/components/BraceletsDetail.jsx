import React, {useEffect, useRef, useState} from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../Toolkit/slices/cartSlice.js";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

import 'swiper/css';
import 'swiper/css/navigation';

const BraceletDetail = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { id } = useParams();

    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const from = location.state?.from || `/${lng}/bracelets`;

    const [bracelet, setBracelet] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [openDetails, setOpenDetails] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptType, setLoginPromptType] = useState("");
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [isWished, setIsWished] = useState(false);

    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;
    const API_URL = import.meta.env.VITE_API_URL;

    const loginPromptRef = useRef(null);


    useEffect(() => {
        const fetchBraceletDetailAndWishlistStatus = async () => {
            try {
                const productRes = await axios.get(`${API_URL}/api/products/${id}`);
                const product = productRes.data;
                setBracelet(product);

                if (currentUser) {
                    const wishRes = await axios.get(`${API_URL}/api/wishlist/${currentUser.id}`);
                    const items = wishRes.data?.items || [];
                    const found = items.some(item => item._id === product._id);
                    setIsWished(found);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error.message);
                toast.error("Failed to load product details");
            } finally {
                setLoading(false); // Set loading to false after fetch
            }
        };

        fetchBraceletDetailAndWishlistStatus();
    }, [id, location.pathname, API_URL, currentUser]);

    useEffect(() => {
        if (isLoginPromptOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isLoginPromptOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isLoginPromptOpen && loginPromptRef.current && !loginPromptRef.current.contains(event.target)) {
                setIsLoginPromptOpen(false);
            }
        };

        if (isLoginPromptOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoginPromptOpen]);

    const toggleWishlist = async () => {
        if (!userId || !bracelet._id) {
            setLoginPromptType("wishlist");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            if (isWished) {
                await axios.delete(`${API_URL}/api/wishlist/${userId}/${bracelet._id}`);
                setIsWished(false);
                toast.info(`${bracelet.name} removed from wishlist`);
            } else {
                await axios.post(`${API_URL}/api/wishlist/${userId}`, {
                    productId: bracelet._id,
                });
                setIsWished(true);
                toast.success(`${bracelet.name} added to wishlist`);
            }
        } catch (err) {
            console.error("Wishlist toggle failed:", err.message);
            toast.error("Error updating wishlist");
        }
    };

    const handleAddToCart = async () => {
        if (!userId) {
            setLoginPromptType("cart");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            await axios.post(`${API_URL}/api/cart/${userId}`, {
                productId: bracelet._id,
                quantity,
            });
            dispatch(addToCart({ ...bracelet, quantity }));
            setIsAddedToCart(true);
            toast.success(t('ringDetail.addedToCart', { defaultValue: `${bracelet.name} added to cart!` }));
            setTimeout(() => setIsAddedToCart(false), 3000);
        } catch (error) {
            console.error("Failed to add to cart:", error.message);
            toast.error(t('ringDetail.cartError', { defaultValue: "Failed to add to cart" }));
        }
    };

    if (loading) {
        return (
            <div className="flex w-[90%] mx-auto pt-[40px] mt-[20px] h-[700px] bg-[#efeeee] justify-center items-start gap-[40px] animate-pulse">
                <div className="w-[400px] h-[400px] bg-gray-300 rounded-[8px]"></div>
                <div className="flex flex-col justify-center items-start gap-[40px] w-[50%]">
                    <div className="w-[200px] h-[40px] bg-gray-300 rounded"></div>
                    <div className="w-full h-[30px] bg-gray-300 rounded mb-[20px]"></div>
                    <div className="w-[200px] h-[30px] bg-gray-300 rounded mb-[20px]"></div>
                    <div className="w-[130px] h-[30px] bg-gray-300 rounded mb-[20px]"></div>
                    <div className="w-full h-[100px] bg-gray-300 rounded mb-[20px]"></div>
                    <div className="w-[200px] h-[40px] bg-gray-300 rounded"></div>
                    <div className="w-full h-[200px] bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    if (!bracelet) {
        return (
            <div className="flex w-[90%] mx-auto pt-[40px] mt-[20px] h-[700px] bg-[#efeeee] justify-center items-center">
                <p className="text-[#0a0a39] text-[20px]">{t('braceletDetail.notFound')}</p>
            </div>
        );
    }

    const images = bracelet.image
        ? [`${import.meta.env.VITE_API_URL}${bracelet.image}`, ...(bracelet.images || []).map(img => `${import.meta.env.VITE_API_URL}${img}`)]
        : (bracelet.images || []).map(img => `${import.meta.env.VITE_API_URL}${img}`);

    return (
        <div className="flex w-[90%] mx-auto pt-[40px] mt-[20px] h-[700px] bg-[#efeeee] justify-center items-start gap-[40px]">
            <div className="relative w-[400px] rounded-[8px] shadow-md overflow-hidden">
                <Swiper
                    modules={[Navigation]}
                    navigation
                    spaceBetween={10}
                    slidesPerView={1}
                >
                    {images.map((img, index) => (
                        <SwiperSlide key={index}>
                            <img
                                src={img}
                                alt={`bracelet image ${index}`}
                                className="w-[400px] h-[400px] object-contain"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="flex flex-col justify-center items-start gap-[40px] w-[50%]">
                <Link to={from}>
                    <button className="bg-[#f7f7f7] text-[#0a0a39] transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] hover:bg-[#0a0a39] hover:text-[white]">
                        {t('braceletsDetail.backToSelection')}
                    </button>
                </Link>

                <div className="flex flex-col w-full">
                    <div className="flex justify-between w-full">
                        <span className="text-[25px] font-bold text-[#213547]">{bracelet.name}</span>
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
                        {bracelet.price * quantity} AMD
                    </span>

                    <div className="flex items-center gap-3 mt-3">
                        <button
                            onClick={() => setQuantity(q => (q > 1 ? q - 1 : 1))}
                            className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                            className="w-[50px] h-[30px] text-center border rounded bg-[#f7f7f7]"
                        />
                        <button
                            onClick={() => setQuantity(q => q + 1)}
                            className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
                        >
                            +
                        </button>
                    </div>

                    <p className="text-[16px] leading-[1.5] text-[#444] mb-[20px]">{bracelet.description}</p>

                    <button
                        id="addBtn"
                        onClick={handleAddToCart}
                        className="transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] bg-[#f7f7f7] text-[#0a0a39] hover:bg-[#0a0a39] hover:text-[white]"
                    >
                        {isAddedToCart ? t('ringDetail.addedToCart') : t('ringDetail.add')}
                    </button>

                    <div className="mt-[20px] w-full bg-[white] rounded-[8px] shadow-md overflow-hidden">
                        <div
                            className={`text-[18px] font-bold flex justify-between items-center px-[20px] py-[12px] bg-[#f7f7f7] border-b border-[#ddd] cursor-pointer select-none ${
                                openDetails ? 'open' : ''
                            }`}
                            onClick={() => setOpenDetails(!openDetails)}
                        >
                            <span>{t('braceletDetail.details')}</span>
                            <i className={`bi bi-chevron-double-down transition-transform duration-300 ${openDetails ? 'rotate-180' : ''}`}></i>
                        </div>

                        {openDetails && (
                            <ul className="list-none m-0 p-[15px] px-[25px] flex flex-col gap-[14px] max-h-[300px] overflow-y-auto">
                                {bracelet.details?.length > 0 &&
                                    Object.entries(bracelet.details[0]).map(([key, value], index) => (
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
            <AnimatePresence>
                {isLoginPromptOpen && (
                    <motion.div
                        ref={loginPromptRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0  flex items-center justify-center z-50"
                    >
                        <div className="bg-white rounded-[10px] p-[20px] w-[500px] flex flex-col items-center justify-center gap-[20px]">
                            <i className="bi bi-lock text-[40px] text-[#0a0a39]" />
                            <h2 className="text-[25px] text-[#0a0a39]">
                                {t(`ringDetail.loginPrompt.${loginPromptType}`)}
                            </h2>
                            <Link to={`/${lng}/login`}>
                                <button className="w-[200px] h-[40px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white">
                                    {t('ringDetail.loginButton')}
                                </button>
                            </Link>
                            <button
                                onClick={() => setIsLoginPromptOpen(false)}
                                className="text-[#0a0a39] hover:text-[#213547] text-[16px]"
                            >
                                {t('ringDetail.cancel')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BraceletDetail;