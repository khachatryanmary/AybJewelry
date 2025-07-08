import React, { useState } from "react";
import { useAuth } from "../Providers/AuthContext.jsx";
import { useTranslation } from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";

const Register = () => {
    const {lng} = useParams();
    const { register } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState(null);

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        const result = register(form);
        if (result.success) {
            alert(t("register.success") || "Registration successful! You can login now.");
            navigate("/login");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            <div className="text-center w-full">
                <h2 className="font-[Against] italic text-[30px] p-[20px]">{t("register.title")}</h2>
            </div>

            <div className="bg-[#efeeee] p-[50px] m-[30px] w-[35%] h-[450px] flex items-center justify-center">
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-[20px] items-center justify-center text-center w-full"
                >
                    <h2 className="text-[25px] font-semibold">{t("register.register")}</h2>

                    <input
                        type="text"
                        name="username"
                        placeholder={t("register.username")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px]"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder={t("register.email")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px]"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder={t("register.password")}
                        className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px]"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    {error && <p className="text-red-600">{error}</p>}

                    <button
                        type="submit"
                        className="bg-[white] border-none rounded-[20px] h-[40px] w-[100%] transition duration-500 hover:text-[white] hover:bg-[#0a0a39] py-2 font-semibold"
                    >
                        {t("register.register")}
                    </button>

                    <p>
                        {t("register.haveAccount")}{" "}
                        <span
                            className="text-[#df7a7a] cursor-pointer hover:text-black"
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
