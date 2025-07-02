import React from 'react';
import { useTranslation } from "react-i18next";

const Cart = () => {
    const { t } = useTranslation();

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-full text-center border-b border-gray-400">
                <h2 className="font-[Against] italic text-[30px] p-[20px]">{t('cartTitle')}</h2>
            </div>

            <div className="w-[30%] h-[400px] flex flex-col items-center justify-center gap-[20px]">
                <i className="bi bi-handbag text-[70px] text-center" />
                <p className="text-[25px] text-black font-light">{t('cartEmpty')}</p>
                <button className="w-[200px] h-[40px] mt-[10px] border-none rounded-[10px] transition duration-500 hover:text-[white] hover:bg-[#0a0a39]">
                    {t('returnToShop')}
                </button>
            </div>
        </div>
    );
};

export default Cart;
