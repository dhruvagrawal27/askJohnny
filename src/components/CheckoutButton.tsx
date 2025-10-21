import React from "react";

type CheckoutButtonProps = {
  priceId: string;
  disabled?: boolean;
};

const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  priceId,
  disabled,
}) => {
  const VITE_BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

  const handleCheckout = async () => {
    if (disabled) return;
    try {
      const res = await fetch(
        `${VITE_BACKEND_BASE_URL}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId }),
        }
      );

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={disabled}
      className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-200 ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-purple-600 hover:bg-purple-700"
      }`}
    >
      Checkout
    </button>
  );
};

export default CheckoutButton;
