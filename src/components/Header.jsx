import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import LocaleSwitcher from "./LocaleSwitcher.jsx";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

function Header({ setSearchActive }) {
    const location = useLocation();
    const currentPath = location.pathname;
    const lng = location.pathname.split("/")[1];
    const { t, ready } = useTranslation();
    const user = useSelector((state) => state.auth.user);

    const [shopOpen, setShopOpen] = useState(false);
    const shopRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shopRef.current && !shopRef.current.contains(event.target)) {
                setShopOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Skeleton loader for nav items
    const SkeletonItem = ({ width }) => (
        <div
            className="bg-gray-300 animate-pulse rounded"
            style={{ width: `${width}px`, height: "20px" }}
        ></div>
    );

    // Only create shopItems when translations are ready
    const shopItems = ready
        ? [
            { key: "necklaces", label: t("sectionNav.necklaces") || "Necklaces" },
            { key: "rings", label: t("sectionNav.rings") || "Rings" },
            { key: "earrings", label: t("sectionNav.earrings") || "Earrings" },
            { key: "bracelets", label: t("sectionNav.bracelets") || "Bracelets" },
            { key: "brooches", label: t("sectionNav.brooches") || "Brooches" },
            { key: "all-products", label: t("allProductsGallery.title") || "All Products" },
        ]
        : [];

    return (
        <header className="bg-[#efeeee] w-full h-[60px] flex items-center">
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
                        <ul className="flex items-center justify-around gap-[30px] relative">
                            {ready ? (
                                <>
                                    <li>
                                        <Link
                                            to={`/${lng}`}
                                            className="text-[#0e0e53] text-[18px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.home")}
                                        </Link>
                                    </li>

                                    {/* Shop dropdown */}
                                    <li
                                        ref={shopRef}
                                        className="relative cursor-pointer"
                                        onClick={() => setShopOpen((open) => !open)}
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                setShopOpen((open) => !open);
                                            }
                                        }}
                                    >
                                        <span className="text-[#0e0e53] text-[18px] font-[Against] hover:text-[white] transition flex items-center gap-1 select-none">
                                            {t("nav.shop")}
                                        </span>

                                        {shopOpen && (
                                            <ul className="absolute top-full left-0 mt-2 bg-[#efeeee] border border-gray-300 rounded shadow-lg min-w-[180px] z-50">
                                                {shopItems.map(({ key, label }) => (
                                                    <li
                                                        key={key}
                                                        className="px-4 py-2 hover:bg-[#0a0a39] hover:text-white transition cursor-pointer"
                                                        onClick={() => setShopOpen(false)}
                                                    >
                                                        <Link to={`/${lng}/${key}`}>{label}</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>

                                    <li>
                                        <a
                                            href={`/${lng}#about`}
                                            className="text-[#0e0e53] text-[18px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.about")}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={`/${lng}#gallery`}
                                            className="text-[#0e0e53] text-[18px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.newReleases")}
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            to={`/${lng}/contact`}
                                            className="text-[#0e0e53] text-[18px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.contact")}
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li><SkeletonItem width={50} /></li>
                                    <li><SkeletonItem width={60} /></li>
                                    <li><SkeletonItem width={70} /></li>
                                    <li><SkeletonItem width={90} /></li>
                                    <li><SkeletonItem width={65} /></li>
                                </>
                            )}
                        </ul>
                    </nav>

                    <ul className="flex items-center gap-[10px] list-none">
                        <li
                            id="search-icon"
                            className="bi bi-search ml-[10px] text-[20px] text-[#0e0e53] cursor-pointer hover:text-[white] transition"
                            onClick={() => setSearchActive(true)}
                        ></li>

                        <li>
                            {user ? (
                                <Link
                                    to={`/${lng}/profile`}
                                    className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition cursor-pointer"
                                >
                                    {user.username?.split(" ")[0] || "User"}
                                </Link>
                            ) : (
                                <Link
                                    to={`/${lng}/login`}
                                    className="bi bi-person text-[25px] text-[#0e0e53] hover:text-[white] transition"
                                />
                            )}
                        </li>

                        <li>
                            <Link
                                to={`/${lng}/cart`}
                                state={{ from: currentPath }}
                                className="bi bi-handbag text-[20px] text-[#0e0e53] hover:text-[white] transition"
                            />
                        </li>
                        <li>
                            <Link
                                to={`/${lng}/wishlist`}
                                className="bi bi-heart text-[20px] text-[#0e0e53] hover:text-[white] transition mr-[10px]"
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