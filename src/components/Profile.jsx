import React, { useEffect, useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import { UserContext } from "../Providers/UserContext";
import { toast } from "react-toastify";

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
.Toastify__close-button {
        font-size: 14px;
    }
}
@media (min-width: 640px) and (max-width: 767px) {
.Toastify__toast {
        width: N/A320px;
        font-size: 15px;
        padding: 10px 14px;
        line-height: 1.5;
    }
.Toastify__toast-body {
        padding: 6px;
    }
.Toastify__close-button {
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
.Toastify__close-button {
        font-size: 16px;
    }
}
`;

const Profile = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const API_URL = import.meta.env.VITE_API_URL;
    const { user, setUser, logout } = useContext(UserContext);
    const lng = location.pathname.split("/")[1];
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || "",
        surname: user?.surname || "",
    });
    const [profileError, setProfileError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const orders = [];

    useEffect(() => {
        if (!user) {
            navigate(`/${lng}/`);
        }
    }, [user, navigate, lng]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleUpdateProfile = async () => {
        if (!form.name || form.name.length < 1) {
            setProfileError(t("profile.nameError") || "Name must be at least 1 character long");
            toast.error(t("profile.nameError") || "Name must be at least 1 character long");
            return;
        }
        try {
            setIsLoading(true);
            setProfileError(null);
            console.log("Sending update request:", { name: form.name, surname: form.surname, token: user.token });
            const { data } = await axios.patch(
                `${API_URL}/api/auth/update-profile`,
                { name: form.name, surname: form.surname },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            console.log("Update response:", data);
            const updatedUser = { ...user, name: data.name, surname: data.surname };
            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
            setForm({ name: data.name, surname: data.surname });
            setIsEditingProfile(false);
            toast.success(t("profile.updateSuccess") || "Profile updated successfully!");
            setUser(updatedUser);
            window.dispatchEvent(new Event("storage"));
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("profile.updateFailed") || "Failed to update profile";
            console.error("Update error:", err.response?.data || err);
            if (err.response?.status === 401) {
                localStorage.removeItem("loggedInUser");
                navigate(`/${lng}/login`);
                toast.error(t("profile.sessionExpired") || "Session expired. Please log in again.");
            } else {
                setProfileError(errorMessage);
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setForm({
            name: user?.name || "",
            surname: user?.surname || "",
        });
        setIsEditingProfile(false);
        setProfileError(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate(`/${lng}/`);
            toast.success(t("profile.logoutSuccess") || "Logged out successfully!");
        } catch (err) {
            toast.error(t("profile.logoutFailed") || "Failed to log out");
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto py-[12px] sm:py-[16px] md:py-[20px] flex flex-col gap-[30px] sm:gap-[16px] md:gap-[20px]">
            <style>{toastStyles}</style>
            <div className="w-full flex justify-end items-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
                <Link
                    to={`/${lng}/wishlist`}
                    className="flex items-center gap-2 text-[14px] sm:text-[16px] md:text-[18px] font-medium text-[#0a0a39] hover:text-[#555] transition-colors duration-300"
                >
                    {t("profile.wishlist")}
                </Link>
                <Link
                    to={`/${lng}/cart`}
                    className="flex items-center gap-2 text-[14px] sm:text-[16px] md:text-[18px] font-medium text-[#0a0a39] hover:text-[#555] transition-colors duration-300"
                >
                    {t("profile.cart")}
                </Link>
                <button
                    onClick={handleLogout}
                    className="bg-[#efeeee] w-[100px] sm:w-[120px] md:w-[140px] h-[28px] sm:h-[32px] md:h-[36px] text-[#0e0e53] px-[8px] sm:px-[10px] md:px-[12px] py-[6px] sm:py-[7px] md:py-[8px] rounded-[8px] hover:bg-[#0a0a39] hover:text-white transition-colors duration-300 text-[14px] sm:text-[13px] md:text-[14px] flex items-center justify-center gap-[4px] sm:gap-[6px] md:gap-[8px]"
                >
                    <i className="bi bi-box-arrow-right text-[16px] sm:text-[18px] md:text-[20px]"></i>
                    {t("profile.logout")}
                </button>
            </div>
            <div className="flex flex-col gap-6">
                <h3 className="font-[Against] text-[20px] sm:text-[22px] md:text-[24px] text-[#0a0a39]">
                    {t("profile.title")}
                </h3>
                <div className="w-full bg-[#efeeee] rounded-[8px] p-[12px] sm:p-[16px] md:p-[20px] flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px]">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[12px] sm:text-[13px] md:text-[14px] font-medium">
                            {t("profile.name")}
                        </span>
                        {isEditingProfile ? (
                            <div className="flex flex-col gap-[8px] sm:gap-[10px] md:gap-[12px]">
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="text-[#0a0a39] text-[14px] sm:text-[15px] md:text-[16px] p-[8px] sm:p-[10px] md:p-[12px] border border-gray-300 rounded-[8px] focus:outline-none focus:border-[#0e0e53]"
                                    placeholder={t("profile.name")}
                                    required
                                />
                                <input
                                    type="text"
                                    name="surname"
                                    value={form.surname}
                                    onChange={handleChange}
                                    className="text-[#0a0a39] text-[14px] sm:text-[15px] md:text-[16px] p-[8px] sm:p-[10px] md:p-[12px] border border-gray-300 rounded-[8px] focus:outline-none focus:border-[#0e0e53]"
                                    placeholder={t("profile.surname")}
                                />
                                {profileError && (
                                    <span className="text-red-600 text-[12px] sm:text-[13px] md:text-[14px]">
                                        {profileError}
                                    </span>
                                )}
                                {isLoading && (
                                    <div className="flex justify-center items-center">
                                        <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="flex gap-[8px] sm:gap-[10px] md:gap-[12px]">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="bg-[#0a0a39] w-[100px] sm:w-[120px] md:w-[140px] h-[28px] sm:h-[32px] md:h-[36px] text-white px-[8px] sm:px-[10px] md:px-[12px] py-[6px] sm:py-[7px] md:py-[8px] rounded-[8px] hover:bg-[#555] transition-colors duration-300 text-[14px] sm:text-[15px] md:text-[16px]"
                                        disabled={isLoading}
                                    >
                                        {t("profile.save")}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-white w-[100px] sm:w-[120px] md:w-[140px] h-[28px] sm:h-[32px] md:h-[36px] text-[#0e0e53] px-[8px] sm:px-[10px] md:px-[12px] py-[6px] sm:py-[7px] md:py-[8px] rounded-[8px] hover:bg-[#efeeee] transition-colors duration-300 text-[14px] sm:text-[15px] md:text-[16px]"
                                        disabled={isLoading}
                                    >
                                        {t("profile.cancel")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-[8px] sm:gap-[10px] md:gap-[12px]">
                                <span className="text-[#0a0a39] text-[16px] sm:text-[18px] md:text-[20px]">
                                    {user.name} {user.surname}
                                </span>
                                <button
                                    onClick={() => setIsEditingProfile(true)}
                                    className="text-[#0e0e53] hover:text-[#555] transition-colors duration-300"
                                >
                                    <FaEdit className="text-[16px] sm:text-[18px] md:text-[20px]" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-[12px] sm:text-[13px] md:text-[14px] font-medium">
                            {t("profile.email")}
                        </span>
                        <span className="text-[#0a0a39] text-[16px] sm:text-[18px] md:text-[20px]">
                            {user.email}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-6">
                <h3 className="font-[Against] text-[20px] sm:text-[22px] md:text-[24px] text-[#0a0a39]">
                    {t("profile.orders")}
                </h3>
                <div className="w-full bg-[#efeeee] rounded-[8px] p-[12px] sm:p-[16px] md:p-[20px] flex flex-col items-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] justify-center">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center gap-[8px] sm:gap-[12px] md:gap-[16px]">
                            <i className="bi bi-box-seam text-[40px] sm:text-[48px] md:text-[56px] text-[#0e0e53]"></i>
                            <p className="text-[14px] sm:text-[16px] md:text-[18px] text-gray-600 font-light">
                                {t("profile.noOrders")}
                            </p>
                            <Link
                                to={`/${lng}/all-products`}
                                className="bg-white text-[#0e0e53] hover:bg-[#0a0a39] hover:text-white transition-colors duration-300 rounded-[8px] px-[12px] sm:px-[16px] md:px-[20px] py-[6px] sm:py-[7px] md:py-[8px] text-[14px] sm:text-[15px] md:text-[16px]"
                            >
                                {t("profile.returnToShop")}
                            </Link>
                        </div>
                    ) : (
                        <ul className="w-full space-y-[8px] sm:space-y-[10px] md:space-y-[12px]">
                            {orders.map((order) => (
                                <li
                                    key={order.id}
                                    className="bg-white p-[8px] sm:p-[10px] md:p-[12px] rounded-[8px] shadow-sm text-[14px] sm:text-[15px] md:text-[16px]"
                                >
                                    Order #{order.id} - {order.total} AMD
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;