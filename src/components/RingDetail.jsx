import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { addToCart } from "../Toolkit/slices/cartSlice.js";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const RingDetail = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const from = location.state?.from || `/${lng}/rings`;

    const [ring, setRing] = useState({});
    const [openDetails, setOpenDetails] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("");
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [isWished, setIsWished] = useState(false);
    const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
    const [loginPromptType, setLoginPromptType] = useState(""); // "cart" or "wishlist"
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;
    const API_URL = import.meta.env.VITE_API_URL;

    const sidebarRef = useRef(null);
    const loginPromptRef = useRef(null);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Lock/unlock body scroll when modals open/close
    useEffect(() => {
        if (isSizeModalOpen || isLoginPromptOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [isSizeModalOpen, isLoginPromptOpen]);

    // Close sidebar or login prompt on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSizeModalOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSizeModalOpen(false);
            }
            if (isLoginPromptOpen && loginPromptRef.current && !loginPromptRef.current.contains(event.target)) {
                setIsLoginPromptOpen(false);
            }
        };

        if (isSizeModalOpen || isLoginPromptOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSizeModalOpen, isLoginPromptOpen]);

    useEffect(() => {
        const fetchRingDetailAndWishlistStatus = async () => {
            try {
                const productRes = await axios.get(`${API_URL}/api/products/${id}`);
                const product = productRes.data;
                setRing(product);

                if (currentUser) {
                    const wishRes = await axios.get(`${API_URL}/api/wishlist/${currentUser.id}`);
                    const items = wishRes.data?.items || [];
                    const found = items.some(item => item._id === product._id);
                    setIsWished(found);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error.message);
            }
        };
        fetchRingDetailAndWishlistStatus();
    }, [id, location.pathname, API_URL, currentUser]);

    const toggleWishlist = async () => {
        if (!userId || !ring._id) {
            setLoginPromptType("wishlist");
            setIsLoginPromptOpen(true);
            return;
        }
        try {
            if (isWished) {
                await axios.delete(`${API_URL}/api/wishlist/${userId}/${ring._id}`);
                setIsWished(false);
                toast.info(t('ringDetail.removedFromWishlist', { defaultValue: `${ring.name} removed from wishlist` }));
            } else {
                await axios.post(`${API_URL}/api/wishlist/${userId}`, {
                    productId: ring._id,
                });
                setIsWished(true);
                toast.success(t('ringDetail.addedToWishlist', { defaultValue: `${ring.name} added to wishlist` }));
            }
        } catch (err) {
            console.error("Wishlist toggle failed:", err.message);
            toast.error(t('ringDetail.wishlistError', { defaultValue: "Error updating wishlist" }));
        }
    };

    const images = ring.image
        ? [`${API_URL}${ring.image}`, ...(ring.images || []).map(img => `${API_URL}${img}`)]
        : (ring.images || []).map(img => `${API_URL}${img}`);

    const handleAddToCart = async () => {
        if (!userId) {
            setLoginPromptType("cart");
            setIsLoginPromptOpen(true);
            return;
        }
        if (!selectedSize) {
            toast.error(t('ringDetail.selectSize', { defaultValue: "Please select a ring size" }));
            return;
        }
        try {
            await axios.post(`${API_URL}/api/cart/${userId}`, {
                productId: ring._id,
                quantity,
                size: selectedSize,
            });
            dispatch(addToCart({ ...ring, quantity, size: selectedSize }));
            setIsAddedToCart(true);
            toast.success(t('ringDetail.addedToCart', { defaultValue: `${ring.name} Size ${selectedSize} added to cart!` }));
            setTimeout(() => setIsAddedToCart(false), 3000);
        } catch (error) {
            console.error("Failed to add to cart:", error.message);
            toast.error(t('ringDetail.cartError', { defaultValue: "Failed to add to cart" }));
        }
    };

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
                                alt={`ring image ${index}`}
                                className="w-[400px] h-[400px] object-contain"
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <div className="flex flex-col justify-center items-start gap-[40px] w-[50%]">
                <Link to={from}>
                    <button className="bg-[#f7f7f7] text-[#0a0a39] transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] hover:bg-[#0a0a39] hover:text-[white]">
                        {t('ringDetail.backToSelection')}
                    </button>
                </Link>

                <div className="flex flex-col w-full">
                    <div className="flex justify-between w-full">
                        <span className="text-[25px] font-bold text-[#213547]">{ring.name}</span>
                        <span
                            onClick={toggleWishlist}
                            className={`text-[28px] cursor-pointer transition-all duration-300 ${isWished ? 'text-[#0a0a39]' : 'text-gray-400'}`}
                            title={t('addToWishlist')}
                        >
                            <i className={`bi ${isWished ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                        </span>
                    </div>

                    <span className="text-[20px] text-[#666] font-semibold my-[10px] mb-[20px]">
                        {ring.price * quantity} AMD
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
                            onChange={e => {
                                const val = Math.max(1, Number(e.target.value));
                                setQuantity(val);
                            }}
                            className="w-[50px] h-[30px] text-center border rounded bg-[#f7f7f7]"
                        />
                        <button
                            onClick={() => setQuantity(q => q + 1)}
                            className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
                        >
                            +
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <div className="relative">
                            <select
                                value={selectedSize}
                                onChange={(e) => setSelectedSize(e.target.value)}
                                className="appearance-none w-[150px] h-[40px] text-[#0a0a39] bg-[#f7f7f7] border border-[#ddd] rounded-[8px] px-4 text-[16px] focus:outline-none focus:border-[#0a0a39] transition-all duration-300 cursor-pointer hover:shadow-md"
                            >
                                <option value="">Select Size</option>
                                {ringSizes.map((size) => (
                                    <option key={size.size} value={size.size}>
                                        {size.size}
                                    </option>
                                ))}
                            </select>
                            <i className="bi bi-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0a0a39]"></i>
                        </div>
                        <button
                            onClick={() => setIsSizeModalOpen(true)}
                            className="ml-3 font-bold text-[#0a0a39] underline hover:text-[#213547] transition"
                        >
                            {t('ringDetail.sizeGuide')}
                        </button>
                    </div>

                    <p className="text-[16px] leading-[1.5] text-[#444] mb-[20px]">{ring.description}</p>

                    <button
                        id="addBtn"
                        onClick={handleAddToCart}
                        className="transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] bg-[#f7f7f7] text-[#0a0a39] hover:bg-[#0a0a39] hover:text-[white]"
                    >
                        {isAddedToCart ? t('ringDetail.addedToCart') : t('ringDetail.add')}
                    </button>

                    <div className="mt-[20px] w-full bg-[white] rounded-[8px] shadow-md overflow-hidden">
                        <div
                            className={`text-[18px] font-bold flex justify-between items-center px-[20px] py-[12px] bg-[#f7f7f7] border-b border-[#ddd] cursor-pointer select-none ${openDetails ? 'open' : ''}`}
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

            <AnimatePresence>
                {isSizeModalOpen && (
                    <motion.div
                        ref={sidebarRef}
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="fixed top-[60px] right-0 w-[600px] h-[calc(100vh-60px)] bg-white shadow-lg z-50 p-[20px] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-[20px]">
                            <h2 className="text-[24px] font-bold text-[#213547]">{t('ringDetail.sizeGuide')}</h2>
                            <button
                                onClick={() => setIsSizeModalOpen(false)}
                                className="text-[20px] text-[#0a0a39] hover:text-[#213547]"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="text-[#444]">
                            <h3 className="text-[18px] font-semibold mb-[10px]">{t('ringDetail.measureInstructionsRing')}</h3>
                            <div className="grid grid-cols-2 gap-4 mb-[20px] size-guide-grid">
                                {measureStepsRing.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <i className={`bi ${step.icon} text-[20px] text-[#0a0a39]`}></i>
                                        <p className="text-[14px]">{step.text}</p>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-[18px] font-semibold mb-[10px]">{t('ringDetail.measureInstructionsFinger')}</h3>
                            <div className="grid grid-cols-2 gap-4 mb-[20px] size-guide-grid">
                                {measureStepsFinger.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <i className={`bi ${step.icon} text-[20px] text-[#0a0a39]`}></i>
                                        <p className="text-[14px]">{step.text}</p>
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-[18px] font-semibold mb-[10px]">{t('ringDetail.sizeChart')}</h3>
                            <table className="w-full table-fixed border-collapse">
                                <thead>
                                <tr className="bg-[#f7f7f7]">
                                    <th className="w-1/3 p-[10px] text-[#213547] text-left">{t('ringDetail.size')}</th>
                                    <th className="w-1/3 p-[10px] text-[#213547] text-left">{t('ringDetail.diameter')}</th>
                                    <th className="w-1/3 p-[10px] text-[#213547] text-left">{t('ringDetail.circumference')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {ringSizes.map((size, index) => (
                                    <tr key={index} className="border-b border-[#ddd]">
                                        <td className="w-1/3 p-[10px] text-left">{size.size}</td>
                                        <td className="w-1/3 p-[10px] text-left">{size.diameter} mm</td>
                                        <td className="w-1/3 p-[10px] text-left">{size.circumference} mm</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
                {isLoginPromptOpen && (
                    <motion.div
                        ref={loginPromptRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                    >
                        <div className="bg-white rounded-[10px] p-[20px] w-[500px] flex flex-col items-center gap-[20px]">
                            <i className="bi bi-lock text-[40px] text-[#0a0a39]" />
                            <h2 className="font-[Against] text-[25px] text-[#0a0a39]">
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

export default RingDetail;