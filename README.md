Planter Website Project Context

Current State

Site is a single-page marketing + order form flow for cedar planter boxes.
Payment is Stripe Payment Links, quantity-based for 1-4.
5+ quantity uses manual follow-up flow (no Stripe redirect).
Order Form Behavior

Required fields:
Full name
Phone (auto-formatted as (###) ###-####)
Email
Preferred contact method
Quantity
Fulfillment method (pickup or delivery)
Delivery address/city/zip only when delivery is selected
Optional fields:
Needed by date
Order notes
Needed-by date defaults to minimum lead time of 3 days in the future and enforces min date.
Fulfillment + Pricing

Base price: $95 per planter.
Delivery fee: $10 when delivery is selected.
Pickup:
Customer is informed that pickup details are shared after order.
Delivery:
Limited to 25 miles of Paxton, IL.
Stripe Logic

Pickup Stripe links configured for quantities 1-4.
Delivery Stripe links configured for quantities 1-4.
For 5+:
Form submits to Formspree.
Customer sees confirmation popup message.
After closing popup, page reloads to clear form.
Owner follows up with custom payment link.
Form Submission

Form endpoint:
https://formspree.io/f/mlgwvadb
Honeypot spam field added:
_gotcha
Turnstile CAPTCHA added to form:
Cloudflare Turnstile script + widget rendered in order form.
Site key currently configured in index.html.
Secret key should remain only in Formspree settings.
Map

Leaflet map shown in order summary.
Center: Paxton, IL (40.4592, -88.0956).
Circle radius: 25 miles.
Safari fix applied:
Removed Leaflet CDN integrity/crossorigin attributes.
Added map init retry + window.load fallback.
Media / Gallery

Hero and gallery updated to use curated images from /Images.
Gallery ordered intentionally from lifestyle/install to workshop/detail shots.
Repo / Branch

Primary branch: main
Remote currently points to:
https://github.com/Cfiorillo2/cedar-planter-website.git
GitHub reports moved location:
https://github.com/hubie-dubois/cedar-planter-website.git
