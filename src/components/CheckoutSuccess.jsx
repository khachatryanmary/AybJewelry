import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const CheckoutSuccess = () => {
    const { t } = useTranslation();
    const { lng } = useParams();
    const [searchParams] = useSearchParams();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const orderId = searchParams.get("orderId");
        const verifyOrder = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/orders/${orderId}`);
                if (data.status === "paid") {
                    toast.success(t("checkout.paymentSuccess", { defaultValue: "Payment successful! Order placed." }));
                    const userId = JSON.parse(localStorage.getItem("user"))?.id;
                    if (userId) {
                        await axios.delete(`${API_URL}/api/cart/${userId}`);
                    }
                } else {
                    toast.error(t("checkout.paymentPending", { defaultValue: "Payment is still processing." }));
                }
            } catch (error) {
                console.error("Order verification error:", error.message);
                toast.error(t("checkout.paymentFailed", { defaultValue: "Payment verification failed." }));
            }
        };
        if (orderId) verifyOrder();
    }, [searchParams, t, API_URL]);

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh]">
            <h2 className="font-[Against] text-[30px] text-[#0e0e53]">
                {t("checkout.successTitle", { defaultValue: "Payment Successful" })}
            </h2>
            <p className="text-[18px] text-[#0e0e53] mt-4">
                {t("checkout.successMessage", { defaultValue: "Your order has been placed. Thank you for shopping with Ayb Jewelry!" })}
            </p>
        </div>
    );
};

export default CheckoutSuccess;