import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, resume, jobDescription, analysisResult } = await request.json()

    const systemContext = `You are ResumeATS AI Assistant — an expert career coach and resume specialist.
You help users improve their resumes to pass ATS systems and get more interviews.

${resume ? `USER'S RESUME:\n${resume}\n` : ''}
${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : ''}
${analysisResult ? `ATS ANALYSIS RESULT:\n${JSON.stringify(analysisResult, null, 2)}\n` : ''}

Guidelines:
- Be specific and actionable — refer to actual content in their resume
- Give concrete examples and rewrites
- Be encouraging but honest
- Keep responses concise (3-5 sentences max unless asked for more)
- If user writes in Hindi, respond in Hindi. If English, respond in English.
- Always end with a specific next action the user can take`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemContext,
      messages: [
        { role: 'user', content: message }
      ],
    })

    const reply = response.content[0]?.text?.trim()
    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Chat failed. Please try again.' }, { status: 500 })
  }
}
