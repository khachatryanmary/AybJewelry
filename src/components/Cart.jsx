import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart } from "../Toolkit/slices/cartSlice.js";

const Cart = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const fromPath = location.state?.from || `/${lng}/all-products`;

    const currentUser = useSelector((state) => state.auth.user);
    const cartItems = useSelector((state) => state.cart.cart);
    const userId = currentUser?.id;
    const API_URL = import.meta.env.VITE_API_URL;

    const [loading, setLoading] = useState(true);

    const categoryPathMap = {
        ring: "rings",
        bracelet: "bracelets",
        earring: "earrings",
        brooch: "brooches",
        necklace: "necklaces"
    };

    useEffect(() => {
        const fetchCart = async () => {
            if (!userId) {
                dispatch(setCart([]));
                setLoading(false);
                return;
            }
            try {
                console.log("Cart.jsx userId:", userId);
                const res = await axios.get(`${API_URL}/api/cart/${userId}`);
                console.log("Cart.jsx response data:", res.data);
                dispatch(setCart(res.data));
            } catch (error) {
                console.error("Failed to fetch cart:", error.response?.data || error.message);
                if (error.response?.status === 404) {
                    dispatch(setCart([]));
                    toast.info("No cart found – starting fresh!");
                } else {
                    toast.error("Failed to load cart");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [userId, API_URL, dispatch]);

    const total = cartItems.reduce(
        (acc, item) => acc + (item.price || 0) * item.quantity,
        0
    );

    const removeItem = async (productId, size) => {
        try {
            await axios.delete(`${API_URL}/api/cart/${userId}/${productId}?size=${size}`);
            dispatch(removeFromCart({ id: productId, size }));
            toast.info("Removed from cart");
        } catch (err) {
            console.error("Failed to remove item:", err.message);
            toast.error("Failed to remove item");
        }
    };

    const updateQuantity = async (productId, size, quantity) => {
        if (quantity < 1) return;
        try {
            await axios.patch(`${API_URL}/api/cart/${userId}/${productId}`, { quantity, size });
            if (quantity > cartItems.find(i => i.id === productId && i.size === size).quantity) {
                dispatch(increaseQuantity({ id: productId, size }));
            } else {
                dispatch(decreaseQuantity({ id: productId, size }));
            }
        } catch (err) {
            console.error("Failed to update quantity:", err.message);
            toast.error("Failed to update quantity");
        }
    };

    const clearCartAction = async () => {
        try {
            await axios.delete(`${API_URL}/api/cart/${userId}`);
            dispatch(clearCart());
            toast.info("Cart cleared");
        } catch (err) {
            console.error("Failed to clear cart:", err.message);
            toast.error("Failed to clear cart");
        }
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
                        <div className="flex items-center gap-2 w-[130px] justify-center">
                            <div className="w-[30px] h-[30px] bg-gray-200 rounded" />
                            <div className="w-[50px] h-[30px] bg-gray-200 rounded" />
                            <div className="w-[30px] h-[30px] bg-gray-200 rounded" />
                        </div>
                        <div className="w-[120px] h-[20px] bg-gray-200 rounded" />
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
                    <div className="w-full text-center border-b border-gray-300">
                        <h2 className="font-[Against] text-[30px] p-[20px] text-[#0a0a39]">{t("cart.cartTitle")}</h2>
                    </div>
                    <div className="h-[400px] flex flex-col items-center justify-center gap-[20px]">
                        <i className="bi bi-lock text-[70px] text-[#0a0a39]" />
                        <p className="text-[20px] text-[#0a0a39]">{t("cart.loginPrompt")}</p>
                        <Link to={`/${lng}/login`}>
                            <button className="w-[200px] h-[40px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white">
                                {t("cart.loginButton")}
                            </button>
                        </Link>
                    </div>
                </>
            ) : cartItems.length === 0 ? (
                <>
                    <div className="w-full text-center border-b border-gray-300">
                        <h2 className="font-[Against] text-[30px] p-[20px] text-[#0a0a39]">{t("cart.cartTitle")}</h2>
                    </div>
                    <div className="h-[400px] flex flex-col items-center justify-center gap-[20px]">
                        <i className="bi bi-handbag text-[70px] text-[#0a0a39]" />
                        <p className="text-[25px] text-black font-light">{t("cart.cartEmpty")}</p>
                        <Link to={fromPath}>
                            <button className="w-[200px] h-[40px] mt-[10px] bg-[#efeeee] border-none rounded-[10px] text-[#0a0a39] font-semibold transition duration-500 hover:bg-[#0a0a39] hover:text-white">
                                {t("cart.returnToShop")}
                            </button>
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="w-full flex justify-between items-center border-b border-gray-300 pb-[10px]">
                        <h2 className="font-[Against] text-[30px] p-[20px] text-[#0a0a39]">{t("cart.cartTitle")}</h2>
                        <button
                            onClick={clearCartAction}
                            className="hover:text-white w-[200px] h-[40px] rounded-[10px] bg-[#efeeee] text-[#0a0a39] font-semibold hover:bg-[#0a0a39] transition"
                        >
                            {t("cart.clearCart")}
                        </button>
                    </div>

                    <ul className="w-full mt-[40px] flex flex-col gap-[20px]">
                        {cartItems.map((item, i) => {
                            const category = item.category?.toLowerCase();
                            const pathCategory = categoryPathMap[category] || `${category}s`;

                            return (
                                <li key={`${item.id}-${item.size}`} className="flex justify-between items-center border border-gray-300 rounded p-[10px]">
                                    <Link to={`/${lng}/${pathCategory}/${item.id}`}>
                                        <img
                                            src={`${API_URL}${item.image}`}
                                            alt={item.name}
                                            className="w-[200px] h-auto object-contain"
                                        />
                                    </Link>

                                    <span className="text-[20px] w-[150px] min-h-[40px] flex items-center justify-start">
                                        {item.name} {item.size && `${t("cart.size")}: ${item.size}`}
                                    </span>

                                    <div className="flex items-center gap-2 w-[130px] justify-center">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                            className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            readOnly
                                            className="w-[50px] h-[30px] text-center rounded bg-[#f7f7f7]"
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                            className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="text-[20px] min-w-[120px]">{item.price * item.quantity} AMD</span>

                                    <button
                                        onClick={() => removeItem(item.id, item.size)}
                                        className="text-[#0a0a39] hover:text-white w-[150px] h-[40px] rounded-[10px] bg-[#efeeee] hover:bg-[#0a0a39] font-semibold transition"
                                    >
                                        {t("cart.removeCart")}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="w-full flex justify-between mt-[30px] p-[30px] border-t border-b border-gray-300">
                        <span className="text-[30px]">{t("cart.total")}</span>
                        <span className="text-[30px]">{total} AMD</span>
                    </div>

                    <Link to={fromPath}>
                        <button className="text-[#0a0a39] hover:text-white w-[230px] h-[40px] rounded-[10px] bg-[#efeeee] mt-[30px] font-semibold hover:bg-[#0a0a39] transition">
                            {t("cart.continueShopping")}
                        </button>
                    </Link>

                    <div className="flex flex-col gap-6 justify-center items-center pt-[30px]">
                        <span>{t("cart.addNote")}</span>
                        <textarea
                            placeholder={t("contact.messagePlaceholder")}
                            className="p-[10px] h-[150px] w-[500px] border border-gray-300"
                        />
                    </div>
                    <Link to={`/${lng}/checkout`}>
                        <button className="text-[#0a0a39] hover:text-white w-[120px] h-[70px] rounded-[10px] bg-[#efeeee] mt-[30px] font-semibold hover:bg-[#0a0a39] transition">
                            {t("cart.checkOut")}
                        </button>
                    </Link>
                </>
            )}
        </div>
    );
};

export default Cart;