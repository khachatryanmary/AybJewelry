import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Filter from "./Filter.jsx";
import { useFilteredProduct } from "./useFilteredProduct.jsx";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../Toolkit/slices/cartSlice.js";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const NecklaceGallery = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();
    const { setProduct, filteredProduct } = useFilteredProduct();
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(15);
    const [addedToCart, setAddedToCart] = useState({});
    const [isWished, setIsWished] = useState({});
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptType, setLoginPromptType] = useState("");
    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;
    const API_URL = import.meta.env.VITE_API_URL;
    const loginPromptRef = useRef(null);

    const skeletons = Array(8).fill(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        const getNecklaces = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/api/products?category=necklace`);
                setProduct(res.data);

                if (currentUser) {
                    const wishRes = await axios.get(`${API_URL}/api/wishlist/${currentUser.id}`);
                    const items = wishRes.data?.items || [];
                    const wished = {};
                    items.forEach(item => {
                        wished[item._id] = true;
                    });
                    setIsWished(wished);
                }
            } catch (error) {
                console.error("Error fetching necklaces:", error.message);
            } finally {
                setLoading(false);
            }
        };

        getNecklaces();
    }, [setProduct, currentUser, API_URL]);

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

    const handleAddToCart = async (product) => {
        if (!userId) {
            setLoginPromptType("cart");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            await axios.post(`${API_URL}/api/cart/${userId}`, {
                productId: product._id,
                quantity: 1,
            });
            dispatch(addToCart({ ...product, quantity: 1 }));
            setAddedToCart(prev => ({ ...prev, [product._id]: true }));
            toast.success(t('necklaceGallery.addedToCart', { defaultValue: `${product.name} added to cart!` }));
            setTimeout(() => {
                setAddedToCart(prev => ({ ...prev, [product._id]: false }));
            }, 3000);
        } catch (error) {
            console.error("Failed to add to cart:", error.message);
            toast.error(t('necklaceGallery.cartError', { defaultValue: "Failed to add to cart" }));
        }
    };

    const toggleWishlist = async (product) => {
        if (!userId) {
            setLoginPromptType("wishlist");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            if (isWished[product._id]) {
                await axios.delete(`${API_URL}/api/wishlist/${userId}/${product._id}`);
                setIsWished(prev => ({ ...prev, [product._id]: false }));
                toast.info(t('necklaceGallery.removedFromWishlist', { defaultValue: `${product.name} removed from wishlist` }));
            } else {
                await axios.post(`${API_URL}/api/wishlist/${userId}`, {
                    productId: product._id,
                });
                setIsWished(prev => ({ ...prev, [product._id]: true }));
                toast.success(t('necklaceGallery.addedToWishlist', { defaultValue: `${product.name} added to wishlist` }));
            }
        } catch (err) {
            console.error("Wishlist toggle failed:", err.message);
            toast.error(t('necklaceGallery.wishlistError', { defaultValue: "Error updating wishlist" }));
        }
    };

    const visibleProducts = filteredProduct.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 15);
    };

    return (
        <div className="w-full">
            <div className="w-[90%] flex flex-col justify-center items-center mx-auto">
                <div className="my-[30px] flex flex-col justify-center items-center text-[#0e0e53] text-center font-[Against] italic font-light">
                    <h2 className="text-[30px]">{t('necklaceGallery.title')}</h2>
                </div>

                <Filter />

                <div className="mt-[50px] mb-[30px] w-full flex justify-center items-center flex-wrap gap-[50px]">
                    {loading ? (
                        skeletons.map((_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="w-[280px] h-[280px] flex flex-col items-center animate-pulse"
                            >
                                <div className="w-[280px] h-[180px] bg-gray-300 rounded-md"></div>
                                <div className="w-full flex flex-col items-start justify-start pl-[30px] mt-2">
                                    <div className="h-[20px] w-[150px] bg-gray-300 rounded mb-2"></div>
                                    <div className="h-[15px] w-[80px] bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        visibleProducts.map(({ _id, image, name, price, category }, i) => (
                            <div
                                key={`${_id}-${i}`}
                                className="w-[280px] h-[280px] flex flex-col items-center relative"
                            >
                                <Link
                                    to={`/${lng}/necklaces/${_id}`}
                                    state={{ from: `/${lng}/necklaces` }}
                                >
                                    <img
                                        src={`${API_URL}${image}`}
                                        alt={name || 'image'}
                                        className="w-[280px] h-[180px] object-cover rounded-md"
                                    />
                                </Link>
                                <div className="flex w-full justify-between">
                                    <div className="w-full flex flex-col text-left mt-2">
                                        <span className="text-[20px] font-bold text-[#213547]">{name}</span>
                                        <span className="text-[15px] text-gray-600">{price} AMD</span>
                                        <span className="text-[13px] text-gray-500 italic">{category}</span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span
                                            onClick={() => handleAddToCart({ _id, name, price, category })}
                                            className="text-[20px] cursor-pointer transition-all duration-300"
                                            title={addedToCart[_id] ? t('necklaceGallery.addedToCart') : t('necklaceGallery.addToCart')}
                                        >
                                            <i className={`bi ${addedToCart[_id] ? 'bi-cart-check-fill text-[#0e0e53]' : 'bi-cart text-gray-400'} text-[20px] hover:text-gray-200 transition-all`}></i>
                                        </span>
                                        <span
                                            onClick={() => toggleWishlist({ _id, name })}
                                            className={`text-[20px] cursor-pointer transition-all duration-300 ${isWished[_id] ? 'text-[#0e0e53]' : 'text-gray-400'}`}
                                            title={t('necklaceGallery.addToWishlist')}
                                        >
                                            <i className={`bi ${isWished[_id] ? 'bi-heart-fill' : 'bi-heart text-gray-400 hover:text-gray-200 transition-all'}`}></i>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {!loading && visibleCount < filteredProduct.length && (
                    <button
                        onClick={handleLoadMore}
                        className="mb-[50px] px-6 py-2 border border-[#0e0e53] text-[#0e0e53] hover:bg-[#0e0e53] hover:text-white transition-all rounded"
                    >
                        {t('necklaceGallery.loadMore') || 'Load More'}
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isLoginPromptOpen && (
                    <motion.div
                        ref={loginPromptRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                    >
                        <div className="bg-white rounded-[10px] p-[20px] w-[500px] flex flex-col items-center justify-center gap-[20px]">
                            <i className="bi bi-lock text-[40px] text-[#0e0e53]" />
                            <h2 className="text-[25px] text-[#0e0e53]">
                                {t(`necklaceGallery.loginPrompt.${loginPromptType}`)}
                            </h2>
                            <Link to={`/${lng}/login`}>
                                <button className="w-[200px] h-[40px] bg-[#efeeee] border-none rounded-[10px] text-[#0e0e53] font-semibold transition duration-500 hover:bg-[#0e0e53] hover:text-white">
                                    {t('necklaceGallery.loginButton')}
                                </button>
                            </Link>
                            <button
                                onClick={() => setIsLoginPromptOpen(false)}
                                className="text-[#0e0e53] hover:text-[#213547] text-[16px]"
                            >
                                {t('necklaceGallery.cancel')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NecklaceGallery;