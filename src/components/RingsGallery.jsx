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

const RingGallery = () => {
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
    const [showAddSizeModal, setShowAddSizeModal] = useState(false);
    const [showRemoveSizeModal, setShowRemoveSizeModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [cartLoading, setCartLoading] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const loginPromptRef = useRef(null);
    const sizeGuideRef = useRef(null);
    const addSizeModalRef = useRef(null);
    const removeSizeModalRef = useRef(null);

    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "am" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const skeletons = Array(8).fill(null);

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
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        const getRings = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/products?category=ring`);
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                const data = await res.json();
                setProduct(data);

                if (user?.id) {
                    console.log("RingGallery.jsx current user:", user);
                    const [cartItems, wishlistItems] = await Promise.all([fetchCart(), fetchWishlist()]);
                    setAddedToCart(cartItems.reduce((acc, item) => ({
                        ...acc,
                        [item.id]: [...(acc[item.id] || []), { size: item.size, quantity: item.quantity }],
                    }), {}));
                    setIsWished(wishlistItems.reduce((acc, item) => ({ ...acc, [item._id]: true }), {}));
                } else {
                    setAddedToCart({});
                    setIsWished({});
                }
            } catch (error) {
                console.error("RingGallery.jsx getRings error:", error.message);
                toast.error(t('ringGallery.fetchError', { defaultValue: "Error fetching rings" }));
                setAddedToCart({});
                setIsWished({});
            } finally {
                setLoading(false);
            }
        };

        getRings();
    }, [setProduct, user, API_URL, t, fetchCart, fetchWishlist]);

    useEffect(() => {
        const handleCartUpdate = async () => {
            const cartItems = await fetchCart();
            setAddedToCart(cartItems.reduce((acc, item) => ({
                ...acc,
                [item.id]: [...(acc[item.id] || []), { size: item.size, quantity: item.quantity }],
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
        if (isLoginPromptOpen || showAddSizeModal || showRemoveSizeModal || isSizeGuideOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isLoginPromptOpen, showAddSizeModal, showRemoveSizeModal, isSizeGuideOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSizeGuideOpen && sizeGuideRef.current && !sizeGuideRef.current.contains(event.target)) {
                setIsSizeGuideOpen(false);
            }
            if (showAddSizeModal && addSizeModalRef.current && !addSizeModalRef.current.contains(event.target) && !isSizeGuideOpen) {
                setShowAddSizeModal(false);
                setSelectedSize("");
                setSelectedProduct(null);
            }
            if (showRemoveSizeModal && removeSizeModalRef.current && !removeSizeModalRef.current.contains(event.target) && !isSizeGuideOpen) {
                setShowRemoveSizeModal(false);
                setSelectedSize("");
                setSelectedProduct(null);
            }
            if (isLoginPromptOpen && loginPromptRef.current && !loginPromptRef.current.contains(event.target)) {
                setIsLoginPromptOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoginPromptOpen, showAddSizeModal, showRemoveSizeModal, isSizeGuideOpen]);

    const handleCartToggle = async (product) => {
        if (!user?.id) {
            setLoginPromptType("cart");
            setIsLoginPromptOpen(true);
            return;
        }

        if (!isCartItem(product._id) && !selectedSize) {
            setSelectedProduct(product);
            setShowAddSizeModal(true);
            return;
        }

        if (isCartItem(product._id) && addedToCart[product._id]?.length > 1) {
            setSelectedProduct(product);
            setShowRemoveSizeModal(true);
            return;
        }

        try {
            setCartLoading(product._id);
            if (isCartItem(product._id)) {
                const sizeToRemove = addedToCart[product._id][0].size;
                await removeFromCart(product._id, sizeToRemove);
                setAddedToCart(prev => {
                    const newState = { ...prev };
                    delete newState[product._id];
                    return newState;
                });
                toast.info(t('productsGallery.removedFromCart', { defaultValue: `Removed from cart` }));
            } else {
                await addToCart(product._id, 1, selectedSize);
                setAddedToCart(prev => ({
                    ...prev,
                    [product._id]: [{ size: selectedSize, quantity: 1 }],
                }));
                toast.success(t('productsGallery.addedToCart', { defaultValue: `Added to cart!` }));
                setShowAddSizeModal(false);
                setSelectedSize("");
                setSelectedProduct(null);
            }
        } catch (error) {
            console.error("RingGallery.jsx handleCartToggle error:", error.message);
            toast.error(t('productsGallery.cartError', { defaultValue: "Error updating cart" }));
        } finally {
            setCartLoading(null);
        }
    };

    const handleRemoveSize = async (product, size) => {
        try {
            setCartLoading(product._id);
            await removeFromCart(product._id, size);
            setAddedToCart(prev => {
                const newState = { ...prev };
                newState[product._id] = newState[product._id].filter(item => item.size !== size);
                if (!newState[product._id].length) {
                    delete newState[product._id];
                }
                return newState;
            });
            toast.info(t('productsGallery.removedFromCart', { defaultValue: `${product.name} (Size ${size}) removed from cart` }));
            setShowRemoveSizeModal(false);
            setSelectedSize("");
            setSelectedProduct(null);
        } catch (error) {
            console.error("RingGallery.jsx handleRemoveSize error:", error.message);
            toast.error(t('productsGallery.cartError', { defaultValue: "Error updating cart" }));
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
            console.error("RingGallery.jsx handleWishlistToggle error:", error.message);
            toast.error(t('productsGallery.wishlistError', { defaultValue: "Error updating wishlist" }));
        }
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    const handleAddModalClose = () => {
        setShowAddSizeModal(false);
        setSelectedSize("");
        setSelectedProduct(null);
    };

    const handleRemoveModalClose = () => {
        setShowRemoveSizeModal(false);
        setSelectedSize("");
        setSelectedProduct(null);
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
                    <h2 className="text-[30px]">{t('ringGallery.title')}</h2>
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
                                    to={`/${lng}/rings/${_id}`}
                                    state={{ from: `/${lng}/rings` }}
                                >
                                    <img
                                        src={`${image}`}
                                        alt={name || 'image'}
                                        className="w-[280px] h-[180px] object-cover rounded-md"
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
                {showAddSizeModal && selectedProduct && (
                    <motion.div
                        ref={addSizeModalRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <div className="bg-[#efeeee] rounded-[10px] p-[10px] sm:p-[15px] md:p-[20px] w-[280px] sm:w-[400px] md:w-[500px] flex items-center justify-center flex-col gap-[10px] sm:gap-[15px] md:gap-[20px]">
                            <h3 className="text-center text-[18px] sm:text-[22px] md:text-[24px] font-semibold text-[#0a0a39]">
                                {t('ringDetail.selectRingSize')} - {selectedProduct.name}
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
                                    onClick={() => handleCartToggle(selectedProduct)}
                                    className="w-[120px] sm:w-[140px] md:w-[150px] flex justify-center items-center h-[30px] sm:h-[35px] md:h-[40px] bg-[#0a0a39] text-white rounded-[6px] font-semibold hover:bg-[#555] transition disabled:opacity-50 text-[14px] sm:text-[15px] md:text-[16px]"
                                    disabled={!selectedSize || cartLoading === selectedProduct._id}
                                >
                                    {cartLoading === selectedProduct._id ? (
                                        <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#efeeee] border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        t('productsGallery.addToCart')
                                    )}
                                </button>
                                <button
                                    onClick={handleAddModalClose}
                                    className="w-[120px] sm:w-[140px] md:w-[150px] h-[30px] sm:h-[35px] md:h-[40px] bg-white text-[#0a0a39] rounded-[6px] font-semibold hover:bg-[#efeeee] transition text-[14px] sm:text-[15px] md:text-[16px]"
                                >
                                    {t('productsGallery.cancel')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
                {showRemoveSizeModal && selectedProduct && (
                    <motion.div
                        ref={removeSizeModalRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <div className="bg-[#efeeee] rounded-[10px] p-[10px] sm:p-[15px] md:p-[20px] w-[280px] sm:w-[400px] md:w-[500px] flex items-center justify-center flex-col gap-[10px] sm:gap-[15px] md:gap-[20px]">
                            <h3 className="text-[18px] sm:text-[22px] md:text-[24px] font-semibold text-[#0a0a39]">
                                {t('ringDetail.selectRemoveSize')} - {selectedProduct.name}
                            </h3>
                            <div className="flex flex-wrap gap-[8px] sm:gap-[10px] md:gap-[12px] items-center justify-center">
                                {addedToCart[selectedProduct._id].map((item, index) => (
                                    <button
                                        key={`${item.size}-${index}`}
                                        onClick={() => handleRemoveSize(selectedProduct, item.size)}
                                        className="w-[44px] sm:w-[48px] md:w-[50px] h-[30px] sm:h-[35px] md:h-[40px] rounded-[6px] font-semibold transition text-[14px] sm:text-[15px] md:text-[16px] bg-white text-[#0a0a39] hover:bg-[#0a0a39] hover:text-white"
                                    >
                                        {item.size}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleRemoveModalClose}
                                className="w-[120px] sm:w-[140px] md:w-[150px] h-[30px] sm:h-[35px] md:h-[40px] bg-white text-[#0a0a39] rounded-[6px] font-semibold hover:bg-[#efeeee] transition text-[14px] sm:text-[15px] md:text-[16px]"
                            >
                                {t('productsGallery.cancel')}
                            </button>
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
                        className="fixed bottom-0 bg-white shadow-sm sm:shadow-md z-50 p-[10px] sm:p-[15px] md:p-[20px] flex flex-col items-start justify-start overflow-y-auto max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh]"
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('RingGallery.jsx size guide closing');
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

export default RingGallery;