const quantitySelect = document.getElementById("quantity");
const estimatedTotal = document.getElementById("estimated-total");
const unitPriceEl = document.getElementById("unit-price");
const payLink = document.getElementById("pay-link");
const checkoutNote = document.getElementById("checkout-note");
const yearEl = document.getElementById("year");

// Replace each value with the Stripe Payment Link for that exact quantity.
// Create one Stripe link per quantity so checkout total always matches your site total.
const STRIPE_PAYMENT_LINKS = {
  1: "https://buy.stripe.com/dRm14o9Qa3zf8ULgERbMQ00",
  2: "https://buy.stripe.com/aFa4gAe6q8Tzc6X1JXbMQ01",
  3: "https://buy.stripe.com/4gM14o9Qad9P5Iz74hbMQ02",
  4: "https://buy.stripe.com/cNieVegeyc5L6MD9cpbMQ04"
};

function formatUSD(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function updateTotal() {
  const unitPrice = Number(unitPriceEl.dataset.priceCents || 9500);
  const quantity = Number(quantitySelect.value || 1);
  const total = unitPrice * quantity;
  const selectedLink = STRIPE_PAYMENT_LINKS[quantity] || STRIPE_PAYMENT_LINKS[1];

  estimatedTotal.textContent = formatUSD(total);
  payLink.href = selectedLink;
  checkoutNote.textContent = `Checkout will open for ${quantity} planter${quantity > 1 ? "s" : ""}.`;
}

quantitySelect.addEventListener("change", updateTotal);
updateTotal();

yearEl.textContent = new Date().getFullYear();
