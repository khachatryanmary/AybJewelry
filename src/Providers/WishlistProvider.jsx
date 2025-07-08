import React, {createContext, useContext, useState, useEffect} from "react";

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(()=>{
        const storedWishlist = localStorage.getItem("wishlist");
        return storedWishlist ? JSON.parse(storedWishlist) : [];
    });

    useEffect(() => {
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const addToWishlist = (item) => {
        setWishlist((prev) => {
            const exists = prev.find((product)=>product.id === item.id);
            if (!exists) {
                return [...prev, item]
            }
            return prev;
        })
    }

    const removeFromWishlist = (id) => {
        setWishlist((prev) => prev.filter((item) => item.id !== id))
    }

    const clearWishlist = () => {
        setWishlist([])
    }

    return(
        <WishlistContext.Provider value={{wishlist, addToWishlist, removeFromWishlist, clearWishlist}}>{children}</WishlistContext.Provider>
    )
}

export const useWishlist = () => useContext(WishlistContext);