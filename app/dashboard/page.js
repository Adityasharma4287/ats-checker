export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getPlanLimits } from '@/lib/plans'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: recentAnalyses } = await supabase
    .from('analyses')
    .select('id, ats_score, created_at, keywords_missing')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const plan = profile?.plan || 'free'
  const limits = getPlanLimits(plan)
  const checksUsed = profile?.checks_used_this_month || 0
  const checksLeft = Math.max(0, limits.checksPerMonth - checksUsed)

  return (
    <DashboardClient
      user={user}
      profile={profile}
      plan={plan}
      checksLeft={checksLeft}
      checksLimit={limits.checksPerMonth}
      recentAnalyses={recentAnalyses || []}
    />
  )
}
