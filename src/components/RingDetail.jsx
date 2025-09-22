import React, { useEffect, useRef, useState, useContext } from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
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

const SkeletonBox = ({ className }) => (
    <div className={`bg-gray-300 animate-pulse rounded ${className}`} />
);

const RingDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const validFromPaths = [`/${lng}/all-products`, `/${lng}/rings`];
    const from = validFromPaths.includes(location.state?.from) ? location.state.from : `/${lng}/rings`;
    const { user } = useContext(UserContext);
    const { addToCart, removeFromCart, isCartItem, fetchCart } = useContext(CartContext);
    const { toggleWishlist, isWishlistItem, fetchWishlist } = useContext(WishlistContext);
    const [ring, setRing] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptType, setLoginPromptType] = useState("");
    const [cartLoading, setCartLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const loginPromptRef = useRef(null);
    const sizeGuideRef = useRef(null);
    const sizeModalRef = useRef(null);

    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "am" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const ringSizes = [
        { size: "16", diameter: 16.0, circumference: 50.3 },
        { size: "16.5", diameter: 16.5, circumference: 51.9 },
        { size: "17", diameter: 17.0, circumference: 53.4 },
        { size: "17.5", diameter: 17.5, circumference: 55.0 },
        { size: "18", diameter: 18.0, circumference: 56.5 },
        { size: "18.5", diameter: 18.5, circumference: 58.1 },
        { size: "19", diameter: 19.0, circumference: 59.7 },
        { size: "19.5", diameter: 19.5, circumference: 61.3 },
        { size: "20", diameter: 20.0, circumference: 62.8 },
        { size: "20.5", diameter: 20.5, circumference: 64.4 },
        { size: "21", diameter: 21.0, circumference: 66.0 },
    ];

    const measureStepsRing = [
        {
            text: t('ringDetail.measureRingStep1', { defaultValue: "Take an existing ring that fits you well." }),
            icon: "bi-circle",
        },
        {
            text: t('ringDetail.measureRingStep2', { defaultValue: "Place the ring on a ruler." }),
            icon: "bi-rulers",
        },
        {
            text: t('ringDetail.measureRingStep3', { defaultValue: "Measure the inner diameter in millimeters (from inside edge to inside edge)." }),
            icon: "bi-arrows-fullscreen",
        },
        {
            text: t('ringDetail.measureRingStep4', { defaultValue: "Compare the measurement to the diameter in the table below." }),
            icon: "bi-table",
        },
    ];

    const measureStepsFinger = [
        {
            text: t('ringDetail.measureFingerStep1', { defaultValue: "Wrap a thin strip of paper or string around the base of your finger." }),
            icon: "bi-bookmark",
        },
        {
            text: t('ringDetail.measureFingerStep2', { defaultValue: "Mark where the ends meet with a pen." }),
            icon: "bi-pen",
        },
        {
            text: t('ringDetail.measureFingerStep3', { defaultValue: "Measure the length in millimeters with a ruler." }),
            icon: "bi-rulers",
        },
        {
            text: t('ringDetail.measureFingerStep4', { defaultValue: "Compare the measurement to the circumference in the table below." }),
            icon: "bi-table",
        },
        {
            text: t('ringDetail.measureFingerStep5', { defaultValue: "Measure in the evening for accuracy, as fingers may swell slightly." }),
            icon: "bi-moon",
        },
        {
            text: t('ringDetail.measureFingerStep6', { defaultValue: "If between sizes, choose the larger size for comfort." }),
            icon: "bi-arrow-up-circle",
        },
    ];

    useEffect(() => {
        const fetchRingDetail = async () => {
            setLoading(true);
            try {
                const productRes = await fetch(`${API_URL}/api/products/${id}`);
                if (!productRes.ok) {
                    throw new Error(`HTTP error! Status: ${productRes.status}`);
                }
                const product = await productRes.json();
                setRing(product);

                if (user?.id) {
                    console.log("RingDetail.jsx current user:", user);
                    await Promise.all([fetchCart(), fetchWishlist()]);
                }
            } catch (error) {
                console.error("RingDetail.jsx fetch data error:", error.message);
                toast.error(t('ringDetail.fetchError', { defaultValue: "Error fetching ring details" }));
            } finally {
                setLoading(false);
            }
        };

        fetchRingDetail();
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
        if (isLoginPromptOpen || showSizeModal || isSizeGuideOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isLoginPromptOpen, showSizeModal, isSizeGuideOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSizeGuideOpen && sizeGuideRef.current && !sizeGuideRef.current.contains(event.target)) {
                setIsSizeGuideOpen(false);
            } else if (showSizeModal && sizeModalRef.current && !sizeModalRef.current.contains(event.target) && !isSizeGuideOpen) {
                setShowSizeModal(false);
                setSelectedSize("");
            } else if (isLoginPromptOpen && loginPromptRef.current && !loginPromptRef.current.contains(event.target)) {
                setIsLoginPromptOpen(false);
            }
        };

        if (isLoginPromptOpen || showSizeModal || isSizeGuideOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoginPromptOpen, showSizeModal, isSizeGuideOpen]);

    const handleWishlistToggle = async () => {
        if (!user?.id || !ring._id) {
            setLoginPromptType("wishlist");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            await toggleWishlist({ _id: ring._id, name: ring.name, price: ring.price, category: ring.category, image: ring.image });
        } catch (error) {
            console.error("RingDetail.jsx handleWishlistToggle error:", error.message);
            toast.error(t('productsDetail.wishlistError', { defaultValue: "Error updating wishlist" }));
        }
    };

    const handleCartToggle = async () => {
        if (!user?.id) {
            setLoginPromptType("cart");
            setIsLoginPromptOpen(true);
            return;
        }
        if (!selectedSize && !isCartItem(ring._id)) {
            setShowSizeModal(true);
            return;
        }
        try {
            setCartLoading(true);
            if (isCartItem(ring._id)) {
                await removeFromCart(ring._id, selectedSize);
                toast.info(t('productsDetail.removedFromCart', { defaultValue: `${ring.name} removed from cart` }));
                setSelectedSize("");
            } else {
                await addToCart(ring._id, quantity, selectedSize);
                toast.success(t('productsDetail.addedToCart', { defaultValue: `Added to cart!` }));
                setShowSizeModal(false);
                setSelectedSize("");
            }
        } catch (error) {
            console.error("RingDetail.jsx handleCartToggle error:", error.message);
            toast.error(t('productsDetail.cartError', { defaultValue: "Error updating cart" }));
        } finally {
            setCartLoading(false);
        }
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    const images = ring.image
        ? [`${ring.image}`, ...(ring.images || []).map(img => `${img}`)]
        : (ring.images || []).map(img => `${img}`);

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
                                    alt={`ring image ${index}`}
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
                ) : (
                    <>
                        <Link to={from}>
                            <button className="bg-white text-[#0a0a39] transition duration-300 border-none cursor-pointer py-[8px] sm:py-[9px] md:py-[10px] px-[12px] sm:px-[15px] md:px-[18px] font-semibold rounded-[6px] text-[14px] sm:text-[15px] md:text-[16px] hover:bg-[#0a0a39] hover:text-white">
                                {t('productsDetail.backToSelection')}
                            </button>
                        </Link>

                        <div className="flex flex-col w-full gap-3">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[18px] sm:text-[22px] md:text-[25px] font-bold text-[#213547]">{ring.name}</span>
                                <span
                                    onClick={handleWishlistToggle}
                                    className={`text-[20px] sm:text-[24px] md:text-[28px] cursor-pointer transition-all duration-300 ${isWishlistItem(ring._id) ? 'text-[#0a0a39]' : 'text-gray-400'}`}
                                    title={t('productsDetail.addToWishlist')}
                                >
                                    <i className={`bi ${isWishlistItem(ring._id) ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                </span>
                            </div>

                            <span className="text-[14px] sm:text-[18px] md:text-[20px] text-[#666] font-semibold">
                                {numberFormatter.format(ring.price * quantity)} {t("checkout.currency", { defaultValue: "AMD" })}
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
                                    onChange={e => {
                                        const val = Math.max(1, Number(e.target.value));
                                        setQuantity(val);
                                    }}
                                    className="w-[40px] sm:w-[48px] md:w-[50px] h-[24px] sm:h-[28px] md:h-[30px] text-[#0a0a39] text-center font-bold rounded bg-white text-[14px] sm:text-[15px] md:text-[16px]"
                                />
                                <button
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="w-[24px] sm:w-[28px] md:w-[30px] h-[24px] sm:h-[28px] md:h-[30px] flex items-center justify-center text-[#0a0a39] bg-white font-bold rounded hover:bg-[#0a0a39] hover:text-white transition text-[14px] sm:text-[15px] md:text-[16px]"
                                >
                                    +
                                </button>
                            </div>

                            <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-[1.4] sm:leading-[1.5] md:leading-[1.5] text-[#444] mb-[12px] sm:mb-[15px] md:mb-[20px]">{ring.description}</p>

                            <button
                                id="addBtn"
                                onClick={handleCartToggle}
                                className="flex items-center justify-center duration-300 border-none cursor-pointer py-[8px] sm:py-[9px] md:py-[10px] px-[12px] sm:px-[15px] md:px-[18px] font-semibold rounded-[6px] bg-white text-[#0a0a39] hover:bg-[#0a0a39] hover:text-white disabled:opacity-50 text-[14px] sm:text-[15px] md:text-[16px]"
                                disabled={cartLoading}
                            >
                                {cartLoading ? (
                                    <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0a0a39] border-t-transparent rounded-full animate-spin"></div>
                                ) : isCartItem(ring._id) ? (
                                    t('productsDetail.addedToCart')
                                ) : (
                                    t('productsDetail.add')
                                )}
                            </button>

                            <div className="mt-[12px] sm:mt-[15px] md:mt-[20px] w-full bg-white rounded-[8px] overflow-hidden">
                                <div
                                    className={`text-[16px] sm:text-[17px] md:text-[18px] font-bold text-[#0a0a39] flex justify-between items-center px-[10px] sm:px-[15px] md:px-[20px] py-[8px] sm:py-[10px] md:py-[12px] bg-[#f7f7f7] border-b border-[#ddd] cursor-pointer select-none ${
                                        openDetails ? 'open' : ''
                                    }`}
                                    onClick={() => setOpenDetails(!openDetails)}
                                >
                                    <span>{t('productsDetail.details')}</span>
                                    <i className={`bi bi-chevron-double-down transition-transform duration-300 text-[#0a0a39] ${openDetails ? 'rotate-180' : ''}`}></i>
                                </div>

                                {openDetails && (
                                    <ul className="list-none p-[10px] sm:p-[12px] md:p-[15px] px-[15px] sm:px-[20px] md:px-[25px] flex flex-col gap-[10px] sm:gap-[12px] md:gap-[14px] max-h-[300px] overflow-y-auto">
                                        {ring.details?.length > 0 &&
                                            Object.entries(ring.details[0]).map(([key, value], index) => (
                                                <li key={index} className="flex justify-start items-center w-full gap-[10px] sm:gap-[15px] md:gap-[20px] text-left text-[14px] sm:text-[15px] md:text-[16px] text-[#666]">
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
                {showSizeModal && (
                    <motion.div
                        ref={sizeModalRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <div className="bg-[#efeeee] rounded-[8px] p-[10px] sm:p-[15px] md:p-[20px] w-[280px] sm:w-[400px] md:w-[500px] flex items-center justify-center flex-col gap-[10px] sm:gap-[15px] md:gap-[20px] shadow-sm sm:shadow-md">
                            <h3 className="text-center text-[18px] sm:text-[22px] md:text-[24px] font-semibold text-[#0a0a39]">
                                {t('ringDetail.selectRingSize')} - {ring.name}
                            </h3>
                            <div className="flex flex-wrap gap-[8px] sm:gap-[10px] md:gap-[12px] items-center justify-center">
                                {ringSizes.map((sizeObj) => (
                                    <button
                                        key={sizeObj.size}
                                        onClick={() => handleSizeSelect(sizeObj.size)}
                                        className={`w-[44px] sm:w-[48px] md:w-[50px] h-[30px] sm:h-[35px] md:h-[40px] rounded-[6px] font-semibold transition text-[14px] sm:text-[15px] md:text-[16px] ${
                                            selectedSize === sizeObj.size
                                                ? "bg-[#0a0a39] text-white"
                                                : "bg-white text-[#0a0a39] hover:bg-[#0a0a39] hover:text-white"
                                        }`}
                                    >
                                        {sizeObj.size}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setIsSizeGuideOpen(true)}
                                className="font-bold text-left text-[#0a0a39] underline hover:text-[#213547] transition text-[14px] sm:text-[15px] md:text-[16px]"
                            >
                                {t('ringDetail.sizeGuide')}
                            </button>
                            <div className="flex gap-[8px] sm:gap-[10px] md:gap-[12px]">
                                <button
                                    onClick={handleCartToggle}
                                    className="w-[120px] sm:w-[140px] md:w-[150px] flex justify-center items-center h-[30px] sm:h-[35px] md:h-[40px] bg-[#0a0a39] text-white rounded-[6px] font-semibold hover:bg-[#555] transition disabled:opacity-50 text-[14px] sm:text-[15px] md:text-[16px]"
                                    disabled={!selectedSize || cartLoading}
                                >
                                    {cartLoading ? (
                                        <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        t('productsGallery.addToCart')
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSizeModal(false);
                                        setSelectedSize("");
                                    }}
                                    className="w-[120px] sm:w-[140px] md:w-[150px] h-[30px] sm:h-[35px] md:h-[40px] bg-white text-[#0a0a39] rounded-[6px] font-semibold hover:bg-[#f7f7f7] transition text-[14px] sm:text-[15px] md:text-[16px]"
                                >
                                    {t('productsGallery.cancel')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
                {isSizeGuideOpen && (
                    <motion.div
                        key="size-guide"
                        ref={sizeGuideRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-white shadow-sm sm:shadow-md z-50 p-[10px] sm:p-[15px] md:p-[20px] flex flex-col items-start justify-start overflow-y-auto"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('RingDetail.jsx size guide closing');
                                setIsSizeGuideOpen(false);
                            }}
                            className="text-[20px] sm:text-[22px] md:text-[24px] w-full text-right text-[#0a0a39] hover:text-[#213547] mb-[10px] sm:mb-[15px] md:mb-[20px]"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                        <div className="flex flex-col sm:flex-row gap-[20px] sm:gap-[30px] md:gap-[40px] text-[#444] w-[90%] mx-auto justify-center items-start">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h3 className="text-[18px] sm:text-[20px] md:text-[22px] font-semibold mb-[10px] sm:mb-[12px] md:mb-[15px] text-[#0a0a39]">{t('ringDetail.measureInstructionsRing')}</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {measureStepsRing.map((step, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <i className={`bi ${step.icon} text-[18px] sm:text-[20px] md:text-[22px] text-[#0a0a39]`}></i>
                                                <p className="text-[14px] sm:text-[15px] md:text-[16px]">{step.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[18px] sm:text-[20px] md:text-[22px] font-semibold mb-[10px] sm:mb-[12px] md:mb-[15px] text-[#0a0a39]">{t('ringDetail.measureInstructionsFinger')}</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {measureStepsFinger.map((step, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <i className={`bi ${step.icon} text-[18px] sm:text-[20px] md:text-[22px] text-[#0a0a39]`}></i>
                                                <p className="text-[14px] sm:text-[15px] md:text-[16px]">{step.text}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex items-start justify-center">
                                <div className="w-full">
                                    <h3 className="text-[18px] sm:text-[20px] md:text-[22px] font-semibold mb-[10px] sm:mb-[12px] md:mb-[15px] text-[#0a0a39]">{t('ringDetail.sizeChart')}</h3>
                                    <table className="w-full max-w-[90%] sm:max-w-[600px] md:max-w-[700px] mx-auto table-fixed border-collapse">
                                        <thead>
                                        <tr className="bg-[#f7f7f7]">
                                            <th className="w-1/3 p-[8px] sm:p-[10px] md:p-[12px] text-[#213547] text-left text-[14px] sm:text-[15px] md:text-[16px]">{t('ringDetail.size')}</th>
                                            <th className="w-1/3 p-[8px] sm:p-[10px] md:p-[12px] text-[#213547] text-left text-[14px] sm:text-[15px] md:text-[16px]">{t('ringDetail.diameter')}</th>
                                            <th className="w-1/3 p-[8px] sm:p-[10px] md:p-[12px] text-[#213547] text-left text-[14px] sm:text-[15px] md:text-[16px]">{t('ringDetail.circumference')}</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {ringSizes.map((size, index) => (
                                            <tr key={index} className="border-b border-[#ddd]">
                                                <td className="w-1/3 p-[8px] sm:p-[10px] md:p-[12px] text-left text-[14px] sm:text-[15px] md:text-[16px]">{size.size}</td>
                                                <td className="w-1/3 p-[8px] sm:p-[10px] md:p-[12px] text-left text-[14px] sm:text-[15px] md:text-[16px]">{size.diameter} mm</td>
                                                <td className="w-1/3 p-[8px] sm:p-[10px] md:p-[12px] text-left text-[14px] sm:text-[15px] md:text-[16px]">{size.circumference} mm</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RingDetail;