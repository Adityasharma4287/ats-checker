import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient, createServiceClient } from '@/lib/supabase-server'
import { getPlanLimits } from '@/lib/plans'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request) {
  try {
    // 1. Auth check
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get profile + check limits
    const serviceClient = createServiceClient()
    const { data: profile } = await serviceClient
      .from('profiles').select('*').eq('id', user.id).single()

    const plan = profile?.plan || 'free'
    const limits = getPlanLimits(plan)
    const checksUsed = profile?.checks_used_this_month || 0

    if (checksUsed >= limits.checksPerMonth) {
      return NextResponse.json(
        { error: 'Monthly limit reached. Please upgrade your plan.' },
        { status: 429 }
      )
    }

    // 3. Parse request
    const { resume, jobDescription } = await request.json()
    if (!resume?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 })
    }

    // 4. Build Claude prompt based on plan
    const isProOrHigher = plan === 'pro' || plan === 'unlimited'

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach. 
Analyze resumes against job descriptions and return a JSON response ONLY (no markdown, no explanation, just JSON).`

    const userPrompt = `Analyze this resume against the job description and return JSON matching this exact structure:

{
  "ats_score": <integer 0-100>,
  "overall_feedback": "<2-3 sentence summary of match quality>",
  "score_breakdown": {
    "keyword_match": <0-100>,
    "skills_alignment": <0-100>,
    "experience_relevance": <0-100>,
    "education_fit": <0-100>,
    "format_quality": <0-100>
  },
  "keywords_found": ["keyword1", "keyword2", ...],
  "keywords_missing": ["keyword1", "keyword2", ...],
  "suggestions": [
    {
      "section": "<section name>",
      "priority": "high|medium|low",
      "suggestion": "<specific actionable advice>",
      "example": "<optional concrete example>"
    }
  ]${isProOrHigher ? `,
  "linkedin_tip": "<specific LinkedIn optimization tip based on the job>"` : ''}
}

Rules:
- keywords_found: max 12 important keywords that ARE in the resume
- keywords_missing: max 10 important keywords from JD that are NOT in resume
- suggestions: provide ${isProOrHigher ? '6-8' : '3-4'} suggestions total
- Be specific and actionable, not generic
- ats_score must be realistic (most resumes score 40-70)

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON, no other text.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    // 5. Parse Claude response
    let analysisData
    try {
      const rawText = message.content[0].text.trim()
      const jsonText = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      analysisData = JSON.parse(jsonText)
    } catch {
      return NextResponse.json({ error: 'Analysis parsing failed. Please try again.' }, { status: 500 })
    }

    // 6. Save to database
    const { data: savedAnalysis, error: saveError } = await serviceClient
      .from('analyses')
      .insert({
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
      .select()
      .single()

    if (saveError) console.error('Save error:', saveError)

    // 7. Increment usage count
    await serviceClient
      .from('profiles')
      .update({ checks_used_this_month: checksUsed + 1 })
      .eq('id', user.id)

    // 8. Return result
    return NextResponse.json({
      ...analysisData,
      analysis_id: savedAnalysis?.id,
    })

  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}
