import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import DeliveryOptions from "../components/DeliveryOptions";
import axios from "axios";
import { toast } from "react-toastify";

const ARMENIAN_REGIONS = [
    "Երևան", "Արմավիր", "Արագածոտն", "Արարատ", "Կոտայք", "Շիրակ",
    "Լոռի", "Տավուշ", "Վայոց Ձոր", "Սյունիք", "Գեղարքունիք"
];

const toastStyles = `
  @media (max-width: 639px) {
    .Toastify__toast {
      width: 280px;
      font-size: 14px;
      padding: 8px 12px;
      line-height: 1.4;
    }
    .Toastify__toast-body {
      padding: 4px;
    }
    .Toastify__close-button {
      font-size: 14px;
    }
  }
  @media (min-width: 640px) and (max-width: 767px) {
    .Toastify__toast {
      width: 320px;
      font-size: 15px;
      padding: 10px 14px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 6px;
    }
    .Toastify__close-button {
      font-size: 15px;
    }
  }
  @media (min-width: 768px) {
    .Toastify__toast {
      width: 360px;
      font-size: 16px;
      padding: 12px 16px;
      line-height: 1.5;
    }
    .Toastify__toast-body {
      padding: 8px;
    }
    .Toastify__close-button {
      font-size: 16px;
    }
  }
`;

