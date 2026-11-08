# Connect the shared backend (Supabase) — 10 minutes, one time

Right now the site works, but the admin saves products **only in the browser that
made the edit**. To make an edit appear on the live site for everyone, connect a
free Supabase database. You do this once.

Everything is already coded. You only create the account, paste two values, and
run one SQL file.

---

## Step 1 — Create the Supabase project (free)

1. Go to **https://supabase.com** and click **Start your project**.
2. Sign up (GitHub or email). No card required — the free tier is enough.
3. Click **New project**.
   - **Name:** `techinverse-solutions`
   - **Database Password:** generate one and save it somewhere safe
   - **Region:** pick the one closest to Nigeria (e.g. *Europe (Frankfurt)* or *West US*)
4. Wait ~2 minutes while the project provisions.

---

## Step 2 — Create the products table

1. In the left sidebar click **SQL Editor** → **New query**.
2. Open the file **`supabase/schema.sql`** from this site folder.
3. Copy the **whole file** and paste it into the SQL editor.
4. Click **Run** (or press Ctrl/Cmd + Enter).

You should see *Success. No rows returned*. This one file:

- creates the `products` table
- turns on Row Level Security (public can read, only signed-in admins can write)
- creates the public `product-images` storage bucket for image uploads
- seeds the **24 products** that are already on the site

> Safe to run more than once — it will not duplicate anything.

---

## Step 3 — Create your admin login

1. Left sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your email and a strong password.
3. Tick **Auto Confirm User** (so you can sign in immediately).
4. Click **Create user**.

That email + password is what you type on the admin page. You can add more
admins later the same way.

---

## Step 4 — Paste two values into the site

1. Left sidebar → **Project Settings** (gear icon) → **API**.
2. Copy these two values:

   | Supabase field | Goes into |
   |---|---|
   | **Project URL** | `SUPABASE_URL` |
   | **anon / public** key | `SUPABASE_ANON_KEY` |

3. Open **`assets/tis-config.js`** and paste them in:

   ```js
   window.TIS_CONFIG = {
       SUPABASE_URL: 'https://yourproject.supabase.co',
       SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....',
       STORAGE_BUCKET: 'product-images',
       ADMIN_PASSWORD: 'admin123',
       ADMIN_AUTH_MODE: 'supabase'
   };
   ```

4. Save the file and push it to GitHub (or ask me to).

> **Is the anon key safe to publish?** Yes. It is designed to be public and is
> meant to sit in browser code. It only grants what the Row Level Security
> policies in `schema.sql` allow — in this case, *read the catalog* and, for a
> signed-in user only, *write products*. It cannot drop tables or read your
> other data.

---

## Step 5 — Check it worked

1. Open **https://ebubechineka.github.io/techinverse-solutions/admin.html**
2. The login box now shows an **Email** field. Sign in with the user from Step 3.
3. Add a product, then open
   **https://ebubechineka.github.io/techinverse-solutions/products.html**
   in a **different browser or a private window** — the product is there.

That is the whole point: the edit is in the shared database, not in one browser.

---

## Changing the admin password

- **With Supabase connected (recommended):** the password is your Supabase Auth
  user's password. Change it in **Authentication → Users → (your user) → Reset
  password**, or use *Forgot password* on a Supabase-hosted login page.
- **Without Supabase (password mode):** edit `ADMIN_PASSWORD` in
  `assets/tis-config.js`. Note this is a **client-side gate only** — anyone who
  reads the page source can see it. It is fine for keeping casual visitors out
  of a demo, but it is not real security. Connect Supabase for real security.

To force password mode even with Supabase connected, set
`ADMIN_AUTH_MODE: 'password'`.

---

## What each file does

| File | Purpose |
|---|---|
| `assets/tis-config.js` | **The only file you edit.** Backend URL, anon key, admin password |
| `assets/tis-backend.js` | Shared product API — read, write, delete, image upload, sign-in |
| `assets/admin-store.js` | The built-in 24-product catalog (used as the offline fallback) |
| `supabase/schema.sql` | Run once in Supabase: table, security policies, bucket, seed data |
| `admin.html` | The admin dashboard |
| `product.html` | Product detail page (`product.html?p=<id>`) |
| `products.html` | Product listing — appends admin-added products to the grid |

---

## If you do nothing

The site keeps working exactly as it does today: the public pages show the
built-in 24-product catalog, and the admin page works but saves edits only in
the browser that made them. The admin page says so in amber text under the
login box, so it is never a silent surprise.
