import React from 'react';
import { useTranslation } from "react-i18next";

const SectionAboutUs = () => {
    const { t } = useTranslation();

    return (
        <div className="mt-[50px] h-[600px] bg-[#efeeee]">
            <div className="grid grid-cols-[2fr_1fr] h-full">
                <div className="m-auto w-[80%] space-y-4">
                    <h2 className="text-[28px] text-[#0a0a39] font-against italic font-light mb-[15px]">
                        {t('aboutUs.title')}
                    </h2>
                    <p className="text-[16px] mb-[10px]">{t('aboutUs.paragraph1')}</p>
                    <p className="text-[16px] mb-[10px]">{t('aboutUs.paragraph2')}</p>
                    <p className="text-[16px] mb-[10px]">{t('aboutUs.paragraph3')}</p>
                    <p className="text-[16px] mb-[10px]">{t('aboutUs.paragraph4')}</p>
                    <p className="text-[16px] mb-[10px]">{t('aboutUs.paragraph5')}</p>
                </div>
                <img
                    src="/images/CoverAboutUs.jpg"
                    alt={t('aboutUs.imageAlt')}
                    className="w-full h-[600px] object-cover"
                />
            </div>
        </div>
    );
};

export default SectionAboutUs;
