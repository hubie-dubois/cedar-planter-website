# Cedar Planter Co. SEO audit

Implementation and local validation completed November 4, 2026. Live redirect observations below were made November 3, 2026. Publication was authorized on November 4; consult repository history and GitHub Pages deployment status for the published revision.

## Changes and findings

| Area | Finding and action |
| --- | --- |
| Preferred domain | Homepage canonical, Open Graph URL/images, Twitter image, JSON-LD IDs/URLs, sitemap, and robots sitemap directive still used `planters.hubiedubois.com`. Corrected to `https://paxtonplanters.com/`. Relative navigation/assets resolve on the same preferred host. |
| Titles and descriptions | Homepage already had the requested title; retained it and its single meaningful H1. Replaced its description with the requested text. Confirmation has a distinct title/description and remains `noindex, follow`; added its own canonical. |
| Headings and content | Kept the H1-to-H2 hierarchy. Expanded the existing product story with the requested Paxton heading, cedar flower/garden/outdoor planter language, and natural Central Illinois context. Added a service-area section using existing layout styles. |
| Delivery coverage | User and current production code specify approximately 30 miles; README incorrectly said 25. Corrected README. No surrounding town coverage was assumed or advertised. Address confirmation is offered at the edge of the delivery area. |
| Product content | One genuine standard product already has photos, price, dimensions, drainage details, custom-order contact and checkout. Made its existing name visible, linked its specs to ordering, and added footer navigation. Kept it on the homepage; a second near-duplicate product page would add little value. |
| Business schema | Retained `LocalBusiness` because a retail storefront subtype is not established. Added confirmed locality/region/country, description, existing logo, approximately 30-mile service area, and the product offer relationship. No street address, phone, hours, coordinates, reviews or social profile URLs were invented. |
| Product schema | Uses the visible product name, real close-up images, both interior/exterior dimensions in the description, cedar material, and the existing $95 USD offer. Removed unsupported `InStock`: the visible site describes a minimum build lead time. |
| FAQ schema | Existing FAQ answers match visible content. Retained valid Schema.org markup and added its matching HTML anchor. No FAQ rich-result benefit is claimed. |
| Crawling | robots.txt allows public crawling and points to the corrected sitemap. Sitemap contains only the homepage, excludes confirmation/verification/duplicate index URLs, and omits an unreliable lastmod. |
| Search Console verification | Preserved the existing `google3bd85db43eab4e14.html` verification file unchanged. No verification meta tag was present. Account ownership/verification status was not checked. |
| Images | Inspected all nine original photos and the existing logo; seven photos are displayed. Existing descriptive alt text, dimensions, responsive sources, lazy gallery loading and high-priority hero loading were already present and retained. Added 14 descriptive WebP variants with JPEG fallbacks; originals and old image URLs remain available. |
| Performance | Responsive JPEG set: 2,133,132 bytes. Equivalent WebP set: 1,257,322 bytes, 41.1% smaller in aggregate. Each browser downloads selected variants, not the entire set. Deferred Leaflet CSS/JS and tiles until the map is near view; removed its initial render-blocking CSS/preconnect. Removed the hero text entrance delay. Existing font display=swap remains. |
| Accessibility | Kept labeled form controls, native FAQ disclosures, image descriptions, skip link and reduced-motion styles. Added visible link/disclosure focus indicators, wrapping for contact addresses, and footer links accessible on mobile. |
| Error messaging | Corrected the older email address in checkout fallback messages to `contact@paxtonplanters.com`. |

## Validation

Run from the repository root, with Python 3 and Node.js; no package installation or build is needed:

```sh
python3 scripts/validate-seo.py
node scripts/test-order.cjs
node --check script.js
node --check confirmation/script.js
git diff --check
```

All passed. Checks cover local HTML asset and fragment links, unique metadata, canonical URLs, one H1 per content page, image attributes, JSON-LD parsing and key content consistency, sitemap XML, robots.txt, CNAME and the verification file. Mocked order tests cover all eight quantity/fulfillment combinations, distinct Stripe link selection, delivery fields, custom-order routing, successful/failed submissions, draft retention, lazy map loading and CDN failure fallback. These tests send no real orders or payments.

Safari visual/interaction checks covered desktop and a 390 × 844 responsive viewport: hero, service-area copy, order controls, footer/gallery links and photos. Three planters with delivery showed $295; 5+ selected the quote flow; pickup restored $95. The map loaded when reached, with its text placeholder removed after initialization. The browser accessibility tree exposed form labels, headings and navigation. This is not a full screen-reader audit or a physical mobile-device test.

JavaScript syntax and mocked runtime checks passed, and observed browser interactions worked. A complete browser console capture was unavailable through the current automation surface. No Lighthouse/Core Web Vitals field measurement or real Formspree-to-Stripe payment was performed. No build manifest/framework exists; root HTML/CSS/JS and the unchanged CNAME remain compatible with the existing GitHub Pages publication.

