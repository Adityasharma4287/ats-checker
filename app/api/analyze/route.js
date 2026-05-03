import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import { getPlanLimits } from '@/lib/plans'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceClient = await createServiceClient()
    const { data: profile } = await serviceClient
      .from('profiles').select('*').eq('id', user.id).single()

    const plan = profile?.plan || 'free'
    const limits = getPlanLimits(plan)
    const checksUsed = profile?.checks_used_this_month || 0

    if (checksUsed >= limits.checksPerMonth) {
      return NextResponse.json({ error: 'Monthly limit reached.' }, { status: 429 })
    }

    const { resume, jobDescription } = await request.json()
    if (!resume?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 })
    }

    const isProOrHigher = plan === 'pro' || plan === 'unlimited'

    const prompt = `You are an expert ATS analyzer. Analyze this resume against the job description. Return ONLY valid JSON, no markdown.

{
  "ats_score": <0-100>,
  "overall_feedback": "<2-3 sentences about THIS specific resume>",
  "score_breakdown": {
    "keyword_match": <0-100>,
    "skills_alignment": <0-100>,
    "experience_relevance": <0-100>,
    "education_fit": <0-100>,
    "format_quality": <0-100>
  },
  "keywords_found": ["keywords", "actually", "in", "resume"],
  "keywords_missing": ["important", "missing", "keywords"],
  "suggestions": [
    {
      "section": "section name",
      "priority": "high",
      "suggestion": "specific advice",
      "example": "example"
    }
  ]${isProOrHigher ? ',\n  "linkedin_tip": "tip"' : ''}
}

RESUME: ${resume}
JOB DESCRIPTION: ${jobDescription}

Return ONLY JSON.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Groq error:', JSON.stringify(data))
      return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 })
    }

    const rawText = data.choices?.[0]?.message?.content?.trim()
    if (!rawText) {
      return NextResponse.json({ error: 'No response from AI.' }, { status: 500 })
    }

    let analysisData
    try {
      const jsonText = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      analysisData = JSON.parse(jsonText)
    } catch {
      return NextResponse.json({ error: 'Analysis parsing failed.' }, { status: 500 })
    }

    await serviceClient.from('analyses').insert({
      user_id: user.id,
      resume_text: resume.substring(0, 5000),
      job_description: jobDescription.substring(0, 3000),
      ats_score: analysisData.ats_score,
      score_breakdown: analysisData.score_breakdown,
      keywords_found: analysisData.keywords_found,
      keywords_missing: analysisData.keywords_missing,
      suggestions: analysisData.suggestions,
      overall_feedback: analysisData.overall_feedback,
    })

    await serviceClient.from('profiles')
      .update({ checks_used_this_month: checksUsed + 1 })
      .eq('id', user.id)

    return NextResponse.json(analysisData)

  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
