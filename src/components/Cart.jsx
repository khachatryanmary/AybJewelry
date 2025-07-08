import React from 'react';
import { useTranslation } from "react-i18next";
import { useCart } from "../Providers/CartProvider";
import { useLocation, Link } from "react-router-dom";


const Cart = () => {
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const { cart, removeFromCart, clearCart } = useCart();
    const { t } = useTranslation();

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            {cart.length === 0 ? (
                <>
                    <div className="w-full text-center border-b border-gray-400">
                        <h2 className="font-[Against] text-[30px] p-[20px]">{t('cart.cartTitle')}</h2>
                    </div>

                    <div className="h-[400px] flex flex-col items-center justify-center gap-[20px]">
                        <i className="bi bi-handbag text-[70px] text-center" />
                        <p className="text-[25px] text-black font-light">{t('cart.cartEmpty')}</p>
                        <Link to={`/${lng}/necklaces`}>
                            <button className="w-[200px] h-[40px] mt-[10px] bg-[#efeeee] border-none rounded-[10px] transition duration-500 hover:text-[white] hover:bg-[#0a0a39]">
                                {t('returnToShop')}
                            </button>
                        </Link>

                    </div>
                </>
            ) : (
                <>
                    <div className="w-full flex justify-between items-center border-b pb-[10px]">
                        <h2 className="font-[Against] text-[30px] p-[20px]">{t('cart.cartTitle')}</h2>
                        <button
                            onClick={clearCart}
                            className="hover:text-[white] w-[200px] h-[40px] rounded-[10px] bg-[#efeeee] text-[#0a0a39] hover:bg-[#0a0a39] transition"
                        >
                            {t('cart.clearCart')}
                        </button>
                    </div>

                    <ul className="w-full mt-[40px] flex flex-col gap-[20px]">
                        {cart.map((item, i) => (
                            <li key={i} className="flex justify-between items-center border border-[gray] rounded p-[10px]">
                                <img src={item.image} alt={item.name} className="w-[200px] h-auto object-cover" />
                                <span className="text-[20px]" >{item.name}</span>
                                <span className="text-[20px]">{item.price} AMD</span>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-[black]  hover:text-[white] w-[150px] h-[40px] rounded-[10px] bg-[#efeeee]  hover:bg-[#0a0a39] transition">
                                    {t('cart.removeCart')}
                                </button>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};

export default Cart;
