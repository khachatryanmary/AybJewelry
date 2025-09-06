import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SectionGallery = () => {
    const { t } = useTranslation();
    const { lng } = useParams();
    const [assets, setAssets] = useState({
        collectionName: 'Spring 2025',
        imageUrl: '',
        videoUrls: [],
        title: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRef = useRef(null);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/homepage-assets`);
                console.log('SectionGallery.jsx API response:', JSON.stringify(response.data, null, 2));
                setAssets({
                    collectionName: response.data.collectionName || 'Spring 2025',
                    imageUrl: response.data.imageUrl || '/Uploads/homePage/modelImg.jpg',
                    videoUrls: Array.isArray(response.data.videoUrls) && response.data.videoUrls.length > 0
                        ? response.data.videoUrls
                        : [
                            'https://res.cloudinary.com/dc6a3ofls/video/upload/v1755694298/new-collection_uvph1b.mp4',
                            'https://res.cloudinary.com/dc6a3ofls/video/upload/v1755694483/C8699_nriprv.mp4'
                        ],
                    title: response.data.title || t('featuredCollection.title', { defaultValue: 'Spring 2025' }),
                    description: response.data.description || t('featuredCollection.description', { defaultValue: 'Explore our latest collection.' }),
                });
            } catch (error) {
                console.error('SectionGallery.jsx fetchAssets error:', error.message);
                setAssets({
                    collectionName: 'Spring 2025',
                    imageUrl: '/Uploads/homePage/modelImg.jpg',
                    videoUrls: [
                        'https://res.cloudinary.com/dc6a3ofls/video/upload/v1755694298/new-collection_uvph1b.mp4',
                        'https://res.cloudinary.com/dc6a3ofls/video/upload/v1755694483/C8699_nriprv.mp4'
                    ],
                    title: t('featuredCollection.title', { defaultValue: 'Spring 2025' }),
                    description: t('featuredCollection.description', { defaultValue: 'Explore our latest collection.' }),
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, [API_URL, t]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
            videoRef.current.play().catch((err) => {
                console.warn('Video playback failed:', err.message);
            });
        }
    }, [currentVideoIndex]);

    const handlePrev = () => {
        setCurrentVideoIndex((prevIndex) =>
            prevIndex === 0 ? assets.videoUrls.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentVideoIndex((prevIndex) =>
            (prevIndex + 1) % assets.videoUrls.length
        );
    };

    const collectionSlug = assets.collectionName.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="w-full">
            <div className="w-full mx-auto flex flex-col items-center justify-center px-4 sm:px-6 md:px-8">
                <h2 className="font-[Against] text-[25px] sm:text-[30px] md:text-[30px] text-[#0e0e53] text-center mb-[10px] sm:mb-[15px] md:mb-[20px]">
                    {t('featuredCollection.title', { defaultValue: assets.title })}
                </h2>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] text-gray-600 text-center mb-[10px] sm:mb-[15px] md:mb-[20px]">
                    {t('featuredCollection.description', { defaultValue: assets.description })}
                </p>
                {assets.videoUrls.length > 0 && (
                    <SkeletonTheme baseColor="#e5e7eb" highlightColor="#d1d5db">
                        <div className="relative w-full h-[calc(100vh-80px)] sm:h-[400px] md:h-[500px]">
                            {loading && <Skeleton height="100%" width="100%" className="w-full h-full rounded-md absolute top-0 left-0" />}
                            <video
                                ref={videoRef}
                                key={assets.videoUrls[currentVideoIndex]}
                                src={assets.videoUrls[currentVideoIndex]}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className={`w-full h-full object-cover rounded-md ${loading ? 'opacity-0' : 'opacity-100'}`}
                                onLoadedData={() => {
                                    console.log('Video loaded:', assets.videoUrls[currentVideoIndex]);
                                    setLoading(false);
                                }}
                                onError={(e) => {
                                    console.warn('Video failed to load:', assets.videoUrls[currentVideoIndex], e);
                                    if (assets.videoUrls.length > 1) {
                                        setCurrentVideoIndex((prev) => (prev + 1) % assets.videoUrls.length);
                                    }
                                }}
                            />
                            <Link
                                to={`/${lng}/${collectionSlug}`}
                                className="w-[200px] flex justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent border border-white px-4 py-2 rounded-md font-semibold text-[12px] sm:text-[18px] md:text-[15px] text-white hover:text-[#0e0e53] hover:bg-white hover:bg-opacity-80 transition-all duration-300 z-10"
                            >
                                {t('featuredCollection.exploreCollection', { defaultValue: `Explore ${assets.collectionName}` })}
                            </Link>
                            {assets.videoUrls.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrev}
                                        className="absolute top-1/2 left-2 sm:left-3 md:left-4 transform -translate-y-1/2 text-white hover:text-[#0e0e53] bg-transparent rounded-full p-1 sm:p-1.5 md:p-2 text-[16px] sm:text-[18px] md:text-[20px] transition-all z-10"
                                    >
                                        &larr;
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute top-1/2 right-2 sm:right-3 md:right-4 transform -translate-y-1/2 text-white hover:text-[#0e0e53] bg-transparent rounded-full p-1 sm:p-1.5 md:p-2 text-[16px] sm:text-[18px] md:text-[20px] transition-all z-10"
                                    >
                                        &rarr;
                                    </button>
                                    <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-1.5 md:gap-2 z-10">
                                        {assets.videoUrls.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 rounded-full ${
                                                    index === currentVideoIndex ? 'bg-white' : 'bg-gray-400'
                                                }`}
                                                onClick={() => setCurrentVideoIndex(index)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </SkeletonTheme>
                )}
            </div>
        </div>
    );
};

export default SectionGallery;