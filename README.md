# Techinverse Solutions — Static Mirror (GitHub Pages Ready)

A faithful, self-contained static copy of **https://techinversesolutions.com/**.

- **55 HTML pages**, **1,108 images**, **1,173 files**, ~81 MB
- `index.html` sits at the **root** of this folder — no wrapper directory
- All internal links and asset paths are **relative** — works at any URL prefix
- **0** references to `static.teamily.ai`
- **No API keys, tokens or secrets** in any file

---

## 1. Deploy to GitHub Pages

### Option A — Upload through the GitHub web UI (no token needed)

1. Create a new **public** repository, e.g. `techinverse-solutions`.
2. Unzip the package on your computer.
3. Open the repo → **Add file** → **Upload files**.
4. Drag in **the contents of the unzipped folder** — i.e. `index.html`, `about-us.html`, `assets/`, `images/`, `products/`, `marketer/`, and the rest.
   ⚠️ **Do NOT upload the ZIP itself, and do NOT upload the enclosing folder.** `index.html` must land at the repo root, or the homepage will 404.
5. Commit the upload.
6. Go to **Settings → Pages** (see the click-path in section 2).
7. Wait ~1 minute. The site goes live at `https://<your-username>.github.io/<repo-name>/`.

> **Note on size:** the package is ~81 MB. GitHub's web uploader accepts up to 100 files per drag-and-drop and 25 MB per file — all individual files here are well under that, but you will need several upload batches. If that is tedious, use Option B or C.

### Option B — Push from the command line

```bash
# 1. unzip and enter the folder
unzip techinverse-solutions-github-pages.zip -d techinverse-solutions
cd techinverse-solutions

# 2. confirm index.html is at the root (must print: index.html)
ls index.html

# 3. init and push
git init
git add -A
git commit -m "Add Techinverse Solutions static mirror"
git branch -M main
git remote add origin https://github.com/Ebubechineka/techinverse-solutions.git
git push -u origin main
```

Then enable Pages (section 2).

### Option C — Push over SSH (no token needed)

Same as Option B, but use an SSH remote and a key already added to your GitHub account:

```bash
git remote add origin git@github.com:Ebubechineka/techinverse-solutions.git
git push -u origin main
```

---

## 2. Exact click-path: Settings → Pages

```
Your repo
  → Settings            (top tab bar, far right)
    → Pages             (left sidebar, under "Code and automation")
      → Build and deployment
        → Source:  Deploy from a branch
        → Branch:  main        (dropdown)
                   / (root)    (second dropdown — must be "/ (root)", NOT "/docs")
        → Save
```

After saving, the page shows a green banner:
**"Your site is live at https://Ebubechineka.github.io/techinverse-solutions/"**

First build takes **30–90 seconds**. If you get a 404 immediately after saving, wait a minute and hard-refresh — the first Pages build is still running.

---

## 3. Do I need a GitHub token?

**Only if you push over HTTPS from the command line (Option B).** GitHub no longer accepts your account password for `git push`.

If you need one:

```
GitHub → click your avatar (top right)
  → Settings
    → Developer settings        (bottom of the left sidebar)
      → Personal access tokens
        → Tokens (classic)      → Generate new token (classic)
          → Scope: check  [x] repo
          → Generate token
```

Copy the token (starts with `ghp_` — it is shown **once**). When `git push` asks:

```
Username: Ebubechineka
Password: <paste the token>      ← not your account password
```

**You do NOT need a token** for Option A (web upload) or Option C (SSH).

---

## 4. What was changed to make the copy run

Only technical adjustments. **No content, layout, colour, font, spacing or imagery was altered.**

| # | Adjustment | Reason |
|---|---|---|
| 1 | `https://r2.techinversesolutions.com/...` image URLs → local `images/img-<hash>.<ext>` | Makes the copy self-contained; the CDN is not part of the copy. Applies to plain `src`/`srcset` **and** to JSON-escaped URLs inside Alpine `x-data` attributes |
| 2 | Internal links (`/about-us`, `/products/...`) → local `.html` files | So navigation works on GitHub Pages |
| 3 | `https://techinversesolutions.com/build/assets/app-<hash>.css` / `.js` → local `assets/app.css` / `assets/app.js` | Same stylesheet and script, served locally |
| 4 | Favicon / manifest paths → local `assets/` | Same files, served locally |
| 5 | Meta Pixel (Facebook) tracking script removed | Third-party analytics that cannot function in a static copy |
| 6 | Google Ads `gtag.js` loader neutralised | Third-party tag; the loader URL is blanked so no external request is made |
| 7 | First-party `/track` analytics beacon neutralised | No backend in a static copy |
| 8 | `<link rel="preconnect">` / `dns-prefetch` hints to the origin CDNs removed | Pointless once assets are local |
| 9 | Newsletter form `action` → local no-op | The origin posts to a server endpoint that does not exist in a static copy. Form markup, fields and styling unchanged |
| 10 | `site.webmanifest` reconstructed from the site's own declared meta tags | The origin returned HTTP 502 on this path during capture. Rebuilt from the site's own `theme-color`, `application-name`, `description` and icon declarations — no invented values |
| 11 | Image files renamed where the extension did not match the real format | The CDN served JPEG data under `.webp` URLs. Browsers refuse to decode a mislabelled image, so the files were renamed to their true format and every reference updated. **Pixel content untouched** |
| 12 | 5 broken Alpine bindings removed on one product page | See section 5 — this is a bug on the live site |

