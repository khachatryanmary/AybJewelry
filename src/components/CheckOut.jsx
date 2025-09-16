import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { toast } from "react-toastify";
import { calculateDeliveryFeeByRegion, getDeliveryInfo } from "../utils/DeliveryCalculator.js";

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

// Enhanced Delivery Options Component
const EnhancedDeliveryOptions = ({
                                     selected,
                                     setSelected,
                                     region,
                                     address,
                                     onDeliveryFeeChange
                                 }) => {
    const [deliveryInfo, setDeliveryInfo] = useState({
        distance: 0,
        fee: 1000,
        isYerevan: true,
        loading: false
    });

    const { t } = useTranslation();

    useEffect(() => {
        const calculateFee = async () => {
            if (selected === 'pickup' || !region) {
                setDeliveryInfo(prev => ({ ...prev, fee: 0 }));
                onDeliveryFeeChange(0);
                return;
            }

            setDeliveryInfo(prev => ({ ...prev, loading: true }));

            try {
                const info = await getDeliveryInfo(region, address);
                setDeliveryInfo({
                    ...info,
                    loading: false
                });
                onDeliveryFeeChange(info.fee);
            } catch (error) {
                console.error('Error calculating delivery fee:', error);
                // Fallback to region-based calculation
                const fallbackFee = calculateDeliveryFeeByRegion(region);
                setDeliveryInfo({
                    distance: region === "Երևան" ? 0 : 50,
                    fee: fallbackFee,
                    isYerevan: region === "Երևան",
                    loading: false
                });
                onDeliveryFeeChange(fallbackFee);
            }
        };

        calculateFee();
    }, [selected, region, address, onDeliveryFeeChange]);

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 p-3 border border-[#0e0e53] rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        value="pickup"
                        checked={selected === 'pickup'}
                        onChange={(e) => setSelected(e.target.value)}
                        className="text-[#0e0e53]"
                    />
                    <div>
                        <div className="font-medium text-[#0e0e53]">
                            {t('checkout.pickup', { defaultValue: 'Store Pickup' })}
                        </div>
                        <div className="text-sm text-gray-600">
                            {t('checkout.pickupDescription', { defaultValue: 'Pick up from our store in Yerevan' })}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                            {t('checkout.free', { defaultValue: 'Free' })}
                        </div>
                    </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-[#0e0e53] rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                        type="radio"
                        value="delivery"
                        checked={selected === 'delivery'}
                        onChange={(e) => setSelected(e.target.value)}
                        className="text-[#0e0e53]"
                    />
                    <div className="flex-1">
                        <div className="font-medium text-[#0e0e53]">
                            {t('checkout.homeDelivery', { defaultValue: 'Home Delivery' })}
                        </div>
                        <div className="text-sm text-gray-600">
                            {t('checkout.deliveryDescription', { defaultValue: 'Delivered to your address' })}
                        </div>

                        {selected === 'delivery' && (
                            <div className="mt-2 p-2 bg-[#f8f9ff] rounded border border-[#e0e4ff]">
                                {deliveryInfo.loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-sm text-[#0e0e53]">
                                            {t('checkout.calculatingFee', { defaultValue: 'Calculating delivery fee...' })}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {deliveryInfo.isYerevan ? (
                                            <div className="text-sm text-[#0e0e53]">
                                                {t('checkout.yerevanDelivery', { defaultValue: 'Yerevan delivery (flat rate)' })}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-[#0e0e53]">
                                                {t('checkout.distanceFromYerevan', {
                                                    defaultValue: 'Distance from Yerevan: {{distance}}km',
                                                    distance: deliveryInfo.distance
                                                })}
                                            </div>
                                        )}
                                        <div className="text-sm font-semibold text-[#0e0e53]">
                                            {deliveryInfo.fee.toLocaleString()} AMD
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </label>
            </div>

            {selected === 'delivery' && !deliveryInfo.isYerevan && !deliveryInfo.loading && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {t('checkout.deliveryCalculation', {
                        defaultValue: 'Calculation: {{distance}}km × 100 AMD/km = {{total}} AMD',
                        distance: deliveryInfo.distance,
                        total: deliveryInfo.fee.toLocaleString()
                    })}
                </div>
            )}
        </div>
    );
};

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
    const [deliveryFee, setDeliveryFee] = useState(1000);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);
    const [cartLoading, setCartLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;
    const API_URL = import.meta.env.VITE_API_URL;

    // Number formatter for locale-specific price display
    const numberFormatter = new Intl.NumberFormat(lng === "ru" ? "ru-RU" : lng === "hy" ? "hy-AM" : "en-US", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    // Handle delivery fee changes
    const handleDeliveryFeeChange = (fee) => {
        setDeliveryFee(fee);
    };

    // Calculate total whenever cart or delivery fee changes
    useEffect(() => {
        const cartTotal = cart.reduce(
            (sum, item) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                const itemTotal = item.totalPrice || price * quantity;
                return sum + itemTotal;
            },
            0
        );
        const calculatedTotal = cartTotal + (deliveryOption === "delivery" ? deliveryFee : 0);
        setTotal(calculatedTotal);
    }, [cart, deliveryOption, deliveryFee]);

    // Fetch cart data - improved with better state management
    const fetchCart = async (retryCount = 0) => {
        if (!userId) {
            console.log("No userId, skipping cart fetch");
            setCartLoading(false);
            setInitialLoadComplete(true);
            return;
        }

        try {
            setCartLoading(true);
            console.log(`Fetching cart for user: ${userId} (attempt ${retryCount + 1})`);

            const res = await axios.get(`${API_URL}/api/cart/${userId}`, { withCredentials: true });
            console.log("CheckOut.jsx fetchCart response:", JSON.stringify(res.data, null, 2));

            const cartData = res.data || [];
            setCart(cartData);

            // If cart is empty and this is the first attempt, retry once after a short delay
            if (cartData.length === 0 && retryCount === 0) {
                console.log("Cart is empty, retrying in 1 second...");
                setTimeout(() => fetchCart(1), 1000);
                return;
            }

            setInitialLoadComplete(true);
        } catch (error) {
            console.error("CheckOut.jsx fetchCart error:", error.response?.data || error.message);

            // If first attempt fails, retry once
            if (retryCount === 0) {
                console.log("Cart fetch failed, retrying in 1 second...");
                setTimeout(() => fetchCart(1), 1000);
                return;
            }

            toast.error(t("checkout.fetchCartError", { defaultValue: "Failed to load cart" }));
            setInitialLoadComplete(true);
        } finally {
            setCartLoading(false);
        }
    };

    // Initialize user data and fetch cart
    useEffect(() => {
        if (currentUser) {
            setEmail(currentUser.email || "");
            setFirstName(currentUser.firstName || "");
            setLastName(currentUser.lastName || "");
        }

        // Only fetch cart if we have a user ID and haven't completed initial load
        if (userId && !initialLoadComplete) {
            fetchCart();
        }
    }, [userId, currentUser, API_URL, t, initialLoadComplete]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const handleDeliveryOptionChange = (option) => {
        setDeliveryOption(option);
        if (option === "pickup") {
            setDeliveryFee(0);
        }
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
            // Redirect to InecoBank's payment page
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
            <h2 className="font-[Against] text-[24px] sm:text-[28px] md:text-[32px] text-[#0e0e53] text-center py-[30px]">
                {t("checkout.checkoutTitle", { defaultValue: "Checkout" })}
            </h2>

            {/* Cart items */}
            {cartLoading ? (
                <div className="flex flex-col items-center gap-[12px] sm:gap-[16px] md:gap-[20px] w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px]">
                    <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[14px] sm:text-[16px] md:text-[18px] text-[#0e0e53]">
                        {t("checkout.loadingCart", { defaultValue: "Loading cart..." })}
                    </p>
                </div>
            ) : cart.length === 0 ? (
                <p className="text-[14px] sm:text-[16px] md:text-[18px] text-[#0e0e53]">
                    {t("checkout.emptyCart", { defaultValue: "Your cart is empty" })}
                </p>
            ) : (
                <>
                    <ul className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px] flex flex-col gap-[12px] sm:gap-[16px] md:gap-[20px]">
                        {cart.map((item) => (
                            <li
                                key={`${item.id}-${item.size || "no-size"}`}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#efeeee] rounded-[8px] p-[12px] sm:p-[16px] md:p-[20px] gap-[12px] sm:gap-[16px] md:gap-[20px]"
                            >
                                {/* Image */}
                                <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-start">
                                    <img
                                        src={`${item.image}`}
                                        alt={item.name}
                                        className="w-[300px] h-[200px] sm:w-[300px] sm:h-[200px] md:w-[300px] md:h-[200px] rounded-[8px] object-cover"
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-grow flex s329 sm:flex-row items-start sm:items-center gap-[8px] sm:gap-[12px] w-full">
                                    <div className="flex flex-col gap-[4px] sm:gap-[6px] md:gap-[8px] w-full sm:w-auto">
                                        <span className="text-[16px] sm:text-[14px] md:text-[16px] font-semibold text-[#0e0e53] break-words">
                                            {item.name}
                                        </span>
                                        {item.size && (
                                            <span className="text-[14px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                                                {t("cart.size", { defaultValue: "Size" })}: {item.size}
                                            </span>
                                        )}
                                        <span className="text-[14px] sm:text-[13px] md:text-[14px] text-[#0e0e53]">
                                            {t("cart.quantity", { defaultValue: "Quantity" })}: {item.quantity}
                                        </span>
                                        <span className="text-[16px] sm:text-[14px] md:text-[16px] font-semibold text-[#0e0e53] whitespace-nowrap">
                                            {numberFormatter.format(item.totalPrice || item.price * item.quantity)} {t("checkout.currency", { defaultValue: "AMD" })}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Subtotal and Delivery Fee */}
                    <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-[800px] flex flex-col gap-[8px] sm:gap-[10px] md:gap-[12px] mt-[16px] sm:mt-[20px] md:mt-[24px] p-[12px] sm:p-[16px] md:p-[20px] border-b border-gray-500">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500">
                                {t("cart.subtotal", { defaultValue: "Subtotal" })}
                            </span>
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500 whitespace-nowrap">
                                {numberFormatter.format(total - (deliveryOption === "delivery" ? deliveryFee : 0))} {t("checkout.currency", { defaultValue: "AMD" })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500">
                                {t("cart.deliveryFee", { defaultValue: "Delivery Fee" })}
                            </span>
                            <span className="text-[16px] sm:text-[18px] md:text-[20px] text-gray-500 whitespace-nowrap">
                                {deliveryOption === "delivery" ? numberFormatter.format(deliveryFee) : 0} {t("checkout.currency", { defaultValue: "AMD" })}
                            </span>
                        </div>
                        <div className="flex justify-between items-center flex-wrap gap-2 mt-[8px] sm:mt-[10px] md:mt-[12px] pt-[8px] sm:pt-[10px] md:pt-[12px] border-t border-gray-500">
                            <span className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold">
                                {t("cart.total", { defaultValue: "Total" })}
                            </span>
                            <span className="text-[20px] sm:text-[24px] md:text-[28px] font-semibold whitespace-nowrap">
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
                <EnhancedDeliveryOptions
                    selected={deliveryOption}
                    setSelected={handleDeliveryOptionChange}
                    region={region}
                    address={address}
                    onDeliveryFeeChange={handleDeliveryFeeChange}
                />

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
                                <option key={i} value={r}>{t(`checkout.ARMENIAN_REGIONS.${r}`)}</option>
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
                    disabled={loading || cartLoading || cart.length === 0}
                    className="bg-[#efeeee] text-[#0e0e53] hover:text-white w-full h-[40px] sm:h-[44px] md:h-[48px] rounded-[12px] mt-[12px] sm:mt-[16px] md:mt-[20px] hover:bg-[#0a0a39] transition duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-[14px] sm:text-[15px] md:text-[16px]"
                >
                    {loading ? (
                        <div className="flex justify-center items-center">
                            <div className="w-[20px] sm:w-[22px] md:w-[24px] h-[20px] sm:h-[22px] md:h-[24px] border-4 border-[#0e0e53] border-t-transparent rounded-full animateborder-t-transparent rounded-full animate-spin"></div>
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