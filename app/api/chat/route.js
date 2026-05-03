import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemContext },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'AI failed')

    const reply = data.choices?.[0]?.message?.content?.trim()
    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Chat failed. Please try again.' }, { status: 500 })
  }
}
