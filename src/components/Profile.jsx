import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, setUser } from "../Toolkit/slices/authSlice";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaUserCircle, FaEdit } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";

const Profile = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state) => state.auth.user);
    const lng = location.pathname.split("/")[1];
    const API_URL = import.meta.env.VITE_API_URL;

    const [showDropdown, setShowDropdown] = useState(false);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [form, setForm] = useState({
        firstName: user?.username?.split(" ")[0] || "",
        lastName: user?.username?.split(" ").slice(1).join(" ") || "",
    });
    const [usernameError, setUsernameError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const orders = [];

    useEffect(() => {
        if (!user) {
            navigate(`/${lng}/`);
        }
    }, [user, navigate, lng]);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleUpdateUsername = async () => {
        const username = `${form.firstName} ${form.lastName}`.trim();
        if (!username || username.length < 3) {
            setUsernameError(t("profile.usernameError") || "Full name must be at least 3 characters long");
            toast.error(t("profile.usernameError") || "Full name must be at least 3 characters long");
            return;
        }
        try {
            setIsLoading(true);
            console.log("Sending update request:", { username, token: user.token });
            const { data } = await axios.patch(
                `${API_URL}/api/auth/update-username`,
                { username },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            console.log("Update response:", data);
            dispatch(setUser({ ...user, username: data.username }));
            localStorage.setItem("loggedInUser", JSON.stringify({ ...user, username: data.username }));
            setIsEditingUsername(false);
            setUsernameError(null);
            toast.success(t("profile.updateSuccess") || "Username updated successfully!");
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("profile.updateFailed") || "Failed to update username";
            console.error("Update error:", err.response?.data || err);
            setUsernameError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setForm({
            firstName: user.username?.split(" ")[0] || "",
            lastName: user.username?.split(" ").slice(1).join(" ") || "",
        });
        setIsEditingUsername(false);
        setUsernameError(null);
    };

    if (!user) return null;

    return (
        <div className="min-h-[80vh] w-[90%] mx-auto py-8 flex flex-col gap-8">
            {/* Header with Wishlist, Cart, and Profile Dropdown */}
            <div className="flex justify-end items-center relative">
                <div className="flex items-center gap-6">
                    <Link
                        to={`/${lng}/wishlist`}
                        className="flex items-center gap-2 text-lg font-medium text-[#0a0a39] hover:text-[#555] transition-colors duration-300"
                    >
                        <i className="bi bi-heart text-lg"></i>
                        {t("wishlist.wishlist")}
                    </Link>
                    <Link
                        to={`/${lng}/cart`}
                        className="flex items-center gap-2 text-lg font-medium text-[#0a0a39] hover:text-[#555] transition-colors duration-300"
                    >
                        <i className="bi bi-handbag text-lg"></i>
                        {t("cartTitle")}
                    </Link>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="text-[#0a0a39] hover:text-[#555] transition-colors duration-300"
                    >
                        <FaUserCircle className="text-3xl" />
                    </button>
                </div>
                {showDropdown && (
                    <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-40">
                        <button
                            onClick={() => dispatch(logout())}
                            className="w-full px-4 py-2 text-red-500 hover:bg-[#efeeee] rounded-lg transition-colors duration-300"
                        >
                            {t("profile.logout")}
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Information */}
            <div>
                <h3 className="font-[Against] italic text-3xl text-[#0e0e53] mb-6">
                    {t("profile.title")}
                </h3>
                <div className="w-full mx-auto bg-[#efeeee] rounded-[10px] p-6 flex flex-col gap-4">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">
                            {t("profile.name")}
                        </span>
                        {isEditingUsername ? (
                            <div className="flex flex-col gap-2">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    className="text-[#0a0a39] text-lg p-2 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                                    placeholder={t("profile.firstName")}
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    className="text-[#0a0a39] text-lg p-2 border border-gray-300 rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                                    placeholder={t("profile.lastName")}
                                />
                                {usernameError && (
                                    <span className="text-red-600 text-[14px]">
                                        {usernameError}
                                    </span>
                                )}
                                {isLoading && (
                                    <div className="flex justify-center items-center">
                                        <div className="w-[24px] h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateUsername}
                                        className="bg-[#0a0a39] w-[120px] text-white px-4 py-2 rounded-[10px] hover:bg-[#555] transition-colors duration-300"
                                        disabled={isLoading}
                                    >
                                        {t("profile.save")}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-white w-[120px] text-[#0e0e53] px-4 py-2 rounded-[10px] hover:bg-[#efeeee] transition-colors duration-300"
                                        disabled={isLoading}
                                    >
                                        {t("profile.cancel")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-[#0a0a39] text-lg">
                                    {user.username}
                                </span>
                                <button
                                    onClick={() => setIsEditingUsername(true)}
                                    className="text-[#0e0e53] hover:text-[#555] transition-colors duration-300"
                                >
                                    <FaEdit className="text-lg" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-sm font-medium">
                            {t("profile.email")}
                        </span>
                        <span className="text-[#0a0a39] text-lg">
                            {user.email}
                        </span>
                    </div>
                </div>
            </div>

            {/* Orders Section */}
            <div>
                <h3 className="font-[Against] italic text-3xl text-[#0e0e53] mb-6">
                    {t("profile.orders")}
                </h3>
                <div className="w-full mx-auto bg-[#efeeee] rounded-[10px] p-6 flex flex-col items-center min-h-[200px] justify-center">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center gap-4">
                            <i className="bi bi-box-seam text-5xl text-[#0e0e53]"></i>
                            <p className="text-lg text-gray-600 font-light">
                                {t("profile.noOrders")}
                            </p>
                            <Link
                                to={`/${lng}/all-products`}
                                className="bg-white text-[#0e0e53] hover:bg-[#0a0a39] hover:text-white transition-colors duration-300 rounded-[10px] px-6 py-2"
                            >
                                {t("returnToShop")}
                            </Link>
                        </div>
                    ) : (
                        <ul className="w-full space-y-4">
                            {orders.map((order) => (
                                <li
                                    key={order.id}
                                    className="bg-white p-4 rounded-[10px] shadow-sm"
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