import React, {useState} from 'react';
import {useSearchParams} from "react-router-dom";

export const useFilteredProduct = () => {
    const [product, setProduct] = useState([]);
    const [searchParams] = useSearchParams();

    const minParam = searchParams.get("min") || "";
    const maxParam = searchParams.get("max") || "";


    const filteredProduct = product.filter((item) => {
        const price = Number(item.price);
        if (minParam && price < Number(minParam)) return false;
        if (maxParam && price > Number(maxParam)) return false;
        return true;
    });
    return {
        setProduct,
        filteredProduct
    }
};