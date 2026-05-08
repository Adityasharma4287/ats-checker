'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Target, CheckCircle, Crown, Zap } from 'lucide-react'

export default function PricingClient({ plans, currentPlan, isLoggedIn }) {
  const [loadingPlan, setLoadingPlan] = useState(null)

  async function handleSubscribe(planKey) {
    if (!isLoggedIn) {
      window.location.href = '/signup'
      return
    }
    if (planKey === 'free') return

    setLoadingPlan(planKey)
    try {
      const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Subscription failed')

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: data.key_id,
          subscription_id: data.subscription_id,
          name: 'ResumeATS',
          description: `${planKey.charAt(0).toUpperCase() + planKey.slice(1)} Plan`,
          handler: async (response) => {
            await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, plan: planKey }),
            })
            window.location.href = '/dashboard?upgraded=true'
          },
          theme: { color: '#C84B31' },
        })
        rzp.open()
      }
    } catch (err) {
      alert('Payment error: ' + err.message)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen grain">
      <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Target size={16} className="text-white" />
          </div>
          <span className="font-display text-xl">ResumeATS</span>
        </Link>
        <div className="flex items-center gap-3">
          {isLoggedIn
            ? <Link href="/dashboard" className="btn-ghost text-sm">Dashboard</Link>
            : <>
                <Link href="/login" className="btn-ghost text-sm">Login</Link>
                <Link href="/signup" className="btn-primary text-sm">Sign Up Free</Link>
              </>
          }
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="font-display text-6xl mb-4">Simple, honest pricing</h1>
          <p className="text-ink-muted text-xl">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(plans).map(([key, plan]) => {
            const isCurrent = currentPlan === key
            const isPopular = key === 'pro'

            return (
              <div key={key} className={`card relative flex flex-col ${isPopular ? 'border-2 border-accent shadow-lg scale-105' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="badge bg-accent text-white px-4 py-1.5 text-xs font-medium">
                      <Crown size={10} /> Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    {key !== 'free' && <Crown size={16} className="text-accent" />}
                    <h2 className="font-display text-2xl">{plan.name}</h2>
                  </div>
                  <div className="flex items-end gap-1 mt-3">
                    <span className="font-display text-5xl">
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                    </span>
                    {plan.price > 0 && <span className="text-ink-muted text-sm mb-2">/month</span>}
                  </div>
                  <p className="text-ink-muted text-sm mt-1">
                    {plan.checksPerMonth === 999999 ? 'Unlimited checks' : `${plan.checksPerMonth} checks per month`}
                  </p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="btn-secondary w-full justify-center cursor-default opacity-70">
                    Current Plan
                  </div>
                ) : key === 'free' ? (
                  <Link href={isLoggedIn ? '/dashboard' : '/signup'}
                    className="btn-secondary w-full justify-center">
                    {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={loadingPlan === key}
                    className="btn-primary w-full justify-center"
                  >
                    {loadingPlan === key ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</>
                    ) : (
                      <><Zap size={15} />Subscribe Now</>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12 text-ink-muted text-sm">
          <p>All prices in INR • Cancel anytime • Secure payments via Razorpay</p>
          <p className="mt-1">Powered by Aditya Sharma</p>
        </div>
      </div>
    </div>
  )
}
