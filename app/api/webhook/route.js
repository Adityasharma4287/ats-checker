import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSig !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const serviceClient = createServiceClient()

    switch (event.event) {
      case 'subscription.cancelled':
      case 'subscription.expired': {
        const subId = event.payload?.subscription?.entity?.id
        if (subId) {
          // Downgrade to free
          await serviceClient
            .from('profiles')
            .update({ plan: 'free', razorpay_subscription_id: null })
            .eq('razorpay_subscription_id', subId)

          await serviceClient
            .from('subscriptions')
            .update({ status: event.event === 'subscription.cancelled' ? 'cancelled' : 'expired' })
            .eq('razorpay_subscription_id', subId)
        }
        break
      }

      case 'subscription.charged': {
        // Reset monthly checks on renewal
        const subId = event.payload?.subscription?.entity?.id
        if (subId) {
          await serviceClient
            .from('profiles')
            .update({ checks_used_this_month: 0, checks_reset_date: new Date().toISOString().split('T')[0] })
            .eq('razorpay_subscription_id', subId)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}
