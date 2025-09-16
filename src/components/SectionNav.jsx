import React, { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const API_URL = import.meta.env.VITE_API_URL;

const SectionNav = () => {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/api/categories`);
                const data = await response.json();
                // Map the fetched data to match the navItems structure
                const navItems = data.categories.map(category => ({
                    to: category.name.toLowerCase(),
                    img: category.image,
                    alt: t(`sectionNav.${category.name.toLowerCase()}Alt`),
                    text: t(`sectionNav.${category.name.toLowerCase()}`)
                }));
                setCategories(navItems);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, [t]);

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        centerMode: true,
        centerPadding: '0px',
    };

    return (
        <div className="h-[80vh] flex flex-col gap-[40px] justify-center items-center">
            <div className="container w-[90%] ">
                <div className="md:hidden">
                    <Slider {...sliderSettings}>
                        {categories.map(({ to, img, alt, text }) => (
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
                                <p className="text-white opacity-70 font-[Against] italic text-[25px] z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    {text}
                                </p>
                            </Link>
                        ))}
                    </Slider>
                </div>
                <div className="hidden md:flex justify-center items-center gap-[50px] w-full h-[200px] flex-wrap">
                    {categories.map(({ to, img, alt, text }) => (
                        <Link
                            key={to}
                            to={`/${lng}/${to}`}
                            className="text-center group relative w-[200px] h-[200px] flex items-center justify-center text-[white]"
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