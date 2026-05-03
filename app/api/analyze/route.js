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

    // Mock response - Anthropic API credit add hone ke baad replace karna
    const analysisData = {
      ats_score: 72,
      overall_feedback: "Your resume shows good technical skills alignment with the job description. Adding more specific keywords and quantifying achievements will significantly improve your ATS score.",
      score_breakdown: {
        keyword_match: 70,
        skills_alignment: 78,
        experience_relevance: 75,
        education_fit: 68,
        format_quality: 72
      },
      keywords_found: ["React", "Node.js", "JavaScript", "SQL", "Python", "Git", "MongoDB", "REST API"],
      keywords_missing: ["Docker", "Agile", "TypeScript", "AWS", "CI/CD", "Kubernetes", "GraphQL"],
      suggestions: [
        {
          section: "Skills",
          priority: "high",
          suggestion: "Add missing technical keywords: Docker, TypeScript, AWS to match job requirements",
          example: "Skills: JavaScript, React, Node.js, TypeScript, Docker, AWS, SQL"
        },
        {
          section: "Experience",
          priority: "high",
          suggestion: "Quantify your achievements with specific numbers and metrics",
          example: "Improved application performance by 40%, reducing load time from 3s to 1.8s"
        },
        {
          section: "Summary",
          priority: "medium",
          suggestion: "Add a professional summary mentioning years of experience and key technologies",
          example: "3+ years Software Engineer specializing in React.js and Node.js applications"
        },
        {
          section: "Experience",
          priority: "low",
          suggestion: "Use more action verbs at the start of each bullet point",
          example: "Architected, Implemented, Optimized, Delivered, Collaborated"
        }
      ]
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
