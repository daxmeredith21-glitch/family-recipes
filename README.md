# Family Recipes

A mobile-first family recipe sharing app. Anyone with the link can browse recipes by category and add their own.

---

## Step 1 — Set up the Supabase database

1. Go to [supabase.com](https://supabase.com) and open your project
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy and paste the entire contents of `supabase_setup.sql`
5. Click **Run**

You should see "Success. No rows returned." — that means the table is ready.

---

## Step 2 — Deploy to Vercel

### Option A: Drag & Drop (easiest, no GitHub needed)

1. Install dependencies and build the app:
   ```
   npm install
   npm run build
   ```
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Click **"Deploy from the CLI or drag and drop"** → drag the `dist/` folder onto the page
4. Add your environment variables in Vercel:
   - `VITE_SUPABASE_URL` = `https://osyfzegbkopuccidawzg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = your key from Supabase Settings → API Keys

### Option B: GitHub (easiest for future updates)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Add the two environment variables above
4. Click **Deploy**

Vercel auto-deploys every time you push to GitHub.

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Adding to the home screen (share with family)

Once deployed, Vercel gives you a URL like `https://family-recipes-xyz.vercel.app`.

On iPhone: Open in Safari → Share → **Add to Home Screen**
On Android: Open in Chrome → Menu → **Add to Home Screen**

It works like a native app from the home screen.
