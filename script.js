const orderForm = document.getElementById("order-form");
const quantityInputs = orderForm
  ? Array.from(orderForm.querySelectorAll("input[name='quantity']"))
  : [];
const estimatedTotal = document.getElementById("estimated-total");
const estimatedTotalField = document.getElementById("estimated-total-field");
const deliveryFeeField = document.getElementById("delivery-fee-field");
const unitPriceEl = document.getElementById("unit-price");
const deliveryFeeEl = document.getElementById("delivery-fee");
const checkoutNote = document.getElementById("checkout-note");
const stripeLinkField = document.getElementById("stripe-link-field");
const formStatus = document.getElementById("form-status");
const draftStatus = document.getElementById("draft-status");
const submitButton = document.getElementById("submit-button");
const fulfillmentContactNote = document.getElementById("fulfillment-contact-note");
const deliveryFields = document.getElementById("delivery-fields");
const deliveryAddress = document.getElementById("delivery-address");
const deliveryCity = document.getElementById("delivery-city");
const deliveryZip = document.getElementById("delivery-zip");
const phoneInput = document.getElementById("phone");
const neededByInput = document.getElementById("needed-by");
const deliveryMapEl = document.getElementById("delivery-map");
const yearEl = document.getElementById("year");
const mobileTotal = document.getElementById("mobile-total");

const DELIVERY_FEE_CENTS = 1000;
const CUSTOM_QUANTITY_VALUE = "5plus";
const DRAFT_STORAGE_KEY = "cedar-planter-order-draft";
const DRAFT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;
const FORM_TIMEOUT_MS = 12000;
let deliveryMapInitialized = false;
let isRestoringDraft = false;

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
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0
  }).format(cents / 100);
}

function getFulfillmentMethod() {
  return orderForm?.querySelector("input[name='fulfillment_method']:checked")?.value || "pickup";
}

function getQuantityValue() {
  return orderForm?.querySelector("input[name='quantity']:checked")?.value || "1";
}

function isCustomQuantitySelection() {
  return getQuantityValue() === CUSTOM_QUANTITY_VALUE;
}

function getQuantityForPricing() {
  if (isCustomQuantitySelection()) return 5;
  return Number(getQuantityValue() || 1);
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
  if (!neededByInput.value || neededByInput.value < minDateString) {
    neededByInput.value = minDateString;
  }
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

function setRadioValue(name, value) {
  const radio = Array.from(orderForm.querySelectorAll(`input[name="${name}"]`)).find(
    (input) => input.value === value
  );
  if (radio) radio.checked = true;
}

function getFieldValue(name) {
  return orderForm?.elements[name]?.value || "";
}

function setFieldValue(name, value) {
  const field = orderForm?.elements[name];
  if (field && typeof field.value !== "undefined") {
    field.value = value || "";
  }
}

function readDraft() {
  try {
    const rawDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!rawDraft) return null;

    const draft = JSON.parse(rawDraft);
    if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_MAX_AGE_MS) {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
    return draft;
  } catch (error) {
    console.warn("Unable to read saved order draft:", error);
    return null;
  }
}

function writeDraft() {
  if (!orderForm || isRestoringDraft) return;

  const draft = {
    savedAt: Date.now(),
    full_name: getFieldValue("full_name"),
    phone: getFieldValue("phone"),
    email: getFieldValue("email"),
    preferred_contact: getFieldValue("preferred_contact"),
    quantity: getQuantityValue(),
    needed_by: getFieldValue("needed_by"),
    fulfillment_method: getFulfillmentMethod(),
    delivery_address: getFieldValue("delivery_address"),
    delivery_city: getFieldValue("delivery_city"),
    delivery_zip: getFieldValue("delivery_zip"),
    order_notes: getFieldValue("order_notes")
  };

  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    if (draftStatus) {
      draftStatus.textContent = "Order details saved on this device.";
    }
  } catch (error) {
    console.warn("Unable to save order draft:", error);
  }
}

