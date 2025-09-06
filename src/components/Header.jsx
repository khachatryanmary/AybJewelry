import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import LocaleSwitcher from "./LocaleSwitcher.jsx";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { useContext } from "react";
import { UserContext } from "../Providers/UserContext";

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

const globalStyles = `
  body {
    padding-top: 60px; /* Ensures content starts below the fixed 60px header */
  }
  .no-scroll {
    overflow: hidden; /* Prevent scrolling when mobile menu is open */
  }
`;

function Header({ setSearchActive }) {
    const location = useLocation();
    const currentPath = location.pathname;
    const lng = location.pathname.split("/")[1];
    const { t, ready } = useTranslation();
    const { user, setUser } = useContext(UserContext);
    const [shopOpen, setShopOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const shopRef = useRef(null);

    // Update user state when localStorage changes
    useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem("loggedInUser")) || null);
        };
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [setUser]);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.classList.add("no-scroll");
        } else {
            document.body.classList.remove("no-scroll");
        }

        return () => {
            document.body.classList.remove("no-scroll");
        };
    }, [isMenuOpen]);

    // Close dropdown and menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (shopRef.current && !shopRef.current.contains(event.target)) {
                setShopOpen(false);
            }
            if (!event.target.closest(".burger-menu") && isMenuOpen) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isMenuOpen]);

    // Skeleton loader for nav items
    const SkeletonItem = ({ width }) => (
        <div
            className="bg-gray-300 animate-pulse rounded"
            style={{ width: `${width}px`, height: "20px" }}
        ></div>
    );

    // Shop items for dropdown
    const shopItems = ready
        ? [
            { key: "necklaces", label: t("sectionNav.necklaces") || "Necklaces" },
            { key: "rings", label: t("sectionNav.rings") || "Rings" },
            { key: "earrings", label: t("sectionNav.earrings") || "Earrings" },
            { key: "bracelets", label: t("sectionNav.bracelets") || "Bracelets" },
            { key: "hairclips", label: t("sectionNav.hairclips") || "Hairclips" },
            { key: "all-products", label: t("allProductsGallery.title") || "All Products" },
        ]
        : [];

    // Animation variants for the dropdown and burger menu
    const dropdownVariants = {
        hidden: { opacity: 0, y: -10, height: 0, transition: { duration: 0.3 } },
        visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.3 } },
    };

    const menuVariants = {
        hidden: { opacity: 0, x: "-100%", transition: { duration: 0.3 } },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    };

    const handleMenuItemClick = () => {
        setTimeout(() => {
            setShopOpen(false);
            setIsMenuOpen(false);
        }, 300);
    };

    return (
        <header className="bg-[#efeeee] w-full h-[60px] flex items-center fixed top-0 left-0 z-50">
            <style>{`${toastStyles}\n${globalStyles}`}</style>
            <div className="container w-[90%] mx-auto px-4 flex justify-between items-center">
                <Link to={`/${lng}`} className="flex items-center">
                    <img
                        src="/logos/ayb-jewelry-logo.png"
                        alt="Logo"
                        className="w-[40px] h-[25px] xs:w-[70px] xs:h-[50px] sm:w-[60px] sm:h-[35px] md:w-[70px] md:h-[40px]"
                    />
                </Link>

                <div className="flex items-center gap-[8px] sm:gap-[10px]">
                    {/* Cart and Search Icons for Small Screens */}
                    {!isMenuOpen && (
                        <ul className="md:hidden flex items-center gap-[8px] sm:gap-[10px] list-none">
                            <li
                                id="search-icon"
                                className="bi bi-search text-[20px] text-[#0e0e53] cursor-pointer hover:text-[white] transition"
                                onClick={() => setSearchActive(true)}
                            ></li>
                            <li>
                                <Link
                                    to={`/${lng}/cart`}
                                    state={{ from: currentPath }}
                                    className="bi bi-handbag text-[20px] text-[#0e0e53] hover:text-[white] transition"
                                />
                            </li>
                        </ul>
                    )}

                    {/* Burger Menu Icon for Small Screens */}
                    <button
                        className="block md:hidden text-[#0e0e53] text-[24px] bi bi-list cursor-pointer hover:text-[white] transition burger-menu"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={isMenuOpen}
                    ></button>

                    {/* Navigation for Medium and Larger Screens */}
                    <nav className="hidden md:block">
                        <ul className="flex items-center justify-around gap-[30px] relative">
                            {ready ? (
                                <>
                                    <li>
                                        <Link
                                            to={`/${lng}`}
                                            className="text-[#0e0e53] text-[18px] sm:text-[16px] xs:text-[14px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.home")}
                                        </Link>
                                    </li>
                                    <li
                                        ref={shopRef}
                                        className="relative"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                setShopOpen(!shopOpen);
                                            }
                                        }}
                                    >
                                        <span
                                            className="text-[#0e0e53] text-[18px] sm:text-[16px] xs:text-[14px] font-[Against] hover:text-[white] transition flex items-center gap-1 select-none"
                                            onClick={() => setShopOpen(!shopOpen)}
                                        >
                                            {t("nav.shop")}
                                        </span>
                                        <AnimatePresence>
                                            {shopOpen && (
                                                <motion.ul
                                                    variants={dropdownVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    className="absolute top-full left-0 mt-2 bg-[#efeeee] border border-gray-300 rounded shadow-lg min-w-[180px] z-50 overflow-hidden"
                                                >
                                                    {shopItems.map(({ key, label }) => (
                                                        <li
                                                            key={key}
                                                            className="px-4 py-2 hover:bg-[#0a0a39] hover:text-white transition"
                                                        >
                                                            <Link
                                                                to={`/${lng}/${key}`}
                                                                className="block w-full"
                                                                onClick={handleMenuItemClick}
                                                            >
                                                                {label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </li>
                                    <li>
                                        <a
                                            href={`/${lng}#about`}
                                            className="text-[#0e0e53] text-[18px] sm:text-[16px] xs:text-[14px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.about")}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={`/${lng}#gallery`}
                                            className="text-[#0e0e53] text-[18px] sm:text-[16px] xs:text-[14px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.newReleases")}
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            to={`/${lng}/contact`}
                                            className="text-[#0e0e53] text-[18px] sm:text-[16px] xs:text-[14px] font-[Against] hover:text-[white] transition"
                                        >
                                            {t("nav.contact")}
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <SkeletonItem width={{ base: 40, sm: 50, md: 50 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 50, sm: 60, md: 60 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 60, sm: 70, md: 70 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 80, sm: 90, md: 90 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 55, sm: 65, md: 65 }} />
                                    </li>
                                </>
                            )}
                        </ul>
                    </nav>

                    {/* Right-side Icons and LocaleSwitcher for Medium and Larger Screens */}
                    <ul className="hidden md:flex items-center gap-2 sm:gap-[10px] list-none ml-2 sm:ml-[10px]">
                        <li
                            id="search-icon"
                            className="bi bi-search text-[20px] text-[#0e0e53] cursor-pointer hover:text-[white] transition"
                            onClick={() => setSearchActive(true)}
                        ></li>
                        <li>
                            {user ? (
                                <Link
                                    to={`/${lng}/profile`}
                                    className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition cursor-pointer"
                                >
                                    {user.name || "User"}
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
                        <li>
                            <LocaleSwitcher />
                        </li>
                    </ul>
                </div>
            </div>

            {/* Burger Menu Content for Small Screens */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.nav
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="block md:hidden fixed top-[60px] left-0 w-screen h-[calc(100vh-60px)] bg-[#efeeee] z-50 burger-menu overflow-y-auto"
                    >
                        <ul className="flex flex-col items-start gap-4 px-6 py-4">
                            {ready ? (
                                <>
                                    <li>
                                        {user ? (
                                            <Link
                                                to={`/${lng}/profile`}
                                                className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                                onClick={handleMenuItemClick}
                                            >
                                                {user.name || "User"}
                                            </Link>
                                        ) : (
                                            <Link
                                                to={`/${lng}/login`}
                                                className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                                onClick={handleMenuItemClick}
                                            >
                                                <i className="bi bi-person mr-2"></i>{" "}
                                                {t("nav.login") || "Login"}
                                            </Link>
                                        )}
                                    </li>
                                    <li>
                                        <Link
                                            to={`/${lng}`}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                            onClick={handleMenuItemClick}
                                        >
                                            {t("nav.home")}
                                        </Link>
                                    </li>
                                    <li ref={shopRef} className="relative w-full">
                                        <span
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2 select-none"
                                            onClick={() => setShopOpen(!shopOpen)}
                                        >
                                            {t("nav.shop")}
                                        </span>
                                        <AnimatePresence>
                                            {shopOpen && (
                                                <motion.ul
                                                    variants={dropdownVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="hidden"
                                                    className="bg-[#efeeee] border border-gray-300 rounded shadow-lg w-full mt-1 ml-4"
                                                >
                                                    {shopItems.map(({ key, label }) => (
                                                        <li
                                                            key={key}
                                                            className="px-4 py-2 hover:bg-[#0a0a39] hover:text-white transition"
                                                        >
                                                            <Link
                                                                to={`/${lng}/${key}`}
                                                                className="block w-full"
                                                                onClick={handleMenuItemClick}
                                                            >
                                                                {label}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </li>
                                    <li>
                                        <a
                                            href={`/${lng}#about`}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                            onClick={handleMenuItemClick}
                                        >
                                            {t("nav.about")}
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href={`/${lng}#gallery`}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                            onClick={handleMenuItemClick}
                                        >
                                            {t("nav.newReleases")}
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            to={`/${lng}/contact`}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                            onClick={handleMenuItemClick}
                                        >
                                            {t("nav.contact")}
                                        </Link>
                                    </li>
                                    <li>
                                        <div
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2 cursor-pointer"
                                            onClick={() => {
                                                setSearchActive(true);
                                                handleMenuItemClick();
                                            }}
                                        >
                                            <i className="bi bi-search mr-2"></i>{" "}
                                            {t("nav.search") || "Search"}
                                        </div>
                                    </li>
                                    <li>
                                        <Link
                                            to={`/${lng}/cart`}
                                            state={{ from: currentPath }}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                            onClick={handleMenuItemClick}
                                        >
                                            <i className="bi bi-handbag mr-2"></i>{" "}
                                            {t("nav.cart") || "Cart"}
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={`/${lng}/wishlist`}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2"
                                            onClick={handleMenuItemClick}
                                        >
                                            <i className="bi bi-heart mr-2"></i>{" "}
                                            {t("nav.wishlist") || "Wishlist"}
                                        </Link>
                                    </li>
                                    <li className="w-full py-2">
                                        <LocaleSwitcher />
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 100, sm: 120, md: 120 }} />
                                    </li>
                                    <li>
                                        <SkeletonItem width={{ base: 150, sm: 180, md: 180 }} />
                                    </li>
                                </>
                            )}
                        </ul>
                    </motion.nav>
                )}
            </AnimatePresence>
        </header>
    );
}

export default Header;