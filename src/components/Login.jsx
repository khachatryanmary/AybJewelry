import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import axios from "axios";
import { UserContext } from "../Providers/UserContext";

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
      width: 320px;
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

const Login = () => {
    const { lng } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const { setUser } = useContext(UserContext);
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const user = JSON.parse(localStorage.getItem("loggedInUser")) || null;

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        localStorage.removeItem("isLoggingOut");

        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError(t("login.invalidEmail") || "Please enter a valid email address");
            toast.error(t("login.invalidEmail") || "Please enter a valid email address");
            setLoading(false);
            return;
        }

        try {
            console.log("Sending login request:", {
                email: form.email.trim().toLowerCase(),
                password: form.password,
                API_URL,
            });
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });
            const userData = response.data;
            console.log("Login response:", userData);
            localStorage.setItem("loggedInUser", JSON.stringify(userData));
            setUser(userData);
            window.dispatchEvent(new Event("storage"));

            // Fetch cart after login
            await axios.get(`${API_URL}/api/cart/${userData.id}`, {
                headers: { Authorization: `Bearer ${userData.token}` },
            });
            window.dispatchEvent(new Event("cart-updated"));

            toast.success(t("login.success") || "Logged in successfully!");
            navigate(`/${lng}`);
        } catch (err) {
            let errorMessage;

            // Handle different types of errors
            if (err.response?.status === 403) {
                // This is a ban error
                errorMessage = err.response.data.message || t("login.accountBanned") || "Your account has been banned. Please contact support.";
                toast.error(errorMessage, {
                    autoClose: 8000, // Show longer for ban messages
                    closeOnClick: true,
                    pauseOnHover: true
                });
            } else {
                // Regular login error
                errorMessage = err.response?.data?.message || t("login.error") || "Login failed. Please check your credentials.";
                toast.error(errorMessage);
            }

            console.error("Login error:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
            });

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && !localStorage.getItem("isLoggingOut")) {
            navigate(`/${lng}`);
        }
    }, [user, lng, navigate]);

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto py-[12px] sm:py-[16px] md:py-[20px] flex flex-col items-center justify-center">
            <style>{toastStyles}</style>
            <div className="text-center w-full">
                <h2 className="font-[Against] text-[24px] sm:text-[28px] md:text-[32px] p-[12px] sm:p-[16px] md:p-[20px] text-[#0e0e53]">
                    {t("login.myAccount")}
                </h2>
            </div>
            <div className="bg-[#efeeee] p-[16px] sm:p-[24px] md:p-[32px] m-[12px] sm:m-[16px] md:m-[20px] w-full max-w-[95%] sm:max-w-[90%] md:max-w-[500px] flex items-center justify-center rounded-[8px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                        {t("login.login")}
                    </h2>
                    <input
                        type="email"
                        name="email"
                        placeholder={t("login.email")}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />

                    {/* Password input with eye toggle */}
                    <div className="relative w-full">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder={t("login.password")}
                            className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53] pr-[40px]"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute right-[8px] sm:right-[10px] md:right-[12px] top-1/2 transform -translate-y-1/2 text-[#666] hover:text-[#0e0e53] transition-colors duration-200 focus:outline-none"
                        >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-[16px] sm:text-[18px]`}></i>
                        </button>
                    </div>

                    <div className="flex w-full items-center justify-around text-center text-[12px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                        <div className="flex items-center justify-center gap-[8px]">
                            <input
                                type="checkbox"
                                className="w-[16px] sm:w-[18px] md:w-[20px] h-[16px] sm:h-[18px] md:h-[20px]"
                            />
                            <span>{t("login.rememberMe")}</span>
                        </div>
                        <div
                            className="text-[#df7a7a] cursor-pointer hover:text-[#0a0a39] transition duration-300"
                            onClick={() => navigate(`/${lng}/forgot-password`)}
                        >
                            <span>{t("login.lostPassword")}</span>
                        </div>
                    </div>
                    {error && <p className="text-red-600 text-[12px] sm:text-[13px] md:text-[14px]">{error}</p>}
                    {loading && (
                        <div className="flex justify-center items-center">
                            <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-[white] border-none rounded-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full transition duration-500 hover:text-white hover:bg-[#0a0a39] py-[8px] sm:py-[10px] md:py-[12px] font-semibold text-[#0e0e53] text-[14px] sm:text-[15px] md:text-[16px]"
                        disabled={loading}
                    >
                        {t("login.login")}
                    </button>
                    <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                        {t("login.notMember")}{" "}
                        <span
                            className="text-[#df7a7a] cursor-pointer hover:text-[#0a0a39] transition duration-300"
                            onClick={() => navigate(`/${lng}/register`)}
                        >
                            {t("login.register")}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;