function restoreDraft() {
  if (!orderForm) return;

  const draft = readDraft();
  if (!draft) return;

  isRestoringDraft = true;
  setFieldValue("full_name", draft.full_name);
  setFieldValue("phone", draft.phone);
  setFieldValue("email", draft.email);
  setFieldValue("preferred_contact", draft.preferred_contact);
  setFieldValue("needed_by", draft.needed_by);
  setFieldValue("delivery_address", draft.delivery_address);
  setFieldValue("delivery_city", draft.delivery_city);
  setFieldValue("delivery_zip", draft.delivery_zip);
  setFieldValue("order_notes", draft.order_notes);
  setRadioValue("quantity", draft.quantity || "1");
  setRadioValue("fulfillment_method", draft.fulfillment_method || "pickup");
  isRestoringDraft = false;

  if (draftStatus) {
    draftStatus.textContent = "Restored saved order details from this device.";
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch (error) {
    console.warn("Unable to clear saved order draft:", error);
  }
}

function setSubmitting(isSubmitting) {
  if (!orderForm || !submitButton) return;
  submitButton.disabled = isSubmitting;
  orderForm.setAttribute("aria-busy", String(isSubmitting));
  submitButton.textContent = isSubmitting
    ? "Submitting order..."
    : "Submit order and continue to payment";
}

function markMapUnavailable() {
  if (!deliveryMapEl || deliveryMapInitialized) return;
  deliveryMapEl.classList.add("map-unavailable");
  deliveryMapEl.textContent = "Map unavailable. Delivery is available within 30 miles of Paxton, Illinois.";
}

function initDeliveryMap() {
  if (deliveryMapInitialized || !deliveryMapEl || typeof L === "undefined") return;

  const paxtonLatLng = [40.4592, -88.0956];
  const deliveryRadiusMeters = 30 * 1609.34;
  const map = L.map("delivery-map", {
    scrollWheelZoom: false
  }).setView(paxtonLatLng, 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const circle = L.circle(paxtonLatLng, {
    radius: deliveryRadiusMeters,
    color: "#1f5a3d",
    weight: 2,
    fillColor: "#1f5a3d",
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
  if (retries <= 0) {
    markMapUnavailable();
    return;
  }
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
  if (!unitPriceEl || !estimatedTotal || !deliveryFeeEl) return;

  const unitPrice = Number(unitPriceEl.dataset.priceCents || 9500);
  const quantity = getQuantityForPricing();
  const isCustomQuantity = isCustomQuantitySelection();
  const isDelivery = getFulfillmentMethod() === "delivery";
  const deliveryFee = isDelivery ? DELIVERY_FEE_CENTS : 0;
  const total = unitPrice * quantity + deliveryFee;
  const selectedLink = getSelectedStripeLink();
  const displayTotal = isCustomQuantity ? `${formatUSD(total)}+` : formatUSD(total);

  estimatedTotal.textContent = displayTotal;
  deliveryFeeEl.textContent = formatUSD(deliveryFee);
  if (mobileTotal) mobileTotal.textContent = displayTotal;
  if (estimatedTotalField) {
    estimatedTotalField.value = isCustomQuantity
      ? `${displayTotal} (minimum for 5+ planters)`
      : displayTotal;
  }
  if (deliveryFeeField) deliveryFeeField.value = formatUSD(deliveryFee);
  if (stripeLinkField) stripeLinkField.value = selectedLink;

  if (!checkoutNote) return;
  if (isCustomQuantity) {
    checkoutNote.textContent =
      "For 5+ planters, submit this request and I will confirm order details before sending the appropriate payment link.";
  } else if (selectedLink) {
    checkoutNote.textContent = `Payment link will open for ${quantity} planter${quantity > 1 ? "s" : ""}${isDelivery ? " with delivery" : ""}.`;
  } else {
    checkoutNote.textContent =
      "This checkout option is not ready yet. Email contact@hubiedubois.com and I will send the correct payment link.";
  }
}

function updateFulfillmentFields() {
  const fulfillment = getFulfillmentMethod();
  const isDelivery = fulfillment === "delivery";

  if (deliveryFields) deliveryFields.hidden = !isDelivery;
  if (deliveryAddress) deliveryAddress.required = isDelivery;
  if (deliveryCity) deliveryCity.required = isDelivery;
  if (deliveryZip) deliveryZip.required = isDelivery;
  if (fulfillmentContactNote) {
    fulfillmentContactNote.textContent = isDelivery
      ? "Delivery orders are confirmed after submission and payment."
      : "For pickup orders, I will contact you shortly with pickup location details in Paxton.";
  }
  updateTotal();
}

async function postFormWithTimeout(formAction, formData) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), FORM_TIMEOUT_MS);

  try {
    return await fetch(formAction, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function submitOrderAndRedirect(event) {
  event.preventDefault();
  if (!orderForm.reportValidity()) return;

  updateTotal();
  writeDraft();

  const isCustomQuantity = isCustomQuantitySelection();
  const selectedLink = getSelectedStripeLink();
  if (!isCustomQuantity && !selectedLink) {
    if (formStatus) {
      formStatus.textContent =
        "This checkout option is not ready yet. Email contact@hubiedubois.com and I will send the correct payment link.";
    }
    return;
  }

  setSubmitting(true);
  if (formStatus) {
    formStatus.textContent = "Submitting order details...";
  }

  const formAction = orderForm.action;
  const formData = new FormData(orderForm);
  let submissionSucceeded = true;

  if (formAction) {
    try {
      const response = await postFormWithTimeout(formAction, formData);

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
    setSubmitting(false);
    if (formStatus) {
      formStatus.textContent =
        "There was a problem submitting your order. Your details are still saved on this device, so check your connection and try again.";
    }
    return;
  }

  if (isCustomQuantity) {
    clearDraft();
    const customMessage =
      "Thank you for your order request. I will contact you to gather a few details and send the appropriate payment link.";
    if (formStatus) formStatus.textContent = customMessage;
    window.alert(customMessage);
    window.location.reload();
    return;
  }

  if (formStatus) {
    formStatus.textContent = "Opening Stripe Checkout...";
  }
  window.location.assign(selectedLink);
}

if (orderForm) {
  const fulfillmentOptions = orderForm.querySelectorAll("input[name='fulfillment_method']");

  quantityInputs.forEach((option) => option.addEventListener("change", () => {
    updateTotal();
    writeDraft();
  }));
  fulfillmentOptions.forEach((option) =>
    option.addEventListener("change", () => {
      updateFulfillmentFields();
      writeDraft();
    })
  );
  phoneInput?.addEventListener("input", handlePhoneInput);
  orderForm.addEventListener("input", writeDraft);
  orderForm.addEventListener("change", writeDraft);
  orderForm.addEventListener("submit", submitOrderAndRedirect);

  restoreDraft();
  applyLeadTimeDate();
  updateTotal();
  updateFulfillmentFields();
}

tryInitDeliveryMap();
window.addEventListener("load", () => tryInitDeliveryMap());
if (yearEl) yearEl.textContent = new Date().getFullYear();
