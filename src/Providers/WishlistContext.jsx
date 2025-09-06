import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { UserContext } from "./UserContext";
import { CartContext } from "./CartContext";
import { toast } from "react-toastify";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(UserContext);
    const { fetchCart } = useContext(CartContext);
    const { t } = useTranslation();
    const [wishlist, setWishlist] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchWishlist = useCallback(async () => {
        if (!user?.id) {
            // console.log("WishlistContext fetchWishlist: No userId, setting empty wishlist");
            setWishlist([]);
            return [];
        }
        try {
            // console.log("WishlistContext fetchWishlist userId:", user.id);
            const response = await axios.get(`${API_URL}/api/wishlist/${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            // console.log("WishlistContext fetchWishlist response:", JSON.stringify(response.data, null, 2));
            const wishlistItems = response.data.items || [];
            setWishlist(wishlistItems);
            return wishlistItems;
        } catch (err) {
            console.error("WishlistContext fetchWishlist error:", err.response?.data || err.message);
            toast.error(t("wishlist.fetchFailed", { defaultValue: "Failed to fetch wishlist" }));
            setWishlist([]);
            return [];
        }
    }, [user, t, API_URL]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    useEffect(() => {
        const handleCartUpdate = () => fetchWishlist();
        const handleWishlistUpdate = () => fetchWishlist();
        const handleUserLogout = () => setWishlist([]);
        window.addEventListener("cart-updated", handleCartUpdate);
        window.addEventListener("wishlist-updated", handleWishlistUpdate);
        window.addEventListener("user-logout", handleUserLogout);
        return () => {
            window.removeEventListener("cart-updated", handleCartUpdate);
            window.removeEventListener("wishlist-updated", handleWishlistUpdate);
            window.removeEventListener("user-logout", handleUserLogout);
        };
    }, [fetchWishlist]);

    const removeFromWishlist = useCallback(async (productId) => {
        if (!user?.id) return;
        try {
            console.log("WishlistContext removeFromWishlist request:", {
                userId: user.id,
                productId,
                url: `${API_URL}/api/wishlist/${user.id}/${productId}`,
            });
            await axios.delete(`${API_URL}/api/wishlist/${user.id}/${productId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setWishlist((prev) => prev.filter((item) => item._id !== productId));
            toast.info(t("wishlist.removeSuccess", { defaultValue: "Removed from wishlist" }));
            window.dispatchEvent(new Event("wishlist-updated"));
        } catch (err) {
            console.error("WishlistContext removeFromWishlist error:", err.response?.data || err.message);
            toast.error(t("wishlist.removeFailed", { defaultValue: "Failed to remove from wishlist" }));
        }
    }, [user, t, API_URL]);

    const clearWishlist = useCallback(async () => {
        if (!user?.id) return;
        try {
            console.log("WishlistContext clearWishlist request:", { url: `${API_URL}/api/wishlist/${user.id}` });
            await axios.delete(`${API_URL}/api/wishlist/${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setWishlist([]);
            toast.success(t("wishlist.clearSuccess", { defaultValue: "Wishlist cleared successfully" }));
            window.dispatchEvent(new Event("wishlist-updated"));
        } catch (err) {
            console.error("WishlistContext clearWishlist error:", err.response?.data || err.message);
            toast.error(t("wishlist.clearFailed", { defaultValue: "Failed to clear wishlist" }));
        }
    }, [user, t, API_URL]);

    const moveToCart = useCallback(async (product, size) => {
        if (!user?.id) return;
        try {
            console.log("WishlistContext moveToCart request:", {
                productId: product._id,
                size: size || "none",
                url: `${API_URL}/api/cart/${user.id}`,
            });
            await axios.post(
                `${API_URL}/api/cart/${user.id}`,
                {
                    productId: product._id,
                    size: product.category === "ring" ? size : undefined,
                },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            await axios.delete(`${API_URL}/api/wishlist/${user.id}/${product._id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setWishlist((prev) => prev.filter((item) => item._id !== product._id));
            toast.success(t("wishlist.moveToCartSuccess", { defaultValue: "Moved to cart successfully" }));
            window.dispatchEvent(new Event("cart-updated"));
            window.dispatchEvent(new Event("wishlist-updated"));
            await fetchCart();
        } catch (err) {
            console.error("WishlistContext moveToCart error:", err.response?.data || err.message);
            toast.error(t("wishlist.moveToCartFailed", { defaultValue: "Failed to move to cart" }));
        }
    }, [user, t, API_URL, fetchCart]);

    const toggleWishlist = useCallback(async (product) => {
        if (!user?.id) return;
        try {
            console.log("WishlistContext toggleWishlist request:", {
                productId: product._id,
                url: isWishlistItem(product._id) ? `${API_URL}/api/wishlist/${user.id}/${product._id}` : `${API_URL}/api/wishlist/${user.id}`,
            });
            if (isWishlistItem(product._id)) {
                await axios.delete(`${API_URL}/api/wishlist/${user.id}/${product._id}`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setWishlist((prev) => prev.filter((item) => item._id !== product._id));
                toast.info(t("allProductsGallery.removedFromWishlist", { defaultValue: `${product.name} removed from wishlist` }));
            } else {
                await axios.post(
                    `${API_URL}/api/wishlist/${user.id}`,
                    { productId: product._id },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
                setWishlist((prev) => [...prev, { _id: product._id, name: product.name, price: product.price, category: product.category, image: product.image }]);
                toast.success(t("allProductsGallery.addedToWishlist", { defaultValue: `${product.name} added to wishlist` }));
            }
            window.dispatchEvent(new Event("wishlist-updated"));
        } catch (err) {
            console.error("WishlistContext toggleWishlist error:", err.response?.data || err.message);
            toast.error(t("allProductsGallery.wishlistError", { defaultValue: "Error updating wishlist" }));
        }
    }, [user, t, API_URL, wishlist]);

    const isWishlistItem = useCallback((productId) => {
        return wishlist.some((item) => item._id === productId);
    }, [wishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, setWishlist, fetchWishlist, removeFromWishlist, clearWishlist, moveToCart, toggleWishlist, isWishlistItem }}>
            {children}
        </WishlistContext.Provider>
    );
};