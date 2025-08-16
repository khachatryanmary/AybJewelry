import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import SectionNav from "./SectionNav.jsx";
import SectionGallery from "./SectionGallery.jsx";
import SectionAboutUs from "./SectionAboutUs.jsx";

export default function HomePage() {
    const location = useLocation();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading (replace with API calls if needed)
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Scroll to hash or top
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

    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    // Intersection observer hooks
    const [navRef, navInView] = useInView({ triggerOnce: true, threshold: 0.2 });
    const [galleryRef, galleryInView] = useInView({ triggerOnce: true, threshold: 0.2 });
    const [aboutRef, aboutInView] = useInView({ triggerOnce: true, threshold: 0.2 });

    return (
        <SkeletonTheme baseColor="#efeeee" highlightColor="#d3d3d3">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="w-full"
            >
                {!imageLoaded && (
                    <Skeleton
                        height={600}
                        className="w-full"
                        style={{ backgroundColor: "#efeeee" }}
                    />
                )}
                <img
                    src="/images/modelImg.jpg"
                    alt="Hero Image"
                    className={`w-full object-cover ${imageLoaded ? "block" : "hidden"}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageLoaded(true)}
                />
            </motion.div>

            <motion.div
                id="nav"
                ref={navRef}
                variants={sectionVariants}
                initial="hidden"
                animate={navInView ? "visible" : "hidden"}
                className="w-full mx-auto py-8"
            >
                {isLoading ? (
                    <div className="h-[50vh] flex flex-col justify-center items-center">
                        <Skeleton width={300} height={40} />
                        <div className="flex flex-row flex-nowrap justify-center items-center gap-[50px]">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton
                                    key={i}
                                    width={200}
                                    height={200}
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
                className="w-[90%] mx-auto py-8"
            >
                {isLoading ? (
                    <div className="h-[558px] bg-[#efeeee]">
                        <div className="max-w-[1200px] mx-auto grid grid-cols-[1fr_2fr] h-full">
                            <Skeleton height={558} className="rounded-[20px]" />
                            <div className="mt-[50px] w-[80%] px-6 space-y-4">
                                <Skeleton width={250} height={30} className="rounded-[20px]" />
                                <Skeleton count={4} height={20} className="rounded-[20px]" />
                                <Skeleton width={150} height={40} className="rounded-[20px]" />
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
                className="w-[90%] mx-auto py-8"
            >
                {isLoading ? (
                    <div className="mt-[50px] h-[600px] bg-[#efeeee]">
                        <div className="grid grid-cols-[2fr_1fr] h-full">
                            <div className="m-auto w-[80%] space-y-4">
                                <Skeleton width={300} height={40} className="rounded-[20px]" />
                                <Skeleton count={5} height={20} className="rounded-[20px]" />
                            </div>
                            <Skeleton height={600} className="rounded-[20px]" />
                        </div>
                    </div>
                ) : (
                    <SectionAboutUs />
                )}
            </motion.div>
        </SkeletonTheme>
    );
}