## Structured data assessment

JSON-LD syntax and visible-content consistency pass local checks. Properties were reviewed against [Schema.org LocalBusiness](https://schema.org/LocalBusiness), [Google LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business), and [Google Product snippet documentation](https://developers.google.com/search/docs/appearance/structured-data/product-snippet).

The Product has the core snippet fields (name and an offer with price), plus currency, description and images. Optional availability, reviews, ratings, expiration dates and shipping/return-policy markup were not fabricated. The business includes only a locality-level address. Google rich-result eligibility/display is not certified: run the deployed page through Google's Rich Results Test and Schema.org Validator, and review any address or recommended-field warnings. Add further information only if accurate and appropriate to publish. Valid schema does not guarantee a rich result or rankings.

## Hosting follow-up

Observed live behavior before deployment:

- `https://paxtonplanters.com/`: 200.
- `https://www.paxtonplanters.com/`: 301 to the preferred HTTPS apex, then 200.
- Former `https://planters.hubiedubois.com/`: 301 to www, then 301 to the apex, then 200.
- `http://paxtonplanters.com/`: 200, rather than an HTTPS redirect.

Review Cloudflare's HTTPS redirect configuration so HTTP permanently redirects to HTTPS. If you control the old-domain redirect, target the preferred apex directly and preserve paths/query strings to remove the extra hop. These are hosting settings, not HTML fixes; no DNS or Cloudflare settings were changed. Recheck after deployment because live settings can change.

## Owner checklist after publishing

1. Publish the scoped repository changes through the existing GitHub Pages process. Confirm the homepage, robots.txt, sitemap.xml, confirmation page and new WebP assets return successfully. Check that the live source contains the new canonical, not the old domain.
2. In the existing Search Console property for `paxtonplanters.com`, submit `https://paxtonplanters.com/sitemap.xml`. Preserve current ownership verification; use a domain property if already available.
3. Inspect `https://paxtonplanters.com/`, run a live test, and request indexing once. After Google recrawls, check Google's selected canonical and Page Indexing. The confirmation page should remain excluded by noindex.
4. Run the published homepage through [Rich Results Test](https://search.google.com/test/rich-results) and [Schema.org Validator](https://validator.schema.org/). Review Product and LocalBusiness findings without inventing missing fields.
5. In the existing Google Business Profile, confirm the real business name, website URL, appropriate category, actual service area, pickup arrangements, price, dimensions and product photos agree with the site. Use only genuine hours and contact information. Do not expose a private home address merely for SEO; use the profile configuration appropriate to how customers actually visit or receive delivery.
6. Add or update the real standard product in the existing profile if that feature is available, linking to the homepage/product section. The official profile URL and account were not verified or modified during this task.
7. Review Search Console queries, impressions, clicks and local inquiries monthly. Keep prices/lead times current; add original installation photos and useful care/planting information over time. Ask actual customers for honest reviews without incentives or selective review gating, and respond helpfully. Seek relevant local mentions through real community relationships.

Google's [local ranking guidance](https://support.google.com/business/answer/7091) emphasizes accurate information, reviews and photos; its [Search Essentials](https://developers.google.com/search/docs/essentials) and [spam policies](https://developers.google.com/search/docs/essentials/spam-policies) support useful content rather than keyword stuffing or doorway town pages. No first-page or Maps-placement guarantee is made.

## Information needed for additional improvements

- Official Google Business Profile URL and any official social profile URLs, to verify before adding `sameAs`.
- Confirmed public business telephone/hours, if you want them displayed; a public customer-facing address only if applicable.
- Whether delivery distance is road mileage or a radius, and confirmation of specific towns before naming them.
- Current availability/build schedule and sufficiently detailed shipping/return policies before adding that optional merchant markup.

## File inventory

Modified: `index.html`, `styles.css`, `script.js`, `robots.txt`, `sitemap.xml`, `confirmation/index.html`, `README.md`.

Added: this `SEO_AUDIT.md`, `scripts/validate-seo.py`, `scripts/test-order.cjs`, and these 14 files under `Images/optimized/`:

- `cedar-planters-patio-720.webp`, `cedar-planters-patio-1150.webp`
- `cedar-planter-tomato-deck-480.webp`, `cedar-planter-tomato-deck-900.webp`
- `cedar-flower-planter-480.webp`, `cedar-flower-planter-900.webp`
- `cedar-planter-build-480.webp`, `cedar-planter-build-900.webp`
- `cedar-planter-side-480.webp`, `cedar-planter-side-900.webp`
- `cedar-planter-pair-480.webp`, `cedar-planter-pair-900.webp`
- `cedar-planter-front-480.webp`, `cedar-planter-front-900.webp`
