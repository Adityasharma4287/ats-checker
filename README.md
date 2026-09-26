<div align="center">

<img src="favicon.png" width="64" alt="ResumeATS Logo"/>

# ResumeATS

### AI-Powered ATS Resume Checker for Indian Job Seekers

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js"/>
<img src="https://img.shields.io/badge/Claude-AI-7c6dfa?style=for-the-badge&logo=anthropic&logoColor=white"/>
<img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
<img src="https://img.shields.io/badge/Razorpay-Payments-02042B?style=for-the-badge&logo=razorpay&logoColor=white"/>
<img src="https://img.shields.io/badge/Deploy-Vercel-000?style=for-the-badge&logo=vercel"/>

<br/><br/>

**Resume paste karo · Job description daalo · AI ATS score batayega**

</div>

---

## What is ResumeATS?

ResumeATS ek AI-powered SaaS tool hai jo aapka resume analyze karta hai aur batata hai ki koi company ka ATS (Applicant Tracking System) usse reject karega ya nahi. Claude AI se powered — real-time analysis, keyword gaps, aur actionable suggestions milti hain.

```
Resume + Job Description  →  ATS Score (0-100)  →  Missing Keywords  →  Fix Suggestions
```

---

## Plans

| Feature | Free | Pro ₹99/mo | Unlimited ₹199/mo |
|---------|:----:|:----------:|:-----------------:|
| Checks/month | 4 | Unlimited | Unlimited |
| ATS Score (0-100) | ✓ | ✓ | ✓ |
| Missing keywords | Top 5 | Full list | Full list |
| Suggestions | Top 2 | All + examples | All + examples |
| LinkedIn tips | ✗ | ✓ | ✓ |
| AI Resume Coach | ✗ | ✓ | ✓ |
| Priority support | ✗ | ✗ | ✓ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| AI | Anthropic Claude (`@anthropic-ai/sdk`) |
| Auth + Database | Supabase (`@supabase/ssr`) |
| Payments | Razorpay (Indian subscriptions) |
| Styling | Tailwind CSS |
| Analytics | Vercel Analytics + Speed Insights |
| Deploy | Vercel |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Adityasharma4287/ats-checker.git
cd ats-checker
npm install
```

### 2. Environment Variables

`.env.local` file banao:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_PRO_PLAN_ID=plan_xxxxx
RAZORPAY_UNLIMITED_PLAN_ID=plan_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run

```bash
npm run dev
# http://localhost:3000
```

---

## Setup Guide

### Supabase

1. [supabase.com](https://supabase.com) pe free account banao
2. New project create karo
3. **Settings → API** se ye copy karo:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
4. **SQL Editor** mein `lib/schema.sql` ka content paste karke Run karo

### Anthropic API Key

1. [console.anthropic.com](https://console.anthropic.com) pe jaao
2. **API Keys → Create Key**
3. Copy karo → `ANTHROPIC_API_KEY`

### Razorpay

1. [dashboard.razorpay.com](https://dashboard.razorpay.com) pe account banao
2. **Settings → API Keys** → Test key generate karo
3. `RAZORPAY_KEY_ID` aur `RAZORPAY_KEY_SECRET` fill karo
4. **Products → Subscriptions → Plans** mein 2 plans banao:

| Plan | Amount (paise) | Monthly |
|------|---------------|---------|
| Pro Plan | `9900` (₹99) | ✓ |
| Unlimited Plan | `19900` (₹199) | ✓ |

5. **Settings → Webhooks** pe add karo:
   - URL: `https://your-domain.com/api/webhook`
   - Events: `subscription.charged`, `subscription.cancelled`, `subscription.expired`

---

## Project Structure

```
ats-checker/
├── app/
│   ├── page.js                      # Landing page
│   ├── layout.js                    # Root layout
│   ├── globals.css                  # Global styles
│   ├── login/page.js                # Login
│   ├── signup/page.js               # Signup
│   ├── dashboard/page.js            # ATS Checker (protected)
│   ├── pricing/page.js              # Pricing page
│   └── api/
│       ├── analyze/route.js         # Claude AI analysis endpoint
│       ├── chat/route.js            # AI Resume Coach chat
│       ├── create-subscription/     # Razorpay subscription
│       ├── verify-payment/          # Payment verification
│       ├── webhook/route.js         # Razorpay webhooks
│       └── auth/callback/route.js   # Supabase auth callback
├── components/
│   ├── DashboardClient.js           # Full checker UI + results
│   └── PricingClient.js             # Pricing + payment UI
├── lib/
│   ├── supabase-browser.js          # Client-side Supabase client
│   ├── supabase-server.js           # Server-side Supabase client
│   ├── plans.js                     # Plan config & limits
│   └── schema.sql                   # Database schema
├── middleware.js                     # Auth route protection
├── next.config.js
├── tailwind.config.js
└── .env.local                        # Environment variables
```

---

## Deploy on Vercel

```bash
# Vercel CLI install karo
npm i -g vercel

# Deploy karo
vercel

# Production deploy
vercel --prod
```

Vercel Dashboard → Project → **Settings → Environment Variables** mein saari `.env.local` values add karo. Webhook URL update karo production domain se.

---

## Test Cards (Razorpay Test Mode)

```
Card Number : 4111 1111 1111 1111
Expiry      : Any future date (e.g. 12/26)
CVV         : Any 3 digits
Name        : Any name

UPI         : success@razorpay
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/analyze` | Resume + JD analyze karo (Claude AI) |
| `POST` | `/api/chat` | AI Resume Coach chat |
| `POST` | `/api/create-subscription` | Razorpay subscription banao |
| `POST` | `/api/verify-payment` | Payment verify + plan activate |
| `POST` | `/api/webhook` | Razorpay subscription events |
| `GET` | `/auth/callback` | Supabase OAuth callback |

---

## Security Notes

- `.env.local` kabhi GitHub pe push mat karo
- `SUPABASE_SERVICE_ROLE_KEY` sirf server-side use karo
- `RAZORPAY_KEY_SECRET` kabhi frontend mein expose mat karo
- Production mein Razorpay Live keys use karo

---

## License

MIT — Free to use and modify.

---

<div align="center">
<sub>Made with ❤️ by <strong>Aditya Sharma</strong> 🇮🇳</sub>
</div>
