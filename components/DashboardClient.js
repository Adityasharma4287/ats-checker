'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import {
  Target, LogOut, Zap, FileText, Briefcase,
  Crown, AlertCircle, CheckCircle, XCircle,
  TrendingUp, Clock, BarChart3, Upload, File,
  X, Send, Bot, User, Sparkles, Lock,
  Award, ThumbsUp, ChevronRight, Rocket
} from 'lucide-react'

function getScoreConfig(score) {
  if (score >= 90) return { label: 'Excellent Match', color: '#2D6A4F', bg: 'bg-success-light', text: 'text-success', emoji: '🏆', ring: '#2D6A4F', grade: 'A+' }
  if (score >= 76) return { label: 'Strong Match', color: '#2D6A4F', bg: 'bg-success-light', text: 'text-success', emoji: '✅', ring: '#2D6A4F', grade: 'A' }
  if (score >= 61) return { label: 'Good Match', color: '#1B6CA8', bg: 'bg-info-light', text: 'text-info', emoji: '👍', ring: '#1B6CA8', grade: 'B' }
  if (score >= 41) return { label: 'Average', color: '#B5451B', bg: 'bg-warn-light', text: 'text-warn', emoji: '⚠️', ring: '#B5451B', grade: 'C' }
  if (score >= 21) return { label: 'Below Average', color: '#C84B31', bg: 'bg-accent-light', text: 'text-accent', emoji: '📉', ring: '#C84B31', grade: 'D' }
  return { label: 'Poor Match', color: '#C84B31', bg: 'bg-accent-light', text: 'text-accent', emoji: '❌', ring: '#C84B31', grade: 'F' }
}

function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return <span>{count}</span>
}

function ScoreRing({ score }) {
  const [animated, setAnimated] = useState(false)
  const config = getScoreConfig(score)
  const radius = 56
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((animated ? score : 0) / 100) * circumference

  useEffect(() => {
    setTimeout(() => setAnimated(true), 200)
  }, [score])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#EDE9E0" strokeWidth="12" />
        <circle cx="80" cy="80" r={radius} fill="none" stroke={config.ring} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '80px 80px',
            transition: 'stroke-dashoffset 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: `drop-shadow(0 0 6px ${config.ring}60)`
          }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-5xl font-bold" style={{ color: config.ring }}>
          <AnimatedCounter target={score} />
        </div>
        <div className="text-xs text-ink-muted font-medium">/100</div>
        <div className="text-lg mt-1">{config.emoji}</div>
      </div>
    </div>
  )
}

