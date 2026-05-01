import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import { PLANS } from '@/lib/plans'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { plan } = await request.json()
    const planConfig = PLANS[plan]
    if (!planConfig || plan === 'free') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planConfig.razorpayPlanId,
      customer_notify: 1,
      quantity: 1,
      total_count: 12,
      notes: { user_id: user.id, plan },
    })

    return NextResponse.json({
      subscription_id: subscription.id,
      key_id: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create subscription' }, { status: 500 })
  }
}
