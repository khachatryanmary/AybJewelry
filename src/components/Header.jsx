import React, { useState, useEffect, useRef, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LocaleSwitcher from "./LocaleSwitcher.jsx";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../Providers/UserContext";
import { CartContext } from "../Providers/CartContext";

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
  @media (max-width: 767px) {
    .burger-menu {
      overflow-y: auto; /* Enable scrolling for mobile menu */
      max-height: calc(100dvh - 60px); /* Use dynamic viewport height */
      overscroll-behavior: contain; /* Prevent overscroll */
    }
  }
  .cart-badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: #efeeee;
    color: #0e0e53;
    font-family: 'Against', sans-serif;
    font-size: 10px;
    font-weight: 600;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  .cart-icon-container:hover .cart-badge {
    background-color: #0a0a39;
    color: white;
  }
  @media (min-width: 768px) {
    .cart-badge {
      font-size: 12px;
      width: 18px;
      height: 18px;
    }
  }
  /* Smooth scrolling for all devices */
  html {
    scroll-behavior: smooth;
  }
`;

function Header({ setSearchActive }) {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const lng = location.pathname.split("/")[1];
    const { t, ready } = useTranslation();
    const { user, setUser } = useContext(UserContext);
    const { cart } = useContext(CartContext);
    const [shopOpen, setShopOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const shopRef = useRef(null);

    // Calculate total cart items (sum of quantities)
    const cartItemCount = cart.reduce((acc, item) => acc + (item.quantity || 0), 0);

    // Improved scroll function that works better on mobile
    const scrollToSection = (sectionId) => {
        // Close mobile menu first
        setIsMenuOpen(false);

        // If we're not on the home page, navigate there first
        if (currentPath !== `/${lng}` && currentPath !== `/${lng}/`) {
            navigate(`/${lng}`);
            // Wait for navigation to complete, then scroll
            setTimeout(() => {
                performScroll(sectionId);
            }, 100);
        } else {
            performScroll(sectionId);
        }
    };

    const performScroll = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            // Calculate offset to account for fixed header
            const headerHeight = 60; // Your header height
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight - 20; // Extra 20px for better spacing

            // Use native scrollTo for better mobile compatibility
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Fallback for older browsers or if smooth scrolling doesn't work
            setTimeout(() => {
                if (Math.abs(window.pageYOffset - offsetPosition) > 50) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                        inline: 'nearest'
                    });
                }
            }, 50);
        }
    };

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

                            <li className="relative cart-icon-container">
                                <Link
                                    to={`/${lng}/cart`}
                                    state={{ from: currentPath }}
                                    className="bi bi-handbag text-[20px] text-[#0e0e53] hover:text-[white] transition"
                                />
                                {cartItemCount > 0 && (
                                    <span className="cart-badge">{cartItemCount}</span>
                                )}
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
                                        <button
                                            onClick={() => scrollToSection('about')}
                                            className="text-[#0e0e53] text-[18px] sm:text-[16px] xs:text-[14px] font-[Against] hover:text-[white] transition bg-transparent border-none cursor-pointer"
                                        >
                                            {t("nav.about")}
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => scrollToSection('gallery')}
                                            className="text-[#0e0e53] text-[18px] sm:text-[16px] xs:text-[14px] font-[Against] hover:text-[white] transition bg-transparent border-none cursor-pointer"
                                        >
                                            {t("nav.newReleases")}
                                        </button>
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
                        <li className="relative cart-icon-container">
                            <Link
                                to={`/${lng}/cart`}
                                state={{ from: currentPath }}
                                className="bi bi-handbag text-[20px] text-[#0e0e53] hover:text-[white] transition"
                            />
                            {cartItemCount > 0 && (
                                <span className="cart-badge">{cartItemCount}</span>
                            )}
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
                        className="block md:hidden fixed top-[60px] left-0 w-screen h-[calc(100dvh-60px)] bg-[#efeeee] z-50 burger-menu overflow-y-auto overscroll-contain"
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
                                        <button
                                            onClick={() => scrollToSection('gallery')}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2 text-left bg-transparent border-none cursor-pointer"
                                        >
                                            {t("nav.newReleases")}
                                        </button>
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
                                    <li className="relative cart-icon-container">
                                        <Link
                                            to={`/${lng}/cart`}
                                            state={{ from: currentPath }}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2 flex items-center"
                                            onClick={handleMenuItemClick}
                                        >
                                            <div className="relative inline-flex items-center">
                                                <i className="bi bi-handbag text-[24px] mr-2"></i>
                                                {cartItemCount > 0 && (
                                                    <span className="cart-badge absolute -top-2 -right-2 bg-[#df7a7a] text-white text-[12px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {cartItemCount}
                                                     </span>
                                                )}
                                            </div>
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
                                        <button
                                            onClick={() => scrollToSection('about')}
                                            className="text-[#0e0e53] text-[18px] font-semibold hover:text-[white] transition block w-full py-2 text-left bg-transparent border-none cursor-pointer"
                                        >
                                            {t("nav.about")}
                                        </button>
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