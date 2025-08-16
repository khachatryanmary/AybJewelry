import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const Wishlist = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const fromPath = location.state?.from || `/${lng}/all-products`;

    const currentUser = useSelector((state) => state.auth.user);
    const [wishlist, setWishlist] = useState([]);
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
        const fetchWishlist = async () => {
            try {
                if (!currentUser) {
                    setWishlist([]);
                    setLoading(false);
                    return;
                }
                const res = await axios.get(`${API_URL}/api/wishlist/${currentUser.id}`);
                setWishlist(res.data.items || []);
            } catch (err) {
                console.error("Failed to fetch wishlist:", err.message);
                toast.error(t('wishlist.fetchFailed') || "Failed to fetch wishlist");
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [currentUser]);

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

    const removeFromWishlist = async (productId) => {
        try {
            await axios.delete(`${API_URL}/api/wishlist/${currentUser.id}/${productId}`);
            setWishlist(prev => prev.filter(item => item._id !== productId));
            toast.info(t('wishlist.removeSuccess') || "Removed from wishlist");
        } catch (err) {
            console.error("Failed to remove from wishlist:", err.message);
            toast.error(t('wishlist.removeFailed') || "Failed to remove from wishlist");
        }
    };

    const clearWishlist = async () => {
        try {
            setClearLoading(true);
            await axios.delete(`${API_URL}/api/wishlist/${currentUser.id}`);
            setWishlist([]);
            toast.success(t('wishlist.clearSuccess') || "Wishlist cleared successfully");
        } catch (err) {
            console.error("Failed to clear wishlist:", err.message);
            toast.error(t('wishlist.clearFailed') || "Failed to clear wishlist");
        } finally {
            setClearLoading(false);
        }
    };

    const moveToCart = async (product) => {
        if (product.category === "ring" && !selectedSize) {
            setSelectedProduct(product);
            setShowSizeModal(true);
            return;
        }

        try {
            setMoveToCartLoading(product._id);
            await axios.post(`${API_URL}/api/cart/${currentUser.id}`, {
                productId: product._id,
                size: product.category === "ring" ? selectedSize : undefined,
            });
            await axios.delete(`${API_URL}/api/wishlist/${currentUser.id}/${product._id}`);
            setWishlist(prev => prev.filter(item => item._id !== product._id));
            toast.success(t('wishlist.moveToCartSuccess') || "Moved to cart successfully");
            setShowSizeModal(false);
            setSelectedSize("");
            setSelectedProduct(null);
        } catch (err) {
            console.error("Failed to move to cart:", err.message);
            toast.error(t('wishlist.moveToCartFailed') || "Failed to move to cart");
        } finally {
            setMoveToCartLoading(null);
        }
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
    };

    const handleModalClose = () => {
        setShowSizeModal(false);
        setSelectedSize("");
        setSelectedProduct(null);
    };

    if (loading) {
        return (
            <div className="w-[90%] mx-auto flex flex-col gap-[20px] min-h-[80vh] py-[30px]">
                <div className="h-[40px] w-[300px] bg-gray-200 animate-pulse rounded" />
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex justify-between items-center border border-gray-200 rounded p-[10px] animate-pulse"
                    >
                        <div className="w-[200px] h-[150px] bg-gray-200 rounded" />
                        <div className="w-[150px] h-[20px] bg-gray-200 rounded" />
                        <div className="w-[100px] h-[20px] bg-gray-200 rounded" />
                        <div className="w-[150px] h-[40px] bg-gray-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            {!currentUser ? (
                <>
                    <div className="w-full text-center border-b border-gray-200">
                        <h2 className="font-[Against] text-[30px] p-[20px] text-[#0a0a39]">{t('wishlist.wishlist')}</h2>
                    </div>
                    <div className="h-[400px] flex flex-col items-center justify-center gap-[20px]">
                        <i className="bi bi-lock text-[70px] text-[#0a0a39]" />
                        <p className="text-[20px] text-[#0a0a39]">{t('wishlist.loginPrompt')}</p>
                        <Link to={`/${lng}/login`}>
                            <button className="w-[200px] h-[40px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white">
                                {t('wishlist.loginButton')}
                            </button>
                        </Link>
                    </div>
                </>
            ) : wishlist.length === 0 ? (
                <>
                    <div className="w-full text-center border-b border-gray-200">
                        <h2 className="font-[Against] text-[30px] p-[20px] text-[#0a0a39]">{t('wishlist.wishlist')}</h2>
                    </div>
                    <div className="h-[400px] flex flex-col items-center justify-center gap-[20px]">
                        <i className="bi bi-heart text-[70px] text-[#0a0a39]" />
                        <p className="text-[25px] font-light text-black">{t('wishlist.wishListMessage')}</p>
                        <p className="text-[15px] text-gray-500">{t('wishlist.clickToAdd')}</p>
                        <Link to={fromPath}>
                            <button className="w-[200px] h-[40px] mt-[10px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white">
                                {t('wishlist.returnToShop')}
                            </button>
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-full flex justify-between items-center border-b pb-[10px]">
                        <h2 className="font-[Against] text-[30px] p-[20px] text-[#0a0a39]">{t('wishlist.wishlist')}</h2>
                        <button
                            onClick={clearWishlist}
                            className="w-[150px] h-[40px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white flex items-center justify-center"
                            disabled={clearLoading}
                        >
                            {clearLoading ? (
                                <div className="w-[24px] h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                t('wishlist.clearWishlist')
                            )}
                        </button>
                    </div>

                    <ul className="w-full mt-[40px] flex flex-col gap-[20px]">
                        {wishlist.map((item, i) => (
                            <li key={i} className="flex justify-between items-center border border-gray-300 rounded p-[10px]">
                                <Link to={`/${lng}/product/${item._id}`} className="hover:opacity-80 transition">
                                    <img src={`${API_URL}${item.image}`} alt={item.name} className="w-[200px] h-auto object-cover rounded-[10px]" />
                                </Link>
                                <span className="text-[20px] font-[Against] text-[#0a0a39]">{item.name}</span>
                                <span className="text-[20px] text-[#0a0a39]">{item.price} AMD</span>
                                <div className="flex gap-[10px]">
                                    <button
                                        onClick={() => removeFromWishlist(item._id)}
                                        className="text-[#0a0a39] hover:text-white w-[150px] h-[40px] rounded-[10px] bg-[#efeeee] font-semibold hover:bg-[#0a0a39] transition"
                                    >
                                        {t('wishlist.removeWishlist')}
                                    </button>
                                    <button
                                        onClick={() => moveToCart(item)}
                                        className="text-[#0a0a39] hover:text-white w-[150px] h-[40px] rounded-[10px] bg-[#efeeee] font-semibold hover:bg-[#0a0a39] transition flex items-center justify-center"
                                        disabled={moveToCartLoading === item._id}
                                    >
                                        {moveToCartLoading === item._id ? (
                                            <div className="w-[24px] h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            t('wishlist.moveToCart')
                                        )}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <AnimatePresence>
                        {showSizeModal && selectedProduct && (
                            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                                <div ref={sizeModalRef} className="bg-[#efeeee] rounded-[10px] p-[20px] w-[90%] max-w-[500px] flex items-center justify-center flex-col gap-[20px]">
                                    <h3 className="text-[24px] font-semibold text-[#0a0a39]">
                                        {t('wishlist.selectRingSize')} - {selectedProduct.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-[10px] flex items-center justify-center">
                                        {ringSizes.map((sizeObj) => (
                                            <button
                                                key={sizeObj.size}
                                                onClick={() => handleSizeSelect(sizeObj.size)}
                                                className={`w-[50px] h-[40px] rounded-[10px] font-semibold transition ${
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
                                        className="font-bold text-left text-[#0a0a39] underline hover:text-[#213547] transition"
                                    >
                                        {t('wishlist.sizeGuide')}
                                    </button>
                                    <div className="flex gap-[10px]">
                                        <button
                                            onClick={() => moveToCart(selectedProduct)}
                                            className="w-[150px] flex justify-center items-center h-[40px] bg-[#0a0a39] text-white rounded-[10px] font-semibold hover:bg-[#555] transition disabled:opacity-50"
                                            disabled={!selectedSize || moveToCartLoading === selectedProduct._id}
                                        >
                                            {moveToCartLoading === selectedProduct._id ? (
                                                <div className="w-[24px] h-[24px] border-4 border-[#efeeee] border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                t('wishlist.addToCart')
                                            )}
                                        </button>
                                        <button
                                            onClick={handleModalClose}
                                            className="w-[150px] h-[40px] bg-white text-[#0a0a39] rounded-[10px] font-semibold hover:bg-[#efeeee] transition"
                                        >
                                            {t('wishlist.cancel')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {isSizeGuideOpen && (
                            <motion.div
                                key="size-guide"
                                ref={sizeGuideRef}
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                className="fixed bottom-0 w-full h-auto bg-white shadow-lg z-60 p-[20px] flex items-center justify-center flex-col"
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSizeGuideOpen(false);
                                    }}
                                    className="text-[20px] w-full text-right text-[#0a0a39] hover:text-[#213547]"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>

                                <div className="flex flex-row gap-6 text-[#444] w-[90%] justify-center items-center">
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <h3 className="text-[20px] font-semibold mb-[10px]">{t('ringDetail.measureInstructionsRing')}</h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                {measureStepsRing.map((step, index) => (
                                                    <div key={index} className="flex items-start gap-3">
                                                        <i className={`bi ${step.icon} text-[20px] text-[#0a0a39]`}></i>
                                                        <p className="text-[14px]">{step.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-[20px] font-semibold mb-[10px]">{t('ringDetail.measureInstructionsFinger')}</h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                {measureStepsFinger.map((step, index) => (
                                                    <div key={index} className="flex items-start gap-3">
                                                        <i className={`bi ${step.icon} text-[20px] text-[#0a0a39]`}></i>
                                                        <p className="text-[14px]">{step.text}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-start justify-center">
                                        <div>
                                            <h3 className="text-[20px] font-semibold mb-[10px]">{t('ringDetail.sizeChart')}</h3>
                                            <table className="w-[600px] h-[200px] mx-auto table-fixed border-collapse">
                                                <thead>
                                                <tr className="bg-[#f7f7f7]">
                                                    <th className="w-1/3 p-[8px] text-[#213547] text-left text-[14px]">{t('ringDetail.size')}</th>
                                                    <th className="w-1/3 p-[8px] text-[#213547] text-left text-[14px]">{t('ringDetail.diameter')}</th>
                                                    <th className="w-1/3 p-[8px] text-[#213547] text-left text-[14px]">{t('ringDetail.circumference')}</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {ringSizes.map((size, index) => (
                                                    <tr key={index} className="border-b border-[#ddd]">
                                                        <td className="w-1/3 p-[8px] text-left text-[14px]">{size.size}</td>
                                                        <td className="w-1/3 p-[8px] text-left text-[14px]">{size.diameter} mm</td>
                                                        <td className="w-1/3 p-[8px] text-left text-[14px]">{size.circumference} mm</td>
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