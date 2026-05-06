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
      return NextResponse.json({ error: 'Monthly limit reached. Please upgrade your plan.' }, { status: 429 })
    }

    const { resume, jobDescription } = await request.json()
    if (!resume?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 })
    }

    const isProOrHigher = plan === 'pro' || plan === 'unlimited'

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer and career coach with 10+ years of experience. 

IMPORTANT: Analyze ONLY the actual content provided. Be specific and reference actual text from the resume.

Analyze this resume against the job description and return ONLY valid JSON:

{
  "ats_score": <realistic integer 0-100, based on actual keyword matches and relevance>,
  "score_label": "<one of: Poor Match, Below Average, Average, Good Match, Strong Match, Excellent Match>",
  "overall_feedback": "<3-4 sentences specifically about THIS resume vs THIS job. Mention actual skills found, what's missing, and key improvements needed>",
  "score_breakdown": {
    "keyword_match": <0-100>,
    "skills_alignment": <0-100>,
    "experience_relevance": <0-100>,
    "education_fit": <0-100>,
    "format_quality": <0-100>
  },
  "keywords_found": ["actual keywords from resume that match JD"],
  "keywords_missing": ["important JD keywords NOT in resume"],
  "strengths": ["3-4 actual strengths found in this resume"],
  "suggestions": [
    {
      "section": "<actual section name>",
      "priority": "high|medium|low",
      "issue": "<specific problem in this resume>",
      "suggestion": "<specific fix>",
      "example": "<concrete rewrite example using their actual content>"
    }
  ]${isProOrHigher ? `,
  "rewrite_summary": "<rewritten professional summary tailored for this specific job>",
  "linkedin_tip": "<specific LinkedIn optimization for this job role>",
  "interview_tips": ["2-3 tips based on gaps in their resume vs JD"]` : ''}
}

SCORING GUIDE:
- 0-20: Very poor match, most keywords missing
- 21-40: Below average, some basic matches
- 41-60: Average match, key skills present but gaps exist  
- 61-75: Good match, most requirements met
- 76-90: Strong match, well aligned
- 91-100: Excellent, near perfect match

RESUME:
${resume.substring(0, 4000)}

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

Return ONLY valid JSON. No markdown. No explanation.`

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: 'You are an ATS expert. Return ONLY valid JSON. No markdown code blocks. No explanation text. Just the raw JSON object.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 2500,
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
      const jsonText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()
      analysisData = JSON.parse(jsonText)
    } catch (parseErr) {
      console.error('Parse error:', parseErr, 'Raw:', rawText.substring(0, 200))
      return NextResponse.json({ error: 'Analysis parsing failed. Please try again.' }, { status: 500 })
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
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}
