import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../Toolkit/slices/authSlice.js";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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

const ForgotPassword = () => {
    const { lng } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [email, setEmail] = useState("");
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => setEmail(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Sending forgot password request:", { email, lng }); // Debug log
        dispatch(forgotPassword({ email, lng })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                toast.success(t("forgotPassword.success") || "Password reset link sent to your email!");
                navigate(`/${lng}/login`);
            } else {
                toast.error(res.payload || t("forgotPassword.error") || "Failed to send reset link. Please try again.");
            }
        });
    };

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto py-[12px] sm:py-[16px] md:py-[20px] flex flex-col items-center justify-center">
            <style>{toastStyles}</style>
            <div className="text-center w-full">
                <h2 className="font-[Against] text-[24px] sm:text-[28px] md:text-[32px] p-[12px] sm:p-[16px] md:p-[20px] text-[#0e0e53]">
                    {t("forgotPassword.title") || "Reset Your Password"}
                </h2>
            </div>

            <div className="bg-[#efeeee] p-[16px] sm:p-[24px] md:p-[32px] m-[12px] sm:m-[16px] md:m-[20px] w-full max-w-[95%] sm:max-w-[90%] md:max-w-[500px] flex items-center justify-center rounded-[8px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                        {t("forgotPassword.header") || "Reset Your Password"}
                    </h2>

                    <input
                        type="email"
                        name="email"
                        placeholder={t("forgotPassword.email") || "Enter your email"}
                        className="p-[8px] sm:p-[10px] md:p-[12px] h-[36px] sm:h-[40px] md:h-[44px] w-full border border-[gray] rounded-[8px] text-[14px] sm:text-[15px] md:text-[16px] focus:outline-none focus:border-[#0e0e53]"
                        value={email}
                        onChange={handleChange}
                        autoComplete="email"
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
                        {t("forgotPassword.submit") || "Send Reset Link"}
                    </button>

                    <p className="text-[12px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                        {t("forgotPassword.backToLogin") || "Back to"}{" "}
                        <span
                            className="text-[#df7a7a] cursor-pointer hover:text-[#0a0a39] transition duration-300"
                            onClick={() => navigate(`/${lng}/login`)}
                        >
                            {t("forgotPassword.login") || "Login"}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;