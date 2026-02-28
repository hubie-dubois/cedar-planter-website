const orderForm = document.getElementById("order-form");
const quantitySelect = document.getElementById("quantity");
const estimatedTotal = document.getElementById("estimated-total");
const estimatedTotalField = document.getElementById("estimated-total-field");
const deliveryFeeField = document.getElementById("delivery-fee-field");
const unitPriceEl = document.getElementById("unit-price");
const deliveryFeeEl = document.getElementById("delivery-fee");
const checkoutNote = document.getElementById("checkout-note");
const stripeLinkField = document.getElementById("stripe-link-field");
const formStatus = document.getElementById("form-status");
const fulfillmentContactNote = document.getElementById("fulfillment-contact-note");
const deliveryFields = document.getElementById("delivery-fields");
const deliveryAddress = document.getElementById("delivery-address");
const deliveryCity = document.getElementById("delivery-city");
const deliveryZip = document.getElementById("delivery-zip");
const phoneInput = document.getElementById("phone");
const neededByInput = document.getElementById("needed-by");
const deliveryMapEl = document.getElementById("delivery-map");
const yearEl = document.getElementById("year");
const DELIVERY_FEE_CENTS = 1000;
const CUSTOM_QUANTITY_VALUE = "5plus";
let deliveryMapInitialized = false;

// Replace delivery links with your Stripe payment links that include the $10 delivery fee.
const STRIPE_PAYMENT_LINKS = {
  pickup: {
    1: "https://buy.stripe.com/dRm14o9Qa3zf8ULgERbMQ00",
    2: "https://buy.stripe.com/aFa4gAe6q8Tzc6X1JXbMQ01",
    3: "https://buy.stripe.com/4gM14o9Qad9P5Iz74hbMQ02",
    4: "https://buy.stripe.com/cNieVegeyc5L6MD9cpbMQ04"
  },
  delivery: {
    1: "https://buy.stripe.com/bJe3cw8M62vb1sj88lbMQ05",
    2: "https://buy.stripe.com/14A7sM9Qa5Hnef51JXbMQ06",
    3: "https://buy.stripe.com/00w7sMgeygm1c6XfANbMQ07",
    4: "https://buy.stripe.com/6oU14o8M6edT9YPagtbMQ08"
  }
};

function formatUSD(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents / 100);
}

function getFulfillmentMethod() {
  return orderForm.querySelector("input[name='fulfillment_method']:checked")?.value || "pickup";
}

function isCustomQuantitySelection() {
  return quantitySelect.value === CUSTOM_QUANTITY_VALUE;
}

function getQuantityForPricing() {
  if (isCustomQuantitySelection()) return 5;
  return Number(quantitySelect.value || 1);
}

function formatDateAsLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function applyLeadTimeDate() {
  if (!neededByInput) return;

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  minDate.setDate(minDate.getDate() + 3);
  const minDateString = formatDateAsLocalISO(minDate);

  neededByInput.min = minDateString;
  neededByInput.value = minDateString;
}

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function handlePhoneInput() {
  if (!phoneInput) return;
  phoneInput.value = formatPhoneNumber(phoneInput.value);
}

