'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import {
  Target, LogOut, Zap, FileText, Briefcase,
  Crown, AlertCircle, CheckCircle, XCircle,
  TrendingUp, Clock, BarChart3, Upload, File,
  X, Send, Bot, User, Sparkles, Lock
} from 'lucide-react'

function ScoreRing({ score }) {
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#2D6A4F' : score >= 50 ? '#B5451B' : '#C84B31'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#EDE9E0" strokeWidth="8" />
        <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          style={{ strokeDashoffset: offset, transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-3xl" style={{ color }}>{score}</div>
        <div className="text-xs text-ink-muted">/100</div>
      </div>
    </div>
  )
}

function KeywordBadge({ word, found }) {
  return (
    <span className={`badge ${found ? 'bg-success-light text-success' : 'bg-warn-light text-warn'}`}>
      {found ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {word}
    </span>
  )
}

function LockedFeature({ plan, feature, children }) {
  const isPro = plan === 'pro' || plan === 'unlimited'
  const isUnlimited = plan === 'unlimited'
  
  if (feature === 'pro' && !isPro) {
    return (
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center">
            <Lock size={20} className="text-accent" />
          </div>
          <div className="text-center px-4">
            <p className="font-display text-lg mb-1">Pro Feature</p>
            <p className="text-ink-muted text-xs mb-3">Yeh feature Pro plan mein available hai</p>
            <Link href="/pricing" className="btn-primary text-xs px-4 py-2">
              <Crown size={12} /> Upgrade to Pro — ₹99/month
            </Link>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none">{children}</div>
      </div>
    )
  }
  
  if (feature === 'unlimited' && !isUnlimited) {
    return (
      <div className="card relative overflow-hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center">
            <Lock size={20} className="text-accent" />
          </div>
          <div className="text-center px-4">
            <p className="font-display text-lg mb-1">Unlimited Feature</p>
            <p className="text-ink-muted text-xs mb-3">Yeh feature Unlimited plan mein available hai</p>
            <Link href="/pricing" className="btn-primary text-xs px-4 py-2">
              <Crown size={12} /> Upgrade — ₹199/month
            </Link>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none">{children}</div>
      </div>
    )
  }
  
  return children
}

function AICoach({ resume, jobDescription, analysisResult, plan }) {
  const isPro = plan === 'pro' || plan === 'unlimited'
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Main aapka AI Resume Coach hoon!\n\nResume analyze karo — phir main specific tips dunga. Ya abhi kuch poochho! 😊' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickQuestions = analysisResult ? [
    '🎯 Score kaise badhao?',
    '📝 Summary rewrite karo',
    '💡 Missing keywords add karo',
    '✨ Professional tips do',
  ] : [
    '📝 Resume tips kya hain?',
    '🎯 ATS kya hota hai?',
    '💼 Summary kaise likhein?',
    '⭐ Keywords kaise dhundhein?',
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (analysisResult) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ Resume analyze ho gaya!\n\nAapka ATS Score: ${analysisResult.ats_score}/100\n\n${analysisResult.ats_score >= 75 ? '🟢 Bahut achha! Thodi improvements se perfect hoga.' : analysisResult.ats_score >= 50 ? '🟡 Theek hai lekin improvements zaruri hain.' : '🔴 Kaafi improvements chahiye. Main help karunga!'}\n\nKya improve karna chahte ho?`
      }])
    }
  }, [analysisResult])

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, resume, jobDescription, analysisResult })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Sorry, kuch problem ho gayi.'
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex flex-col" style={{ minHeight: '420px' }}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-paper-warm">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <p className="font-medium text-sm">AI Resume Coach</p>
          <p className="text-xs text-ink-muted">Hindi/English</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-success">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1" style={{ maxHeight: '260px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-accent-light' : 'bg-paper-warm'}`}>
              {msg.role === 'assistant' ? <Bot size={12} className="text-accent" /> : <User size={12} className="text-ink-muted" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${msg.role === 'assistant' ? 'bg-paper rounded-tl-none' : 'bg-accent text-white rounded-tr-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-accent-light flex items-center justify-center">
              <Bot size={12} className="text-accent" />
            </div>
            <div className="bg-paper rounded-2xl rounded-tl-none px-3 py-2.5">
              <div className="flex gap-1">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {quickQuestions.map((q, i) => (
          <button key={i} onClick={() => sendMessage(q)} disabled={loading}
            className="text-left text-xs bg-paper hover:bg-paper-warm rounded-lg px-2 py-1.5 transition-colors leading-snug disabled:opacity-50">
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Kuch bhi poochho..." className="input-field text-xs py-2 flex-1" disabled={loading} />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="btn-primary px-3 py-2 disabled:opacity-50">
          <Send size={14} />
        </button>
      </div>

      {!isPro && (
        <div className="mt-3 pt-3 border-t border-paper-warm">
          <Link href="/pricing" className="flex items-center gap-2 text-xs text-accent hover:underline">
            <Crown size={12} /> Pro mein unlimited AI coaching milti hai
          </Link>
        </div>
      )}
    </div>
  )
}

// PDF text extraction using pdf.js from CDN
async function extractPdfText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        // Load pdf.js from CDN
        if (!window.pdfjsLib) {
          await new Promise((res, rej) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
            script.onload = res
            script.onerror = rej
            document.head.appendChild(script)
          })
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        }
        
        const arrayBuffer = e.target.result
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map(item => item.str).join(' ')
          fullText += pageText + '\n'
        }
        
        resolve(fullText.trim())
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export default function DashboardClient({ user, profile, plan, checksLeft, checksLimit, recentAnalyses }) {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [resume, setResume] = useState('')
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadMethod, setUploadMethod] = useState('paste')
  const [extracting, setExtracting] = useState(false)

  const isPro = plan === 'pro' || plan === 'unlimited'
  const isUnlimited = plan === 'unlimited'

  async function handleFileUpload(e) {
    const file = e.target?.files?.[0] || e
    if (!file || !file.name) return
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return }
    
    setUploadedFile(file)
    setError('')
    setExtracting(true)
    
    try {
      let text = ''
      
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF extraction
        text = await extractPdfText(file)
        if (!text || text.length < 50) {
          setError('PDF se text extract nahi hua. Please resume text manually paste karo.')
          setUploadedFile(null)
          setExtracting(false)
          return
        }
      } else {
        // Text/Word files
        const reader = new FileReader()
        text = await new Promise((res, rej) => {
          reader.onload = ev => res(ev.target.result)
          reader.onerror = rej
          reader.readAsText(file)
        })
      }
      
      setResume(text)
      setUploadMethod('file')
    } catch (err) {
      setError('File read karne mein problem hui. Please text paste karo.')
      setUploadedFile(null)
    } finally {
      setExtracting(false)
    }
  }

  function removeFile() {
    setUploadedFile(null); setResume(''); setUploadMethod('paste')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAnalyze(e) {
    e.preventDefault()
    if (!resume.trim() || !jobDesc.trim()) { setError('Please fill both resume and job description.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription: jobDesc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data); router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/'); router.refresh()
  }

  const scoreLabel = result
    ? result.ats_score >= 75 ? 'Strong Match' : result.ats_score >= 50 ? 'Needs Work' : 'Poor Match'
    : null

  return (
    <div className="min-h-screen grain">
      <nav className="bg-white border-b border-paper-warm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-display text-lg">ResumeATS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${plan === 'free' ? 'bg-paper-warm text-ink-muted' : 'bg-accent-light text-accent'}`}>
              {plan === 'free' ? 'Free' : <><Crown size={10} /> {plan.charAt(0).toUpperCase() + plan.slice(1)}</>}
            </span>
            {!isPro && <Link href="/pricing" className="btn-primary text-xs px-3 py-1.5">Upgrade</Link>}
            <button onClick={handleLogout} className="btn-ghost text-xs p-2"><LogOut size={15} /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center mb-2">
                <span className="font-display text-accent text-lg">{(profile?.full_name || user.email)[0].toUpperCase()}</span>
              </div>
              <p className="font-medium text-sm truncate">{profile?.full_name || 'User'}</p>
              <p className="text-ink-muted text-xs truncate">{user.email}</p>
              <div className="mt-2">
                <span className={`badge text-xs ${plan === 'free' ? 'bg-paper-warm text-ink-muted' : 'bg-accent-light text-accent'}`}>
                  {plan === 'free' ? '🆓 Free Plan' : plan === 'pro' ? '👑 Pro Plan' : '⚡ Unlimited Plan'}
                </span>
              </div>
            </div>

            {/* Plan Features */}
            <div className="card p-4">
              <p className="text-xs font-medium text-ink-muted mb-3">Plan Features</p>
              <div className="space-y-2">
                {[
                  { label: 'ATS Score', free: true, pro: true, unlimited: true },
                  { label: 'Keyword Analysis', free: true, pro: true, unlimited: true },
                  { label: 'Basic Suggestions', free: true, pro: true, unlimited: true },
                  { label: 'Detailed Feedback', free: false, pro: true, unlimited: true },
                  { label: 'LinkedIn Tips', free: false, pro: true, unlimited: true },
                  { label: 'AI Chat Coach', free: true, pro: true, unlimited: true },
                  { label: 'PDF Upload', free: true, pro: true, unlimited: true },
                  { label: 'Priority Support', free: false, pro: false, unlimited: true },
                ].map(f => {
                  const hasFeature = plan === 'unlimited' ? f.unlimited : plan === 'pro' ? f.pro : f.free
                  return (
                    <div key={f.label} className="flex items-center justify-between">
                      <span className="text-xs text-ink-muted">{f.label}</span>
                      {hasFeature
                        ? <CheckCircle size={12} className="text-success" />
                        : <Lock size={12} className="text-ink-muted/40" />
                      }
                    </div>
                  )
                })}
              </div>
              {!isPro && (
                <Link href="/pricing" className="btn-primary w-full justify-center text-xs mt-3 py-2">
                  <Crown size={12} /> Upgrade Plan
                </Link>
              )}
            </div>

            <div className="card p-4">
              <p className="text-xs font-medium text-ink-muted mb-2 flex items-center gap-1"><BarChart3 size={12} /> Usage</p>
              <div className="flex items-end justify-between">
                <span className="font-display text-2xl">{checksLimit - checksLeft}</span>
                <span className="text-ink-muted text-xs">/ ∞</span>
              </div>
            </div>

            {recentAnalyses.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-medium text-ink-muted mb-2 flex items-center gap-1"><Clock size={12} /> Recent</p>
                <div className="space-y-1.5">
                  {recentAnalyses.slice(0, 4).map(a => (
                    <div key={a.id} className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${a.ats_score >= 75 ? 'text-success' : a.ats_score >= 50 ? 'text-warn' : 'text-accent'}`}>{a.ats_score}/100</span>
                      <span className="text-ink-muted text-xs">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {!result ? (
              <div className="card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-accent-light rounded-xl flex items-center justify-center">
                    <Zap size={18} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl">ATS Resume Checker</h2>
                    <p className="text-ink-muted text-xs">PDF, Word ya text paste karo</p>
                  </div>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                      <FileText size={14} className="text-accent" /> Your Resume
                    </label>
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={() => setUploadMethod('paste')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${uploadMethod === 'paste' ? 'bg-accent text-white border-accent' : 'bg-white border-paper-warm text-ink-muted'}`}>
                        ✏️ Paste Text
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${uploadMethod === 'file' ? 'bg-accent text-white border-accent' : 'bg-white border-paper-warm text-ink-muted'}`}>
                        📄 Upload PDF/DOC
                      </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                    
                    {extracting && (
                      <div className="flex items-center gap-2 bg-info-light text-info px-3 py-2 rounded-lg mb-2 text-xs">
                        <div className="w-3 h-3 border-2 border-info/30 border-t-info rounded-full animate-spin" />
                        PDF se text extract ho raha hai...
                      </div>
                    )}
                    
                    {uploadedFile && !extracting && (
                      <div className="flex items-center gap-2 bg-success-light text-success px-3 py-1.5 rounded-lg mb-2 text-xs">
                        <File size={12} />
                        <span className="flex-1 truncate">{uploadedFile.name}</span>
                        <span className="text-success/70">{resume.length} chars extracted</span>
                        <button type="button" onClick={removeFile}><X size={12} /></button>
                      </div>
                    )}

                    {!uploadedFile && !extracting && (
                      <div className="border-2 border-dashed border-paper-warm rounded-xl p-4 text-center mb-2 cursor-pointer hover:border-accent transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}>
                        <Upload size={18} className="text-ink-muted mx-auto mb-1" />
                        <p className="text-xs text-ink-muted font-medium">PDF, DOC, DOCX, TXT</p>
                        <p className="text-xs text-ink-muted/60">Drop here or click to browse • Max 10MB</p>
                      </div>
                    )}

                    <textarea value={resume} onChange={e => { setResume(e.target.value); if (!uploadedFile) setUploadMethod('paste') }}
                      placeholder="Ya seedha resume text yahan paste karo..." rows={7} className="textarea-field" required />
                    <p className="text-ink-muted/50 text-xs mt-1">{resume.length} characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-accent" /> Job Description
                    </label>
                    <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                      placeholder="LinkedIn, Naukri, Indeed se job description paste karo..." rows={5} className="textarea-field" required />
                    <p className="text-ink-muted/50 text-xs mt-1">{jobDesc.length} characters</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-warn-light text-warn text-sm px-4 py-3 rounded-xl">
                      <AlertCircle size={15} />{error}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted text-xs">✅ Unlimited checks</span>
                    <button type="submit" disabled={loading || extracting} className="btn-primary px-6 py-2.5 disabled:opacity-50">
                      {loading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                        : <><Zap size={15} />Analyze Resume</>}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-up">
                {/* Score */}
                <div className="card">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <ScoreRing score={result.ats_score} />
                    <div className="flex-1 text-center sm:text-left">
                      <div className={`badge mb-2 ${result.ats_score >= 75 ? 'bg-success-light text-success' : result.ats_score >= 50 ? 'bg-warn-light text-warn' : 'bg-accent-light text-accent'}`}>
                        {scoreLabel}
                      </div>
                      <h2 className="font-display text-2xl mb-2">ATS Score: {result.ats_score}/100</h2>
                      <p className="text-ink-muted text-sm leading-relaxed">{result.overall_feedback}</p>
                    </div>
                    <button onClick={() => { setResult(null); setResume(''); setJobDesc(''); setUploadedFile(null) }} className="btn-secondary text-sm">
                      Check Another
                    </button>
                  </div>
                </div>

                {/* Score Breakdown - FREE */}
                {result.score_breakdown && (
                  <div className="card">
                    <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                      <TrendingUp size={16} className="text-accent" /> Score Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(result.score_breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between p-2.5 bg-paper rounded-xl">
                          <span className="text-xs font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-14 h-1.5 bg-paper-warm rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-accent" style={{ width: `${val}%` }} />
                            </div>
                            <span className="text-xs font-medium w-7 text-right">{val}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords - FREE */}
                <div className="card">
                  <h3 className="font-display text-lg mb-3">Keyword Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-success mb-2 flex items-center gap-1"><CheckCircle size={12} /> Found ({result.keywords_found?.length || 0})</p>
                      <div className="flex flex-wrap gap-1">{result.keywords_found?.slice(0, isPro ? 20 : 5).map(k => <KeywordBadge key={k} word={k} found={true} />)}</div>
                      {!isPro && result.keywords_found?.length > 5 && (
                        <Link href="/pricing" className="text-xs text-accent mt-1 flex items-center gap-1 hover:underline">
                          <Lock size={10} /> +{result.keywords_found.length - 5} more in Pro
                        </Link>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-warn mb-2 flex items-center gap-1"><XCircle size={12} /> Missing ({result.keywords_missing?.length || 0})</p>
                      <div className="flex flex-wrap gap-1">{result.keywords_missing?.slice(0, isPro ? 20 : 5).map(k => <KeywordBadge key={k} word={k} found={false} />)}</div>
                      {!isPro && result.keywords_missing?.length > 5 && (
                        <Link href="/pricing" className="text-xs text-accent mt-1 flex items-center gap-1 hover:underline">
                          <Lock size={10} /> +{result.keywords_missing.length - 5} more in Pro
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions - LIMITED for free */}
                {result.suggestions && (
                  <div className="card">
                    <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                      Improvement Suggestions
                      {!isPro && <span className="badge bg-paper-warm text-ink-muted text-xs">Top 2 Free</span>}
                    </h3>
                    <div className="space-y-2">
                      {result.suggestions.slice(0, isPro ? 10 : 2).map((s, i) => (
                        <div key={i} className={`rounded-xl p-3 ${s.priority === 'high' ? 'bg-accent-light border-l-4 border-accent' : s.priority === 'medium' ? 'bg-warn-light border-l-4 border-warn' : 'bg-info-light border-l-4 border-info'}`}>
                          <div className="flex gap-2">
                            <span className={`badge text-xs flex-shrink-0 ${s.priority === 'high' ? 'bg-accent text-white' : s.priority === 'medium' ? 'bg-warn text-white' : 'bg-info text-white'}`}>{s.priority}</span>
                            <div>
                              <p className="font-medium text-xs">{s.section}</p>
                              <p className="text-ink-muted text-xs mt-0.5">{s.suggestion}</p>
                              {s.example && isPro && <p className="text-xs mt-1 font-mono bg-white/60 rounded px-2 py-1 text-ink-muted">💡 {s.example}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isPro && result.suggestions.length > 2 && (
                      <div className="mt-3 p-3 bg-paper rounded-xl border border-paper-warm flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium">+{result.suggestions.length - 2} more suggestions</p>
                          <p className="text-xs text-ink-muted">Pro plan mein saari suggestions milti hain</p>
                        </div>
                        <Link href="/pricing" className="btn-primary text-xs px-3 py-1.5">
                          <Crown size={12} /> Upgrade
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* LinkedIn Tip - PRO ONLY */}
                {result.linkedin_tip && (
                  isPro ? (
                    <div className="card border-l-4 border-accent">
                      <div className="flex items-start gap-3">
                        <Crown size={18} className="text-accent mt-0.5" />
                        <div>
                          <p className="font-medium text-sm mb-1">LinkedIn Optimization Tip</p>
                          <p className="text-ink-muted text-sm">{result.linkedin_tip}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card border border-paper-warm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock size={16} className="text-ink-muted" />
                          <div>
                            <p className="font-medium text-sm">LinkedIn Optimization Tip</p>
                            <p className="text-xs text-ink-muted">Pro plan mein available</p>
                          </div>
                        </div>
                        <Link href="/pricing" className="btn-primary text-xs px-3 py-1.5">
                          <Crown size={12} /> Upgrade
                        </Link>
                      </div>
                    </div>
                  )
                )}

                {!isPro && (
                  <div className="card bg-ink text-white text-center py-6">
                    <Crown size={28} className="text-accent mx-auto mb-3" />
                    <h3 className="font-display text-xl mb-2">Pro Plan — ₹99/month</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/70 mb-4 max-w-xs mx-auto">
                      <div className="flex items-center gap-1"><CheckCircle size={10} className="text-accent" /> All suggestions</div>
                      <div className="flex items-center gap-1"><CheckCircle size={10} className="text-accent" /> LinkedIn tips</div>
                      <div className="flex items-center gap-1"><CheckCircle size={10} className="text-accent" /> Full keywords</div>
                      <div className="flex items-center gap-1"><CheckCircle size={10} className="text-accent" /> Rewrite examples</div>
                    </div>
                    <Link href="/pricing" className="btn-primary mx-auto">
                      Upgrade to Pro
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar — AI Coach ALWAYS VISIBLE */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <AICoach resume={resume} jobDescription={jobDesc} analysisResult={result} plan={plan} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
