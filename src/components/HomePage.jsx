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
import CollectionSection from "./CollectionSection.jsx";

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
                    : "https://res.cloudinary.com/dnies3wxf/image/upload/v1757759096/modelImg_1_kmmtnc.jpg";

                setCollectionName(response.data.collectionName || "Spring 2025");

                // Preload the image
                const img = new Image();
                img.src = imageUrl;
                img.onload = () => {
                    setHeroImage(imageUrl);
                    setImageLoaded(true);
                    setIsLoading(false);
                };
                img.onerror = () => {
                    setHeroImage("https://res.cloudinary.com/dnies3wxf/image/upload/v1757759096/modelImg_1_kmmtnc.jpg");
                    setImageLoaded(true);
                    setIsLoading(false);
                };
            } catch (error) {
                console.error("HomePage.jsx fetchAssets error:", error.message);
                setHeroImage("https://res.cloudinary.com/dnies3wxf/image/upload/v1757759096/modelImg_1_kmmtnc.jpg");
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
    const [collectionRef, collectionInView] = useInView({ triggerOnce: true, threshold: 0.2 });
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
                            src={heroImage}
                            alt="Hero Image"
                            className="w-full h-full sm:aspect-[16/9] md:aspect-[16/9] object-cover object-[center_20%]"
                            onLoad={handleImageLoad}
                            onError={() => {
                                setHeroImage("https://res.cloudinary.com/dnies3wxf/image/upload/v1757759096/modelImg_1_kmmtnc.jpg");
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
                className="w-full mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-0"
            >
                {isLoading ? (
                    <div className="h-[50vh] flex flex-col justify-center items-center">
                        <Skeleton width={200} height={40} className="mb-4" />
                        <div className="flex flex-col sm:flex-row flex-nowrap justify-center items-center gap-4 sm:gap-6 md:gap-[50px] overflow-hidden">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    width={150}
                                    height={150}
                                    className="rounded-[20px] flex-shrink-0"
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
                className="w-full sm:w-[90%] mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-0"
            >
                {isLoading ? (
                    <div className="h-[400px] sm:h-[500px] md:h-[558px] bg-[#efeeee] overflow-hidden">
                        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-[1fr_2fr] h-full gap-4">
                            <Skeleton
                                height={300}
                                className="rounded-[20px] w-full"
                            />
                            <div className="mt-4 sm:mt-6 md:mt-[50px] w-full px-4 sm:px-6 space-y-4 overflow-hidden">
                                <Skeleton
                                    width={200}
                                    height={30}
                                    className="rounded-[20px]"
                                />
                                <Skeleton count={4} height={20} className="rounded-[20px]" />
                                <Skeleton
                                    width={100}
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
                id="collections"
                ref={collectionRef}
                variants={sectionVariants}
                initial="hidden"
                animate={collectionInView ? "visible" : "hidden"}
                className="w-full sm:w-[90%] mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-0"
            >
                {isLoading ? (
                    <div className="h-[400px] bg-[#efeeee] overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Array(4).fill(null).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    height={300}
                                    className="rounded-[20px] w-full"
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <CollectionSection />
                )}
            </motion.div>

            <motion.div
                id="about"
                ref={aboutRef}
                variants={sectionVariants}
                initial="hidden"
                animate={aboutInView ? "visible" : "hidden"}
                className="w-full sm:w-[90%] mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-0"
            >
                {isLoading ? (
                    <div className="mt-4 sm:mt-6 md:mt-[50px] h-[400px] sm:h-[500px] md:h-[600px] bg-[#efeeee] overflow-hidden">
                        <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] h-full gap-4">
                            <div className="m-auto w-full space-y-4 px-4 sm:px-0 overflow-hidden">
                                <Skeleton
                                    width={200}
                                    height={40}
                                    className="rounded-[20px]"
                                />
                                <Skeleton count={5} height={20} className="rounded-[20px]" />
                            </div>
                            <Skeleton
                                height={300}
                                className="rounded-[20px] w-full"
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