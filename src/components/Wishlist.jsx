import React from 'react';
import { useTranslation } from "react-i18next";

const Wishlist = () => {
    const { t } = useTranslation();

    return (
        <div>
            <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh] gap-[70px]">
                <div className="w-full text-center border-b border-[gray-400]">
                    <h2 className="font-[Against] text-[30px] p-[20px] italic">WISHLIST</h2>
                </div>

                <div className="w-[30%] h-[300px] flex flex-col items-center justify-center">
                    <i className="bi bi-heart text-[70px] text-center"></i>
                    <div className="w-full h-full flex flex-col items-center">
                        <p className="text-[25px] font-light text-black">{t('wishListMessage')}</p>
                        <p className="text-[15px] text-gray-500">{t('clickToAdd')}</p>
                        <button className="w-[200px] h-[40px] mt-[10px] border-none rounded-[10px] transition duration-500 hover:text-[white] hover:bg-[#0a0a39]">
                            {t('returnToShop')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
