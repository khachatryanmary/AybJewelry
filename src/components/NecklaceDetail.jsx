import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const NecklaceDetail = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const location = useLocation();
    const lng = location.pathname.split("/")[1];

    const [necklace, setNecklace] = useState({});
    const [openDetails, setOpenDetails] = useState(false);

    useEffect(() => {
        const fetchNecklacesDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:4000/necklaces?id=${id}`);
                setNecklace(res.data[0]);
            } catch (error) {
                console.log('Failed to fetch necklaces:', error.message);
            }
        };
        fetchNecklacesDetail();
    }, [id, location.pathname]); // 👈 Now also re-runs when language (URL) changes

    return (
        <div className="flex w-[90%] mx-auto pt-[40px] mt-[20px] h-[700px] bg-[#efeeee] justify-center items-start gap-[40px]">
            <div className="flex items-start justify-start">
                <img
                    id="detailImage"
                    src={necklace.image}
                    alt={necklace.name || 'image'}
                    className="w-[450px] h-auto rounded-[8px] object-cover shadow-md"
                />
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
                        <span className="text-[28px] text-gray-500 cursor-pointer transition duration-300 hover:text-[#0a0a39]">
                            <i className="bi bi-heart-fill"></i>
                        </span>
                    </div>

                    <span className="text-[20px] text-[#666] font-semibold my-[10px] mb-[20px]">
                        {necklace.price} AMD
                    </span>

                    <p className="text-[16px] leading-[1.5] text-[#444] mb-[20px]">{necklace.description}</p>

                    <button
                        id="addBtn"
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
