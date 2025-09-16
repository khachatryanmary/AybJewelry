import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SectionNav from "./SectionNav.jsx";
import SectionGallery from "./SectionGallery.jsx";
import SectionAboutUs from "./SectionAboutUs.jsx";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export default function HomePage() {
    const location = useLocation();
    const { t } = useTranslation();
    const { lng } = useParams();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [heroImage, setHeroImage] = useState("");
    const [collectionName, setCollectionName] = useState("Spring 2025");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setIsLoading(true);
                setImageLoaded(false);
                const response = await axios.get(`${API_URL}/api/homepage-assets`, {
                    headers: {
                        "Cache-Control": "no-cache",
                    },
                });
                console.log("HomePage.jsx API response:", JSON.stringify(response.data, null, 2));
                const imageUrl = response.data.imageUrl
                    ? `${response.data.imageUrl}?t=${new Date().getTime()}`
                    : "/Uploads/homePage/modelImg.jpg";

                setCollectionName(response.data.collectionName || "Spring 2025");

                // Preload the image
                const img = new Image();
                img.src = `${API_URL}${imageUrl}`;
                img.onload = () => {
                    setHeroImage(imageUrl);
                    setImageLoaded(true);
                    setIsLoading(false);
                };
                img.onerror = () => {
                    setHeroImage("/Uploads/homePage/modelImg.jpg");
                    setImageLoaded(true);
                    setIsLoading(false);
                };
            } catch (error) {
                console.error("HomePage.jsx fetchAssets error:", error.message);
                setHeroImage("/Uploads/homePage/modelImg.jpg");
                setCollectionName("Spring 2025");
                setImageLoaded(true);
                setIsLoading(false);
            }
        };

        fetchAssets();
    }, [API_URL]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        setIsLoading(false);
    };

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace("#", "");
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            }, 100);
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [location]);

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const [navRef, navInView] = useInView({ triggerOnce: true, threshold: 0.2 });
    const [galleryRef, galleryInView] = useInView({ triggerOnce: true, threshold: 0.2 });
    const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.2 });

    const collectionSlug = collectionName.toLowerCase().replace(/\s+/g, '-');

    return (
        <SkeletonTheme baseColor="#efeeee" highlightColor="#d3d3d3">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-full h-screen md:min-h-[600px] relative overflow-hidden"
            >
                {isLoading ? (
                    <div className="w-full h-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[16/9]">
                        <Skeleton
                            height="100%"
                            width="100%"
                            style={{ display: "block", backgroundColor: "#efeeee" }}
                        />
                    </div>
                ) : (
                    <>
                        <img
                            src={`${API_URL}${heroImage}`}
                            alt="Hero Image"
                            className="w-full h-full sm:aspect-[16/9] md:aspect-[16/9] object-cover object-[center_20%]"
                            onLoad={handleImageLoad}
                            onError={() => {
                                setHeroImage("/Uploads/homePage/modelImg.jpg");
                                handleImageLoad();
                            }}
                        />
                        <Link
                            to={`/${lng}/${collectionSlug}`}
                            className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2
                                    px-4 py-2
                                    border border-white rounded-md
                                    text-center text-white text-[12px] sm:text-base md:text-lg font-semibold
                                    hover:bg-white hover:text-[#0e0e53]"
                        >
                            {t('featuredCollection.exploreCollection', { defaultValue: `Explore Collection` })}
                        </Link>

                    </>
                )}
            </motion.div>

            <motion.div
                id="nav"
                ref={navRef}
                variants={sectionVariants}
                initial="hidden"
                animate={navInView ? "visible" : "hidden"}
                className="w-full mx-auto py-4 sm:py-6 md:py-8"
            >
                {isLoading ? (
                    <div className="h-[50vh] flex flex-col justify-center items-center">
                        <Skeleton width={{ base: 200, sm: 250, md: 300 }} height={40} />
                        <div className="flex flex-col sm:flex-row flex-nowrap justify-center items-center gap-4 sm:gap-6 md:gap-[50px]">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    width={{ base: 150, sm: 180, md: 200 }}
                                    height={{ base: 150, sm: 180, md: 200 }}
                                    className="rounded-[20px]"
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <SectionNav />
                )}
            </motion.div>

            <motion.div
                id="gallery"
                ref={galleryRef}
                variants={sectionVariants}
                initial="hidden"
                animate={galleryInView ? "visible" : "hidden"}
                className="w-full sm:w-[90%] mx-auto py-4 sm:py-6 md:py-8"
            >
                {isLoading ? (
                    <div className="h-[400px] sm:h-[500px] md:h-[558px] bg-[#efeeee]">
                        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-[1fr_2fr] h-full">
                            <Skeleton
                                height={{ base: 300, sm: 400, md: 558 }}
                                className="rounded-[20px]"
                            />
                            <div className="mt-4 sm:mt-6 md:mt-[50px] w-full sm:w-[80%] px-4 sm:px-6 space-y-4">
                                <Skeleton
                                    width={{ base: 200, sm: 220, md: 250 }}
                                    height={30}
                                    className="rounded-[20px]"
                                />
                                <Skeleton count={4} height={20} className="rounded-[20px]" />
                                <Skeleton
                                    width={{ base: 100, sm: 120, md: 150 }}
                                    height={40}
                                    className="rounded-[20px]"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <SectionGallery />
                )}
            </motion.div>

            <motion.div
                id="about"
                ref={aboutRef}
                variants={sectionVariants}
                initial="hidden"
                animate={aboutInView ? "visible" : "hidden"}
                className="w-full sm:w-[90%] mx-auto py-4 sm:py-6 md:py-8"
            >
                {isLoading ? (
                    <div className="mt-4 sm:mt-6 md:mt-[50px] h-[400px] sm:h-[500px] md:h-[600px] bg-[#efeeee]">
                        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] h-full">
                            <div className="m-auto w-full sm:w-[80%] space-y-4 px-4 sm:px-0">
                                <Skeleton
                                    width={{ base: 200, sm: 250, md: 300 }}
                                    height={40}
                                    className="rounded-[20px]"
                                />
                                <Skeleton count={5} height={20} className="rounded-[20px]" />
                            </div>
                            <Skeleton
                                height={{ base: 300, sm: 400, md: 600 }}
                                className="rounded-[20px]"
                            />
                        </div>
                    </div>
                ) : (
                    <SectionAboutUs />
                )}
            </motion.div>
        </SkeletonTheme>
    );
}