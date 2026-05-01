export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    checksPerMonth: 3,
    features: [
      'ATS score out of 100',
      'Top 5 missing keywords',
      'Basic improvement tips',
      '3 checks per month',
    ],
    razorpayPlanId: null,
  },
  pro: {
    name: 'Pro',
    price: 99,
    checksPerMonth: 50,
    features: [
      'ATS score out of 100',
      'Full keyword analysis',
      'Detailed section-wise feedback',
      'Rewrite suggestions',
      'LinkedIn optimization tips',
      '50 checks per month',
      'Download PDF report',
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
      'Early access to new features',
      'Bulk resume upload (coming soon)',
    ],
    razorpayPlanId: process.env.RAZORPAY_UNLIMITED_PLAN_ID || 'plan_unlimited',
  },
}

export function getPlanLimits(plan) {
  return PLANS[plan] || PLANS.free
}
