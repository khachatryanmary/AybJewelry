import React from "react";
import { Link, useLocation } from "react-router-dom";
import LocaleSwitcher from "./LocaleSwitcher.jsx";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthContext";
import {useTheme} from "../Providers/useTheme.jsx";  // import your auth context hook

function Header({ setSearchActive }) {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();
    const { user } = useAuth();
    const {toggleTheme} = useTheme();
    return (
        <header className="bg-[#efeeee] w-full h-[60px] flex items-center dark:bg-[black]  ">
           <button onClick={toggleTheme}>
               Theme
           </button>

            <div className="container w-[90%] mx-auto px-4 flex justify-between items-center">
                <Link to={`/${lng}`} className="flex items-center">
                    <img
                        id="logo"
                        src="/images/ayb-logo.png"
                        alt="Logo"
                        className="w-[70px] h-[40px]"
                    />
                </Link>

                <div className="flex items-center justify-between">
                    <nav>
                        <ul className="flex items-center justify-around gap-[30px] ">
                            <li>
                                <Link
                                    to={`/${lng}`}
                                    className="text-[#0e0e53] text-[20px] font-[Against] hover:text-[white] transition"
                                >
                                    {t('nav.home')}
                                </Link>
                            </li>
                            <li>
                                <a
                                    href={`/${lng}#about`}
                                    className="text-[#0e0e53] text-[20px] font-[Against] hover:text-[white] transition"
                                >
                                    {t('nav.about')}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`/${lng}#gallery`}
                                    className="text-[#0e0e53] text-[20px] font-against hover:text-white transition"
                                >
                                    {t('nav.newReleases')}
                                </a>
                            </li>
                            <li>
                                <Link
                                    to={`/${lng}/contact`}
                                    className="text-[#0e0e53] text-[20px] font-against hover:text-white transition"
                                >
                                    {t('nav.contact')}
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Icons */}
                    <ul className="flex items-center gap-[10px] list-none">
                        <li
                            id="search-icon"
                            className="bi bi-search ml-[10px] text-[20px] text-[#0e0e53] cursor-pointer hover:text-white transition"
                            onClick={() => setSearchActive(true)}
                        ></li>
                        <li>
                            {user ? (
                                <Link
                                    to={`/${lng}/profile`}
                                    className="text-[#0e0e53] text-[18px] font-semibold hover:text-white transition cursor-pointer"
                                >
                                    {user.username || user.name}
                                </Link>
                            ) : (
                                <Link
                                    to={`/${lng}/login`}
                                    className="bi bi-person text-[25px] text-[#0e0e53] hover:text-white transition"
                                />
                            )}
                        </li>
                        <li>
                            <Link
                                to={`/${lng}/cart`}
                                className="bi bi-handbag text-[20px] text-[#0e0e53] hover:text-white transition"
                            />
                        </li>
                        <li>
                            <Link
                                to={`/${lng}/wishlist`}
                                className="bi bi-heart text-[20px] text-[#0e0e53] hover:text-white transition mr-[10px]"
                            />
                        </li>
                    </ul>

                    <LocaleSwitcher />
                </div>
            </div>
        </header>
    );
}

export default Header;
