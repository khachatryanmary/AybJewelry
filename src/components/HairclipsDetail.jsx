import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import 'swiper/css';
import 'swiper/css/navigation';
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

const SkeletonBox = ({ className }) => (
    <div className={`bg-gray-300 animate-pulse rounded ${className}`} />
);

const HairclipDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const validFromPaths = [`/${lng}/all-products`, `/${lng}/hairclips`];
    const from = validFromPaths.includes(location.state?.from) ? location.state.from : `/${lng}/hairclips`;
    const { user } = useContext(UserContext);
    const { addToCart, removeFromCart, isCartItem, fetchCart } = useContext(CartContext);
    const { toggleWishlist, isWishlistItem, fetchWishlist } = useContext(WishlistContext);
    const [hairclip, setHairclip] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptType, setLoginPromptType] = useState("");
    const [cartLoading, setCartLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const loginPromptRef = useRef(null);

    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "am" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    useEffect(() => {
        const fetchHairclipDetail = async () => {
            setLoading(true);
            try {
                const productRes = await fetch(`${API_URL}/api/products/${id}`);
                if (!productRes.ok) {
                    throw new Error(`HTTP error! Status: ${productRes.status}`);
                }
                const product = await productRes.json();
                setHairclip(product);

                if (user?.id) {
                    console.log("HairclipDetail.jsx current user:", user);
                    await Promise.all([fetchCart(), fetchWishlist()]);
                }
            } catch (error) {
                console.error("HairclipDetail.jsx fetch data error:", error.message);
                toast.error(t('productsDetail.fetchError', { defaultValue: "Failed to load product details" }));
            } finally {
                setLoading(false);
            }
        };

        fetchHairclipDetail();
    }, [id, API_URL, user, t, fetchCart, fetchWishlist]);

    useEffect(() => {
        const handleCartUpdate = async () => {
            await fetchCart();
        };
        const handleWishlistUpdate = async () => {
            await fetchWishlist();
        };

        window.addEventListener("cart-updated", handleCartUpdate);
        window.addEventListener("wishlist-updated", handleWishlistUpdate);
        return () => {
            window.removeEventListener("cart-updated", handleCartUpdate);
            window.removeEventListener("wishlist-updated", handleWishlistUpdate);
        };
    }, [fetchCart, fetchWishlist]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

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

    const handleWishlistToggle = async () => {
        if (!user?.id || !hairclip._id) {
            setLoginPromptType("wishlist");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            await toggleWishlist({ _id: hairclip._id, name: hairclip.name, price: hairclip.price, category: hairclip.category, image: hairclip.image });
        } catch (error) {
            console.error("HairclipDetail.jsx handleWishlistToggle error:", error.message);
            toast.error(t('productsDetail.wishlistError', { defaultValue: "Error updating wishlist" }));
        }
    };

    const handleCartToggle = async () => {
        if (!user?.id) {
            setLoginPromptType("cart");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            setCartLoading(true);
            if (isCartItem(hairclip._id)) {
                await removeFromCart(hairclip._id, null);
                toast.info(t('productsDetail.removedFromCart', { defaultValue: `${hairclip.name} removed from cart` }));
            } else {
                await addToCart(hairclip._id, quantity, null);
                toast.success(t('productsDetail.addedToCart', { defaultValue: `${hairclip.name} added to cart!` }));
            }
        } catch (error) {
            console.error("HairclipDetail.jsx handleCartToggle error:", error.message);
            toast.error(t('productsDetail.cartError', { defaultValue: "Error updating cart" }));
        } finally {
            setCartLoading(false);
        }
    };

    const images = hairclip.image
        ? [`${hairclip.image}`, ...(hairclip.images || []).map(img => `${img}`)]
        : (hairclip.images || []).map(img => `${img}`);

    return (
        <div className="flex flex-col sm:flex-row w-[90%] mx-auto pt-[20px] sm:pt-[30px] md:pt-[40px] mt-[10px] sm:mt-[15px] md:mt-[20px] min-h-[400px] sm:min-h-[450px] md:min-h-[500px] bg-[#f5f5f5] justify-center items-start gap-[20px] sm:gap-[30px] md:gap-[40px] pb-[20px]">
            <style>{toastStyles}</style>
            <div className="relative w-full sm:w-[300px] md:w-[400px] rounded-[8px] overflow-hidden">
                {loading ? (
                    <SkeletonBox className="w-full sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px]" />
                ) : (
                    <Swiper modules={[Navigation]} navigation spaceBetween={10} slidesPerView={1}>
                        {images.map((img, index) => (
                            <SwiperSlide key={index}>
                                <img
                                    src={img}
                                    alt={`hairclip image ${index}`}
                                    className="w-full sm:w-[300px] md:w-[400px] h-[200px] sm:h-[300px] md:h-[400px] object-contain"
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>

            <div className="flex flex-col justify-center items-start gap-[20px] sm:gap-[30px] md:gap-[40px] w-full sm:w-[50%] px-2 sm:px-4 md:px-0">
                {loading ? (
                    <>
                        <SkeletonBox className="w-[120px] sm:w-[140px] md:w-[150px] h-[30px] sm:h-[35px] md:h-[40px]" />
                        <SkeletonBox className="w-[60%] sm:w-[70%] md:w-[80%] h-[25px] sm:h-[28px] md:h-[30px]" />
                        <SkeletonBox className="w-[80px] sm:w-[90px] md:w-[100px] h-[25px] sm:h-[28px] md:h-[30px]" />
                        <SkeletonBox className="w-full h-[80px] sm:h-[100px] md:h-[120px]" />
                    </>
                ) : !hairclip._id ? (
                    <p className="text-[#0a0a39] text-[14px] sm:text-[15px] md:text-[16px]">{t('hairclipDetail.notFound', { defaultValue: "Product not found" })}</p>
                ) : (
                    <>
                        <Link to={from}>
                            <button className="bg-white text-[#0a0a39] transition duration-300 border-none cursor-pointer py-[8px] sm:py-[9px] md:py-[10px] px-[12px] sm:px-[15px] md:px-[18px] font-semibold rounded-[6px] text-[14px] sm:text-[15px] md:text-[16px] hover:bg-[#0a0a39] hover:text-white">
                                {t('productsDetail.backToSelection')}
                            </button>
                        </Link>

                        <div className="flex flex-col w-full gap-3">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[18px] sm:text-[22px] md:text-[25px] font-bold text-[#213547]">{hairclip.name}</span>
                                <span
                                    onClick={handleWishlistToggle}
                                    className={`text-[20px] sm:text-[24px] md:text-[28px] cursor-pointer transition-all duration-300 ${isWishlistItem(hairclip._id) ? 'text-[#0a0a39]' : 'text-gray-400'}`}
                                    title={t('productsDetail.addToWishlist')}
                                >
                                    <i className={`bi ${isWishlistItem(hairclip._id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                </span>
                            </div>

                            <span className="text-[14px] sm:text-[18px] md:text-[20px] text-[#666] font-semibold">
                                {numberFormatter.format(hairclip.price * quantity)} {t("checkout.currency", { defaultValue: "AMD" })}
                            </span>

                            <div className="flex items-center gap-2 sm:gap-3 md:gap-3">
                                <button
                                    onClick={() => setQuantity(q => (q > 1 ? q - 1 : 1))}
                                    className="w-[24px] sm:w-[28px] md:w-[30px] h-[24px] sm:h-[28px] md:h-[30px] flex items-center justify-center text-[#0a0a39] bg-white rounded hover:bg-[#0a0a39] font-bold hover:text-white transition text-[14px] sm:text-[15px] md:text-[16px]"
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                                    className="w-[40px] sm:w-[48px] md:w-[50px] h-[24px] sm:h-[28px] md:h-[30px] text-[#0a0a39] text-center font-bold rounded bg-white text-[14px] sm:text-[15px] md:text-[16px]"
                                />
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-[24px] sm:w-[28px] md:w-[30px] h-[24px] sm:h-[28px] md:h-[30px] flex items-center justify-center text-[#0a0a39] bg-white font-bold rounded hover:bg-[#0a0a39] hover:text-white transition text-[14px] sm:text-[15px] md:text-[16px]"
                                >
                                    +
                                </button>
                            </div>

                            <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-[1.4] sm:leading-[1.5] md:leading-[1.5] text-[#444] mb-[12px] sm:mb-[15px] md:mb-[20px]">{hairclip.description}</p>

                            <button
                                id="addBtn"
                                onClick={handleCartToggle}
                                className="flex items-center justify-center duration-300 border-none cursor-pointer py-[8px] sm:py-[9px] md:py-[10px] px-[12px] sm:px-[15px] md:px-[18px] font-semibold rounded-[6px] bg-white text-[#0a0a39] hover:bg-[#0a0a39] hover:text-white disabled:opacity-50 text-[14px] sm:text-[15px] md:text-[16px]"
                                disabled={cartLoading}
                            >
                                {cartLoading ? (
                                    <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0a0a39] border-t-transparent rounded-full animate-spin"></div>
                                ) : isCartItem(hairclip._id) ? (
                                    t('productsDetail.addedToCart')
                                ) : (
                                    t('productsDetail.add')
                                )}
                            </button>

                            <div className="mt-[12px] sm:mt-[15px] md:mt-[20px] w-full bg-white rounded-[8px] overflow-hidden">
                                <div
                                    className={`text-[16px] sm:text-[17px] md:text-[18px] font-bold text-[#0a0a39] flex justify-between items-center px-[10px] sm:px-[15px] md:px-[20px] py-[8px] sm:py-[10px] md:py-[12px] bg-[#f7f7f7] border-b border-[#ddd] cursor-pointer select-none ${openDetails ? 'open' : ''}`}
                                    onClick={() => setOpenDetails(!openDetails)}
                                >
                                    <span>{t('productsDetail.details')}</span>
                                    <i className={`bi bi-chevron-double-down transition-transform duration-300 text-[#0a0a39] ${openDetails ? 'rotate-180' : ''}`}></i>
                                </div>

                                {openDetails && (
                                    <ul className="list-none p-[10px] sm:p-[12px] md:p-[15px] px-[15px] sm:px-[20px] md:px-[25px] flex flex-col gap-[10px] sm:gap-[12px] md:gap-[14px] max-h-[300px] overflow-y-auto">
                                        {hairclip.details?.length > 0 &&
                                            Object.entries(hairclip.details[0]).map(([key, value], index) => (
                                                <li
                                                    key={index}
                                                    className="flex justify-start items-center w-full gap-[10px] sm:gap-[15px] md:gap-[20px] text-left text-[14px] sm:text-[15px] md:text-[16px] text-[#666]"
                                                >
                                                    <strong className="text-[#0a0a39]">{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                                                </li>
                                            ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </>
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

export default HairclipDetail;