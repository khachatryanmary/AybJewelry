import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../Toolkit/slices/authSlice.js";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

const Login = () => {
    const { lng } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [form, setForm] = useState({ email: "", password: "" });
    const { user, error, loading } = useSelector((state) => state.auth);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ usernameOrEmail: form.email, password: form.password })).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
                toast.success(t("login.success") || "Logged in successfully!");
                navigate(`/${lng}`);
            } else {
                toast.error(res.payload?.message || t("login.error") || "Login failed. Please check your credentials.");
            }
        });
    };

    useEffect(() => {
        if (user) {
            navigate(`/${lng}`);
        }
    }, [user, lng, navigate]);

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center w-full">
                <h2 className="font-[Against] italic text-[30px] p-[20px] text-[#0e0e53]">
                    {t("login.myAccount")}
                </h2>
            </div>

            <div className="bg-[#efeeee] p-[50px] m-[30px] w-[35%] h-[400px] flex items-center justify-center rounded-[10px]">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[25px] font-semibold text-[#0e0e53]">
                        {t("login.login")}
                    </h2>

                    <input
                        type="email"
                        name="email"
                        placeholder={t("login.email")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t("login.password")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px] focus:outline-none focus:border-[#0e0e53]"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <div className="flex w-full items-center justify-around text-center text-[14px] text-[#0e0e53]">
                        <div className="flex items-center justify-center gap-[8px]">
                            <input type="checkbox" className="w-[20px] h-[20px]" />
                            <span>{t("login.rememberMe")}</span>
                        </div>
                        <div className="text-[#df7a7a] cursor-pointer hover:text-[#0a0a39] transition duration-300">
                            <span>{t("login.lostPassword")}</span>
                        </div>
                    </div>

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
                        {t("login.login")}
                    </button>

                    <p className="text-[14px] text-[#0e0e53]">
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