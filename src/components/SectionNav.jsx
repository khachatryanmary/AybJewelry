import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SectionNav = () => {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();

    const navItems = [
        {
            to: "necklaces",
            img: "/images/NecklacesCover.jpg",
            alt: t('sectionNav.necklacesAlt'),
            text: t('sectionNav.necklaces')
        },
        {
            to: "rings",
            img: "/images/RingsCover.jpg",
            alt: t('sectionNav.ringsAlt'),
            text: t('sectionNav.rings')
        },
        {
            to: "earrings",
            img: "/images/EarringsCover.jpg",
            alt: t('sectionNav.earringsAlt'),
            text: t('sectionNav.earrings')
        },
        {
            to: "bracelets",
            img: "/images/BraceletsCover.jpg",
            alt: t('sectionNav.braceletsAlt'),
            text: t('sectionNav.bracelets')
        },
        {
            to: "brooches",
            img: "/images/BroochesCover.jpg",
            alt: t('sectionNav.broochesAlt'),
            text: t('sectionNav.brooches')
        }
    ];

    return (
        <div className="h-[60vh] flex flex-col justify-center items-center">
            <h2
                id="secText"
                className="text-[28px] text-[#0a0a39] font-[Against] italic font-light text-center"
            >
                {t('sectionNav.heading')}
            </h2>
            <div className="container flex justify-center items-center gap-[50px] w-[90%] h-[200px] flex-wrap">
                {navItems.map(({ to, img, alt, text }) => (
                    <Link key={to} to={`/${lng}/${to}`} className="group relative w-[200px] h-[200px] flex items-center justify-center text-[white]">
                        <img
                            src={img}
                            alt={alt}
                            className="object-contain w-full h-full transition-transform duration-800 ease-in-out group-hover:opacity-50 group-hover:scale-110 cursor-pointer absolute"
                        />
                        <p className="opacity-0 group-hover:opacity-100 text-white font-against italic font-light text-[25px] z-10 transition-opacity duration-1000">
                            {text}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SectionNav;
