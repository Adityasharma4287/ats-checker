# ResumeATS — Complete Setup Guide

## Kya banaya hai?
Ek full Micro SaaS — AI-powered ATS Resume Checker with:
- Free plan: 3 checks/month
- Pro plan: 50 checks/month (₹99)
- Unlimited plan: unlimited checks (₹199)
- Claude AI se analysis
- Supabase se auth + database
- Razorpay se Indian payments

---

## Step 1 — Project Setup

```bash
# Project clone/download karo, folder mein jao
cd ats-checker

# Dependencies install karo
npm install

# .env.local file already bani hai — ab keys fill karo
```

---

## Step 2 — Supabase Setup

1. **https://supabase.com** pe jao, free account banao
2. "New Project" create karo
3. Project create hone ke baad:
   - Settings → API → `Project URL` copy karo → `NEXT_PUBLIC_SUPABASE_URL`
   - Settings → API → `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Settings → API → `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. SQL Editor mein jao → `lib/schema.sql` ka poora content paste karo → Run karo

---

## Step 3 — Anthropic API Key

1. **https://console.anthropic.com** pe jao
2. API Keys → Create key
3. Copy karo → `ANTHROPIC_API_KEY` mein paste karo

---

## Step 4 — Razorpay Setup

1. **https://dashboard.razorpay.com** pe account banao (student/individual)
2. Settings → API Keys → Generate Test Key
3. `RAZORPAY_KEY_ID` aur `RAZORPAY_KEY_SECRET` fill karo
4. `NEXT_PUBLIC_RAZORPAY_KEY_ID` = same as KEY_ID

### Razorpay Plans banana (Subscriptions ke liye):
1. Dashboard → Products → Subscriptions → Plans
2. "Pro Plan" banao:
   - Name: Pro Plan
   - Billing Amount: 9900 (paise mein, matlab ₹99)
   - Period: Monthly
   - Plan ID copy karo → `RAZORPAY_PRO_PLAN_ID`
3. "Unlimited Plan" banao:
   - Name: Unlimited Plan
   - Billing Amount: 19900 (matlab ₹199)
   - Period: Monthly
   - Plan ID copy karo → `RAZORPAY_UNLIMITED_PLAN_ID`

### Webhook setup:
1. Dashboard → Settings → Webhooks → Add New
2. URL: `https://your-domain.com/api/webhook`
3. Events: subscription.charged, subscription.cancelled, subscription.expired
4. Secret: apna secret dalo (same as RAZORPAY_KEY_SECRET)

---

## Step 5 — .env.local Fill Karo

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

ANTHROPIC_API_KEY=sk-ant-...

RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_PRO_PLAN_ID=plan_xxxxx
RAZORPAY_UNLIMITED_PLAN_ID=plan_xxxxx

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 6 — Run Karo

```bash
npm run dev
# http://localhost:3000 pe open karo
```

---

## Step 7 — Vercel pe Deploy Karo

```bash
# Vercel CLI install karo
npm i -g vercel

# Deploy karo
vercel

# Environment variables add karo Vercel dashboard mein
# Project → Settings → Environment Variables
# Saari .env.local ki values wahan add karo
```

---

## Project Structure

```
ats-checker/
├── app/
│   ├── page.js              ← Homepage (landing page)
│   ├── layout.js            ← Root layout
│   ├── globals.css          ← Global styles
│   ├── login/page.js        ← Login page
│   ├── signup/page.js       ← Signup page
│   ├── dashboard/page.js    ← Main checker (protected)
│   ├── pricing/page.js      ← Pricing page
│   └── api/
│       ├── analyze/route.js         ← Claude AI analysis
│       ├── create-subscription/     ← Razorpay subscription create
│       ├── verify-payment/          ← Payment verification
│       └── webhook/route.js         ← Razorpay webhooks
├── components/
│   ├── DashboardClient.js   ← Full checker UI + results
│   └── PricingClient.js     ← Pricing page with payment
├── lib/
│   ├── supabase-browser.js  ← Client-side Supabase
│   ├── supabase-server.js   ← Server-side Supabase
│   ├── plans.js             ← Plan config & limits
│   └── schema.sql           ← Database schema (Supabase mein run karo)
├── middleware.js             ← Auth protection
└── .env.local               ← Environment variables
```

---

## Features by Plan

| Feature | Free | Pro | Unlimited |
|---------|------|-----|-----------|
| Checks/month | 3 | 50 | Unlimited |
| ATS Score | ✓ | ✓ | ✓ |
| Keywords | Basic (5) | Full | Full |
| Suggestions | 3-4 | 6-8 | 6-8 |
| LinkedIn tip | ✗ | ✓ | ✓ |
| Score breakdown | ✓ | ✓ | ✓ |

---

## Test Cards (Razorpay Test Mode)

- Card: 4111 1111 1111 1111
- Expiry: any future date
- CVV: any 3 digits
- Name: any name

---

## Support
Koi problem aaye to `.env.local` pehle check karo — 90% errors wahan se hoti hain.
