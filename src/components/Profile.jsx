// src/components/Profile.jsx
import React from "react";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";

const Profile = () => {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    if (!user) return <p>{t("profile.notLoggedIn")}</p>;

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
                    onClick={logout}
                    className="w-[90%] h-[40px] rounded-[10px] bg-[white] text-[#0a0a39] hover:bg-[#0a0a39] hover:text-[white] transition duration-300"
                >
                    {t("profile.logout")}
                </button>
            </div>
        </div>
    );
};

export default Profile;
