# Cedar Planter Box Website

A modern one-page storefront for selling handcrafted cedar planter boxes.

## What is included

- Responsive product showcase + gallery
- Order area with secure payment button (Stripe Checkout link)
- Custom order request form (Formspree-ready)
- Free hosting path via GitHub Pages

## File structure

- `index.html`: page content and sections
- `styles.css`: visual design and responsive layout
- `script.js`: pricing total and small interactions
- `assets/images/`: selected production photos

## Quick setup for payments (free to start)

1. Create a free Stripe account at `https://stripe.com`.
2. In Stripe dashboard, create a **Payment Link** for your planter product.
3. In `script.js`, replace:
   - `https://buy.stripe.com/test_placeholder`
   with your real payment link URL.
4. In Stripe, enable adjustable quantity on the payment link if you want quantity handled in checkout.

## Quick setup for custom order form (free tier)

1. Create a free Formspree account at `https://formspree.io`.
2. Create a form and copy your endpoint (looks like `https://formspree.io/f/xxxxxxx`).
3. In `index.html`, replace:
   - `https://formspree.io/f/your-form-id`
   with your real endpoint.

## 100% free hosting option: GitHub Pages

1. Create a free GitHub account (if needed).
2. Create a new public repository.
3. Upload all project files to the repo root.
4. In GitHub repo settings:
   - Go to **Pages**
   - Under **Build and deployment**, choose **Deploy from a branch**
   - Select `main` branch and `/ (root)` folder
5. Save. Your site will be published on a free `github.io` URL.

## Run locally

Open `index.html` in a browser, or run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
