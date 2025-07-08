import React from 'react';
import { useTranslation } from "react-i18next";

const Contact = () => {
    const { t } = useTranslation();

    return (
        <div className="w-[75%] mx-auto my-8">
            <div className="text-center font-against italic">
                <h2 className="text-[28px] text-[#0a0a39]">{t('contactTitle')}</h2>
            </div>

            <div className="mt-[30px] bg-[#efeeee] flex lg:flex-row justify-between items-start gap-8 p-[70px]">
                {/* Left Info */}
                <div className="flex flex-col gap-[20px] text-[18px]">
                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold">{t('contact.address')}</h2>
                        <div>
                            <i className="bi bi-geo-alt pr-[10px]" />
                            <span>{t('contact.addressText')}</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold">{t('contact.phone')}</h2>
                        <p>
                            <i className="bi bi-telephone pr-[10px]" />
                            <span>+374 55 067198</span>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold">{t('contact.email')}</h2>
                        <p>
                            <i className="bi bi-envelope pr-[10px]" />
                            <span>ayb.jewelry925@gmail.com</span>
                        </p>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-[#0a0a39] font-semibold">{t('contact.hours')}</h2>
                        <div>
                            <i className="bi bi-clock pr-[10px]" />
                            <span>{t('contact.hoursText')}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-[#0a0a39] font-semibold">{t('contact.follow')}</h2>
                        <div className="flex gap-[30px] text-[25px]">
                            <i className="bi bi-facebook" />
                            <i className="bi bi-instagram" />
                            <i className="bi bi-whatsapp" />
                        </div>
                    </div>
                </div>

                {/* Right Info */}
                <div className="w-full max-w-[500px]">
                    <form className="flex flex-col gap-[20px]">
                        <h2 className="text-[#0a0a39] font-semibold text-[22px]">{t('contact.formTitle')}</h2>
                        <input
                            type="text"
                            placeholder={t('contact.namePlaceholder')}
                            className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px]"
                        />
                        <input
                            type="email"
                            placeholder={t('contact.emailPlaceholder')}
                            className="p-[10px] h-[40px] w-full border border-[gray] rounded-[10px]"
                        />
                        <textarea
                            placeholder={t('contact.messagePlaceholder')}
                            className="p-[10px] h-[150px] w-full border border-[gray] rounded-[10px]"
                        />
                        <button
                            className="bg-[white] border-none rounded-[20px] h-[40px] w-[100%] transition duration-500 hover:text-[white] hover:bg-[#0a0a39] py-2 font-semibold">
                            {t('contact.button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