function KeywordBadge({ word, found }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 cursor-default ${found ? 'bg-success-light text-success border border-success/20' : 'bg-warn-light text-warn border border-warn/20'}`}>
      {found ? <CheckCircle size={10} /> : <XCircle size={10} />}
      {word}
    </span>
  )
}

function AICoach({ resume, jobDescription, analysisResult, plan }) {
  const isPro = plan === 'pro' || plan === 'unlimited'
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '👋 Main aapka AI Resume Coach hoon!\n\nResume analyze karo — main score ke baad specific tips dunga. Ya abhi kuch poochho! 😊' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickQuestions = analysisResult ? [
    '🎯 Score kaise badhao?',
    '📝 Summary rewrite karo',
    '💡 Keywords add karo',
    '✨ Professional tips',
  ] : [
    '📝 Resume tips?',
    '🎯 ATS kya hai?',
    '💼 Summary kaise likhein?',
    '⭐ Keywords kaise dhundhein?',
  ]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (analysisResult) {
      const config = getScoreConfig(analysisResult.ats_score)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${config.emoji} Score: ${analysisResult.ats_score}/100 — ${config.label}\n\n${analysisResult.ats_score < 60 ? `Main aapko ${Math.min(analysisResult.ats_score + 25, 95)}+ tak le ja sakta hoon! Kya improve karein?` : 'Bahut achha! Aur better karne ke liye kya chahiye?'}`
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, try again.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error.' }])
    } finally { setLoading(false) }
  }

  return (
    <div className="card flex flex-col" style={{ minHeight: '480px' }}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-paper-warm">
        <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles size={17} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">AI Resume Coach</p>
          <p className="text-xs text-ink-muted">Hindi / English</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-success-light px-2.5 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-success font-medium">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1" style={{ maxHeight: '300px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'assistant' ? 'bg-accent-light' : 'bg-ink'}`}>
              {msg.role === 'assistant' ? <Bot size={13} className="text-accent" /> : <User size={13} className="text-white" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${msg.role === 'assistant' ? 'bg-paper-warm rounded-tl-none' : 'bg-ink text-white rounded-tr-none'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center">
              <Bot size={13} className="text-accent" />
            </div>
            <div className="bg-paper-warm rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1.5">
                {[0, 150, 300].map(d => (
                  <div key={d} className="w-2 h-2 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
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
            className="text-left text-xs bg-paper hover:bg-paper-warm border border-paper-warm rounded-xl px-2.5 py-2 transition-all leading-snug disabled:opacity-50 hover:border-accent/30 hover:shadow-sm">
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Kuch bhi poochho..." className="input-field text-xs py-2.5 flex-1" disabled={loading} />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="bg-accent hover:bg-accent-hover text-white px-3 py-2 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-sm">
          <Send size={14} />
        </button>
      </div>

      {!isPro && (
        <div className="mt-3 pt-3 border-t border-paper-warm">
          <Link href="/pricing" className="flex items-center gap-1.5 text-xs text-accent hover:underline font-medium">
            <Crown size={11} /> Pro mein unlimited AI coaching
          </Link>
        </div>
      )}
    </div>
  )
}

async function extractPdfText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        if (!window.pdfjsLib) {
          await new Promise((res, rej) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
            script.onload = res; script.onerror = rej
            document.head.appendChild(script)
          })
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        }
        const pdf = await window.pdfjsLib.getDocument({ data: e.target.result }).promise
        let fullText = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          fullText += content.items.map(item => item.str).join(' ') + '\n'
        }
        resolve(fullText.trim())
      } catch (err) { reject(err) }
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
  const [extracting, setExtracting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const isPro = plan === 'pro' || plan === 'unlimited'

  async function handleFileUpload(e) {
    const file = e.target?.files?.[0] || e
    if (!file || !file.name) return
    if (file.type.startsWith('image/')) {
      setError('❌ Image files nahi chalti. PDF, DOC ya TXT upload karo.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) { setError('File too large. Max 10MB.'); return }
    setUploadedFile(file); setError(''); setExtracting(true)
    try {
      let text = ''
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        text = await extractPdfText(file)
        if (!text || text.length < 50) {
          setError('PDF se text extract nahi hua. Please text paste karo.')
          setUploadedFile(null); setExtracting(false); return
        }
      } else {
        text = await new Promise((res, rej) => {
          const reader = new FileReader()
          reader.onload = ev => res(ev.target.result)
          reader.onerror = rej
          reader.readAsText(file)
        })
      }
      setResume(text)
    } catch {
      setError('File read nahi hua. Please text paste karo.')
      setUploadedFile(null)
    } finally { setExtracting(false) }
  }

  function removeFile() {
    setUploadedFile(null); setResume('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleAnalyze(e) {
    e.preventDefault()
    if (!resume.trim() || !jobDesc.trim()) { setError('Dono fields fill karo.'); return }
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
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/'); router.refresh()
  }

  const scoreConfig = result ? getScoreConfig(result.ats_score) : null

  return (
    <div className="min-h-screen grain">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-ink via-ink-soft to-ink relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent rounded-full blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center shadow-lg">
              <Target size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display text-xl text-white">ResumeATS</span>
              <span className="text-white/40 text-xs ml-2">Beat the Bots</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${plan === 'free' ? 'bg-white/10 text-white/70' : 'bg-accent/20 text-accent border border-accent/30'}`}>
              {plan === 'free' ? '🆓 Free' : plan === 'pro' ? '👑 Pro' : '⚡ Unlimited'}
            </span>
            {!isPro && (
              <Link href="/pricing" className="bg-accent hover:bg-accent-hover text-white text-xs px-4 py-2 rounded-xl font-medium transition-all shadow-sm flex items-center gap-1.5">
                <Crown size={12} /> Upgrade
              </Link>
            )}
            <button onClick={handleLogout} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-7xl mx-auto px-6 pb-4 relative">
          <div className="flex items-center gap-6 text-xs text-white/50">
            <span className="flex items-center gap-1.5"><Rocket size={11} className="text-accent" /> AI-Powered Analysis</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={11} className="text-success" /> Unlimited Checks</span>
            <span className="flex items-center gap-1.5"><Sparkles size={11} className="text-accent" /> Hindi + English Support</span>
            {recentAnalyses.length > 0 && (
              <span className="flex items-center gap-1.5">
                <BarChart3 size={11} className="text-white/40" />
                Last score: <strong className={`${getScoreConfig(recentAnalyses[0].ats_score).text.replace('text-', 'text-')} ml-1`}>{recentAnalyses[0].ats_score}/100</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5 bg-gradient-to-br from-white to-paper shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-light to-accent/10 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                <span className="font-display text-accent text-xl font-bold">{(profile?.full_name || user.email)[0].toUpperCase()}</span>
              </div>
              <p className="font-semibold text-sm truncate">{profile?.full_name || 'User'}</p>
              <p className="text-ink-muted text-xs truncate mb-2">{user.email}</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${plan === 'free' ? 'bg-paper-warm text-ink-muted' : 'bg-accent-light text-accent'}`}>
                {plan === 'free' ? '🆓 Free Plan' : plan === 'pro' ? '👑 Pro Plan' : '⚡ Unlimited'}
              </span>
            </div>

            {/* Plan Features */}
            <div className="card p-4 shadow-sm">
              <p className="text-xs font-bold text-ink-muted mb-3 uppercase tracking-wider">Plan Features</p>
              <div className="space-y-2">
                {[
                  { label: 'ATS Score', free: true },
                  { label: 'Keyword Analysis', free: true },
                  { label: 'Score Breakdown', free: true },
                  { label: 'Basic Suggestions', free: true },
                  { label: 'All Suggestions', free: false },
                  { label: 'Rewrite Examples', free: false },
                  { label: 'LinkedIn Tips', free: false },
                  { label: 'Summary Rewrite', free: false },
                  { label: 'Interview Tips', free: false },
                  { label: 'AI Chat Coach', free: true },
                  { label: 'PDF Upload', free: true },
                ].map(f => {
                  const has = isPro || f.free
                  return (
                    <div key={f.label} className={`flex items-center justify-between py-0.5 transition-opacity ${!has ? 'opacity-40' : ''}`}>
                      <span className="text-xs">{f.label}</span>
                      {has ? <CheckCircle size={12} className="text-success flex-shrink-0" /> : <Lock size={11} className="text-ink-muted/50 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
              {!isPro && (
                <Link href="/pricing" className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-accent to-accent-hover text-white text-xs font-semibold mt-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <Crown size={12} /> Upgrade ₹99/mo
                </Link>
              )}
            </div>

            {/* Usage */}
            <div className="card p-4 shadow-sm">
              <p className="text-xs font-bold text-ink-muted mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <BarChart3 size={11} /> This Month
              </p>
              <div className="flex items-end justify-between">
                <span className="font-display text-3xl font-bold">{checksLimit - checksLeft}</span>
                <span className="text-ink-muted text-sm">checks</span>
              </div>
            </div>

            {recentAnalyses.length > 0 && (
              <div className="card p-4 shadow-sm">
                <p className="text-xs font-bold text-ink-muted mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock size={11} /> Recent
                </p>
                <div className="space-y-2">
                  {recentAnalyses.slice(0, 5).map(a => {
                    const cfg = getScoreConfig(a.ats_score)
                    return (
                      <div key={a.id} className="flex items-center justify-between bg-paper rounded-xl px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.emoji}</span>
                          <span className={`text-xs font-bold ${cfg.text}`}>{a.ats_score}/100</span>
                        </div>
                        <span className="text-ink-muted text-xs">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            {!result ? (
              <div className="card shadow-sm">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-5 border-b border-paper-warm">
                  <div className="w-11 h-11 bg-gradient-to-br from-accent-light to-accent/10 rounded-2xl flex items-center justify-center shadow-sm">
                    <Zap size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl">ATS Resume Checker</h2>
                    <p className="text-ink-muted text-xs">PDF upload karo ya text paste karo</p>
                  </div>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-5">
                  {/* Resume Upload Area */}
                  <div>
                    <label className="block text-sm font-semibold mb-3 flex items-center gap-1.5">
                      <FileText size={15} className="text-accent" /> Your Resume
                    </label>

                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />

                    {/* Drag & Drop Zone */}
                    {!uploadedFile && !extracting && (
                      <div
                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragOver ? 'border-accent bg-accent-light/30 scale-[1.01]' : 'border-paper-warm hover:border-accent/50 hover:bg-paper'}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all ${dragOver ? 'bg-accent shadow-lg scale-110' : 'bg-paper-warm'}`}>
                          <Upload size={24} className={dragOver ? 'text-white' : 'text-ink-muted'} />
                        </div>
                        <p className="font-semibold text-sm text-ink mb-1">
                          {dragOver ? '📂 Drop karo!' : '📄 PDF, DOC, TXT upload karo'}
                        </p>
                        <p className="text-xs text-ink-muted/60">Drag & drop ya click karo • Max 10MB</p>
                        <div className="flex items-center justify-center gap-2 mt-3">
                          {['PDF', 'DOC', 'DOCX', 'TXT'].map(t => (
                            <span key={t} className="text-xs bg-paper-warm px-2 py-1 rounded-lg text-ink-muted font-medium">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {extracting && (
                      <div className="border-2 border-info/30 bg-info-light rounded-2xl p-6 text-center">
                        <div className="w-10 h-10 border-3 border-info/20 border-t-info rounded-full animate-spin mx-auto mb-3" style={{ borderWidth: '3px' }} />
                        <p className="text-sm font-medium text-info">PDF se text extract ho raha hai...</p>
                        <p className="text-xs text-info/60 mt-1">Please wait</p>
                      </div>
                    )}

                    {uploadedFile && !extracting && (
                      <div className="bg-success-light border border-success/20 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <File size={18} className="text-success" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-success truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-success/70">{resume.length.toLocaleString()} characters extracted ✓</p>
                        </div>
                        <button type="button" onClick={removeFile}
                          className="w-7 h-7 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm">
                          <X size={13} className="text-ink-muted hover:text-accent" />
                        </button>
                      </div>
                    )}

                    {/* Text area - always visible */}
                    <div className="mt-3">
                      <p className="text-xs text-ink-muted/60 mb-1.5 flex items-center gap-1">
                        <span className="w-4 h-px bg-paper-warm inline-block" />
                        ya seedha paste karo
                        <span className="w-4 h-px bg-paper-warm inline-block" />
                      </p>
                      <textarea
                        value={resume}
                        onChange={e => setResume(e.target.value)}
                        placeholder="Resume text yahan paste karo..."
                        rows={5}
                        className="textarea-field text-xs"
                        required
                      />
                      <p className="text-ink-muted/40 text-xs mt-1">{resume.length} characters</p>
                    </div>
                  </div>

                  {/* Job Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Briefcase size={15} className="text-accent" /> Job Description
                    </label>
                    <div className="bg-paper rounded-xl px-4 py-2.5 mb-2 flex items-center gap-2 text-xs text-ink-muted border border-paper-warm">
                      <span className="text-base">💡</span>
                      LinkedIn, Naukri, Indeed se copy karke paste karo
                    </div>
                    <textarea
                      value={jobDesc}
                      onChange={e => setJobDesc(e.target.value)}
                      placeholder="Job description yahan paste karo (responsibilities, requirements, skills)..."
                      rows={6}
                      className="textarea-field text-xs"
                      required
                    />
                    <p className="text-ink-muted/40 text-xs mt-1">{jobDesc.length} characters</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-warn-light text-warn text-xs px-4 py-3 rounded-xl border border-warn/20 font-medium animate-fade-in">
                      <AlertCircle size={14} className="flex-shrink-0" />{error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || extracting}
                    className="w-full py-4 bg-gradient-to-r from-accent to-accent-hover text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2 text-sm">
                    {loading ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI Analysis ho rahi hai...</>
                    ) : (
                      <><Zap size={18} />Analyze Resume — Free</>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 text-xs text-ink-muted/50">
                    <span className="flex items-center gap-1"><CheckCircle size={10} className="text-success" /> Unlimited checks</span>
                    <span className="flex items-center gap-1"><CheckCircle size={10} className="text-success" /> AI-powered</span>
                    <span className="flex items-center gap-1"><CheckCircle size={10} className="text-success" /> 100% private</span>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-up">
                {/* Score Hero */}
                <div className="card shadow-md overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <Target size={128} className={scoreConfig.text.replace('text-', 'text-')} />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ScoreRing score={result.ats_score} />
                    <div className="flex-1 text-center sm:text-left">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-3 ${scoreConfig.bg} ${scoreConfig.text}`}>
                        {scoreConfig.emoji} {scoreConfig.label} — Grade: {scoreConfig.grade}
                      </span>
                      <h2 className="font-display text-3xl mb-2">
                        ATS Score: <AnimatedCounter target={result.ats_score} />/100
                      </h2>
                      <p className="text-ink-muted text-sm leading-relaxed">{result.overall_feedback}</p>

                      {/* Score scale visual */}
                      <div className="mt-4">
                        <div className="flex h-2 rounded-full overflow-hidden">
                          {['#C84B31', '#B5451B', '#E6A800', '#1B6CA8', '#2D6A4F', '#1A5C3A'].map((c, i) => (
                            <div key={i} className="flex-1 transition-all" style={{ backgroundColor: c, opacity: Math.floor(result.ats_score / 20) >= i ? 1 : 0.15 }} />
                          ))}
                        </div>
                        <div className="flex justify-between text-xs text-ink-muted/50 mt-1">
                          <span>0</span><span>20</span><span>40</span><span>60</span><span>80</span><span>100</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setResult(null); setResume(''); setJobDesc(''); setUploadedFile(null) }}
                      className="btn-secondary text-xs shadow-sm flex-shrink-0">
                      New Check
                    </button>
                  </div>
                </div>

                {/* Score Breakdown */}
                {result.score_breakdown && (
                  <div className="card shadow-sm">
                    <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                      <TrendingUp size={17} className="text-accent" /> Score Breakdown
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(result.score_breakdown).map(([key, val]) => {
                        const cfg = getScoreConfig(val)
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className={`text-xs font-bold ${cfg.text}`}>{val}% — {cfg.label}</span>
                            </div>
                            <div className="h-2.5 bg-paper-warm rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000 delay-300"
                                style={{ width: `${val}%`, backgroundColor: cfg.ring, boxShadow: `0 0 8px ${cfg.ring}40` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                {result.strengths && result.strengths.length > 0 && (
                  <div className="card shadow-sm border-l-4 border-success">
                    <h3 className="font-display text-lg mb-3 flex items-center gap-2 text-success">
                      <ThumbsUp size={17} /> Aapki Strengths
                    </h3>
                    <div className="space-y-2">
                      {result.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-success-light/40 rounded-xl px-4 py-2.5">
                          <CheckCircle size={14} className="text-success flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-ink">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Keywords */}
                <div className="card shadow-sm">
                  <h3 className="font-display text-lg mb-4">Keyword Analysis</h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <p className="text-xs font-bold text-success mb-3 flex items-center gap-1.5">
                        <CheckCircle size={12} /> Found ({result.keywords_found?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords_found?.slice(0, isPro ? 20 : 5).map(k => <KeywordBadge key={k} word={k} found={true} />)}
                        {!isPro && result.keywords_found?.length > 5 && (
                          <Link href="/pricing" className="inline-flex items-center gap-1 text-xs text-accent bg-accent-light px-2.5 py-1 rounded-full hover:bg-accent hover:text-white transition-all border border-accent/20">
                            <Lock size={9} /> +{result.keywords_found.length - 5} Pro
                          </Link>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-warn mb-3 flex items-center gap-1.5">
                        <XCircle size={12} /> Missing ({result.keywords_missing?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords_missing?.slice(0, isPro ? 20 : 5).map(k => <KeywordBadge key={k} word={k} found={false} />)}
                        {!isPro && result.keywords_missing?.length > 5 && (
                          <Link href="/pricing" className="inline-flex items-center gap-1 text-xs text-accent bg-accent-light px-2.5 py-1 rounded-full hover:bg-accent hover:text-white transition-all border border-accent/20">
                            <Lock size={9} /> +{result.keywords_missing.length - 5} Pro
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {result.suggestions && (
                  <div className="card shadow-sm">
                    <h3 className="font-display text-lg mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2"><AlertTriangle size={17} className="text-accent" /> Improvements</span>
                      {!isPro && <span className="text-xs text-ink-muted bg-paper-warm px-2.5 py-1 rounded-full">Free: Top 2</span>}
                    </h3>
                    <div className="space-y-3">
                      {result.suggestions.slice(0, isPro ? 10 : 2).map((s, i) => (
                        <div key={i} className={`rounded-2xl p-4 transition-all hover:shadow-sm ${s.priority === 'high' ? 'bg-accent-light border border-accent/20' : s.priority === 'medium' ? 'bg-warn-light border border-warn/20' : 'bg-info-light border border-info/20'}`}>
                          <div className="flex gap-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 h-fit ${s.priority === 'high' ? 'bg-accent text-white' : s.priority === 'medium' ? 'bg-warn text-white' : 'bg-info text-white'}`}>
                              {s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢'} {s.priority}
                            </span>
                            <div className="flex-1">
                              <p className="font-bold text-sm mb-1">{s.section}</p>
                              {s.issue && <p className="text-xs text-ink-muted/80 mb-1.5 italic">⚠️ {s.issue}</p>}
                              <p className="text-xs text-ink leading-relaxed">{s.suggestion}</p>
                              {s.example && isPro && (
                                <div className="mt-2.5 bg-white/80 rounded-xl px-3 py-2.5 border border-white shadow-sm">
                                  <p className="text-xs font-mono text-ink-muted leading-relaxed">💡 {s.example}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isPro && result.suggestions.length > 2 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-accent-light/50 to-paper rounded-2xl border border-accent/15 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">+{result.suggestions.length - 2} more suggestions</p>
                          <p className="text-xs text-ink-muted">Rewrite examples ke saath</p>
                        </div>
                        <Link href="/pricing" className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5">
                          <Crown size={11} /> Upgrade
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Pro exclusive features */}
                {isPro && result.rewrite_summary && (
                  <div className="card shadow-sm border-l-4 border-accent">
                    <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                      <Sparkles size={17} className="text-accent" /> AI-Rewritten Summary
                    </h3>
                    <div className="bg-gradient-to-br from-paper to-accent-light/20 rounded-2xl p-4 text-sm leading-relaxed text-ink border border-accent/10">
                      "{result.rewrite_summary}"
                    </div>
                  </div>
                )}

                {isPro && result.interview_tips && result.interview_tips.length > 0 && (
                  <div className="card shadow-sm">
                    <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                      <Award size={17} className="text-accent" /> Interview Prep Tips
                    </h3>
                    <div className="space-y-2">
                      {result.interview_tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 bg-paper rounded-2xl px-4 py-3">
                          <span className="w-6 h-6 bg-accent-light rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">{i + 1}</span>
                          <p className="text-sm text-ink leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isPro && result.linkedin_tip && (
                  <div className="card shadow-sm bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-400">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-xl">💼</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1.5">LinkedIn Optimization</p>
                        <p className="text-ink-muted text-sm leading-relaxed">{result.linkedin_tip}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isPro && (
                  <div className="card bg-gradient-to-br from-ink to-ink-soft text-white text-center py-10 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full blur-2xl" />
                    </div>
                    <Crown size={36} className="text-accent mx-auto mb-3 relative" />
                    <h3 className="font-display text-2xl mb-1 relative">Unlock Full Analysis</h3>
                    <p className="text-white/50 text-sm mb-5 relative">Pro Plan — ₹99/month</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-white/60 mb-6 max-w-xs mx-auto relative">
                      {['All suggestions', 'Rewrite examples', 'LinkedIn tips', 'Interview tips', 'Summary rewrite', 'Full keywords'].map(f => (
                        <div key={f} className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1.5 justify-center text-center">
                          <CheckCircle size={9} className="text-accent flex-shrink-0" /> {f}
                        </div>
                      ))}
                    </div>
                    <Link href="/pricing" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-3 rounded-2xl shadow-lg transition-all relative">
                      <Crown size={16} /> Upgrade to Pro — ₹99/month
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right — AI Coach */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <AICoach resume={resume} jobDescription={jobDesc} analysisResult={result} plan={plan} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
