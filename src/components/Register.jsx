import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

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

const Register = () => {
    const { lng } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value.trim() }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate inputs
        if (!form.firstName || form.firstName.length < 1) {
            setError(t("register.nameError") || "Name must be at least 1 character long");
            toast.error(t("register.nameError") || "Name must be at least 1 character long");
            setLoading(false);
            return;
        }
        if (!/^\S+@\S+\.\S+$/.test(form.email)) {
            setError(t("register.invalidEmail") || "Please enter a valid email address");
            toast.error(t("register.invalidEmail") || "Please enter a valid email address");
            setLoading(false);
            return;
        }
        if (form.password.length < 8 || !/^(?=.*[A-Za-z])(?=.*[0-9@#$%^&*]).*$/.test(form.password)) {
            setError(t("register.passwordError") || "Password must be at least 8 characters long and contain at least one letter and one number or special character");
            toast.error(t("register.passwordError") || "Password must be at least 8 characters long and contain at least one letter and one number or special character");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, {
                name: form.firstName.trim(),
                surname: form.lastName.trim(),
                email: form.email.trim().toLowerCase(),
                password: form.password,
            });
            toast.success(t("register.success") || "Registration successful! You can login now.");
            navigate(`/${lng}/login`);
        } catch (err) {
            const errorMessage = err.response?.data?.message || t("register.error") || "Registration failed. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
            console.error("Registration error:", err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto py-[12px] sm:py-[16px] md:py-[20px] flex flex-col items-center justify-center">
            <style>{toastStyles}</style>
            <div className="text-center w-full">
                <h2 className="font-[Against] text-[24px] sm:text-[28px] md:text-[32px] p-[12px] sm:p-[16px] md:p-[20px] text-[#0e0e53]">
                    {t("register.title")}
                </h2>
            </div>

            <div className="bg-[#efeeee] p-[16px] sm:p-[24px] md:p-[32px] m-[12px] sm:m-[16px] md:m-[20px] w-full max-w-[95%] sm:max-w-[90%] md:max-w-[500px] flex items-center justify-center rounded-[8px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                        {t("register.register")}
                    </h2>

                    <input
                        type="text"
                        name="firstName"
                        placeholder={t("register.firstName")}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder={t("register.lastName")}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.lastName}
                        onChange={handleChange}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder={t("register.email")}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t("register.password")}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

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
                        {t("register.register")}
                    </button>

                    <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                        {t("register.haveAccount")}{" "}
                        <span
                            className="text-[#df7a7a] cursor-pointer hover:text-[#0a0a39] transition duration-300"
                            onClick={() => navigate(`/${lng}/login`)}
                        >
                            {t("register.login")}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;