const CheckoutForm = () => {
    const { t } = useTranslation();
    const { lng } = useParams();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [region, setRegion] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [deliveryOption, setDeliveryOption] = useState("delivery");
    const [deliveryFee, setDeliveryFee] = useState(1000); // 1,000 AMD for delivery
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [total, setTotal] = useState(0);

    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;
    const API_URL = import.meta.env.VITE_API_URL;

    // Number formatter for locale-specific price display
    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "am" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    useEffect(() => {
        if (currentUser) {
            setEmail(currentUser.email || "");
            setFirstName(currentUser.firstName || "");
            setLastName(currentUser.lastName || "");
        }
        const fetchCart = async () => {
            if (!userId) {
                console.log("No userId, skipping cart fetch");
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/api/cart/${userId}`, { withCredentials: true });
                console.log("CheckOut.jsx fetchCart response:", JSON.stringify(res.data, null, 2));
                const cartData = res.data || [];
                setCart(cartData);
                const cartTotal = cartData.reduce(
                    (sum, item) => {
                        const price = Number(item.price) || 0;
                        const quantity = Number(item.quantity) || 0;
                        const itemTotal = item.totalPrice || price * quantity;
                        console.log(`Item: ${item.name}, Price: ${price}, Quantity: ${quantity}, Total: ${itemTotal}`);
                        return sum + itemTotal;
                    },
                    0
                );
                const calculatedTotal = cartTotal + (deliveryOption === "delivery" ? deliveryFee : 0);
                console.log("Cart Total:", cartTotal, "Delivery Fee:", deliveryFee, "Total:", calculatedTotal);
                setTotal(calculatedTotal);
            } catch (error) {
                console.error("CheckOut.jsx fetchCart error:", error.response?.data || error.message);
                toast.error(t("checkout.fetchCartError", { defaultValue: "Failed to load cart" }));
            }
        };
        fetchCart();
    }, [userId, API_URL, currentUser, t, deliveryOption, deliveryFee]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleDeliveryOptionChange = (option) => {
        setDeliveryOption(option);
        setDeliveryFee(option === "delivery" ? 1000 : 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!userId) {
            toast.error(t("checkout.loginRequired", { defaultValue: "Please log in to proceed" }));
            navigate(`/${lng}/login`);
            return;
        }
        if (cart.length === 0) {
            toast.error(t("checkout.emptyCart", { defaultValue: "Your cart is empty" }));
            return;
        }
        if (deliveryOption === "delivery" && (!region || !address || !postalCode)) {
            toast.error(
                t("checkout.missingDeliveryInfo", { defaultValue: "Please provide region, address, and postal code" })
            );
            return;
        }

        setLoading(true);

        try {
            // Save order to db.json or MongoDB before payment
            const orderId = uuidv4();
            await axios.post(`${API_URL}/api/orders`, {
                orderId,
                customer: {
                    email,
                    firstName,
                    lastName,
                    phone,
                    region: deliveryOption === "delivery" ? region : undefined,
                    address: deliveryOption === "delivery" ? address : undefined,
                    apartment: deliveryOption === "delivery" ? apartment : undefined,
                    postalCode: deliveryOption === "delivery" ? postalCode : undefined,
                    deliveryType: deliveryOption,
                },
                cart,
                total,
                deliveryFee,
                status: "pending",
            });

            // Request payment URL from InecoBank
            const { data } = await axios.post(`${API_URL}/api/payment/create-payment-request`, {
                amount: total,
                orderId,
                lng,
            });

            // Redirect to InecoBank’s payment page
            window.location.href = data.paymentUrl;
        } catch (err) {
            console.error("CheckOut.jsx handleSubmit error:", err.response?.data || err.message);
            toast.error(
                err.response?.data?.error ||
                t("checkout.paymentFailed", { defaultValue: "Payment failed. Please try again." })
            );
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] sm:min-h-[80vh] md:min-h-[85vh] w-[95%] sm:w-[90%] md:w-[85%] mx-auto py-[12px] sm:py-[16px] md:py-[20px] flex flex-col items-center gap-[12px] sm:gap-[16px] md:gap-[20px]">
            <style>{toastStyles}</style>
            <h2 className="font-[Against] text-[24px] sm:text-[28px] md:text-[32px] text-[#0e0e53] text-center">
                {t("checkout.checkoutTitle", { defaultValue: "Checkout" })}
            </h2>

            {/* Cart items */}
            {cart.length === 0 ? (
                <p className="text-[14px] sm:text-[16px] md:text-[18px] text-[#0e0e53]">
                    {t("checkout.emptyCart", { defaultValue: "Your cart is empty" })}
                </p>
            ) : (
                <>
                    <ul className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px] flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px]">
                        {cart.map((item, i) => (
                            <li
                                key={`${item.id}-${item.size || "no-size"}`}
                                className="flex flex-row items-center justify-between bg-[#efeeee] rounded-[8px] p-[12px] sm:p-[16px] md:p-[20px] gap-[8px] sm:gap-[12px] md:gap-[16px]"
                            >
                                <img
                                    src={`${API_URL}${item.image}`}
                                    alt={item.name}
                                    className="w-[100px] sm:w-[120px] md:w-[150px] h-auto object-contain rounded-[8px]"
                                />
                                <div className="flex flex-col gap-[4px] sm:gap-[6px] md:gap-[8px] min-w-[120px] sm:min-w-[150px] md:min-w-[180px]">
                                    <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#0e0e53]">
                                        {item.name}
                                    </span>
                                    <span className="text-[14px] sm:text-[16px] md:text-[18px] text-[#0e0e53]">
                                        {item.size ? `${t("cart.size", { defaultValue: "Size" })}: ${item.size}` : ""}
                                    </span>
                                    <span className="text-[14px] sm:text-[16px] md:text-[18px] text-[#0e0e53]">
                                        {t("cart.quantity", { defaultValue: "Quantity" })}: {item.quantity}
                                    </span>
                                </div>
                                <span className="text-[14px] sm:text-[16px] md:text-[18px] font-semibold text-[#0e0e53] min-w-[100px] sm:min-w-[120px] md:min-w-[140px] text-right">
                                    {numberFormatter.format(item.totalPrice || item.price * item.quantity)} {t("checkout.currency", { defaultValue: "AMD" })}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* Subtotal and Delivery Fee */}
                    <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px] flex flex-col gap-[8px] sm:gap-[10px] md:gap-[12px] mt-[16px] sm:mt-[20px] md:mt-[24px] p-[12px] sm:p-[16px] md:p-[20px] border-b border-gray-500">
                        <div className="flex justify-between">
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500">
                                {t("cart.subtotal", { defaultValue: "Subtotal" })}
                            </span>
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500">
                                {numberFormatter.format(total - (deliveryOption === "delivery" ? deliveryFee : 0))} {t("checkout.currency", { defaultValue: "AMD" })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500">
                                {t("cart.deliveryFee", { defaultValue: "Delivery Fee" })}
                            </span>
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500">
                                {deliveryOption === "delivery" ? numberFormatter.format(deliveryFee) : 0} {t("checkout.currency", { defaultValue: "AMD" })}
                            </span>
                        </div>
                        <div className="flex justify-between mt-[8px] sm:mt-[10px] md:mt-[12px] pt-[8px] sm:pt-[10px] md:pt-[12px] border-t border-gray-500">
                            <span className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold">
                                {t("cart.total", { defaultValue: "Total" })}
                            </span>
                            <span className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold">
                                {numberFormatter.format(total)} {t("checkout.currency", { defaultValue: "AMD" })}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Checkout form */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[700px] flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px] mt-[16px] sm:mt-[20px] md:mt-[24px] p-[12px] sm:p-[16px] md:p-[20px] rounded-[8px]"
            >
                <h3 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                    {t("checkout.deliveryOptions", { defaultValue: "Delivery Options" })}
                </h3>
                <DeliveryOptions selected={deliveryOption} setSelected={handleDeliveryOptionChange} />

                <h3 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                    {t("checkout.contactInfo", { defaultValue: "Contact Information" })}
                </h3>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("checkout.email", { defaultValue: "Email" })}
                    className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a]"
                    required
                />
                <div className="flex flex-col sm:flex-row gap-[8px] sm:gap-[10px] md:gap-[12px]">
                    <input
                        type="text"
                        placeholder={t("checkout.firstName", { defaultValue: "First Name" })}
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a] w-full"
                        required
                    />
                    <input
                        type="text"
                        placeholder={t("checkout.lastName", { defaultValue: "Last Name" })}
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a] w-full"
                        required
                    />
                </div>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("checkout.phone", { defaultValue: "+374..." })}
                    className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a]"
                    required
                />

                {deliveryOption === "delivery" && (
                    <>
                        <h3 className="text-[20px] sm:text-[22px] md:text-[24px] font-semibold text-[#0e0e53]">
                            {t("checkout.deliveryInfo", { defaultValue: "Delivery Information" })}
                        </h3>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a]"
                            required
                        >
                            <option value="">{t("checkout.selectRegion", { defaultValue: "Select region" })}</option>
                            {ARMENIAN_REGIONS.map((r, i) => (
                                <option key={i} value={r}>{r}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder={t("checkout.streetAddress", { defaultValue: "Street address" })}
                            className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a]"
                            required
                        />
                        <input
                            type="text"
                            value={apartment}
                            onChange={(e) => setApartment(e.target.value)}
                            placeholder={t("checkout.apartment", { defaultValue: "Apartment" })}
                            className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a]"
                        />
                        <input
                            type="text"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            placeholder={t("checkout.postalCode", { defaultValue: "Postal Code" })}
                            className="p-[8px] sm:p-[10px] md:p-[12px] text-[14px] sm:text-[15px] md:text-[16px] border border-[#0e0e53] rounded-[8px] focus:outline-none focus:border-[#df7a7a]"
                            required
                        />
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading || cart.length === 0}
                    className="bg-[#efeeee] text-[#0e0e53] hover:text-white w-full h-[40px] sm:h-[44px] md:h-[48px] rounded-[12px] mt-[12px] sm:mt-[16px] md:mt-[20px] hover:bg-[#0a0a39] transition duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-[14px] sm:text-[15px] md:text-[16px]"
                >
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        t("checkout.pay", { defaultValue: "Pay" })
                    )}
                </button>
                {deliveryOption === "delivery" && (
                    <p className="text-center text-[12px] sm:text-[13px] md:text-[14px] text-gray-500 mt-[8px] sm:mt-[10px] md:mt-[12px]">
                        {t("cart.deliveryNote", { defaultValue: "Delivery will be in 24 hours" })}
                    </p>
                )}
            </form>
        </div>
    );
};

const CheckOut = () => <CheckoutForm />;

export default CheckOut;