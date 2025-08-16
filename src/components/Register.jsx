import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../Toolkit/slices/authSlice.js";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
    const { lng } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, error, loading } = useSelector((state) => state.auth);
    const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const username = `${form.firstName} ${form.lastName}`.trim();
        if (!username || username.length < 3) {
            toast.error(t("register.usernameError") || "Full name must be at least 3 characters long");
            return;
        }
        dispatch(registerUser({ username, email: form.email, password: form.password })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                toast.success(t("register.success") || "Registration successful! You can login now.");
                navigate(`/${lng}/login`);
            } else {
                toast.error(res.payload?.message || t("register.error") || "Registration failed. Please try again.");
            }
        });
    };

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center w-full">
                <h2 className="font-[Against] italic text-[30px] p-[20px] text-[#0e0e53]">
                    {t("register.title")}
                </h2>
            </div>

            <div className="bg-[#efeeee] p-[50px] m-[30px] w-[35%] h-[500px] flex items-center justify-center rounded-[10px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[25px] font-semibold text-[#0e0e53]">
                        {t("register.register")}
                    </h2>

                    <input
                        type="text"
                        name="firstName"
                        placeholder={t("register.firstName")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.firstName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder={t("register.lastName")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.lastName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder={t("register.email")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t("register.password")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    {error && <p className="text-red-600 text-[14px]">{error}</p>}
                    {loading && (
                        <div className="flex justify-center items-center">
                            <div className="w-[24px] h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="bg-[white] border-none rounded-[20px] h-[40px] w-full transition duration-500 hover:text-white hover:bg-[#0a0a39] py-2 font-semibold text-[#0e0e53]"
                        disabled={loading}
                    >
                        {t("register.register")}
                    </button>

                    <p className="text-[14px] text-[#0e0e53]">
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