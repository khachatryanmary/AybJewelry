import React from 'react';
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import {
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    selectCartTotal
} from "../Toolkit/slices/cartSlice.js";


const Cart = () => {
    const total = useSelector(selectCartTotal);
    const location = useLocation();
    const lng = location.pathname.split("/")[1];
    const fromPath = location.state?.from || `/${lng}/all-products`;

    const { cart } = useSelector((state) => state.cart);
    const dispatch = useDispatch();
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
                        <Link to={fromPath}>
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
                            onClick={() => dispatch(clearCart())}
                            className="hover:text-[white] w-[200px] h-[40px] rounded-[10px] bg-[#efeeee] text-[#0a0a39] hover:bg-[#0a0a39] transition"
                        >
                            {t('cart.clearCart')}
                        </button>
                    </div>

                    <ul className="w-full mt-[40px] flex flex-col gap-[20px]">
                        {cart.map((item, i) => (
                            <li key={i} className="flex justify-between items-center border border-[gray] rounded p-[10px]">
                                <img src={item.image} alt={item.name} className="w-[200px] h-auto object-cover" />
                                <span className="text-[20px]">{item.name}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => dispatch(decreaseQuantity(item.id))}
                                        className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        readOnly
                                        className="w-[50px] h-[30px] text-center border rounded bg-[#f7f7f7]"
                                    />
                                    <button
                                        onClick={() => dispatch(increaseQuantity(item.id))}
                                        className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-[20px]">{item.price * item.quantity} AMD</span>
                                <button
                                    onClick={() => dispatch(removeFromCart(item.id))}
                                    className="text-[black] hover:text-[white] w-[150px] h-[40px] rounded-[10px] bg-[#efeeee] hover:bg-[#0a0a39] transition"
                                >
                                    {t('cart.removeCart')}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="w-full text-right mt-[30px]">
                        <h3 className="text-[22px] font-bold">{t('cart.total')}: {total} AMD</h3>
                    </div>
                </>
            )}
        </div>
    );
};

export default Cart;
