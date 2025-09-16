import React, { useEffect, useState, useRef, useContext } from 'react';
import { Link, useLocation } from "react-router-dom";
import Filter from "./Filter.jsx";
import { useFilteredProduct } from "./useFilteredProduct.jsx";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from '../Providers/UserContext';
import { CartContext } from '../Providers/CartContext';
import { WishlistContext } from '../Providers/WishlistContext';

const toastStyles = `
  @media (max-width: 639px) {
    .Toastify__toast {
      width: 280px;
      font-size: 14px;
      padding: 8px 12px;
      line-height: 1.4;
    }
    .Toastify__toast-body {
      padding: 4px;
    }
    .Toastify__close-button {
      font-size: 14px;
    }
  }
  @media (min-width: 640px) and (max-width: 767px) {
    .Toastify__toast {
      width: 320px;
      font-size: 15px;
      padding: 10px 14px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 6px;
    }
    .Toastify__close-button {
      font-size: 15px;
    }
  }
  @media (min-width: 768px) {
    .Toastify__toast {
      width: 360px;
      font-size: 16px;
      padding: 12px 16px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 8px;
    }
    .Toastify__close-button {
      font-size: 16px;
    }
  }
`;

const HairclipGallery = () => {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();
    const { setProduct, filteredProduct } = useFilteredProduct();
    const { user } = useContext(UserContext);
    const { addToCart, removeFromCart, isCartItem, fetchCart } = useContext(CartContext);
    const { toggleWishlist, isWishlistItem, fetchWishlist } = useContext(WishlistContext);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(15);
    const [addedToCart, setAddedToCart] = useState({});
    const [isWished, setIsWished] = useState({});
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptType, setLoginPromptType] = useState("");
    const [cartLoading, setCartLoading] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const loginPromptRef = useRef(null);

    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "am" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const skeletons = Array(8).fill(null);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        const getHairclips = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/products?category=hairclip`);
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                const data = await res.json();
                setProduct(data);

                if (user?.id) {
                    console.log("HairclipGallery.jsx current user:", user);
                    const [cartItems, wishlistItems] = await Promise.all([fetchCart(), fetchWishlist()]);
                    setAddedToCart(cartItems.reduce((acc, item) => ({
                        ...acc,
                        [item.id]: true,
                    }), {}));
                    setIsWished(wishlistItems.reduce((acc, item) => ({ ...acc, [item._id]: true }), {}));
                } else {
                    setAddedToCart({});
                    setIsWished({});
                }
            } catch (error) {
                console.error("HairclipGallery.jsx getHairclips error:", error.message);
                toast.error(t('hairclipGallery.fetchError', { defaultValue: "Error fetching hairclips" }));
                setAddedToCart({});
                setIsWished({});
            } finally {
                setLoading(false);
            }
        };

        getHairclips();
    }, [setProduct, user, API_URL, t, fetchCart, fetchWishlist]);

    useEffect(() => {
        const handleCartUpdate = async () => {
            const cartItems = await fetchCart();
            setAddedToCart(cartItems.reduce((acc, item) => ({
                ...acc,
                [item.id]: true,
            }), {}));
        };
        const handleWishlistUpdate = async () => {
            const wishlistItems = await fetchWishlist();
            setIsWished(wishlistItems.reduce((acc, item) => ({ ...acc, [item._id]: true }), {}));
        };

        window.addEventListener("cart-updated", handleCartUpdate);
        window.addEventListener("wishlist-updated", handleWishlistUpdate);
        return () => {
            window.removeEventListener("cart-updated", handleCartUpdate);
            window.removeEventListener("wishlist-updated", handleWishlistUpdate);
        };
    }, [fetchCart, fetchWishlist]);

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

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoginPromptOpen]);

    const handleCartToggle = async (product) => {
        if (!user?.id) {
            setLoginPromptType("cart");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            setCartLoading(product._id);
            if (isCartItem(product._id)) {
                await removeFromCart(product._id, null);
                setAddedToCart(prev => ({ ...prev, [product._id]: false }));
                toast.info(t('productsGallery.removedFromCart', { defaultValue: `${product.name} removed from cart` }));
            } else {
                await addToCart(product._id, 1, null);
                setAddedToCart(prev => ({ ...prev, [product._id]: true }));
                toast.success(t('productsGallery.addedToCart', { defaultValue: `${product.name} added to cart!` }));
            }
        } catch (error) {
            console.error("HairclipGallery.jsx handleCartToggle error:", error.message);
            toast.error(t('productsGallerycartError', { defaultValue: "Error updating cart" }));
        } finally {
            setCartLoading(null);
        }
    };

    const handleWishlistToggle = async (product) => {
        if (!user?.id) {
            setLoginPromptType("wishlist");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            await toggleWishlist({ _id: product._id, name: product.name, price: product.price, category: product.category, image: product.image });
            setIsWished(prev => ({ ...prev, [product._id]: !isWishlistItem(product._id) }));
        } catch (error) {
            console.error("HairclipGallery.jsx handleWishlistToggle error:", error.message);
            toast.error(t('productsGallery.wishlistError', { defaultValue: "Error updating wishlist" }));
        }
    };

    const visibleProducts = filteredProduct.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 15);
    };

    return (
        <div className="w-full">
            <style>{toastStyles}</style>
            <div className="w-[90%] flex flex-col justify-center items-center mx-auto">
                <div className="my-[30px] flex flex-col justify-center items-center text-[#0e0e53] text-center font-[Against] font-light">
                    <h2 className="text-[30px]">{t('hairclipGallery.title')}</h2>
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
                                    to={`/${lng}/hairclips/${_id}`}
                                    state={{ from: `/${lng}/hairclips` }}
                                >
                                    <img
                                        src={`${image}`}
                                        alt={name || 'image'}
                                        className="w-[280px] h-[180px] object-cover object-[center_20%] rounded-md"
                                    />
                                </Link>
                                <div className="flex w-full justify-between">
                                    <div className="w-full flex flex-col text-left mt-2">
                                        <span className="text-[20px] font-bold text-[#213547]">{name}</span>
                                        <span className="text-[15px] text-gray-600">
                                            {numberFormatter.format(price)} {t("checkout.currency", { defaultValue: "AMD" })}
                                        </span>
                                        <span className="text-[13px] text-gray-500 italic">{category}</span>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <span
                                            onClick={() => handleCartToggle({ _id, name, price, category })}
                                            className="text-[20px] cursor-pointer transition-all duration-300"
                                            title={isCartItem(_id) ? t('productsGallery.removeFromCart') : t('productsGallery.addToCart')}
                                        >
                                            {cartLoading === _id ? (
                                                <div className="w-[20px] h-[20px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <i className={`bi ${isCartItem(_id) ? 'bi-cart-check-fill text-[#0e0e53]' : 'bi-cart text-gray-400'} text-[20px] hover:text-gray-200 transition-all`}></i>
                                            )}
                                        </span>
                                        <span
                                            onClick={() => handleWishlistToggle({ _id, name, price, category, image })}
                                            className={`text-[20px] cursor-pointer transition-all duration-300 ${isWishlistItem(_id) ? 'text-[#0e0e53]' : 'text-gray-400'}`}
                                            title={t('productsGallery.addToWishlist')}
                                        >
                                            <i className={`bi ${isWishlistItem(_id) ? 'bi-heart-fill' : 'bi-heart text-gray-400 hover:text-gray-200 transition-all'}`}></i>
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
                        {t('productsGallery.loadMore') || 'Load More'}
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
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                        <div className="bg-white rounded-[8px] p-[10px] sm:p-[15px] md:p-[20px] w-[280px] sm:w-[400px] md:w-[500px] flex flex-col items-center justify-center gap-[10px] sm:gap-[15px] md:gap-[20px] shadow-sm sm:shadow-md">
                            <i className="bi bi-lock text-[30px] sm:text-[35px] md:text-[40px] text-[#0e0e53]" />
                            <h2 className="text-center text-[18px] sm:text-[22px] md:text-[25px] text-[#0e0e53]">
                                {t(`productsGallery.loginPrompt.${loginPromptType}`)}
                            </h2>
                            <Link to={`/${lng}/login`}>
                                <button className="w-[140px] sm:w-[180px] md:w-[200px] h-[30px] sm:h-[35px] md:h-[40px] bg-[#f7f7f7] border-none rounded-[6px] text-[#0e0e53] font-semibold transition duration-300 hover:bg-[#0e0e53] hover:text-white text-[14px] sm:text-[15px] md:text-[16px]">
                                    {t('productsGallery.loginButton')}
                                </button>
                            </Link>
                            <button
                                onClick={() => setIsLoginPromptOpen(false)}
                                className="text-[#0e0e53] hover:text-[#213547] text-[14px] sm:text-[15px] md:text-[16px]"
                            >
                                {t('productsGallery.cancel')}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HairclipGallery;