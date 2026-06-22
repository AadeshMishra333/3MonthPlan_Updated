# Final Website Audit & Deployment Readiness Plan

Complete audit of all 12 HTML pages, 1 CSS, and 1 JS file. Goal: fix every remaining gap and make the site GoDaddy-deployable.

## Audit Findings — Issues to Fix

### 🔴 Critical (Blocks Deployment)

| # | Issue | Files |
|---|-------|-------|
| 1 | **No favicon** — browser tab shows generic icon | All 12 HTML files |
| 2 | **No `robots.txt`** — search engines get no crawl guidance | Missing file |
| 3 | **No `sitemap.xml`** — poor SEO discoverability | Missing file |
| 4 | **No `.htaccess`** — GoDaddy shared hosting needs URL rewriting, caching, GZIP, error pages | Missing file |
| 5 | **No `404.html`** — broken links show ugly server error | Missing file |
| 6 | **`support@divyachetana.com`** still used — domain doesn't exist yet; should be `divyamchetnaos@gmail.com` | contact.html, returns.html, shipping.html, cancellation.html |
| 7 | **Undefined CSS variables** `--maroon` and `--saffron` used in inline styles — text renders transparent/invisible | about.html, terms.html, cancellation.html |
| 8 | **"Founded in 2024"** on about.html — should say 2026 to match tagline | about.html |

### 🟡 Important (Quality/Polish)

| # | Issue | Files |
|---|-------|-------|
| 9 | **Duplicate team member** — Gauri Mishra appears twice (Co-Founder + Head of Operations) as separate cards | about.html |
| 10 | **Google Maps placeholder** — shows dashed box with text "Maps integration in production" | contact.html |
| 11 | **`privacy@divyachetana.com`** and **`grievance@divyachetana.com`** — these domain emails don't exist yet. Keep but note to user | privacy.html, all footers |
| 12 | **`Open Graph` meta tags** missing — poor social sharing preview | All HTML files |
| 13 | **Canonical tags** missing — duplicate content risk | All HTML files |

---

## Proposed Changes

### Deployment Infrastructure Files

#### [NEW] robots.txt
Standard robots.txt allowing all crawlers, linking to sitemap.

#### [NEW] sitemap.xml
XML sitemap with all 12 pages for SEO.

#### [NEW] .htaccess
Apache config for GoDaddy shared hosting:
- GZIP compression
- Browser caching (images, CSS, JS)
- Custom 404 error page
- Security headers (X-Content-Type-Options, X-Frame-Options, XSS-Protection)
- Force HTTPS redirect (commented out until SSL is configured)

#### [NEW] 404.html
Custom branded 404 error page matching website design.

---

### CSS Fix

#### [MODIFY] [style.css](file:///c:/Users/mishr_o9lk6qh/OneDrive/Desktop/3MonthPlan_Updated/WebsiteLLP/DivyaChetana_Website/css/style.css)
- Add missing `--maroon` and `--saffron` CSS variables to `:root`

---

### HTML Global Fixes (All 12 files)

#### [MODIFY] All HTML files
- Add `<link rel="icon" href="images/Logo.png" type="image/png">` favicon
- Add Open Graph meta tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Add `<link rel="canonical" href="...">` tag
- Replace `support@divyachetana.com` → `divyamchetnaos@gmail.com`

---

### Page-Specific Fixes

#### [MODIFY] [about.html](file:///c:/Users/mishr_o9lk6qh/OneDrive/Desktop/3MonthPlan_Updated/WebsiteLLP/DivyaChetana_Website/about.html)
- Fix "Founded in 2024" → "Founded in 2026"
- Consolidate duplicate Gauri Mishra cards (keep as Co-Founder & Head of Operations)

#### [MODIFY] [contact.html](file:///c:/Users/mishr_o9lk6qh/OneDrive/Desktop/3MonthPlan_Updated/WebsiteLLP/DivyaChetana_Website/contact.html)
- Replace Google Maps placeholder with actual embedded Google Maps iframe for the registered address

---

## GoDaddy Deployment Guide

After all fixes, the deployment folder will be ready to upload via:
1. **GoDaddy File Manager** → Upload entire `DivyaChetana_Website/` folder contents to `public_html/`
2. **FTP** → Connect via FileZilla and upload
3. **Domain** → Point `divyachetana.com` to GoDaddy nameservers
4. **SSL** → Enable free SSL from GoDaddy cPanel, then uncomment HTTPS redirect in `.htaccess`

---

## Future Development Suggestions

Will be documented in the walkthrough after implementation.

---

## Verification Plan

### Manual Verification
- Open each HTML page locally and check for visual correctness
- Verify no broken links remain
- Confirm favicon shows in browser tab
- Confirm responsive mobile menu works properly

> [!IMPORTANT]
> The emails `grievance@divyachetana.com` and `privacy@divyachetana.com` are intentionally kept as-is. You should create these email aliases once you have the `divyachetana.com` domain active on GoDaddy (via cPanel → Email Forwarders → forward to `divyamchetnaos@gmail.com`).
