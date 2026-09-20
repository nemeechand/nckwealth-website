# NCK WEALTH — Website

A complete, static, mobile-first website for **NCK WEALTH** (Invest • Insure • Grow), an initiative by Nemee Chand Khichar. Built with plain HTML5, CSS3 and vanilla JavaScript — no build step, no server requirement, ready to upload to Hostinger shared hosting.

---

## A) Complete File Structure

```
/
├── index.html                 Home
├── about.html                 About Nemee Chand Khichar
├── mutual-funds.html          Mutual Funds & SIP
├── stock-market.html          Stock Market
├── insurance.html             Insurance Planning
├── personal-finance.html      Personal Finance
├── wealth-creation.html       Wealth Creation
├── financial-education.html   Financial Education hub (Tax, Retirement, Goals, Education planning)
├── calculators.html           SIP / Compound Interest / Goal / Emergency Fund calculators
├── blog.html                  Blog index
├── contact.html                Contact + enquiry form
├── disclaimer.html            Financial disclaimer
├── privacy-policy.html        Privacy policy
├── terms.html                 Terms & conditions
├── robots.txt
├── sitemap.xml
├── README.md                  (this file)
│
├── css/
│   └── style.css              Single stylesheet — design tokens, layout, components
│
├── js/
│   ├── config.js              ⭐ EDIT THIS FILE — WhatsApp number, social links, contact info, form endpoint
│   └── main.js                Navigation, WhatsApp links, form validation, calculators logic
│
├── images/
│   ├── hero-financial-advisor.webp   Hero image (served first — small, fast)
│   ├── hero-financial-advisor.png    Hero image fallback (for older browsers without WebP support)
│   ├── nck-wealth-logo.png    Your uploaded logo (kept as a brand asset — no longer used in the header/footer, see Branding note below)
│   ├── nck-wealth-icon.png    Your uploaded round icon (used for favicon + social share previews)
│   ├── originals/             Untouched, full-resolution copies of every uploaded image
│   └── founder-photo.jpg      ⚠️ NOT INCLUDED — used only on the About page; add your photo here (see Placeholders below)
│
├── favicon/
│   ├── favicon.ico, favicon-16x16.png, favicon-32x32.png,
│   │   favicon-48x48.png, favicon-180x180.png, favicon-192x192.png,
│   │   favicon-512x512.png     Generated from your uploaded round logo
│
└── blog/
    ├── mutual-fund-risk-explained-simply.html
    ├── how-compounding-actually-works.html
    └── term-insurance-vs-investment.html
```

---

## B) The Code

All HTML, CSS and JavaScript files listed above are complete and functional — open `index.html` directly in a browser to preview the site right now, before uploading anywhere.

