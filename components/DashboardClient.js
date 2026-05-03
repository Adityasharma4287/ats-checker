'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import {
  Target, LogOut, Zap, FileText, Briefcase,
  Crown, AlertCircle, CheckCircle, XCircle,
  TrendingUp, Clock, BarChart3, Upload, File,
  X, Send, Bot, User, ChevronDown, ChevronUp,
  Sparkles
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

function AIAssistant({ resume, jobDescription, analysisResult }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Namaste! Main aapka AI Resume Coach hoon. Aapke resume ke baare mein kuch poochna hai? Main aapki poori madad karunga! 🚀'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const messagesEndRef = useRef(null)

  const quickQuestions = [
    '📝 Mera resume improve kaise karoon?',
    '🎯 Missing keywords kaise add karoon?',
    '💼 Professional summary kaise likhein?',
    '⭐ ATS score 90+ kaise karoon?',
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          resume,
          jobDescription,
          analysisResult
        })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || 'Sorry, kuch problem ho gayi. Dobara try karo.'
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Network error. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-1"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">AI Resume Coach</p>
            <p className="text-xs text-ink-muted">Resume improve karne mein help</p>
          </div>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
      </button>

      {isOpen && (
        <div className="mt-4">
          {/* Messages */}
          <div className="h-64 overflow-y-auto space-y-3 mb-3 pr-1">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' ? 'bg-accent-light' : 'bg-paper-warm'}`}>
                  {msg.role === 'assistant'
                    ? <Bot size={14} className="text-accent" />
                    : <User size={14} className="text-ink-muted" />
                  }
                </div>
                <div className={`max-w-xs rounded-2xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'assistant' ? 'bg-paper rounded-tl-none' : 'bg-accent text-white rounded-tr-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center">
                  <Bot size={14} className="text-accent" />
                </div>
                <div className="bg-paper rounded-2xl rounded-tl-none px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs bg-paper hover:bg-paper-warm rounded-xl px-3 py-2 transition-colors leading-snug"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Kuch poochho..."
              className="input-field text-xs py-2 flex-1"
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn-primary px-3 py-2 text-xs"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
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

  async function handleFileUpload(e) {
    const file = e.target.files?.[0] || e
    if (!file || !file.name) return
    if (file.size > 5 * 1024 * 1024) { setError('File too large. Max 5MB.'); return }
    setUploadedFile(file)
    setError('')
    const reader = new FileReader()
    reader.onload = (ev) => { setResume(ev.target.result); setUploadMethod('file') }
    reader.readAsText(file)
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
      setResult(data)
      router.refresh()
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-display text-lg">ResumeATS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${plan === 'free' ? 'bg-paper-warm text-ink-muted' : 'bg-accent-light text-accent'}`}>
              {plan === 'free' ? 'Free' : <><Crown size={10} /> {plan}</>}
            </span>
            {plan === 'free' && <Link href="/pricing" className="btn-primary text-xs px-3 py-1.5">Upgrade</Link>}
            <button onClick={handleLogout} className="btn-ghost text-xs p-2"><LogOut size={15} /></button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-4">
              <div className="w-10 h-10 bg-accent-light rounded-full flex items-center justify-center mb-3">
                <span className="font-display text-accent text-lg">{(profile?.full_name || user.email)[0].toUpperCase()}</span>
              </div>
              <p className="font-medium text-sm truncate">{profile?.full_name || 'User'}</p>
              <p className="text-ink-muted text-xs truncate">{user.email}</p>
            </div>

            <div className="card p-4">
              <p className="text-xs font-medium text-ink-muted mb-3 flex items-center gap-1.5"><BarChart3 size={12} /> Monthly Usage</p>
              <div className="flex items-end justify-between mb-2">
                <span className="font-display text-2xl">{checksLimit - checksLeft}</span>
                <span className="text-ink-muted text-xs">/ ∞</span>
              </div>
            </div>

            {recentAnalyses.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-medium text-ink-muted mb-3 flex items-center gap-1.5"><Clock size={12} /> Recent Checks</p>
                <div className="space-y-2">
                  {recentAnalyses.slice(0, 4).map(a => (
                    <div key={a.id} className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${a.ats_score >= 75 ? 'text-success' : a.ats_score >= 50 ? 'text-warn' : 'text-accent'}`}>{a.ats_score}/100</span>
                      <span className="text-ink-muted text-xs">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant in sidebar when result shown */}
            {result && (
              <AIAssistant resume={resume} jobDescription={jobDesc} analysisResult={result} />
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-4 space-y-6">
            {!result ? (
              <div className="card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 bg-accent-light rounded-xl flex items-center justify-center">
                    <Zap size={18} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl">ATS Resume Checker</h2>
                    <p className="text-ink-muted text-xs">Upload or paste your resume and job description</p>
                  </div>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                        <FileText size={14} className="text-accent" /> Your Resume
                      </label>
                      <div className="flex gap-2 mb-3">
                        <button type="button" onClick={() => setUploadMethod('paste')}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${uploadMethod === 'paste' ? 'bg-accent text-white border-accent' : 'bg-white border-paper-warm text-ink-muted hover:border-accent'}`}>
                          ✏️ Paste Text
                        </button>
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-all ${uploadMethod === 'file' ? 'bg-accent text-white border-accent' : 'bg-white border-paper-warm text-ink-muted hover:border-accent'}`}>
                          📁 Upload File
                        </button>
                      </div>
                      <input ref={fileInputRef} type="file" accept=".txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />
                      {uploadedFile && (
                        <div className="flex items-center gap-2 bg-success-light text-success px-3 py-2 rounded-lg mb-2 text-xs">
                          <File size={12} /><span className="flex-1 truncate">{uploadedFile.name}</span>
                          <button type="button" onClick={removeFile}><X size={12} /></button>
                        </div>
                      )}
                      {!uploadedFile && (
                        <div className="border-2 border-dashed border-paper-warm rounded-xl p-4 text-center mb-2 cursor-pointer hover:border-accent transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}>
                          <Upload size={20} className="text-ink-muted mx-auto mb-1" />
                          <p className="text-xs text-ink-muted">Drop .txt .doc .docx here</p>
                          <p className="text-xs text-ink-muted/60 mt-0.5">or click to browse</p>
                        </div>
                      )}
                      <textarea value={resume} onChange={e => { setResume(e.target.value); setUploadMethod('paste') }}
                        placeholder="Ya seedha resume text yahan paste karo..." rows={8} className="textarea-field" required />
                      <p className="text-ink-muted/50 text-xs mt-1">{resume.length} characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
                        <Briefcase size={14} className="text-accent" /> Job Description
                      </label>
                      <div className="border-2 border-dashed border-paper-warm rounded-xl p-4 text-center mb-3">
                        <p className="text-xs text-ink-muted font-medium mb-1">📋 Job Description paste karo</p>
                        <p className="text-xs text-ink-muted/60">LinkedIn, Naukri, Indeed se copy karo</p>
                      </div>
                      <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                        placeholder="Job description yahan paste karo..." rows={8} className="textarea-field" required />
                      <p className="text-ink-muted/50 text-xs mt-1">{jobDesc.length} characters</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs text-ink-muted">
                    <div className="bg-paper rounded-lg p-3">
                      <p className="font-medium text-ink mb-1">📄 PDF Resume?</p>
                      <p>PDF kholo → Ctrl+A → Ctrl+C → yahan paste karo</p>
                    </div>
                    <div className="bg-paper rounded-lg p-3">
                      <p className="font-medium text-ink mb-1">☁️ Google Drive?</p>
                      <p>File → Download → .txt download → upload karo</p>
                    </div>
                    <div className="bg-paper rounded-lg p-3">
                      <p className="font-medium text-ink mb-1">💼 LinkedIn?</p>
                      <p>Profile → More → Save to PDF → text copy karo</p>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-warn-light text-warn text-sm px-4 py-3 rounded-xl">
                      <AlertCircle size={15} />{error}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted text-sm">Unlimited checks available</span>
                    <button type="submit" disabled={loading} className="btn-primary px-8 py-3">
                      {loading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                        : <><Zap size={16} />Analyze Resume</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-up">
                {/* Score */}
                <div className="card">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ScoreRing score={result.ats_score} />
                    <div className="flex-1 text-center sm:text-left">
                      <div className={`badge mb-2 ${result.ats_score >= 75 ? 'bg-success-light text-success' : result.ats_score >= 50 ? 'bg-warn-light text-warn' : 'bg-accent-light text-accent'}`}>
                        {scoreLabel}
                      </div>
                      <h2 className="font-display text-3xl mb-2">ATS Score: {result.ats_score}/100</h2>
                      <p className="text-ink-muted text-sm leading-relaxed max-w-lg">{result.overall_feedback}</p>
                    </div>
                    <button onClick={() => { setResult(null); setResume(''); setJobDesc(''); setUploadedFile(null) }} className="btn-secondary text-sm">
                      Check Another
                    </button>
                  </div>
                </div>

                {/* Score Breakdown */}
                {result.score_breakdown && (
                  <div className="card">
                    <h3 className="font-display text-xl mb-4 flex items-center gap-2">
                      <TrendingUp size={18} className="text-accent" /> Score Breakdown
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {Object.entries(result.score_breakdown).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-paper rounded-xl">
                          <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-paper-warm rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${val}%` }} />
                            </div>
                            <span className="text-sm font-medium w-8 text-right">{val}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                <div className="card">
                  <h3 className="font-display text-xl mb-4">Keyword Analysis</h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-success mb-2 flex items-center gap-1.5">
                        <CheckCircle size={14} /> Found ({result.keywords_found?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords_found?.map(k => <KeywordBadge key={k} word={k} found={true} />) || <span className="text-ink-muted text-xs">None</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warn mb-2 flex items-center gap-1.5">
                        <XCircle size={14} /> Missing ({result.keywords_missing?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords_missing?.map(k => <KeywordBadge key={k} word={k} found={false} />) || <span className="text-ink-muted text-xs">None</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {result.suggestions && (
                  <div className="card">
                    <h3 className="font-display text-xl mb-4">Improvement Suggestions</h3>
                    <div className="space-y-3">
                      {result.suggestions.map((s, i) => (
                        <div key={i} className={`rounded-xl p-4 ${s.priority === 'high' ? 'bg-accent-light border-l-4 border-accent' : s.priority === 'medium' ? 'bg-warn-light border-l-4 border-warn' : 'bg-info-light border-l-4 border-info'}`}>
                          <div className="flex items-start gap-3">
                            <span className={`badge text-xs mt-0.5 ${s.priority === 'high' ? 'bg-accent text-white' : s.priority === 'medium' ? 'bg-warn text-white' : 'bg-info text-white'}`}>{s.priority}</span>
                            <div>
                              <p className="font-medium text-sm">{s.section}</p>
                              <p className="text-ink-muted text-sm mt-0.5">{s.suggestion}</p>
                              {s.example && <p className="text-xs mt-2 font-mono bg-white/60 rounded-lg px-3 py-2 text-ink-muted">💡 {s.example}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LinkedIn Tip */}
                {result.linkedin_tip && (
                  <div className="card border-l-4 border-accent">
                    <div className="flex items-start gap-3">
                      <Crown size={18} className="text-accent mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-1">LinkedIn Optimization Tip</p>
                        <p className="text-ink-muted text-sm">{result.linkedin_tip}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Assistant after result */}
                <div className="card bg-gradient-to-br from-accent-light to-white border-accent/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                      <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl">AI Resume Coach</h3>
                      <p className="text-ink-muted text-xs">Apne resume ko aur improve karo — AI se directly poochho</p>
                    </div>
                  </div>
                  <AIAssistant resume={resume} jobDescription={jobDesc} analysisResult={result} />
                </div>

                {plan === 'free' && (
                  <div className="card bg-ink text-white text-center py-8">
                    <Crown size={32} className="text-accent mx-auto mb-3" />
                    <h3 className="font-display text-2xl mb-2">Unlock Full Analysis</h3>
                    <p className="text-white/60 text-sm mb-5">Pro plan mein detailed rewrite suggestions aur LinkedIn tips milte hain.</p>
                    <Link href="/pricing" className="btn-primary mx-auto">
                      Upgrade to Pro — ₹99/month
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
