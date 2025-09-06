import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SectionNav = () => {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();

    const navItems = [
        {
            to: "necklaces",
            img: "/images/NecklacesCover.jpg",
            alt: t('sectionNav.necklacesAlt'),
            text: t('sectionNav.necklaces'),
        },
        {
            to: "rings",
            img: "/images/RingsCover.jpg",
            alt: t('sectionNav.ringsAlt'),
            text: t('sectionNav.rings'),
        },
        {
            to: "earrings",
            img: "/images/EarringsCover.jpg",
            alt: t('sectionNav.earringsAlt'),
            text: t('sectionNav.earrings'),
        },
        {
            to: "bracelets",
            img: "/images/BraceletsCover.jpg",
            alt: t('sectionNav.braceletsAlt'),
            text: t('sectionNav.bracelets'),
        },
        {
            to: "hairclips",
            img: "/images/HairclipsCover.jpg",
            alt: t('sectionNav.hairclipsAlt'),
            text: t('sectionNav.hairclips'),
        },
    ];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        centerPadding: '0px', // Ensure only one image is fully visible
    };

    return (
        <div className="h-[50vh] flex flex-col gap-[40px] justify-center items-center">
            <h2
                id="secText"
                className="text-[28px] text-[#0a0a39] font-[Against] text-center"
            >
                {t('sectionNav.heading')}
            </h2>
            <div className="container w-[90%] h-[200px]">
                <div className="md:hidden">
                    <Slider {...sliderSettings}>
                        {navItems.map(({ to, img, alt, text }) => (
                            <Link
                                key={to}
                                to={`/${lng}/${to}`}
                                className="group relative w-[250px] h-[200px] flex items-center justify-center text-[white] mx-auto"
                            >
                                <img
                                    src={img}
                                    alt={alt}
                                    className="object-contain w-full h-full transition-transform duration-800 ease-in-out group-hover:opacity-50 group-hover:scale-110 cursor-pointer absolute"
                                />
                                <p className="text-white opacity-70 font-semibold italic text-[25px] z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    {text}
                                </p>
                            </Link>
                        ))}
                    </Slider>
                </div>
                <div className="hidden md:flex justify-center items-center gap-[50px] w-full h-[200px] flex-wrap">
                    {navItems.map(({ to, img, alt, text }) => (
                        <Link
                            key={to}
                            to={`/${lng}/${to}`}
                            className="group relative w-[200px] h-[200px] flex items-center justify-center text-[white]"
                        >
                            <img
                                src={img}
                                alt={alt}
                                className="object-contain w-full h-full transition-transform duration-800 ease-in-out group-hover:opacity-50 group-hover:scale-110 cursor-pointer absolute"
                            />
                            <p className="opacity-0 group-hover:opacity-100 text-white font-[Against] italic text-[25px] z-10 transition-opacity duration-1000">
                                {text}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SectionNav;