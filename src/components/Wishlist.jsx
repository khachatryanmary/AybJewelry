import React from 'react';
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeFromWishlist, clearWishlist } from "../Toolkit/slices/wishlistSlice.js";

const Wishlist = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];

    const dispatch = useDispatch();
    const wishlist = useSelector(state => state.wishlist.wishlist);

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            {wishlist.length === 0 ? (
                <>
                    <div className="w-full text-center border-b border-gray-400">
                        <h2 className="font-[Against] text-[30px] p-[20px]">{t('wishlist')}</h2>
                    </div>
                    <div className="h-[400px] flex flex-col items-center justify-center gap-[20px]">
                        <i className="bi bi-heart text-[70px]" />
                        <p className="text-[25px] font-light text-black">{t('wishListMessage')}</p>
                        <p className="text-[15px] text-gray-500">{t('clickToAdd')}</p>
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
                        <h2 className="font-[Against] text-[30px] p-[20px]">{t('wishlist')}</h2>
                        <button
                            onClick={() => dispatch(clearWishlist())}
                            className="hover:text-[white] w-[200px] h-[40px] rounded-[10px] bg-[#efeeee] text-[#0a0a39] hover:bg-[#0a0a39] transition"
                        >
                            {t('clearWishlist')}
                        </button>
                    </div>

                    <ul className="w-full mt-[40px] flex flex-col gap-[20px]">
                        {wishlist.map((item, i) => (
                            <li key={i} className="flex justify-between items-center border border-[gray] rounded p-[10px]">
                                <img src={item.image} alt={item.name} className="w-[200px] h-auto object-cover" />
                                <span className="text-[20px]">{item.name}</span>
                                <span className="text-[20px]">{item.price} AMD</span>
                                <button
                                    onClick={() => dispatch(removeFromWishlist(item.id))}
                                    className="text-[black] hover:text-[white] w-[150px] h-[40px] rounded-[10px] bg-[#efeeee] hover:bg-[#0a0a39] transition"
                                >
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

export default Wishlist;
