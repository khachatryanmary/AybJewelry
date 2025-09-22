import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CollectionSection = () => {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { t } = useTranslation();
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const containerRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${API_URL}/api/products`);

                if (!response.ok) {
                    throw new Error(`API error! Status: ${response.status}`);
                }

                const products = await response.json();

                // Group products by collection (excluding "Classic" and empty collections)
                const collectionsMap = new Map();

                products.forEach(product => {
                    const collection = product.productCollection?.trim();
                    if (collection && collection.toLowerCase() !== 'classic') {
                        if (!collectionsMap.has(collection)) {
                            collectionsMap.set(collection, {
                                name: collection,
                                products: [],
                                coverImage: null
                            });
                        }
                        collectionsMap.get(collection).products.push(product);
                    }
                });

                // Assign a random product image as cover
                collectionsMap.forEach(collection => {
                    if (collection.products.length > 0) {
                        const randomIndex = Math.floor(Math.random() * collection.products.length);
                        collection.coverImage = collection.products[randomIndex].image;
                    }
                });

                // Convert map to array and sort by name
                const collectionsArray = Array.from(collectionsMap.values())
                    .filter(collection => collection.products.length > 0)
                    .sort((a, b) => a.name.localeCompare(b.name));

                setCollections(collectionsArray);
            } catch (error) {
                console.error('Error fetching collections:', error);
                setCollections([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCollections();
    }, [API_URL]);

    // Track window width
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check if collections overflow the container
    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && collections.length > 0) {
                const containerWidth = containerRef.current.offsetWidth;
                let cardsPerRow;

                // Calculate cards per row based on screen width
                if (windowWidth >= 1024) {
                    cardsPerRow = Math.floor(containerWidth / 270); // 250px + 20px gap
                } else if (windowWidth >= 640) {
                    cardsPerRow = Math.floor(containerWidth / 270); // 2 columns on tablet
                } else {
                    cardsPerRow = 1; // Always use slider on mobile
                }

                setIsOverflowing(collections.length > cardsPerRow);
            }
        };

        // Add a small delay to ensure proper calculation
        const timer = setTimeout(checkOverflow, 100);
        return () => clearTimeout(timer);
    }, [collections, windowWidth]);

    const sliderSettings = {
        dots: true,
        infinite: collections.length > 3,
        speed: 500,
        slidesToShow: Math.min(collections.length, 4),
        slidesToScroll: 1,
        arrows: true,
        centerMode: false,
        variableWidth: false,
        focusOnSelect: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(collections.length, 3),
                    slidesToScroll: 1,
                    infinite: collections.length > 3,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: Math.min(collections.length, 2),
                    slidesToScroll: 1,
                    infinite: collections.length > 2,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    centerMode: true,
                    centerPadding: '20px',
                    infinite: collections.length > 1,
                }
            }
        ]
    };

    if (loading) {
        return (
            <div className="w-full py-[50px]">
                <div className="w-[90%] mx-auto">
                    <div className="h-[36px] w-[200px] bg-gray-300 rounded-md animate-pulse mx-auto mb-[40px]"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px]">
                        {Array(4).fill(null).map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="w-full h-[400px] bg-gray-300 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (collections.length === 0) {
        return null;
    }

    // Force slider on mobile/tablet or when overflowing
    const useSlider = windowWidth < 1024 || isOverflowing;

    return (
        <div className="w-full py-[50px] bg-gray-50">
            <div className="w-[90%] mx-auto">
                <div className="text-center mb-[40px]">
                    <h2 className="font-[Against] text-[30px] text-[#0e0e53] mb-2">
                        {t('collections.title', { defaultValue: 'Our Collections' })}
                    </h2>
                    <p className="text-[16px] text-gray-600">
                        {t('collections.subtitle', { defaultValue: 'Discover our curated collections' })}
                    </p>
                </div>

                {/* Mobile & Tablet slider */}
                <div className="md:hidden">
                    <Slider
                        dots={true}
                        infinite={true}
                        speed={500}
                        slidesToShow={1}
                        slidesToScroll={1}
                        arrows={true}
                        centerMode={true}
                        centerPadding="0px"
                    >
                        {collections.map(collection => {
                            const collectionSlug = collection.name.toLowerCase().replace(/\s+/g, '-');
                            return (
                                <Link
                                    key={collection.name}
                                    to={`/${lng}/collection/${collectionSlug}`}
                                    className="group relative w-[180px] h-[590px] flex items-center justify-center text-white mx-auto"
                                >
                                    <img
                                        src={collection.coverImage}
                                        alt={collection.name}
                                        className="object-cover w-full h-full transition-transform duration-800 ease-in-out group-hover:opacity-50 group-hover:scale-[1.02] cursor-pointer absolute rounded-lg"
                                        onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                    />
                                    <p className="text-white flex text-center opacity-70 font-[Against] italic text-[22px] z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        {collection.name.toUpperCase()}
                                    </p>
                                </Link>

                            );
                        })}
                    </Slider>
                </div>

                {/* Desktop grid */}
                <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] justify-items-center">
                    {collections.map(collection => {
                        const collectionSlug = collection.name.toLowerCase().replace(/\s+/g, '-');
                        return (
                            <Link
                                key={collection.name}
                                to={`/${lng}/collection/${collectionSlug}`}
                                className="group relative w-[250px] h-[400px] flex items-center justify-center text-white"
                            >
                                <img
                                    src={collection.coverImage}
                                    alt={collection.name}
                                    className="object-cover w-full h-full transition-transform duration-800 ease-in-out group-hover:opacity-50 group-hover:scale-110 cursor-pointer absolute rounded-lg"
                                    onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                />
                                <p className="opacity-0 group-hover:opacity-100 text-white font-[Against] italic text-[30px] z-10 transition-opacity duration-1000 text-center">
                                    {collection.name.toUpperCase()}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>

    );
};

export default CollectionSection;