import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("loggedInUser")) || null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user));
        } else {
            localStorage.removeItem("loggedInUser");
        }
    }, [user]);

    useEffect(() => {
        const handleStorageChange = () => {
            const storedUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
            setUser(storedUser);
        };
        window.addEventListener("storage", handleStorageChange);
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const logout = async () => {
        try {
            if (user?.id) {
                console.log('Attempting to clear cart and wishlist for user:', user.id);
                await Promise.all([
                    axios.delete(`${API_URL}/api/cart/${user.id}`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }).catch(err => {
                        if (err.response?.status === 404) {
                            console.warn('Cart not found, continuing logout');
                            return null; // Ignore 404
                        }
                        console.error('Cart delete error:', err.response?.data || err.message);
                        throw err;
                    }),
                    axios.delete(`${API_URL}/api/wishlist/${user.id}`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    }).catch(err => {
                        if (err.response?.status === 404) {
                            console.warn('Wishlist not found, continuing logout');
                            return null; // Ignore 404
                        }
                        console.error('Wishlist delete error:', err.response?.data || err.message);
                        throw err;
                    }),
                ]);
                console.log("Cart and wishlist cleared on backend (or not found)");
            }
            localStorage.setItem("isLoggingOut", "true");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("adminToken"); // Clear admin token too
            setUser(null);
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new Event("user-logout"));
        } catch (err) {
            console.error("Logout error:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });
            throw err;
        } finally {
            setTimeout(() => localStorage.removeItem("isLoggingOut"), 1000);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};