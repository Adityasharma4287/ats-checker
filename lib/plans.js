export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    checksPerMonth: 4,
    features: [
      'ATS score out of 100',
      'Top 5 missing keywords',
      'Top 2 suggestions',
      '4 checks per month',
    ],
    razorpayPlanId: null,
  },
  pro: {
    name: 'Pro',
    price: 99,
    checksPerMonth: 999999,
    features: [
      'ATS score out of 100',
      'Full keyword analysis',
      'All suggestions + examples',
      'LinkedIn optimization tips',
      'Unlimited checks',
      'AI Resume Coach',
    ],
    razorpayPlanId: process.env.RAZORPAY_PRO_PLAN_ID || 'plan_pro',
  },
  unlimited: {
    name: 'Unlimited',
    price: 199,
    checksPerMonth: 999999,
    features: [
      'Everything in Pro',
      'Unlimited checks',
      'Priority support',
      'Early access to features',
    ],
    razorpayPlanId: process.env.RAZORPAY_UNLIMITED_PLAN_ID || 'plan_unlimited',
  },
}

export function getPlanLimits(plan) {
  return PLANS[plan] || PLANS.free
}
