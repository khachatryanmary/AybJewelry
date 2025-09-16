import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const SectionAboutUs = () => {
    const { t } = useTranslation();
    const { lng } = useParams();

    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="w-[90%] mx-auto py-8 min-h-[500px] bg-[#efeeee] flex justify-center items-center"
        >
            <div className="w-full flex justify-center items-center">
                <div className="flex flex-col justify-center items-center gap-4 w-[80%] space-y-4">
                    <h2 className="text-[25px] sm:text-[30px] md:text-[30px] text-[#0e0e53] font-[Against] font-light mb-4">
                        {t('aboutUs.title')}
                    </h2>
                    <p className="text-[16px] text-[#656565] text-center">{t('aboutUs.paragraph1')}</p>
                    <p className="text-[16px] text-[#656565] text-center">{t('aboutUs.paragraph2')}</p>
                    <p className="text-[16px] text-[#656565] text-center">{t('aboutUs.paragraph3')}</p>
                    <p className="text-[16px] text-[#656565] text-center">{t('aboutUs.paragraph4')}</p>
                    <p className="text-[16px] text-[#656565] text-center">{t('aboutUs.paragraph5')}</p>
                    {/*<Link to={`/${lng}/about`}>*/}
                    {/*    <button className="px-6 py-2 border border-[#0e0e53] text-[#0e0e53] bg-transparent hover:bg-[#0e0e53] hover:text-white transition-all rounded mt-4">*/}
                    {/*        {t('aboutUs.learnMore', { defaultValue: 'Discover More' })}*/}
                    {/*    </button>*/}
                    {/*</Link>*/}
                </div>
            </div>
        </motion.div>
    );
};

export default SectionAboutUs;