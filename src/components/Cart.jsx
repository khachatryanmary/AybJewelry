import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../Providers/UserContext";
import { CartContext } from "../Providers/CartContext";

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
.Toastify__toast-close-button {
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
.Toastify__toast-close-button {
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
.Toastify__toast-close-button {
        font-size: 16px;
    }
}
`;

const Cart = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { user } = useContext(UserContext);
    const { cart, setCart, fetchCart } = useContext(CartContext);
    const [loading, setLoading] = useState(true);
    const [removeLoading, setRemoveLoading] = useState(null);
    const [clearLoading, setClearLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;

    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "am" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    const categoryPathMap = {
        ring: "rings",
        bracelet: "bracelets",
        earring: "earrings",
        brooch: "brooches",
        necklace: "necklaces",
    };

    useEffect(() => {
        if (loading) {
            fetchCart().then(() => setLoading(false)).catch(() => setLoading(false));
        }
    }, [fetchCart, loading]);

    const subtotal = cart.reduce(
        (acc, item) => acc + (item.price || 0) * item.quantity,
        0
    );

    const removeItem = async (productId, size, category) => {
        if (removeLoading) {
            console.log("Cart.jsx removeItem: Already removing, ignoring", { productId, size, category });
            return;
        }
        try {
            setRemoveLoading(productId);
            const params = category === "ring" && size ? { size } : { size: null };
            console.log("Cart.jsx removeItem request:", {
                productId,
                size: size || "none",
                category,
                url: `${API_URL}/api/cart/${user?.id}/${productId}`,
                params,
            });
            const response = await axios.delete(`${API_URL}/api/cart/${user?.id}/${productId}`, {
                params,
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            console.log("Cart.jsx removeItem response:", JSON.stringify(response.data, null, 2));
            await fetchCart();
        } catch (err) {
            console.error("Cart.jsx removeItem error:", err.response?.data || err.message);
            toast.error(
                err.response?.data?.message || t("cart.removeError", { defaultValue: "Failed to remove item" })
            );
        } finally {
            setRemoveLoading(null);
        }
    };

    const updateQuantity = async (productId, size, quantity, category) => {
        if (quantity < 1) {
            console.log("Cart.jsx updateQuantity: Quantity < 1, ignoring", { productId, size, quantity, category });
            return;
        }
        try {
            const params = category === "ring" && size ? { size } : { size: null };
            console.log("Cart.jsx updateQuantity request:", {
                productId,
                size: size || "none",
                quantity,
                category,
                url: `${API_URL}/api/cart/${user?.id}/${productId}`,
                params,
            });
            await axios.patch(
                `${API_URL}/api/cart/${user?.id}/${productId}`,
                { quantity, size: category === "ring" ? size : null },
                { params, headers: { Authorization: `Bearer ${user?.token}` } }
            );
            await fetchCart();
        } catch (err) {
            console.error("Cart.jsx updateQuantity error:", err.response?.data || err.message);
            toast.error(
                err.response?.data?.message || t("cart.quantityError", { defaultValue: "Failed to update quantity" })
            );
        }
    };

    const clearCartAction = async () => {
        if (clearLoading) {
            console.log("Cart.jsx clearCart: Already clearing, ignoring");
            return;
        }
        try {
            setClearLoading(true);
            console.log("Cart.jsx clearCart request:", { url: `${API_URL}/api/cart/${user?.id}` });
            await axios.delete(`${API_URL}/api/cart/${user?.id}`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            console.log("Cart.jsx clearCart response: Cart cleared");
            setCart([]);
            toast.info(t("cart.cleared", { defaultValue: "Cart cleared" }));
        } catch (err) {
            console.error("Cart.jsx clearCart error:", err.response?.data || err.message);
            toast.error(
                err.response?.data?.message || t("cart.clearError", { defaultValue: "Failed to clear cart" })
            );
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
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#efeeee] rounded-[8px] p-[12px] sm:p-[16px] md:p-[20px] gap-[12px] sm:gap-[16px] md:gap-[20px] animate-pulse"
                    >
                        <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
                            <div className="w-[300px] h-[200px] sm:w-[300px] sm:h-[200px] md:w-[300px] md:h-[200px] bg-gray-200 rounded-[8px]" />
                        </div>
                        <div className="flex-grow flex flex-col sm:flex-row items-start sm:items-center gap-[8px] sm:gap-[12px] w-full">
                            <div className="flex flex-col gap-[4px] sm:gap-[6px] md:gap-[8px] w-full sm:w-auto">
                                <div className="h-[16px] sm:h-[18px] md:h-[20px] bg-gray-200 rounded" />
                                <div className="h-[16px] sm:h-[18px] md:h-[20px] bg-gray-200 rounded" />
                            </div>
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
                    <div className="w-full text-center border-b border-gray-300 p-[8px] sm:p-[12px] md:p-[16px]">
                        <h2 className="font-[Against] text-[20px] sm:text-[22px] md:text-[24px] text-[#0a0a39]">{t("cart.cartTitle")}</h2>
                    </div>
                    <div className="h-[200px] sm:h-[250px] md:h-[300px] flex flex-col items-center justify-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
                        <i className="bi bi-lock text-[30px] sm:text-[40px] md:text-[50px] text-[#0a0a39]" />
                        <p className="text-center text-[14px] sm:text-[16px] md:text-[18px] text-[#0a0a39]">{t("cart.loginPrompt")}</p>
                        <Link to={`/${lng}/login`}>
                            <button className="w-[120px] sm:w-[140px] md:w-[160px] h-[28px] sm:h-[32px] md:h-[36px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white text-[12px] sm:text-[13px] md:text-[14px]">
                                {t("cart.loginButton")}
                            </button>
                        </Link>
                    </div>
                </>
            ) : cart.length === 0 ? (
                <>
                    <div className="w-full text-center border-b border-gray-300 p-[8px] sm:p-[12px] md:p-[16px]">
                        <h2 className="font-[Against] text-[30px] sm:text-[22px] md:text-[30px] text-[#0a0a39]">{t("cart.cartTitle")}</h2>
                    </div>
                    <div className="h-[200px] sm:h-[250px] md:h-[300px] flex flex-col items-center justify-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
                        <i className="bi bi-handbag text-[30px] sm:text-[40px] md:text-[50px] text-[#0a0a39]" />
                        <p className="text-[14px] sm:text-[16px] md:text-[18px] text-black font-light">{t("cart.cartEmpty")}</p>
                        <Link to={`/${lng}/all-products`}>
                            <button className="w-[120px] sm:w-[140px] md:w-[160px] min-h-[40px] mt-[4px] sm:mt-[6px] md:mt-[8px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white text-[12px] sm:text-[13px] md:text-[14px]">
                                {t("cart.returnToShop")}
                            </button>
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-full flex justify-between items-center border-b border-gray-300 p-[8px] sm:p-[12px] md:p-[16px]">
                        <h2 className="text-[20px] sm:text-[22px] font-[Against] md:text-[24px] text-[#0a0a39]">{t("cart.cartTitle")}</h2>
                        <button
                            onClick={clearCartAction}
                            className="hover:text-white w-[120px] sm:w-[140px] md:w-[160px] h-[28px] sm:h-[32px] md:h-[36px] rounded-[10px] bg-[#efeeee] text-[#0a0a39] font-semibold hover:bg-[#0a0a39] transition flex items-center justify-center text-[12px] sm:text-[13px] md:text-[14px]"
                            disabled={clearLoading}
                        >
                            {clearLoading ? (
                                <div className="w-[16px] sm:w-[18px] md:w-[20px] h-[16px] sm:h-[18px] md:h-[20px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                t("cart.clearCart")
                            )}
                        </button>
                    </div>

                    <ul className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px] flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] py-[30px]">
                        {cart.map((item) => {
                            const category = item.category?.toLowerCase();
                            const pathCategory = categoryPathMap[category] || `${category}s`;

                            return (
                                <li
                                    key={`${item.id}-${item.size || ''}`}
                                    className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#efeeee] rounded-[8px] p-[12px] sm:p-[16px] md:p-[20px] gap-[12px] sm:gap-[16px] md:gap-[20px]"
                                >
                                    <button
                                        onClick={() => removeItem(item.id, item.size, item.category)}
                                        className=" absolute top-2 right-2 sm:absolute sm:top-2 sm:right-2 sm:px-4 sm:py-2 text-[#0e0e53] hover:bg-[#0a0a39] hover:text-white font-semibold text-[12px] sm:text-[13px] md:text-[14px] px-3 py-1 rounded-[8px] transition duration-300 z-10 disabled:opacity-50 disabled:cursor-not sm:absolute relative self-end mt-1 sm:mt-0"
                                        disabled={removeLoading === item.id}
                                    >
                                        {removeLoading === item.id ? (
                                            <div className="w-[16px] sm:w-[18px] md:w-[20px] h-[16px] sm:h-[18px] md:h-[20px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                        ) : (

                                            <span>Remove</span>
                                        )}
                                    </button>

                                    <Link to={`/${lng}/${pathCategory}/${item.id}`} className=" flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
                                        <img
                                            src={`${item.image}`}
                                            alt={item.name}
                                            className="w-[300px] h-[200px] sm:w-[300px] sm:h-[200px] md:w-[300px] md:h-[200px] rounded-[8px] object-cover"
                                        />
                                    </Link>

                                    <div className="flex-grow flex flex-col sm:flex-row items-start sm:items-center gap-[8px] sm:gap-[12px] w-full">
                                        <div className="flex flex-col gap-[4px] sm:gap-[6px] md:gap-[8px] w-full sm:w-auto">
                                            <span className="text-[16px] sm:text-[14px] md:text-[16px] font-semibold text-[#0e0e53] break-words">
                                                {item.name}
                                            </span>
                                            {item.size && (
                                                <span className="text-[14px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                                                    {t("cart.size", { defaultValue: "Size" })}: {item.size}
                                                </span>
                                            )}
                                            <span className="text-[14px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                                                {t("cart.quantity", { defaultValue: "Quantity" })}: {item.quantity}
                                            </span>
                                            <span className="text-[16px] sm:text-[14px] md:text-[16px] font-semibold text-[#0e0e53] whitespace-nowrap">
                                                {numberFormatter.format(item.price * item.quantity)} {t("checkout.currency", { defaultValue: "AMD" })}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-1 sm:gap-2 md:gap-2 w-full sm:w-auto justify-start sm:justify-start">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1, item.category)}
                                                className="w-[24px] sm:w-[26px] md:w-[28px] h-[24px] sm:h-[26px] md:h-[28px] text-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition text-[12px] sm:text-[13px] md:text-[14px]"
                                                disabled={removeLoading === item.id}
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                readOnly
                                                className="w-[40px] sm:w-[46px] md:w-[48px] h-[24px] sm:h-[26px] md:h-[28px] text-center rounded bg-[#f7f7f7] text-[12px] sm:text-[13px] md:text-[14px]"
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.category)}
                                                className="w-[24px] sm:w-[26px] md:w-[28px] h-[24px] sm:h-[26px] md:h-[28px] bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition text-[12px] sm:text-[13px] md:text-[14px]"
                                                disabled={removeLoading === item.id}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px] flex flex-col gap-[8px] sm:gap-[10px] md:gap-[12px] mt-[16px] sm:mt-[20px] md:mt-[24px] p-[12px] sm:p-[16px] md:p-[20px] border-b border-gray-500">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500">
                                {t("cart.subtotal", { defaultValue: "Subtotal" })}
                            </span>
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500 whitespace-nowrap">
                                {numberFormatter.format(subtotal)} {t("checkout.currency", { defaultValue: "AMD" })}
                            </span>
                        </div>
                    </div>

                    <Link to={`/${lng}/all-products`}>
                        <button className="text-[#0a0a39] hover:text-white h-[28px] sm:h-[32px] md:h-[36px] rounded-[10px] bg-[#efeeee] mt-[12px] sm:mt-[16px] md:mt-[20px] font-semibold hover:bg-[#0a0a39] transition text-[12px] sm:text-[13px] md:text-[14px] px-4 sm:px-5 md:px-6">
                            {t("cart.continueShopping")}
                        </button>
                    </Link>

                    <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 justify-center items-center pt-[12px] sm:pt-[16px] md:pt-[20px]">
                        <span className="text-[12px] sm:text-[13px] md:text-[14px]">{t("cart.addNote")}</span>
                        <textarea
                            placeholder={t("contact.messagePlaceholder")}
                            className="p-[4px] sm:p-[6px] md:p-[8px] h-[80px] sm:h-[100px] md:h-[120px] w-[95%] sm:w-[90%] md:w-[500px] border border-gray-300 rounded"
                        />
                    </div>
                    <Link to={`/${lng}/checkout`}>
                        <button className="text-[#0a0a39] hover:text-white w-[80px] sm:w-[90px] md:w-[100px] h-[40px] sm:h-[50px] md:h-[60px] rounded-[10px] bg-[#efeeee] mt-[12px] sm:mt-[16px] md:mt-[20px] font-semibold hover:bg-[#0a0a39] transition text-[12px] sm:text-[13px] md:text-[14px]">
                            {t("cart.checkOut")}
                        </button>
                    </Link>
                    <p className="text-[11px] sm:text-[12px] md:text-[13px] text-gray-500 mt-[4px] sm:mt-[6px] md:mt-[8px]">
                        {t("cart.deliveryCalculatedInCheckout", { defaultValue: "Delivery cost is calculated in checkout" })}
                    </p>
                </>
            )}
        </div>
    );
};

export default Cart;