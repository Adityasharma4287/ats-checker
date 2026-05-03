export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { PLANS } from '@/lib/plans'
import PricingClient from '@/components/PricingClient'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let currentPlan = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('plan').eq('id', user.id).single()
    currentPlan = profile?.plan || 'free'
  }

  return <PricingClient plans={PLANS} currentPlan={currentPlan} isLoggedIn={!!user} />
}
