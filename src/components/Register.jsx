import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../Toolkit/slices/authSlice.js";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const Register = () => {
    const { lng } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, error, loading } = useSelector((state) => state.auth);
    const [form, setForm] = useState({ username: "", email: "", password: "" });

    const handleChange = (e) =>
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerUser(form));
    };

    useEffect(() => {
        if (user) {
            alert(t("register.success") || "Registration successful! You can login now.");
            navigate(`/${lng}/login`);
        }
    }, [user]);

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
                    {loading && <p className="text-blue-500">Loading...</p>}

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
