import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../Toolkit/slices/authSlice.js";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

const Profile = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state) => state.auth.user);
    const lng = location.pathname.split("/")[1]; // վերցնում ենք լեզուն /en/profile → en

    useEffect(() => {
        if (!user) {
            navigate(`/${lng}/`);
        }
    }, [user, navigate, lng]);

    if (!user) return null;

    return (
        <div className="w-[90%] mx-auto h-[400px] flex flex-col items-center justify-center">
            <h2 className="text-[28px] mb-[10px]">{t("profile.title")}</h2>

            <div className="bg-[#efeeee] h-[100%] w-[350px] text-center flex flex-col items-center justify-center gap-[20px]">
                <p className="text-[20px] mb-2">
                    <span>{t("profile.username")}:</span> {user.username}
                </p>
                <p className="text-[20px] mb-4">
                    <span>{t("profile.email")}:</span> {user.email}
                </p>

                <button
                    onClick={() => dispatch(logout())}
                    className="w-[90%] h-[40px] rounded-[10px] bg-[white] text-[#0a0a39] hover:bg-[#0a0a39] hover:text-[white] transition duration-300"
                >
                    {t("profile.logout")}
                </button>
            </div>
        </div>
    );
};

export default Profile;
