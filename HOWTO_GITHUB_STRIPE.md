# How To Launch Your Cedar Planter Website (GitHub + Stripe)

This guide walks you through publishing your site for free and accepting payments.

## What you already have

Your website files are in this folder:

- `index.html`
- `styles.css`
- `script.js`
- `assets/images/*`

## Part 1: Create a GitHub account (free)

1. Go to `https://github.com`.
2. Click **Sign up**.
3. Create your account and verify your email.

## Part 2: Create a new GitHub repository

1. In GitHub, click the `+` icon (top-right), then **New repository**.
2. Repository name suggestion: `cedar-planter-website`.
3. Set visibility to **Public** (required for free GitHub Pages on personal accounts).
4. Click **Create repository**.

## Part 3: Upload your website files to GitHub

### Option A (easiest): upload from browser

1. Open your new repo page.
2. Click **uploading an existing file**.
3. Drag all project files/folders into GitHub:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/`
   - `Images/` (optional, not required for live site)
   - `README.md`
   - `HOWTO_GITHUB_STRIPE.md`
4. Scroll down, enter commit message: `Initial website upload`.
5. Click **Commit changes**.

### Option B: use Git locally (recommended long term)

Run these commands in your project folder:

```bash
git init
git add .
git commit -m "Initial website upload"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/cedar-planter-website.git
git push -u origin main
```

Replace `YOUR-USERNAME` with your GitHub username.

## Part 4: Enable free GitHub Pages hosting

1. Open your repo on GitHub.
2. Go to **Settings**.
3. Click **Pages** in the left sidebar.
4. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**.
6. Wait 1-3 minutes.
7. Refresh the Pages settings page and copy your site URL.

Your URL will look like:

`https://YOUR-USERNAME.github.io/cedar-planter-website/`

## Part 5: Create a Stripe account (free to start)

1. Go to `https://stripe.com`.
2. Click **Start now** and create your account.
3. Confirm email and finish basic business profile.
4. In Stripe dashboard, complete account activation steps:
   - Business info
   - Payout bank account
   - Identity verification (if requested)

Note: Stripe charges payment processing fees per sale.

## Part 6: Create your product in Stripe

1. In Stripe dashboard, go to **Product catalog** (or **Products**).
2. Click **Add product**.
3. Name: `Classic Cedar Planter Box`.
4. Price: set your price (example: `$149.00 USD`).
5. Save the product.

## Part 7: Create a Stripe Payment Link

1. In Stripe, go to **Payment Links**.
2. Click **Create payment link**.
3. Add your `Classic Cedar Planter Box` product.
4. Set quantity behavior:
   - Turn on adjustable quantity (recommended).
5. Optional but recommended settings:
   - Collect customer email
   - Collect shipping address (if you deliver/ship)
   - Add phone number collection
6. Click **Create link**.
7. Copy the generated URL (looks like `https://buy.stripe.com/...`).

## Part 8: Put Stripe link into your website

Open these files and replace the placeholder URL.

### File 1: `script.js`

Find this line:

```js
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_placeholder";
```

Replace with your real link:

```js
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/your_real_link";
```

### File 2: `index.html`

Find this link in the order section:

```html
href="https://buy.stripe.com/test_placeholder"
```

Replace with the same real Stripe link.

## Part 9: Optional custom order form (free Formspree)

If you want custom-size inquiries by email:

1. Go to `https://formspree.io` and create a free account.
2. Create a new form.
3. Copy your endpoint URL (format: `https://formspree.io/f/xxxxxxx`).
4. Open `index.html`.
5. Find:

```html
action="https://formspree.io/f/your-form-id"
```

6. Replace with your real Formspree endpoint.

## Part 10: Push updates to GitHub

If you edited files locally, push changes:

```bash
git add .
git commit -m "Configure Stripe link and form endpoint"
git push
```

GitHub Pages will automatically redeploy in about 1-3 minutes.

## Part 11: Test full checkout flow

1. Visit your GitHub Pages website URL.
2. Click **Pay Securely**.
3. Confirm Stripe Checkout opens correctly.
4. In Stripe test mode, run a test payment first.
5. When ready, switch to live mode and ensure the live link is in your files.

## Part 12: Stripe test cards

Use Stripe test card in test mode:

- Card number: `4242 4242 4242 4242`
- Any future expiration date
- Any 3-digit CVC
- Any ZIP code

## Part 13: Switch from test mode to live mode

1. In Stripe dashboard, toggle from **Test mode** to **Live mode**.
2. Create a new live Payment Link (test and live links are different).
3. Replace your site’s Stripe link with the live link.
4. Push to GitHub again (`git add`, `git commit`, `git push`).

## Troubleshooting

### Site not loading / 404 on GitHub Pages

- Confirm repo is **public**.
- Confirm Pages source is `main` branch and `/ (root)`.
- Confirm `index.html` is in repo root.
- Wait a few minutes and refresh.

### Pay button opens Stripe error page

- Verify you replaced both placeholders:
  - `script.js`
  - `index.html`
- Confirm link copied fully from Stripe.

### Custom form not sending emails

- Confirm Formspree endpoint is correct in `index.html`.
- Check Formspree dashboard for submission logs.

## Ongoing updates

Anytime you change text, price, or images:

1. Edit files locally.
2. Run:

```bash
git add .
git commit -m "Update website content"
git push
```

3. Wait for GitHub Pages to redeploy.

## Fast launch checklist

- [ ] GitHub account created
- [ ] Repo created and website uploaded
- [ ] GitHub Pages enabled
- [ ] Stripe account activated
- [ ] Product created in Stripe
- [ ] Payment Link created
- [ ] Stripe link replaced in `script.js` and `index.html`
- [ ] (Optional) Formspree endpoint added
- [ ] Changes pushed to GitHub
- [ ] Live website and checkout tested
