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
      return NextResponse.json(
        { error: 'Monthly limit reached. Please upgrade your plan.' },
        { status: 429 }
      )
    }

    const { resume, jobDescription } = await request.json()
    if (!resume?.trim() || !jobDescription?.trim()) {
      return NextResponse.json({ error: 'Resume and job description are required' }, { status: 400 })
    }

    const isProOrHigher = plan === 'pro' || plan === 'unlimited'

    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze this resume against the job description and return ONLY valid JSON, no markdown, no explanation.

Return this exact JSON structure:
{
  "ats_score": <integer 0-100>,
  "overall_feedback": "<2-3 sentence specific feedback about THIS resume and THIS job>",
  "score_breakdown": {
    "keyword_match": <0-100>,
    "skills_alignment": <0-100>,
    "experience_relevance": <0-100>,
    "education_fit": <0-100>,
    "format_quality": <0-100>
  },
  "keywords_found": ["list", "of", "keywords", "found", "in", "resume"],
  "keywords_missing": ["important", "keywords", "from", "JD", "not", "in", "resume"],
  "suggestions": [
    {
      "section": "<exact section name>",
      "priority": "high|medium|low",
      "suggestion": "<specific actionable advice for THIS resume>",
      "example": "<concrete example>"
    }
  ]${isProOrHigher ? ',\n  "linkedin_tip": "<specific LinkedIn tip for this job>"' : ''}
}

Rules:
- Analyze ONLY what is in the resume — do not make up information
- keywords_found: max 12 keywords actually present in resume
- keywords_missing: max 10 important JD keywords missing from resume  
- suggestions: ${isProOrHigher ? '6-8' : '3-4'} specific suggestions based on actual resume content
- ats_score: realistic score (most resumes 40-70 range)
- Return ONLY JSON, nothing else

RESUME:
${resume}

JOB DESCRIPTION:
${jobDescription}`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          }
        })
      }
    )

    const geminiData = await response.json()
    
    if (!response.ok) {
      console.error('Gemini error:', geminiData)
      return NextResponse.json({ error: 'AI analysis failed. Please try again.' }, { status: 500 })
    }

    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!rawText) {
      return NextResponse.json({ error: 'No response from AI. Please try again.' }, { status: 500 })
    }

    let analysisData
    try {
      const jsonText = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      analysisData = JSON.parse(jsonText)
    } catch {
      return NextResponse.json({ error: 'Analysis parsing failed. Please try again.' }, { status: 500 })
    }

    const { data: savedAnalysis } = await serviceClient
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

    await serviceClient
      .from('profiles')
      .update({ checks_used_this_month: checksUsed + 1 })
      .eq('id', user.id)

    return NextResponse.json({
      ...analysisData,
      analysis_id: savedAnalysis?.id,
    })

  } catch (error) {
    console.error('Analyze error:', error)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}
