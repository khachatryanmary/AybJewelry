import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        const storedWishlist = localStorage.getItem("wishlist");
        return storedWishlist ? JSON.parse(storedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (item) => {
        setWishlist((prev) => {
            const exists = prev.find((product) => product.id === item.id);
            if (!exists) {
                toast.success(`${item.name} ${'added to wishlist!'}`);  // Toast on add
                return [...prev, item];
            } else {
                toast.info(`${item.name} ${'is already in wishlist.'}`); // Optional: notify if already exists
                return prev;
            }
        });
    };

    const removeFromWishlist = (id) => {
        setWishlist((prev) => {
            const removedItem = prev.find((item) => item.id === id);
            if (removedItem) {
                toast.info(`${removedItem.name} ${'removed from wishlist.'}`); // Toast on remove
            }
            return prev.filter((item) => item.id !== id);
        });
    };

    const clearWishlist = () => {
        setWishlist([]);
        toast.info("Wishlist cleared."); // Optional toast on clear
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
