import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient, createServiceClient } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      plan,
    } = await request.json()

    // Verify signature
    const text = `${razorpay_payment_id}|${razorpay_subscription_id}`
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    const serviceClient = createServiceClient()

    // Update user plan
    await serviceClient
      .from('profiles')
      .update({
        plan,
        razorpay_subscription_id,
        checks_used_this_month: 0,
      })
      .eq('id', user.id)

    // Record subscription
    await serviceClient.from('subscriptions').insert({
      user_id: user.id,
      plan,
      razorpay_subscription_id,
      status: 'active',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify payment error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
