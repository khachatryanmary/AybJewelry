// DeliveryOptions.jsx
import { Truck, Store } from "lucide-react";

const DeliveryOptions = ({ selected, setSelected }) => {
    return (
        <div className="flex gap-4 mt-6">
            {/* Delivery Option */}
            <label
                className={`flex items-center gap-2 cursor-pointer p-4 rounded-xl border transition ${
                    selected === "delivery" ? "border-black bg-gray-100" : "border-gray-300"
                }`}
            >
                <input
                    type="radio"
                    name="deliveryOption"
                    value="delivery"
                    checked={selected === "delivery"}
                    onChange={() => setSelected("delivery")}
                    className="hidden"
                />
                <Truck className="w-5 h-5" />
                <span>Delivery</span>
            </label>

            {/* Pickup Option */}
            <label
                className={`flex items-center gap-2 cursor-pointer p-4 rounded-xl border transition ${
                    selected === "pickup" ? "border-black bg-gray-100" : "border-gray-300"
                }`}
            >
                <input
                    type="radio"
                    name="deliveryOption"
                    value="pickup"
                    checked={selected === "pickup"}
                    onChange={() => setSelected("pickup")}
                    className="hidden"
                />
                <Store className="w-5 h-5" />
                <span>Pick up (Vernissage)</span>
            </label>
        </div>
    );
};

export default DeliveryOptions;
