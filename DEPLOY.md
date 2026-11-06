# VSL, Veloter Software Lab · Deploy Guide

A dependency-free static website (HTML + CSS + vanilla JS). No build step, no framework. Deploy it to Cloudflare Pages in under 2 minutes.

---

## What's inside

```
vsl-website/
├── index.html          # Single-page site (hero, services, process, work, testimonials, FAQ, contact)
├── 404.html            # Branded 404 page (Cloudflare Pages serves it automatically)
├── css/style.css       # All styling · clean light theme, brand navy #01276A + orange #F45601
├── js/main.js          # Menu, animations, counters, form handler · no libraries
├── assets/
│   ├── logo.png        # Official VSL logo (transparent background)
│   ├── favicon.svg     # Navy tile + orange arc favicon
│   └── og.png          # 1200×630 social-share image
├── robots.txt
├── sitemap.xml
└── _headers            # Cloudflare Pages security headers + caching rules
```

---

## Deploy to Cloudflare Pages

### Option A · Direct upload (fastest)

1. Go to **https://dash.cloudflare.com** → **Workers & Pages** → **Create application** → **Pages** → **Upload assets**.
2. Name the project (e.g. `veloter` · this becomes `veloter.pages.dev`).
3. **Drag and drop the `vsl-website` folder** (or the unzipped contents) → **Deploy site**.
4. Done · your site is live at `https://<project>.pages.dev`.

> Tip: upload the *contents* of this folder as the site root. `index.html` must sit at the root.

### Option B · Wrangler CLI

```bash
npm install -g wrangler
wrangler login
cd vsl-website
wrangler pages deploy . --project-name=veloter
```

### Option C · Git integration (auto-deploy on push)

1. Push this folder to a GitHub/GitLab repo (as the repo root).
2. Cloudflare Dashboard → **Pages** → **Create application** → **Connect to Git** → pick the repo.
3. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. Save & deploy. Every push to `main` redeploys automatically.

### Custom domain

Pages project → **Custom domains** → **Set up a custom domain** → follow the DNS steps (Cloudflare Registrar domains are configured automatically).

---

## Before you go live · replace the placeholders

Search for `EDIT:` comments inside `index.html` (they mark every spot). Summary:

| What | Where | Current placeholder |
| --- | --- | --- |
| Domain | `index.html` (canonical + og:url + og:image), `robots.txt`, `sitemap.xml` | `https://veloter.com/` |
| Email | `index.html` (contact + footer + mailto in `js/main.js`) | `hello@veloter.com` |
| Phone / WhatsApp | `index.html` (contact + footer, `tel:` links) | `+91 XXXXX XXXXX` |
| Social links | `index.html` footer | `href="#"` (LinkedIn, GitHub, X) |
| Stats | `index.html` hero `data-count` values | 40+, 15+, 98%, 48h · set your real numbers |
| Projects | `index.html` "Representative work" section | Sample case studies · replace with yours |
| Testimonials | `index.html` "Client words" section | Sample quotes · replace with real ones |

## Wire the dynamic contact form (2 minutes, free)

The contact form is wired to a serverless Cloudflare Pages Function at `/api/contact` (`functions/api/contact.js`), sending submissions securely to your inbox.

### Step 1: Get a free key
1. Get a free access key at **https://web3forms.com** (enter `veloterlabs@gmail.com`).
2. Copy the access key sent to your inbox.

### Step 2: Add to Cloudflare Environment Variables
In your Cloudflare Pages dashboard:
- Go to **Settings** → **Variables and Secrets** (or during project creation under **Environment variables**).
- Add variable:
  - **Variable name:** `WEB3FORMS_ACCESS_KEY`
  - **Value:** `your-access-key-here`
- Save and deploy!

*(Alternatively, if using Resend: set `RESEND_API_KEY` and optional `CONTACT_EMAIL`).*

*If no environment variable is configured, the form automatically falls back to pre-filling the visitor's email client (`mailto:`), ensuring no messages are missed.*

## Preview locally

Just open `index.html` in a browser · or run `npx serve vsl-website` for a local server.