---

## 5. Known limitations

### 9 product links intentionally point at the live site

These product pages were **not part of the mirror's documented capture scope** (the inventory covers 25 pages). Rather than invent pages, the links were left pointing at the real site so they still work:

```
/products/asus-tuf-gaming-fa507uv-amd-ryzen-9-8945h-8gb-nvidia-geforce-rtx-4060
/products/dell-latitude-3190-2in1-touchscreen-x360-convertible-8gb-ram
/products/dell-latitude-5420-touchscreen-intel-core-i7-11th-generation-16gb-ram-iris-xe-graphics
/products/dell-latitude-7410-10th-generation-intel-core-i5
/products/dell-precision-9560-touchscreen-core-i7-4gb-dedicated-gtx-1050
/products/hp-elitebook-840-g6-intel-core-i5-8th-gen
/products/hp-zbook-15-g5-4gb-nvida-dedicated
/products/lenovo-thinkpad-x380-yoga-touchscreen-x360-foldable-16gb-ram
/products/model-hp-zbook-studio-g5-x360-touchscreen-4gb-nvidia-dedicated
```

Note: `/products/dell-latitude-7410-10th-generation-intel-core-i5` returns **404 on the live site itself** — that is the origin's own broken link, reproduced faithfully.

### Two defects reproduced from the live site

These are **not** copy errors. They exist on techinversesolutions.com and were deliberately not "fixed", because the brief was a faithful mirror:

1. **`index is not defined` on product pages.** The gallery template is written
   `x-for="(image, index) in images"` but the Alpine build in use does not expose the
   second (index) argument, so the expression throws. The gallery still renders; the
   error is logged to the console. Present on the live site.

2. **`paystack.com/public/css/button.min.css` blocked.** The site's own script injects a
   stylesheet from Paystack's domain. Paystack sends no CORS header for it, so the browser
   blocks it (`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`). The Paystack *script* itself loads
   fine; only this one stylesheet is refused. Present on the live site.

**One deliberate deviation:** on the Apple iPad product page, 5 server-rendered thumbnails
carried `:src="image.url"` *outside* the Alpine `x-for` scope. On the live site Alpine
overwrites their working `src` with `undefined`, so those thumbnails render as broken
images. The binding was removed so the real images show. This is the only place the copy
is intentionally better than the original, and it is recorded here rather than hidden.

### Backend functionality is not reproducible

This is a Laravel + Livewire application. Cart, login, register, checkout, search and newsletter subscribe are server-driven. **The pages and forms render exactly as on the live site**, but submitting them cannot work without the original server.

### Other

- **Live product data** — prices, stock and listings are frozen at capture time.
- **External links left as-is** — social profiles (Facebook, Telegram, Instagram, LinkedIn), WhatsApp chat, and the "Bonifade Technologies" credit still point to their real destinations. These are the site's own outbound links and were deliberately not altered.
- **Mobile horizontal scroll on `products.html`** — the product grid is 401 px wide at a 375 px viewport. This is present on the live site and in the original capture; it was not "fixed" because that would change the layout.

---

## 6. Verification performed

| Check | Result |
|---|---|
| `index.html` at folder root | **Yes** — no wrapper directory |
| `static.teamily.ai` references | **0** |
| API keys / secrets / tokens | **0** (only the site's own Laravel `csrf-token` meta, which is expected) |
| Image references resolving to a real file | **588 / 588** |
| Image extension vs. real format mismatches | **0** |
| Broken images rendered, desktop + mobile | **0** |
| Pages returning HTTP 200 | **32 / 32 tested** |
| Horizontal overflow | 1 page (`products.html`) — pre-existing on the live site |
| Remaining console errors | 2 unique, both from the live site's own third-party code (section 5) |
| ZIP root-flat (no wrapper folder) | **Verified with `unzip -l`** |

---

## 7. Package contents

```
techinverse-solutions-github-pages.zip
├── index.html                  ← opens at the homepage
├── about-us.html
├── products.html
├── cart.html
├── login.html
├── register.html
├── forgot-password.html
├── marketers.html
├── privacy-policy.html
├── shipping-info.html
├── terms-and-conditions.html
├── README.md                   ← this file
├── FILE_MANIFEST.md
├── assets/                     (8 files: CSS, JS, favicons, manifest)
├── images/                     (1,108 files)
├── marketer/
│   └── register.html
└── products/                   (43 product detail pages)
```

**All files are at the archive root — there is no wrapper folder.** Unzip and open `index.html`.