**Design system:** Deep navy (#0a1730 / #060f1f), emerald green (#12805f), premium gold (#c9982f) on white and soft grey, with Fraunces (headings) + Inter (body) from Google Fonts.

**Key JavaScript features (`js/main.js`):**
- Mobile hamburger menu with slide-down navigation
- WhatsApp links built automatically from your number in `js/config.js`
- Social icons that read their URLs from `js/config.js`
- Contact form validation (name, 10-digit mobile, email, city, interest) with a success message
- Four calculators: SIP, Compound Interest, Goal Planning, Emergency Fund — all client-side, no backend needed

---

## Branding: official white logo image, used everywhere

The header and footer (and therefore every page, since both are shared components) now use your official logo file — the white, transparent-background lockup — as a real `<img>`, not text. It's served as `images/nck-wealth-logo-white.webp` (small, fast) with `images/nck-wealth-logo-white.png` as a fallback, sized with plain CSS height rules (`.brand-logo--header` / `.brand-logo--footer` in `css/style.css`) so it scales up on larger screens without ever being stretched or distorted — width is always `auto` from the image's real aspect ratio. It's a single reusable helper (`brand_logo_img()` in the page generator), so header, mobile menu and footer all show the exact same file. The original, full-resolution upload is preserved untouched in `images/originals/`.

**One exception, by design, not oversight:** the favicon and the `og:image`/structured-data "logo" (used when the site is shared as a link on social media) still use the round `nck-wealth-icon.png` mark, not this new white logo. That's because this logo is white-on-transparent, built for the dark navy header/footer — placed on a favicon or a typical white social-preview card, it would be invisible. If you'd like a light-background or square version of the new logo for those two spots, send it over and it can be swapped in the same way.

## Hero image

The Home page hero now uses your uploaded advisor photo instead of the founder-photo placeholder. It's served as a `<picture>` element: a ~330KB WebP version loads first (visually identical to your original, just compressed), with the original-quality PNG as a fallback for older browsers. `object-fit: contain` is used throughout so the image is never cropped or distorted, and it's placed with `loading="eager" fetchpriority="high"` rather than lazy-loaded, since it's the largest visible element on page load (lazy-loading an above-the-fold hero image would slow down, not help, perceived performance). Its alt text is exactly `"NCK Wealth Financial Advisor"` as requested.

## Founder details, photo & contact info (this update)

The About page now shows your real, verified credentials instead of placeholders:
- **Experience:** 20+ Years
- **Education:** Graduate — Science Stream
- **ARN:** 162630 (valid upto 19 Apr 2028)
- **EUIN:** E305122

The "Certification" field was removed (rather than left as a placeholder or invented) since no certification was supplied. Your uploaded founder portrait is now live at `images/founder-photo.jpg` / `.webp` — used as-is, full portrait shown without cropping the face.

`js/config.js` is now filled in with everything you provided:
- WhatsApp: `918003805588` (shown on-site as +91 80038 05588)
- Email: support@nckwealth.com
- Facebook, Instagram, YouTube, LinkedIn — all live and clickable
- Location: Jaipur, Rajasthan – 302001

### ⚠️ Still needed from you
A few fields are intentionally left blank because they weren't provided — nothing has been guessed:
1. **A phone number**, if different from your WhatsApp number (currently shows "[ADD PHONE]" on the Contact page)
2. **Full office/street address** (currently only city, state and PIN are shown — no building/street/area)
3. **A Google Maps link**, if you'd like an embedded map on the Contact page
4. Telegram / X (Twitter) handles, if you use them and want them added

Send these whenever you're ready and they'll drop straight into `js/config.js` and the Contact page — no other files need to change.

## C) Assets Required From You

| Asset | Status | Where it's used |
|---|---|---|
| NCK WEALTH brand wordmark | ✅ Built in HTML/CSS (no image) | Header, footer, mobile nav |
| Hero advisor photo | ✅ Included — `images/hero-financial-advisor.webp` + `.png` | Home page hero |
| NCK WEALTH round icon | ✅ Included — `images/nck-wealth-icon.png` | Favicon, social preview image |
| **Your professional photograph** | ✅ Included — `images/founder-photo.jpg` | About page |
| WhatsApp number | ⚠️ Needed | `js/config.js` → `WHATSAPP_NUMBER` |
| Email address | ⚠️ Needed | `js/config.js` → `CONTACT_EMAIL` |
| Phone number | ⚠️ Needed | `js/config.js` → `CONTACT_PHONE` |
| Facebook / LinkedIn URLs | ⚠️ Needed | `js/config.js` → `FACEBOOK_URL`, `LINKEDIN_URL` |
| Instagram / YouTube URLs | ✅ Pre-filled (@nckwealth, @NCKWEALTH) — verify they're correct | `js/config.js` |
| Contact form backend | ⚠️ Optional | `js/config.js` → `FORM_ENDPOINT` (see below) |

### Connecting the contact form to a real inbox
Right now, the form validates input and shows a "Thank you" message, but does **not** send the enquiry anywhere. To receive real enquiries, either:
1. Sign up for a free form backend such as **Formspree** or **Getform**, and paste the endpoint URL into `FORM_ENDPOINT` in `js/config.js`, or
2. Ask a developer to add a simple PHP mail script on Hostinger and point `FORM_ENDPOINT` to it (e.g. `/contact-handler.php`).

---

## D) Hostinger Deployment — Step by Step

You do not need to be a developer to do this.

**STEP 1 — Login to Hostinger**
Go to hpanel.hostinger.com and log in with your Hostinger account.

**STEP 2 — Open File Manager**
From your hosting dashboard, find your website/hosting plan and click **File Manager** (usually under "Files").

**STEP 3 — Open public_html**
Inside File Manager, double-click the **public_html** folder. This is the folder that becomes your live website.

**STEP 4 — Upload website files**
Upload every file and folder from this package (`index.html`, `about.html`, all other `.html` files, `robots.txt`, `sitemap.xml`, and the `css`, `js`, `images`, `favicon` and `blog` folders) directly into `public_html`. In Hostinger's File Manager, use the **Upload** button, or upload the **FIXED ROOT ZIP** and use **Extract** inside `public_html`. This ZIP is intentionally packaged WITHOUT an outer `nckwealth-website` folder, so the files extract directly into `public_html`.

**STEP 5 — Upload assets**
Make sure the `images`, `css`, `js`, `favicon` and `blog` folders are all inside `public_html` at the same level as `index.html` — not nested inside an extra folder. Add your `founder-photo.jpg` into the `images` folder at this stage if you have it ready.

**STEP 6 — Check index.html**
Confirm `index.html` sits directly inside `public_html` (path should read `public_html/index.html`, not `public_html/nckwealth-website/index.html`). The package also includes `.htaccess` with `DirectoryIndex index.html` so an old `default.php` placeholder does not take priority.

**STEP 7 — Connect domain**
In hPanel, go to **Domains** and make sure `nckwealth.com` is pointed to this hosting account (if you bought the domain elsewhere, update the nameservers as Hostinger instructs).

**STEP 8 — Enable SSL**
In hPanel, go to **SSL** and enable the free SSL certificate for `nckwealth.com`. This makes your site load as `https://nckwealth.com` with the padlock icon.

**STEP 9 — Test website**
Visit `https://nckwealth.com` in your browser. Click through every page in the navigation menu, test the WhatsApp button, and submit the contact form once to check the success message appears.

**STEP 10 — Test mobile version**
Open the same link on your phone (or resize a desktop browser window to a narrow width). Check the hamburger menu opens and closes, buttons are easy to tap, and no content is cut off or scrolls sideways.

---

## E) Placeholders You Still Need to Replace

**In `js/config.js`:**
- `CONTACT_PHONE` — a phone number, if different from your WhatsApp number
- `FORM_ENDPOINT` — only needed if you want real enquiry emails (see Section C)

**On the Contact page (`contact.html`):**
- Full office/street address (only city, state and PIN are currently shown) and a Google Maps link, if you'd like one embedded

**On the Disclaimer page (`disclaimer.html`):**
- `[ADD DATE]` — last-updated date

**On the Privacy Policy and Terms pages:**
- `[ADD DATE]`, and analytics-related placeholders if you later add Google Analytics or Meta Pixel

---

## F) Final Testing Checklist

- [ ] Every page loads without errors (Home, About, all 6 learning pages, Calculators, Blog + 3 posts, Contact, Disclaimer, Privacy Policy, Terms)
- [ ] Every navigation link (desktop + mobile + footer) goes to the correct page
- [ ] Mobile menu opens and closes correctly on a phone
- [ ] No horizontal scrolling on any page at 360px, 375px, 390px, 412px widths
- [ ] Brand wordmark displays sharply and is not distorted at any screen size
- [ ] WhatsApp floating button and all WhatsApp CTAs open a chat with a pre-filled message to +91 80038 05588
- [ ] Social icons (Facebook, LinkedIn, Instagram, YouTube) link to the correct profiles
- [ ] Contact form shows validation errors for empty/invalid fields, and a success message on valid submission
- [ ] All 4 calculators (SIP, Compound Interest, Goal Planning, Emergency Fund) update results as sliders move
- [ ] Founder photo displays correctly on the About page, face fully visible on mobile and desktop
- [ ] SEO: page titles and meta descriptions look correct in browser tabs / search preview tools
- [ ] SSL is active (`https://nckwealth.com` shows a padlock)
- [ ] `sitemap.xml` and `robots.txt` load at `https://nckwealth.com/sitemap.xml` and `/robots.txt`
- [ ] Spelling and remaining placeholder text (phone number, full address, dates) reviewed before sharing the site publicly

---

## Future Expansion (architecture is ready for)

Newsletter signup, lead CRM integration, WhatsApp automation, appointment booking, a blog CMS, Google Analytics / Search Console, Meta Pixel, and deeper YouTube/Instagram embeds can all be added later without restructuring this site — each is additive to the current file structure.


## NCK WEALTH — September 2026 update
- Contact details, social links, office address, Google Maps, Jaipur jurisdiction and last-updated date configured.
- Header now includes a YouTube button.
- Home page includes Latest Long Videos and Latest Shorts sections.
- YouTube auto-feed requires a YouTube Data API v3 key in `js/config.js` (`YOUTUBE_API_KEY`). Restrict the key to your website domain in Google Cloud.
- Google Analytics requires the GA4 Measurement ID in `js/config.js` (`GOOGLE_ANALYTICS_ID`).
- Meta Pixel requires the Pixel ID in `js/config.js` (`META_PIXEL_ID`).
- Contact form posts to `contact-handler.php`; upload that file to the site root. Email delivery depends on Hostinger/PHP mail configuration. Google Sheet capture requires deploying `google-apps-script/Code.gs` and placing its Web App URL in `$sheetWebhook` inside `contact-handler.php`.
