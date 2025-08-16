import React from 'react';
import { useTranslation } from "react-i18next";

const SectionGallery = () => {
    const { t } = useTranslation();

    return (
        <div className="h-[558px] bg-[#efeeee]">
            <div className="max-w-[1200px] mx-auto grid grid-cols-[1fr_2fr] overflow-hidden h-full">
                <video
                    className="w-full h-[558px] object-contain"
                    autoPlay
                    muted
                    loop
                    controls={false}
                >
                    <source src="/videos/JewelryIntro.mp4" type="video/mp4" />
                </video>
                <div className="mt-[50px] w-[80%] px-6">
                    <h2 className="text-[#0a0a39] font-[Against] font-light text-[25px] mb-[10px]">
                        {t('sectionGallery.title')}
                    </h2>
                    <p className="text-base mb-[10px]">
                        {t('sectionGallery.paragraph1')}
                    </p>
                    <p className="mb-[10px]">
                        {t('sectionGallery.paragraph2')}
                    </p>
                    <p className="mb-[10px]">
                        {t('sectionGallery.paragraph3')}
                    </p>
                    <p className="mb-[70px]">
                        {t('sectionGallery.paragraph4')}
                    </p>
                    <button
                        className="bg-[white] border-none rounded-[20px] h-[40px] w-[100%] transition duration-500 hover:text-[white] hover:bg-[#0a0a39] py-2 font-semibold"
                    >
                        {t('sectionGallery.button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SectionGallery;
