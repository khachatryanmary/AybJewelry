import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(UserContext);
    const { t } = useTranslation();
    const [cart, setCart] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchCart = useCallback(async () => {
        if (!user?.id) {
            console.log("CartContext fetchCart: No userId, setting empty cart");
            setCart([]);
            return [];
        }
        try {
            // console.log("CartContext fetchCart userId:", user.id);
            const response = await axios.get(`${API_URL}/api/cart/${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            // console.log("CartContext fetchCart response:", JSON.stringify(response.data, null, 2));
            const cartItems = response.data || [];
            setCart(cartItems);
            return cartItems;
        } catch (err) {
            console.error("CartContext addToCart error:", err.response?.data || err.message);
            toast.error(t("cart.fetchFailed", { defaultValue: "Failed to fetch cart" }));
            setCart([]);
            return [];
        }
    }, [user, t, API_URL]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    useEffect(() => {
        const handleUserLogout = () => {
            setCart([]);
        };
        window.addEventListener("user-logout", handleUserLogout);
        window.addEventListener("cart-updated", fetchCart);
        return () => {
            window.removeEventListener("user-logout", handleUserLogout);
            window.removeEventListener("cart-updated", fetchCart);
        };
    }, [fetchCart]);

    const addToCart = useCallback(async (productId, quantity, size) => {
        if (!user?.id) return;
        try {
            // console.log("CartContext addToCart request:", {
            //     productId,
            //     quantity,
            //     size: size || "none",
            //     url: `${API_URL}/api/cart/${user.id}`,
            // });
            await axios.post(
                `${API_URL}/api/cart/${user.id}`,
                { productId, quantity, size },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            await fetchCart();
            // toast.success(t("cart.addSuccess", { defaultValue: "Added to cart successfully" }));
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error("CartContext addToCart error:", err.response?.data || err.message);
            toast.error(t("cart.addFailed", { defaultValue: "Failed to add to cart" }));
        }
    }, [user, t, API_URL, fetchCart]);

    const removeFromCart = useCallback(async (productId, size) => {
        if (!user?.id) return;
        try {
            // console.log("CartContext removeFromCart request:", {
            //     productId,
            //     size: size || "none",
            //     url: `${API_URL}/api/cart/${user.id}/${productId}`,
            // });
            const params = size ? { size } : {};
            await axios.delete(`${API_URL}/api/cart/${user.id}/${productId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
                params,
            });
            await fetchCart();
            // toast.info(t("cart.removeSuccess", { defaultValue: "Removed from cart" }));
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error("CartContext removeFromCart error:", err.response?.data || err.message);
            toast.error(t("cart.removeFailed", { defaultValue: "Failed to remove from cart" }));
        }
    }, [user, t, API_URL, fetchCart]);

    const updateCartItem = useCallback(async (productId, quantity, size) => {
        if (!user?.id) return;
        try {
            // console.log("CartContext updateCartItem request:", {
            //     productId,
            //     quantity,
            //     size: size || "none",
            //     url: `${API_URL}/api/cart/${user.id}/${productId}`,
            // });
            await axios.put(
                `${API_URL}/api/cart/${user.id}/${productId}`,
                { quantity, size },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            await fetchCart();
            toast.info(t("cart.updateSuccess", { defaultValue: "Cart updated successfully" }));
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error("CartContext updateCartItem error:", err.response?.data || err.message);
            toast.error(t("cart.updateFailed", { defaultValue: "Failed to update cart" }));
        }
    }, [user, t, API_URL, fetchCart]);

    const clearCart = useCallback(async () => {
        if (!user?.id) return;
        try {
            // console.log("CartContext clearCart request:", { url: `${API_URL}/api/cart/${user.id}` });
            await axios.delete(`${API_URL}/api/cart/${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setCart([]);
            toast.success(t("cart.clearSuccess", { defaultValue: "Cart cleared successfully" }));
            window.dispatchEvent(new Event("cart-updated"));
        } catch (err) {
            console.error("CartContext clearCart error:", err.response?.data || err.message);
            toast.error(t("cart.clearFailed", { defaultValue: "Failed to clear cart" }));
        }
    }, [user, t, API_URL]);

    const isCartItem = useCallback((productId) => {
        return cart.some((item) => item.id === productId);
    }, [cart]);

    return (
        <CartContext.Provider
            value={{ cart, setCart, fetchCart, addToCart, removeFromCart, updateCartItem, clearCart, isCartItem }}
        >
            {children}
        </CartContext.Provider>
    );
};