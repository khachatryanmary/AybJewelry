import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import {useDispatch} from "react-redux";
import { addToCart } from "../Toolkit/slices/cartSlice.js";
import { toast } from "react-toastify";



const NecklaceDetail = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();
  const lng = location.pathname.split("/")[1];

  const [necklace, setNecklace] = useState({});
  const [openDetails, setOpenDetails] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchNecklacesDetail = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/necklaces?id=${id}`);
        const product = res.data[0];
        setNecklace(product);
        setIsWished(wishlist.some(item => item.id === product.id));
      } catch (error) {
        console.log('Failed to fetch necklaces:', error.message);
      }
    };
    fetchNecklacesDetail();
  }, [id, location.pathname, wishlist]);

  const toggleWishlist = () => {
    if (isWished) {
      removeFromWishlist(necklace.id);
    } else {
      addToWishlist(necklace);
    }
    setIsWished(!isWished);
  };

  const images = necklace.image
    ? [necklace.image, ...(necklace.images || [])]
    : necklace.images || [];

  const handleAddToCart = () => {
    dispatch(addToCart({ ...necklace, quantity }));
    const message = t("toast.addedToCart") || "🛒 Added to cart!";
    toast.success(`${necklace.name} ${message}`);
  };

  return (
    <div className="flex w-[90%] mx-[0auto] pt-[40px] mt-[20px] h-[700px] bg-[#efeeee] justify-center items-start gap-[40px]">
      
      <div className="relative w-[400px] rounded-[8px] shadow-md overflow-hidden">
          <Swiper
            modules={[Navigation]}
            navigation

            spaceBetween={10}
            slidesPerView={1}
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <img
                  src={img}
                  alt={`necklace image ${index}`}
                  className="w-[400px] h-auto object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
      </div>


      <div className="flex flex-col justify-center items-start gap-[40px] w-[50%]">
        <Link to={`/${lng}/necklaces/`}>
          <button className="bg-[#f7f7f7] text-[#0a0a39] transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] hover:bg-[#0a0a39] hover:text-[white]">
            {t('necklaceDetail.backToSelection')}
          </button>
        </Link>

        <div className="flex flex-col w-full">
          <div className="flex justify-between w-full">
            <span className="text-[25px] font-bold text-[#213547]">{necklace.name}</span>
            <span
              onClick={toggleWishlist}
              className={`text-[28px] cursor-pointer transition-all duration-300 ${
                isWished ? 'text-[#0a0a39]' : 'text-gray-400'
              }`}
              title={t('addToWishlist')}
            >
              <i className={`bi ${isWished ? 'bi-heart-fill' : 'bi-heart'} transition-all duration-300`}></i>
            </span>
          </div>

          <span className="text-[20px] text-[#666] font-semibold my-[10px] mb-[20px]">
          {necklace.price * quantity} AMD
          </span>
          <div className="flex items-center gap-3 mt-3">
            <button
                onClick={() =>
                    setQuantity(q => (q > 1 ? q - 1 : 1))}
                className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
            >
              -
            </button>
            <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => {
                  const val = Math.max(1, Number(e.target.value));
                  setQuantity(val);
                }}
                className="w-[50px] h-[30px] text-center border rounded bg-[#f7f7f7]"
            />
            <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-[30px] h-[30px] flex items-center justify-center bg-[#f7f7f7] rounded hover:bg-[#0a0a39] hover:text-white transition"
            >
              +
            </button>
          </div>

          <p className="text-[16px] leading-[1.5] text-[#444] mb-[20px]">{necklace.description}</p>

          <button
            id="addBtn"
            onClick={handleAddToCart}
            className="transition duration-500 border-none cursor-pointer py-[10px] px-[18px] font-semibold rounded-[6px] bg-[#f7f7f7] text-[#0a0a39] hover:bg-[#0a0a39] hover:text-[white]"
          >
            {t('necklaceDetail.add')}
          </button>

          <div className="mt-[20px] w-full bg-[white] rounded-[8px] shadow-md overflow-hidden">
            <div
              className={`text-[18px] font-bold flex justify-between items-center px-[20px] py-[12px] bg-[#f7f7f7] border-b border-[#ddd] cursor-pointer select-none ${
                openDetails ? 'open' : ''
              }`}
              onClick={() => setOpenDetails(!openDetails)}
            >
              <span>{t('necklaceDetail.details')}</span>
              <i className={`bi bi-chevron-double-down transition-transform duration-300 ${openDetails ? 'rotate-180' : ''}`}></i>
            </div>

            {openDetails && (
              <ul className="list-none m-0 p-[15px] px-[25px] flex flex-col gap-[14px] max-h-[300px] overflow-y-auto">
                {necklace.details?.length > 0 &&
                  Object.entries(necklace.details[0]).map(([key, value], index) => (
                    <li
                      key={index}
                      className="flex justify-start items-center w-full gap-[20px] text-left"
                    >
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NecklaceDetail;
 