import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { message, resume, jobDescription, analysisResult } = await request.json()

    // DEBUG: Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set!')
      return NextResponse.json({ error: 'API key not configured. Contact support.' }, { status: 500 })
    }

    const systemContext = `You are ResumeATS AI Assistant — an expert career coach and resume specialist.
You help users improve their resumes to pass ATS systems and get more interviews.
${resume ? `\nUSER'S RESUME:\n${resume}\n` : ''}
${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n` : ''}
${analysisResult ? `ATS ANALYSIS RESULT:\n${JSON.stringify(analysisResult, null, 2)}\n` : ''}
Guidelines:
- Be specific and actionable
- Give concrete examples
- Keep responses concise (3-5 sentences max)
- If user writes in Hindi, respond in Hindi. If English, respond in English.
- Always end with a specific next action`

    const fullPrompt = systemContext + '\n\nUser: ' + message

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      }
    )

    const data = await geminiRes.json()

    if (!geminiRes.ok) {
      console.error('Gemini API error:', JSON.stringify(data))
      throw new Error(data.error?.message || 'Gemini API failed')
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    if (!reply) throw new Error('Empty response from Gemini')

    return NextResponse.json({ reply })

  } catch (error) {
    console.error('Chat error:', error.message)
    return NextResponse.json({ error: 'Chat failed: ' + error.message }, { status: 500 })
  }
}
