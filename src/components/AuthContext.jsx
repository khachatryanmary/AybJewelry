// src/components/AuthContext.jsx
import React, { createContext, useContext, useState} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem("loggedInUser");
        return saved ? JSON.parse(saved) : null;
    });

    const register = ({ username, email, password }) => {
        const users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.find(u => u.email === email || u.username === username)) {
            return { success: false, message: "User already exists" };
        }

        const newUser = { id: Date.now(), username, email, password };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        return { success: true };
    };

    const login = (usernameOrEmail, password) => {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const foundUser = users.find(
            u =>
                (u.email === usernameOrEmail || u.username === usernameOrEmail) &&
                u.password === password
        );
        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
            return { success: true };
        }
        return { success: false, message: "Invalid credentials" };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("loggedInUser");
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