function initDeliveryMap() {
  if (deliveryMapInitialized || !deliveryMapEl || typeof L === "undefined") return;

  const paxtonLatLng = [40.4592, -88.0956];
  const deliveryRadiusMeters = 30 * 1609.34;
  const map = L.map("delivery-map").setView(paxtonLatLng, 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const circle = L.circle(paxtonLatLng, {
    radius: deliveryRadiusMeters,
    color: "#2f6a45",
    weight: 2,
    fillColor: "#2f6a45",
    fillOpacity: 0.16
  }).addTo(map);

  L.marker(paxtonLatLng).addTo(map).bindPopup("Paxton, IL");
  map.fitBounds(circle.getBounds(), { padding: [20, 20] });
  deliveryMapInitialized = true;
}

function tryInitDeliveryMap(retries = 12) {
  if (deliveryMapInitialized) return;
  if (typeof L !== "undefined") {
    initDeliveryMap();
    return;
  }
  if (retries <= 0) return;
  window.setTimeout(() => tryInitDeliveryMap(retries - 1), 250);
}

function getSelectedStripeLink() {
  if (isCustomQuantitySelection()) return "";
  const fulfillmentMethod = getFulfillmentMethod();
  const quantity = getQuantityForPricing();
  const linksByMethod = STRIPE_PAYMENT_LINKS[fulfillmentMethod] || STRIPE_PAYMENT_LINKS.pickup;
  const selectedLink = linksByMethod[quantity];
  return selectedLink && selectedLink.startsWith("https://") ? selectedLink : "";
}

function updateTotal() {
  const unitPrice = Number(unitPriceEl.dataset.priceCents || 9500);
  const quantity = getQuantityForPricing();
  const isCustomQuantity = isCustomQuantitySelection();
  const isDelivery = getFulfillmentMethod() === "delivery";
  const deliveryFee = isDelivery ? DELIVERY_FEE_CENTS : 0;
  const total = unitPrice * quantity + deliveryFee;
  const selectedLink = getSelectedStripeLink();

  estimatedTotal.textContent = isCustomQuantity ? `${formatUSD(total)}+` : formatUSD(total);
  deliveryFeeEl.textContent = formatUSD(deliveryFee);
  estimatedTotalField.value = isCustomQuantity
    ? `${formatUSD(total)}+ (minimum for 5+ planters)`
    : formatUSD(total);
  deliveryFeeField.value = formatUSD(deliveryFee);
  stripeLinkField.value = selectedLink;

  if (isCustomQuantity) {
    checkoutNote.textContent = "For 5+ planters, submit this request and I will contact you to confirm order details and send the appropriate payment link.";
  } else if (selectedLink) {
    checkoutNote.textContent = `Payment link will open for ${quantity} planter${quantity > 1 ? "s" : ""}${isDelivery ? " with delivery" : ""}.`;
  } else {
    checkoutNote.textContent = "Add your delivery Stripe links in script.js before using delivery checkout.";
  }
}

function updateFulfillmentFields() {
  const fulfillment = getFulfillmentMethod();
  const isDelivery = fulfillment === "delivery";

  deliveryFields.hidden = !isDelivery;
  deliveryAddress.required = isDelivery;
  deliveryCity.required = isDelivery;
  deliveryZip.required = isDelivery;
  if (fulfillmentContactNote) {
    fulfillmentContactNote.textContent = isDelivery
      ? "Delivery orders are confirmed after submission and payment."
      : "For pickup orders, I will contact you shortly with pickup location details in Paxton.";
  }
  updateTotal();
}

async function submitOrderAndRedirect(event) {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  updateTotal();
  const isCustomQuantity = isCustomQuantitySelection();
  const selectedLink = getSelectedStripeLink();
  if (!isCustomQuantity && !selectedLink) {
    formStatus.textContent = "Delivery payment links are not set yet. Please update script.js first.";
    return;
  }
  formStatus.textContent = "Submitting order details...";

  const formAction = orderForm.action;
  const formData = new FormData(orderForm);
  let submissionSucceeded = true;

  if (formAction && !formAction.includes("your-form-id")) {
    try {
      const response = await fetch(formAction, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        submissionSucceeded = false;
        console.error("Order form submission did not return OK:", response.status);
      }
    } catch (error) {
      submissionSucceeded = false;
      console.error("Order form submission failed:", error);
    }
  }

  if (!submissionSucceeded) {
    formStatus.textContent = "There was a problem submitting your order. Please try again.";
    return;
  }

  if (isCustomQuantity) {
    const customMessage =
      "Thank you for your order request. I will contact you to gather a few details and send the appropriate payment link.";
    formStatus.textContent = customMessage;
    window.alert(customMessage);
    window.location.reload();
    return;
  }

  formStatus.textContent = "Opening Stripe Checkout...";
  window.location.href = selectedLink;
}

if (orderForm) {
  const fulfillmentOptions = orderForm.querySelectorAll("input[name='fulfillment_method']");

  quantitySelect.addEventListener("change", updateTotal);
  fulfillmentOptions.forEach((option) => option.addEventListener("change", updateFulfillmentFields));
  phoneInput?.addEventListener("input", handlePhoneInput);
  orderForm.addEventListener("submit", submitOrderAndRedirect);

  applyLeadTimeDate();
  updateTotal();
  updateFulfillmentFields();
}

tryInitDeliveryMap();
window.addEventListener("load", () => tryInitDeliveryMap());
yearEl.textContent = new Date().getFullYear();
