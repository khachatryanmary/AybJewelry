import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { selectCartTotal, setCart } from "../Toolkit/slices/cartSlice";
import DeliveryOptions from "../components/DeliveryOptions";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const ARMENIAN_REGIONS = [
    "Երևան", "Արմավիր", "Արագածոտն", "Արարատ", "Կոտայք", "Շիրակ",
    "Լոռի", "Տավուշ", "Վայոց Ձոր", "Սյունիք", "Գեղարքունիք"
];

const CheckoutForm = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const cart = useSelector((state) => state.cart.cart);
    const total = useSelector(selectCartTotal);
    const user = useSelector((state) => state.auth.user);
    const stripe = useStripe();
    const elements = useElements();

    const [email, setEmail] = useState(user?.email || "");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [region, setRegion] = useState("");
    const [address, setAddress] = useState("");
    const [apartment, setApartment] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [deliveryOption, setDeliveryOption] = useState("delivery");
    const [cardHolderFirst, setCardHolderFirst] = useState("");
    const [cardHolderLast, setCardHolderLast] = useState("");
    const [loading, setLoading] = useState(false);

    const currentUser = useSelector((state) => state.auth.user);
    const userId = currentUser?.id;
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/cart/${userId}`, { withCredentials: true });
                dispatch(setCart(res.data));
            } catch (error) {
                console.error("Failed to fetch cart", error);
            }
        };
        fetchCart();
    }, [dispatch, userId, API_URL]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        try {
            const { data: clientSecret } = await axios.post(`${API_URL}/api/payment`, {
                amount: total * 100,
            });

            const cardElement = elements.getElement(CardElement);
            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: `${cardHolderFirst} ${cardHolderLast}`,
                        email,
                        phone,
                        address: {
                            line1: address,
                            city: region,
                            postal_code: postalCode,
                            country: "AM"
                        }
                    }
                }
            });

            if (paymentResult.error) {
                alert(paymentResult.error.message);
            } else if (paymentResult.paymentIntent.status === "succeeded") {
                alert("Payment successful!");
                await axios.post(`${API_URL}/api/orders`, {
                    customer: { email, firstName, lastName, phone, region, address, apartment, postalCode, deliveryType: deliveryOption },
                    cart,
                    total
                });
            }
        } catch (err) {
            console.error(err);
            alert("Payment failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-[90%] mx-auto flex flex-col items-center justify-center min-h-[80vh] py-10 gap-10">
            <h2 className="font-[Against] text-[30px] text-center">
                {t("checkout.checkoutTitle") || "Checkout"}
            </h2>

            {/* Cart items */}
            <ul className="w-full flex flex-col gap-[20px]">
                {cart.map((item, i) => (
                    <li key={`${item.id}-${item.size}`} className="flex justify-between items-center border border-gray-300 rounded p-[10px]">
                        <img src={`${API_URL}${item.image}`} alt={item.name} className="w-[120px] h-auto object-contain" />
                        <span className="text-[18px] w-[150px]">
                            {item.name}
                        </span>
                        <span className="text-[18px] w-[150px]">{item.size && `${t("cart.size")}: ${item.size}`}</span>
                        <span className="text-[18px]">{item.quantity === 1 ? item.price : item.quantity + " x " + item.price} AMD</span>
                        <span className="text-[18px]">{item.totalPrice} AMD</span>
                    </li>
                ))}
            </ul>

            {/* Total */}
            <div className="w-full flex justify-between mt-[30px] p-[30px] border-t border-b border-gray-300">
                <span className="text-[24px]">{t("cart.total")}</span>
                <span className="text-[24px]">{total} AMD</span>
            </div>

            {/* Checkout form */}
            <form onSubmit={handleSubmit} className="w-full max-w-[600px] flex flex-col gap-6 mt-10">
                <DeliveryOptions selected={deliveryOption} setSelected={setDeliveryOption} />

                {/* Contact info */}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="p-3 border border-gray-300 rounded" required />
                <div className="flex gap-4">
                    <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="p-3 border border-gray-300 rounded w-full" required />
                    <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="p-3 border border-gray-300 rounded w-full" required />
                </div>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+374..." className="p-3 border border-gray-300 rounded" required />

                {/* Delivery info */}
                {deliveryOption === "delivery" && (
                    <>
                        <select value={region} onChange={(e) => setRegion(e.target.value)} className="p-3 border border-gray-300 rounded" required>
                            <option value="">Select region</option>
                            {ARMENIAN_REGIONS.map((r, i) => (
                                <option key={i} value={r}>{r}</option>
                            ))}
                        </select>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street address" className="p-3 border border-gray-300 rounded" required />
                        <input type="text" value={apartment} onChange={(e) => setApartment(e.target.value)} placeholder="Apartment" className="p-3 border border-gray-300 rounded" />
                        <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Postal Code" className="p-3 border border-gray-300 rounded" required />
                    </>
                )}

                {/* Payment details */}
                <h3 className="text-[20px] font-semibold mt-6">{t("checkout.paymentDetails") || "Payment Details"}</h3>
                <div className="flex gap-4">
                    <input type="text" placeholder="Cardholder First Name" className="p-3 border border-gray-300 rounded w-full" value={cardHolderFirst} onChange={(e) => setCardHolderFirst(e.target.value)} required />
                    <input type="text" placeholder="Cardholder Last Name" className="p-3 border border-gray-300 rounded w-full" value={cardHolderLast} onChange={(e) => setCardHolderLast(e.target.value)} required />
                </div>
                <div className="p-3 border border-gray-300 rounded bg-white">
                    <CardElement options={{
                        hidePostalCode: true,
                        disabledPaymentMethods: ['apple_pay', 'google_pay']
                    }} />
                </div>

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="text-[black] hover:text-[white] w-full h-[50px] rounded-[10px] bg-[#efeeee] mt-[20px] hover:bg-[#0a0a39] transition"
                >
                    {loading ? "Processing..." : t("checkout.placeOrder") || "Place Order"}
                </button>
            </form>
        </div>
    );
};

const CheckOut = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default CheckOut;