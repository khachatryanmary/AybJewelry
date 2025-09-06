import React, { useEffect, useState, useRef, useContext } from 'react';
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../Providers/UserContext";
import { WishlistContext } from "../Providers/WishlistContext";

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

const Wishlist = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const fromPath = location.state?.from || `/${lng}/all-products`;

    const { user } = useContext(UserContext);
    const { wishlist, fetchWishlist, removeFromWishlist, clearWishlist, moveToCart } = useContext(WishlistContext);
    const [loading, setLoading] = useState(true);
    const [clearLoading, setClearLoading] = useState(false);
    const [moveToCartLoading, setMoveToCartLoading] = useState(null);
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedSize, setSelectedSize] = useState("");
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL;
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
        if (loading) {
            fetchWishlist().then(() => setLoading(false)).catch(() => setLoading(false));
        }
    }, [fetchWishlist, loading]);

    useEffect(() => {
        if (showSizeModal || isSizeGuideOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [showSizeModal, isSizeGuideOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSizeGuideOpen && sizeGuideRef.current && !sizeGuideRef.current.contains(event.target)) {
                setIsSizeGuideOpen(false);
            } else if (showSizeModal && sizeModalRef.current && !sizeModalRef.current.contains(event.target) && !isSizeGuideOpen) {
                setShowSizeModal(false);
                setSelectedSize("");
                setSelectedProduct(null);
            }
        };

        if (showSizeModal || isSizeGuideOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSizeModal, isSizeGuideOpen]);

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    const handleModalClose = () => {
        setShowSizeModal(false);
        setSelectedSize("");
        setSelectedProduct(null);
    };

    const handleMoveToCart = async (product) => {
        if (product.category === "ring" && !selectedSize) {
            setSelectedProduct(product);
            setShowSizeModal(true);
            return;
        }
        setMoveToCartLoading(product._id);
        try {
            await moveToCart(product, selectedSize);
        } finally {
            setMoveToCartLoading(null);
            setShowSizeModal(false);
            setSelectedSize("");
            setSelectedProduct(null);
        }
    };

    const handleClearWishlist = async () => {
        if (clearLoading) return;
        setClearLoading(true);
        try {
            await clearWishlist();
        } finally {
            setClearLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto flex flex-col gap-[8px] sm:gap-[12px] md:gap-[16px] min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] py-[12px] sm:py-[16px] md:py-[20px]">
                <div className="h-[20px] sm:h-[24px] md:h-[28px] w-[200px] sm:w-[240px] md:w-[280px] bg-gray-200 animate-pulse rounded" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex flex-row justify-between items-center border border-gray-200 rounded p-[4px] sm:p-[6px] md:p-[8px] animate-pulse gap-[6px] sm:gap-[8px] md:gap-[10px]"
                    >
                        <div className="w-[100px] sm:w-[120px] md:w-[150px] h-[80px] sm:h-[100px] md:h-[120px] bg-gray-200 rounded" />
                        <div className="flex flex-col gap-[4px] sm:gap-[6px] md:gap-[8px] w-[80px] sm:w-[100px] md:w-[120px]">
                            <div className="h-[16px] sm:h-[18px] md:h-[20px] bg-gray-200 rounded" />
                            <div className="h-[16px] sm:h-[18px] md:h-[20px] bg-gray-200 rounded" />
                        </div>
                        <div className="flex gap-[4px] sm:gap-[6px] md:gap-[8px] w-[80px] sm:w-[200px] md:w-[230px] justify-center">
                            <div className="w-[24px] sm:w-[90px] md:w-[100px] h-[24px] sm:h-[28px] md:h-[32px] bg-gray-200 rounded" />
                            <div className="w-[90px] sm:w-[100px] md:w-[120px] h-[24px] sm:h-[28px] md:h-[32px] bg-gray-200 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-[95%] sm:w-[90%] md:w-[85%] mx-auto flex flex-col items-center justify-center min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] py-[12px] sm:py-[16px] md:py-[20px]">
            <style>{toastStyles}</style>

            {!user ? (
                <>
                    <div className="w-full text-center border-b border-gray-200 p-[8px] sm:p-[12px] md:p-[16px]">
                        <h2 className="font-[Against] text-[20px] sm:text-[22px] md:text-[24px] text-[#0a0a39]">{t('wishlist.wishlist')}</h2>
                    </div>
                    <div className="h-[200px] sm:h-[250px] md:h-[300px] flex flex-col items-center justify-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
                        <i className="bi bi-lock text-[30px] sm:text-[40px] md:text-[50px] text-[#0a0a39]" />
                        <p className="text-[14px] sm:text-[16px] md:text-[18px] text-[#0a0a39]">{t('wishlist.loginPrompt')}</p>
                        <Link to={`/${lng}/login`}>
                            <button className="w-[120px] sm:w-[140px] md:w-[160px] h-[28px] sm:h-[32px] md:h-[36px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white text-[12px] sm:text-[13px] md:text-[14px]">
                                {t('wishlist.loginButton')}
                            </button>
                        </Link>
                    </div>
                </>
            ) : wishlist.length === 0 ? (
                <>
                    <div className="w-full text-center border-b border-gray-200 p-[8px] sm:p-[12px] md:p-[16px]">
                        <h2 className="font-[Against] text-[20px] sm:text-[22px] md:text-[24px] text-[#0a0a39]">{t('wishlist.wishlist')}</h2>
                    </div>
                    <div className="h-[200px] sm:h-[250px] md:h-[300px] flex flex-col items-center justify-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
                        <i className="bi bi-heart text-[30px] sm:text-[40px] md:text-[50px] text-[#0a0a39]" />
                        <p className="text-[14px] sm:text-[16px] md:text-[18px] font-light text-black">{t('wishlist.wishListMessage')}</p>
                        <p className="text-[12px] sm:text-[13px] md:text-[14px] text-gray-500">{t('wishlist.clickToAdd')}</p>
                        <Link to={fromPath}>
                            <button className="w-[120px] sm:w-[140px] md:w-[160px] h-[28px] sm:h-[32px] md:h-[36px] mt-[4px] sm:mt-[6px] md:mt-[8px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white text-[12px] sm:text-[13px] md:text-[14px]">
                                {t('wishlist.returnToShop')}
                            </button>
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-full flex justify-between items-center border-b border-gray-200 p-[8px] sm:p-[12px] md:p-[16px]">
                        <h2 className="font-[Against] text-[20px] sm:text-[22px] md:text-[24px] text-[#0a0a39]">{t('wishlist.wishlist')}</h2>
                        <button
                            onClick={handleClearWishlist}
                            className="w-[120px] sm:w-[140px] md:w-[160px] h-[28px] sm:h-[32px] md:h-[36px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white flex items-center justify-center text-[12px] sm:text-[13px] md:text-[14px]"
                            disabled={clearLoading}
                        >
                            {clearLoading ? (
                                <div className="w-[16px] sm:w-[18px] md:w-[20px] h-[16px] sm:h-[18px] md:h-[20px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                t('wishlist.clearWishlist')
                            )}
                        </button>
                    </div>

                    <ul className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px] mt-[20px] sm:mt-[30px] md:mt-[35px] flex flex-col gap-[8px] sm:gap-[12px] md:gap-[16px]">
                        {wishlist.map((item, i) => (
                            <li key={i} className="flex flex-row justify-between items-center border border-gray-300 rounded p-[4px] sm:p-[6px] md:p-[8px] gap-[6px] sm:gap-[8px] md:gap-[10px]">
                                <Link to={`/${lng}/product/${item._id}`} className="hover:opacity-80 transition">
                                    <img src={`${API_URL}${item.image}`} alt={item.name} className="w-[100px] sm:w-[120px] md:w-[150px] h-[80px] sm:h-[100px] md:h-[120px] object-contain" />
                                </Link>
                                <div className="flex flex-col gap-[4px] sm:gap-[6px] md:gap-[8px] min-w-[80px] sm:min-w-[100px] md:min-w-[120px]">
                                    <span className="text-[12px] font-semibold sm:text-[14px] md:text-[16px] min-h-[20px] sm:min-h-[24px] md:min-h-[28px] flex items-center">{item.name}</span>
                                    <span className="text-[12px] sm:text-[14px] md:text-[16px] ">
                                        {numberFormatter.format(item.price)} {t("checkout.currency", { defaultValue: "AMD" })}
                                    </span>
                                </div>
                                <div className="flex w-[120px] gap-[4px] sm:gap-[6px] md:gap-[8px] w-[80px] sm:w-[200px] md:w-[230px] justify-center">
                                    <button
                                        onClick={() => handleMoveToCart(item)}
                                        className="text-[#0a0a39] hover:text-white w-[100px] sm:w-[120px] md:w-[140px] h-[40px] sm:h-[28px] md:h-[32px] rounded-[10px] bg-[#efeeee] font-semibold hover:bg-[#0a0a39] transition flex items-center justify-center text-[12px] sm:text-[13px] md:text-[14px] px-[8px] sm:px-[10px] md:px-[12px] overflow-hidden text-ellipsis"
                                        disabled={moveToCartLoading === item._id}
                                    >
                                        {moveToCartLoading === item._id ? (
                                            <div className="w-[16px] sm:w-[18px] md:w-[20px] h-[16px] sm:h-[18px] md:h-[20px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            t('wishlist.moveToCart')
                                        )}
                                    </button>
                                    <button
                                        onClick={() => removeFromWishlist(item._id)}
                                        className="text-[#0a0a39] w-[24px] sm:w-[90px] h-[40px] sm:h-[28px] font-semibold hover:text-gray-400 transition flex items-center justify-center text-[12px] sm:text-[13px] md:text-[14px]"
                                    >
                                        <span className="block"><i className="bi bi-x text-[20px]"></i></span>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <AnimatePresence>
                        {showSizeModal && selectedProduct && (
                            <motion.div
                                ref={sizeModalRef}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                            >
                                <div className="bg-white rounded-[8px] p-[10px] sm:p-[15px] md:p-[20px] w-[280px] sm:w-[400px] md:w-[500px] flex items-center justify-center flex-col gap-[10px] sm:gap-[15px] md:gap-[20px] shadow-sm sm:shadow-md">
                                    <h3 className="text-[18px] sm:text-[22px] md:text-[24px] font-semibold text-[#0a0a39]">
                                        {t('wishlist.selectRingSize')} - {selectedProduct.name}
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
                                        {t('wishlist.sizeGuide')}
                                    </button>
                                    <div className="flex gap-[8px] sm:gap-[10px] md:gap-[12px]">
                                        <button
                                            onClick={() => handleMoveToCart(selectedProduct)}
                                            className="w-[120px] sm:w-[140px] md:w-[150px] h-[30px] sm:h-[35px] md:h-[40px] flex justify-center items-center bg-[#0a0a39] text-white rounded-[6px] font-semibold hover:bg-[#555] transition disabled:opacity-50 text-[14px] sm:text-[15px] md:text-[16px]"
                                            disabled={!selectedSize || moveToCartLoading === selectedProduct._id}
                                        >
                                            {moveToCartLoading === selectedProduct._id ? (
                                                <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                t('wishlist.addToCart')
                                            )}
                                        </button>
                                        <button
                                            onClick={handleModalClose}
                                            className="w-[120px] sm:w-[140px] md:w-[150px] h-[30px] sm:h-[35px] md:h-[40px] bg-white text-[#0a0a39] rounded-[6px] font-semibold hover:bg-[#f7f7f7] transition text-[14px] sm:text-[15px] md:text-[16px]"
                                        >
                                            {t('wishlist.cancel')}
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
                                        console.log('Wishlist.jsx size guide closing');
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
                </>
            )}
        </div>
    );
};

export default Wishlist;