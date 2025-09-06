import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const ResetPassword = () => {
    const { token, lng } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, { password });
            toast.success(t("resetPassword.success") || "Password reset successful!");
            navigate(`/${lng}/login`);
        } catch (err) {
            setError(err.response?.data?.message || t("resetPassword.error") || "Failed to reset password.");
            toast.error(err.response?.data?.message || t("resetPassword.error") || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto py-[12px] sm:py-[16px] md:py-[20px] flex flex-col items-center justify-center">
            <style>{toastStyles}</style>
            <div className="text-center w-full">
                <h2 className="font-[Against] text-[24px] sm:text-[28px] md:text-[32px] p-[12px] sm:p-[16px] md:p-[20px] text-[#0e0e53]">
                    {t("resetPassword.title") || "Set New Password"}
                </h2>
            </div>
            <div className="bg-[#efeeee] p-[16px] sm:p-[24px] md:p-[32px] m-[12px] sm:m-[16px] md:m-[20px] w-full max-w-[95%] sm:max-w-[90%] md:max-w-[500px] flex items-center justify-center rounded-[8px]">
                <form onSubmit={handleSubmit} className="flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] items-center justify-center text-center w-full">
                    <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                        {t("resetPassword.header") || "Set New Password"}
                    </h2>
                    <input
                        type="password"
                        placeholder={t("resetPassword.password") || "Enter new password"}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
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
                        {t("resetPassword.submit") || "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;