const quantitySelect = document.getElementById("quantity");
const estimatedTotal = document.getElementById("estimated-total");
const unitPriceEl = document.getElementById("unit-price");
const payLink = document.getElementById("pay-link");
const yearEl = document.getElementById("year");

// Replace with your real Stripe Payment Link once created.
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/dRm14o9Qa3zf8ULgERbMQ00";

function formatUSD(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function updateTotal() {
  const unitPrice = Number(unitPriceEl.dataset.priceCents || 14900);
  const quantity = Number(quantitySelect.value || 1);
  const total = unitPrice * quantity;

  estimatedTotal.textContent = formatUSD(total);

  // Stripe Payment Links can support adjustable quantity if enabled in Stripe.
  payLink.href = STRIPE_PAYMENT_LINK;
}

quantitySelect.addEventListener("change", updateTotal);
updateTotal();

yearEl.textContent = new Date().getFullYear();
