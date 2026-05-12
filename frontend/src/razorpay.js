// Razorpay Checkout client
import api from "@/api";
import { toast } from "sonner";

// Loads Razorpay's Checkout JS once (only when keys are configured).
let rzpLoading = null;
function loadRazorpayJS() {
  if (typeof window === "undefined") return Promise.reject();
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (rzpLoading) return rzpLoading;
  rzpLoading = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve(window.Razorpay);
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
  return rzpLoading;
}

/**
 * Open a Razorpay checkout (or mock checkout) for a package.
 * @param packageId one of basic_monthly | premium_monthly | platinum_monthly | swipe_pack
 * @returns Promise resolving to { ok: true, mock: boolean } on payment success
 */
export async function payWithRazorpay(packageId) {
  const { data: order } = await api.post("/razorpay/order", { package_id: packageId });

  // MOCK / Demo mode — no real keys configured. Show our own confirm dialog.
  if (order.mock) {
    const ok = window.confirm(
      `Demo mode (no Razorpay keys configured yet).\n\nPay ₹${(order.amount / 100).toFixed(0)} for ${order.description}?\n\nClick OK to simulate a successful payment.`
    );
    if (!ok) throw new Error("cancelled");
    const { data: verify } = await api.post("/razorpay/verify", { order_id: order.order_id, mock: true });
    return { ok: true, mock: true, verify };
  }

  // Real Razorpay Checkout modal
  const Razorpay = await loadRazorpayJS();
  return await new Promise((resolve, reject) => {
    const opts = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      order_id: order.order_id,
      prefill: order.prefill,
      notes: order.notes,
      theme: { color: "#C45A45" },
      handler: async (resp) => {
        try {
          const { data: verify } = await api.post("/razorpay/verify", {
            order_id: resp.razorpay_order_id,
            payment_id: resp.razorpay_payment_id,
            signature: resp.razorpay_signature,
          });
          resolve({ ok: true, mock: false, verify });
        } catch (e) {
          toast.error(e?.response?.data?.detail || "Payment verification failed");
          reject(e);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("dismissed")),
      },
    };
    new Razorpay(opts).open();
  });
}
