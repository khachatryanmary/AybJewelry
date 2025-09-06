import { useTranslation } from "react-i18next";
import { Truck, Store } from "lucide-react";

const DeliveryOptions = ({ selected, setSelected }) => {
    const { t } = useTranslation();

    const options = [
        {
            value: "delivery",
            label: t("deliveryOptions.delivery", { defaultValue: "Delivery" }),
            fee: 1000,
        },
        {
            value: "pickup",
            label: t("deliveryOptions.pickup", { defaultValue: "Pick up (Vernissage)" }),
            fee: 0,
        },
    ];

    return (
        <div className="flex gap-4 mt-6">
            {options.map((option) => (
                <label
                    key={option.value}
                    className={`flex items-center gap-2 cursor-pointer p-4 rounded-xl border transition ${
                        selected === option.value ? "border-black bg-gray-100" : "border-gray-300"
                    }`}
                >
                    <input
                        type="radio"
                        name="deliveryOption"
                        value={option.value}
                        checked={selected === option.value}
                        onChange={() => setSelected(option.value)}
                        className="hidden"
                    />
                    {option.value === "delivery" ? (
                        <Truck className="w-5 h-5" />
                    ) : (
                        <Store className="w-5 h-5" />
                    )}
                    <span>
                        {option.label}{" "}
                        {option.fee > 0
                            ? `(${new Intl.NumberFormat("hy-AM").format(option.fee)} ${t("checkout.currency", { defaultValue: "AMD" })})`
                            : ""}
                    </span>
                </label>
            ))}
        </div>
    );
};

export default DeliveryOptions;