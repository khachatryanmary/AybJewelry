import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

function Search({ searchActive, setSearchActive, lng }) {
    const { t } = useTranslation();

    const [search, setSearch] = useState('');
    const [allProducts, setAllProducts] = useState([]); // to store combined data
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!searchActive) return;

        setLoading(true);

        // Fetch all categories in parallel
        Promise.all([
            fetch('http://localhost:4000/necklaces').then(res => res.json()),
            fetch('http://localhost:4000/rings').then(res => res.json()),
            fetch('http://localhost:4000/earrings').then(res => res.json()),
            fetch('http://localhost:4000/bracelets').then(res => res.json()),
            fetch('http://localhost:4000/brooches').then(res => res.json()),
        ])
            .then(([necklaces, rings, earrings, bracelets, brooches]) => {
                const necklacesWithCategory = necklaces.map(item => ({ ...item, category: 'necklaces' }));
                const ringsWithCategory = rings.map(item => ({ ...item, category: 'rings' }));
                const earringsWithCategory = earrings.map(item => ({ ...item, category: 'earrings' }));
                const braceletsWithCategory = bracelets.map(item => ({ ...item, category: 'bracelets' }));
                const broochesWithCategory = brooches.map(item => ({ ...item, category: 'brooches' }));

                const combined = [
                    ...necklacesWithCategory,
                    ...ringsWithCategory,
                    ...earringsWithCategory,
                    ...braceletsWithCategory,
                    ...broochesWithCategory,
                ];

                setAllProducts(combined);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [searchActive]);

    const filteredProducts = useMemo(() => {
        if (search.trim() === '') return [];
        return allProducts.filter(item =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, allProducts]);

    if (!searchActive) return null;

    return (
        <div className="fixed w-full h-full bg-[rgba(200,195,195,0.8)] z-50 flex justify-center pt-[100px]">
            <div className="flex flex-col items-center w-full max-w-[600px] space-y-6 relative">
                <h2 className="font-[Against] text-[25px] text-[#0e0e53]">
                    {t('search.title')}
                </h2>

                <input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="p-2 w-[400px] h-[40px] rounded-lg border border-white focus:outline-none rounded-[30px] p-[20px] mt-[20px]"
                />

                <button
                    onClick={() => setSearchActive(false)}
                    className="absolute top-[15px] right-[15px] w-[25px] h-[30px] flex items-center justify-center bg-white border border-black hover:text-[#df7a7a] hover:border-[#df7a7a] transition cursor-pointer"
                >
                    X
                </button>

                {loading && <p className="text-gray-700">{t('search.loading')}</p>}

                {!loading && search.trim() !== '' && (
                    <ul className="w-full flex flex-col mt-[20px] gap-[20px] max-h-[300px] overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((item) => (
                                <Link
                                    key={`${item.category}-${item.id}`}
                                    to={`/${lng}/${item.category}/${item.id}`}
                                    className="flex items-center gap-4 bg-white shadow-md rounded-lg p-4 hover:bg-gray-100 transition"
                                    onClick={() => setSearchActive(false)}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.alt || item.name}
                                        className="w-[200px] h-[150px] object-cover rounded"
                                    />
                                    <div className="text-left pl-[20px]">
                                        <span className="block font-semibold text-[#0e0e53] text-[18px]">
                                            {item.name}
                                        </span>
                                        <span className="block text-[16px] text-gray-400">
                                            {item.price} AMD
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <li className="text-gray-600">{t('search.noResults')}</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Search;
