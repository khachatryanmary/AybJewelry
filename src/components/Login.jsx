import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";

const Login = () => {
    const { lng } = useParams();
    const { login } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
    const [error, setError] = useState(null);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = login(form.usernameOrEmail, form.password);
        if (result.success) {
            alert(t("login.loginSuccess") || "Logged in successfully!");
            navigate("/");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center w-full">
                <h2 className="font-[Against] italic text-[30px] p-[20px]">{t("login.myAccount")}</h2>
            </div>

            <div className="bg-[#efeeee] p-[50px] m-[30px] w-[35%] h-[400px] flex items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[25px] font-semibold">{t("login.login")}</h2>

                    <input
                        type="text"
                        name="usernameOrEmail"
                        placeholder={t("login.usernameOrEmail")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px]"
                        value={form.usernameOrEmail}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t("login.password")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px]"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <div className="flex w-full items-center justify-around text-center">
                        <div className="flex items-center justify-center gap-[8px]">
                            <input type="checkbox" className="w-[20px] h-[20px]" />
                            <span>{t("login.rememberMe")}</span>
                        </div>
                        <div className="text-[#df7a7a] cursor-pointer hover:text-black">
                            <span>{t("login.lostPassword")}</span>
                        </div>
                    </div>

                    {error && <p className="text-red-600">{error}</p>}

                    <button
                        type="submit"
                        className="bg-[white] border-none rounded-[20px] h-[40px] w-[100%] transition duration-500 hover:text-[white] hover:bg-[#0a0a39] py-2 font-semibold"
                    >
                        {t("login.logIn")}
                    </button>

                    <p>
                        {t("login.notMember")}{" "}
                        <span
                            className="text-[#df7a7a] cursor-pointer hover:text-black"
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
