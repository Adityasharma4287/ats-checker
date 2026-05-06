'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import {
  Target, LogOut, Zap, FileText, Briefcase,
  Crown, AlertCircle, CheckCircle, XCircle,
  TrendingUp, Clock, BarChart3, Upload, File,
  X, Send, Bot, User, Sparkles, Lock, Star,
  Award, ThumbsUp, AlertTriangle, ChevronRight
} from 'lucide-react'

// Score configuration
function getScoreConfig(score) {
  if (score >= 90) return { label: 'Excellent Match', color: '#2D6A4F', bg: 'bg-success-light', text: 'text-success', emoji: '🏆', ring: '#2D6A4F' }
  if (score >= 76) return { label: 'Strong Match', color: '#2D6A4F', bg: 'bg-success-light', text: 'text-success', emoji: '✅', ring: '#2D6A4F' }
  if (score >= 61) return { label: 'Good Match', color: '#1B6CA8', bg: 'bg-info-light', text: 'text-info', emoji: '👍', ring: '#1B6CA8' }
  if (score >= 41) return { label: 'Average', color: '#B5451B', bg: 'bg-warn-light', text: 'text-warn', emoji: '⚠️', ring: '#B5451B' }
  if (score >= 21) return { label: 'Below Average', color: '#C84B31', bg: 'bg-accent-light', text: 'text-accent', emoji: '📉', ring: '#C84B31' }
  return { label: 'Poor Match', color: '#C84B31', bg: 'bg-accent-light', text: 'text-accent', emoji: '❌', ring: '#C84B31' }
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
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((animated ? score : 0) / 100) * circumference

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100)
  }, [score])

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Background ring */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#EDE9E0" strokeWidth="10" />
        {/* Score ring */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke={config.ring} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference}
          style={{
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '70px 70px',
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />
        {/* Glow effect */}
        <circle cx="70" cy="70" r={radius} fill="none" stroke={config.ring} strokeWidth="2"
          strokeLinecap="round" strokeDasharray={circumference} opacity="0.3"
          style={{
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '70px 70px',
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            filter: 'blur(3px)'
          }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-4xl font-bold" style={{ color: config.ring }}>
          <AnimatedCounter target={score} />
        </div>
        <div className="text-xs text-ink-muted font-medium">/100</div>
      </div>
    </div>
  )
}

function KeywordBadge({ word, found }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 ${found ? 'bg-success-light text-success border border-success/20' : 'bg-warn-light text-warn border border-warn/20'}`}>
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
      const config = getScoreConfig(analysisResult.ats_score)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${config.emoji} Resume analyze ho gaya!\n\nAapka Score: ${analysisResult.ats_score}/100 — ${config.label}\n\n${analysisResult.ats_score < 60 ? `Main aapko ${Math.min(analysisResult.ats_score + 25, 100)} tak le ja sakta hoon! Kya improve karna chahte ho?` : 'Bahut achha! Aur better karne ke liye kya chahiye?'}`
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
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || 'Sorry, kuch problem ho gayi.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card flex flex-col h-full" style={{ minHeight: '460px' }}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-paper-warm">
        <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles size={17} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">AI Resume Coach</p>
          <p className="text-xs text-ink-muted">Hindi / English</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 bg-success-light px-2 py-1 rounded-full">
          <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-success font-medium">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1" style={{ maxHeight: '280px' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'assistant' ? 'bg-accent-light' : 'bg-ink'}`}>
              {msg.role === 'assistant' ? <Bot size={13} className="text-accent" /> : <User size={13} className="text-white" />}
            </div>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line ${msg.role === 'assistant' ? 'bg-paper-warm rounded-tl-none shadow-sm' : 'bg-ink text-white rounded-tr-none shadow-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-accent-light flex items-center justify-center">
              <Bot size={13} className="text-accent" />
            </div>
            <div className="bg-paper-warm rounded-2xl rounded-tl-none px-3 py-3">
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
            className="text-left text-xs bg-paper hover:bg-paper-warm border border-paper-warm rounded-xl px-2.5 py-2 transition-all leading-snug disabled:opacity-50 hover:border-accent/30">
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Kuch bhi poochho..." className="input-field text-xs py-2 flex-1" disabled={loading} />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
          className="bg-accent hover:bg-accent-hover text-white px-3 py-2 rounded-xl transition-all disabled:opacity-50 active:scale-95">
          <Send size={14} />
        </button>
      </div>

      {!isPro && (
        <div className="mt-3 pt-3 border-t border-paper-warm">
          <Link href="/pricing" className="flex items-center gap-1.5 text-xs text-accent hover:underline font-medium">
            <Crown size={11} /> Pro mein unlimited AI coaching milti hai
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
  const [uploadMethod, setUploadMethod] = useState('paste')
  const [extracting, setExtracting] = useState(false)

  const isPro = plan === 'pro' || plan === 'unlimited'

  async function handleFileUpload(e) {
    const file = e.target?.files?.[0] || e
    if (!file || !file.name) return
    if (file.type.startsWith('image/')) {
      setError('❌ Image files supported nahi. PDF, DOC ya TXT upload karo, ya text paste karo.')
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
      setResume(text); setUploadMethod('file')
    } catch {
      setError('File read nahi hua. Please text paste karo.')
      setUploadedFile(null)
    } finally { setExtracting(false) }
  }

  function removeFile() {
    setUploadedFile(null); setResume(''); setUploadMethod('paste')
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

  const planFeatures = [
    { label: 'ATS Score', free: true, pro: true },
    { label: 'Keyword Analysis', free: true, pro: true },
    { label: 'Score Breakdown', free: true, pro: true },
    { label: 'Basic Suggestions (2)', free: true, pro: true },
    { label: 'All Suggestions', free: false, pro: true },
    { label: 'Rewrite Examples', free: false, pro: true },
    { label: 'LinkedIn Tips', free: false, pro: true },
    { label: 'Summary Rewrite', free: false, pro: true },
    { label: 'Interview Tips', free: false, pro: true },
    { label: 'AI Chat Coach', free: true, pro: true },
    { label: 'PDF Upload', free: true, pro: true },
  ]

  return (
    <div className="min-h-screen grain">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-paper-warm sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center shadow-sm">
              <Target size={15} className="text-white" />
            </div>
            <span className="font-display text-xl">ResumeATS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${plan === 'free' ? 'bg-paper-warm text-ink-muted' : 'bg-gradient-to-r from-accent-light to-accent/10 text-accent'}`}>
              {plan === 'free' ? '🆓 Free' : plan === 'pro' ? '👑 Pro' : '⚡ Unlimited'}
            </span>
            {!isPro && (
              <Link href="/pricing" className="btn-primary text-xs px-4 py-2 shadow-sm">
                <Crown size={12} /> Upgrade
              </Link>
            )}
            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-paper-warm transition-colors text-ink-muted">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <div className="card p-5 bg-gradient-to-br from-white to-paper">
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
            <div className="card p-4">
              <p className="text-xs font-semibold text-ink-muted mb-3 uppercase tracking-wide">Plan Features</p>
              <div className="space-y-2">
                {planFeatures.map(f => {
                  const has = isPro ? f.pro : f.free
                  return (
                    <div key={f.label} className={`flex items-center justify-between py-0.5 ${!has ? 'opacity-50' : ''}`}>
                      <span className="text-xs">{f.label}</span>
                      {has ? <CheckCircle size={12} className="text-success flex-shrink-0" /> : <Lock size={11} className="text-ink-muted/50 flex-shrink-0" />}
                    </div>
                  )
                })}
              </div>
              {!isPro && (
                <Link href="/pricing" className="btn-primary w-full justify-center text-xs mt-4 py-2.5 shadow-sm">
                  <Crown size={12} /> Upgrade to Pro ₹99/mo
                </Link>
              )}
            </div>

            {/* Usage */}
            <div className="card p-4">
              <p className="text-xs font-semibold text-ink-muted mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                <BarChart3 size={11} /> This Month
              </p>
              <div className="flex items-end justify-between">
                <span className="font-display text-3xl font-bold">{checksLimit - checksLeft}</span>
                <span className="text-ink-muted text-sm">checks done</span>
              </div>
            </div>

            {/* Recent */}
            {recentAnalyses.length > 0 && (
              <div className="card p-4">
                <p className="text-xs font-semibold text-ink-muted mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock size={11} /> Recent Checks
                </p>
                <div className="space-y-2">
                  {recentAnalyses.slice(0, 5).map(a => {
                    const cfg = getScoreConfig(a.ats_score)
                    return (
                      <div key={a.id} className="flex items-center justify-between bg-paper rounded-xl px-3 py-2">
                        <span className={`text-xs font-bold ${cfg.text}`}>{a.ats_score}/100</span>
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-light to-accent/10 rounded-2xl flex items-center justify-center shadow-sm">
                    <Zap size={20} className="text-accent" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl">ATS Resume Checker</h2>
                    <p className="text-ink-muted text-xs">PDF, Word ya text paste karo</p>
                  </div>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-5">
                  {/* Resume Input */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <FileText size={14} className="text-accent" /> Your Resume
                    </label>
                    <div className="flex gap-2 mb-3">
                      <button type="button" onClick={() => setUploadMethod('paste')}
                        className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold border-2 transition-all ${uploadMethod === 'paste' ? 'bg-accent text-white border-accent shadow-sm' : 'bg-white border-paper-warm text-ink-muted hover:border-accent/50'}`}>
                        ✏️ Paste Text
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 py-2 px-4 rounded-xl text-xs font-semibold border-2 transition-all ${uploadMethod === 'file' ? 'bg-accent text-white border-accent shadow-sm' : 'bg-white border-paper-warm text-ink-muted hover:border-accent/50'}`}>
                        📄 Upload PDF/DOC
                      </button>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={handleFileUpload} className="hidden" />

                    {extracting && (
                      <div className="flex items-center gap-2 bg-info-light text-info px-4 py-3 rounded-xl mb-3 text-xs font-medium">
                        <div className="w-3.5 h-3.5 border-2 border-info/30 border-t-info rounded-full animate-spin" />
                        PDF se text extract ho raha hai...
                      </div>
                    )}

                    {uploadedFile && !extracting && (
                      <div className="flex items-center gap-2 bg-success-light text-success px-4 py-2.5 rounded-xl mb-3 text-xs font-medium border border-success/20">
                        <File size={13} />
                        <span className="flex-1 truncate">{uploadedFile.name}</span>
                        <span className="text-success/70 bg-success/10 px-2 py-0.5 rounded-full">{resume.length} chars ✓</span>
                        <button type="button" onClick={removeFile} className="hover:text-accent transition-colors"><X size={13} /></button>
                      </div>
                    )}

                    {!uploadedFile && !extracting && (
                      <div className="border-2 border-dashed border-paper-warm rounded-2xl p-5 text-center mb-3 cursor-pointer hover:border-accent/50 hover:bg-paper transition-all"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}>
                        <Upload size={22} className="text-ink-muted/50 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-ink-muted">PDF, DOC, DOCX, TXT</p>
                        <p className="text-xs text-ink-muted/50 mt-0.5">Drag & drop ya click karo • Max 10MB</p>
                      </div>
                    )}

                    <textarea value={resume} onChange={e => { setResume(e.target.value); if (!uploadedFile) setUploadMethod('paste') }}
                      placeholder="Ya seedha resume text yahan paste karo..." rows={8} className="textarea-field text-xs" required />
                    <p className="text-ink-muted/40 text-xs mt-1">{resume.length} characters</p>
                  </div>

                  {/* Job Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Briefcase size={14} className="text-accent" /> Job Description
                    </label>
                    <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)}
                      placeholder="LinkedIn, Naukri, Indeed se job description paste karo..." rows={6} className="textarea-field text-xs" required />
                    <p className="text-ink-muted/40 text-xs mt-1">{jobDesc.length} characters</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-warn-light text-warn text-xs px-4 py-3 rounded-xl border border-warn/20 font-medium">
                      <AlertCircle size={14} />{error}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-ink-muted text-xs flex items-center gap-1">
                      <CheckCircle size={12} className="text-success" /> Unlimited checks
                    </span>
                    <button type="submit" disabled={loading || extracting}
                      className="btn-primary px-8 py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm">
                      {loading ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                      ) : (
                        <><Zap size={16} />Analyze Resume</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-5 animate-fade-up">
                {/* Score Hero Card */}
                <div className="card shadow-md overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-paper-warm/30 pointer-events-none" />
                  <div className="flex flex-col sm:flex-row items-center gap-6 relative">
                    <ScoreRing score={result.ats_score} />
                    <div className="flex-1 text-center sm:text-left">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3 ${scoreConfig.bg} ${scoreConfig.text}`}>
                        {scoreConfig.emoji} {scoreConfig.label}
                      </span>
                      <h2 className="font-display text-3xl mb-2">
                        ATS Score: <AnimatedCounter target={result.ats_score} />/100
                      </h2>
                      <p className="text-ink-muted text-sm leading-relaxed">{result.overall_feedback}</p>
                      
                      {/* Score scale */}
                      <div className="mt-4 flex items-center gap-1 text-xs">
                        {['Poor', 'Below Avg', 'Average', 'Good', 'Strong', 'Excellent'].map((l, i) => (
                          <div key={l} className={`flex-1 text-center py-1 rounded text-xs font-medium transition-all ${Math.floor(result.ats_score / 20) === i ? 'bg-accent text-white scale-110 shadow-sm' : 'bg-paper text-ink-muted/50'}`}>
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { setResult(null); setResume(''); setJobDesc(''); setUploadedFile(null) }}
                      className="btn-secondary text-xs shadow-sm">
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
                          <div key={key} className="flex items-center gap-3">
                            <span className="text-xs font-medium capitalize w-36 flex-shrink-0">{key.replace(/_/g, ' ')}</span>
                            <div className="flex-1 h-2.5 bg-paper-warm rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${val}%`, backgroundColor: cfg.ring }} />
                            </div>
                            <span className={`text-xs font-bold w-9 text-right ${cfg.text}`}>{val}%</span>
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
                        <div key={i} className="flex items-start gap-2 bg-success-light/50 rounded-xl px-3 py-2">
                          <CheckCircle size={13} className="text-success flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-ink">{s}</p>
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
                      <p className="text-xs font-bold text-success mb-2.5 flex items-center gap-1.5">
                        <CheckCircle size={12} /> Found ({result.keywords_found?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords_found?.slice(0, isPro ? 20 : 5).map(k => <KeywordBadge key={k} word={k} found={true} />)}
                        {!isPro && result.keywords_found?.length > 5 && (
                          <Link href="/pricing" className="inline-flex items-center gap-1 text-xs text-accent bg-accent-light px-2 py-1 rounded-full hover:bg-accent hover:text-white transition-all">
                            <Lock size={9} /> +{result.keywords_found.length - 5} Pro
                          </Link>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-warn mb-2.5 flex items-center gap-1.5">
                        <XCircle size={12} /> Missing ({result.keywords_missing?.length || 0})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords_missing?.slice(0, isPro ? 20 : 5).map(k => <KeywordBadge key={k} word={k} found={false} />)}
                        {!isPro && result.keywords_missing?.length > 5 && (
                          <Link href="/pricing" className="inline-flex items-center gap-1 text-xs text-accent bg-accent-light px-2 py-1 rounded-full hover:bg-accent hover:text-white transition-all">
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
                      Improvements
                      {!isPro && <span className="badge bg-paper-warm text-ink-muted text-xs font-normal">Free: Top 2</span>}
                    </h3>
                    <div className="space-y-3">
                      {result.suggestions.slice(0, isPro ? 10 : 2).map((s, i) => (
                        <div key={i} className={`rounded-2xl p-4 ${s.priority === 'high' ? 'bg-accent-light border border-accent/20' : s.priority === 'medium' ? 'bg-warn-light border border-warn/20' : 'bg-info-light border border-info/20'}`}>
                          <div className="flex gap-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${s.priority === 'high' ? 'bg-accent text-white' : s.priority === 'medium' ? 'bg-warn text-white' : 'bg-info text-white'}`}>
                              {s.priority === 'high' ? '🔴' : s.priority === 'medium' ? '🟡' : '🟢'} {s.priority}
                            </span>
                            <div className="flex-1">
                              <p className="font-bold text-sm mb-1">{s.section}</p>
                              {s.issue && <p className="text-xs text-ink-muted/80 mb-1">⚠️ {s.issue}</p>}
                              <p className="text-xs text-ink">{s.suggestion}</p>
                              {s.example && isPro && (
                                <div className="mt-2 bg-white/70 rounded-xl px-3 py-2 border border-white">
                                  <p className="text-xs font-mono text-ink-muted">💡 Example: {s.example}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {!isPro && result.suggestions.length > 2 && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-accent-light to-paper rounded-2xl border border-accent/20 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">+{result.suggestions.length - 2} more suggestions</p>
                          <p className="text-xs text-ink-muted">Rewrite examples ke saath</p>
                        </div>
                        <Link href="/pricing" className="btn-primary text-xs px-4 py-2 shadow-sm">
                          <Crown size={11} /> Upgrade
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Pro Features */}
                {isPro && result.rewrite_summary && (
                  <div className="card shadow-sm border-l-4 border-accent">
                    <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                      <Sparkles size={17} className="text-accent" /> Rewritten Summary
                    </h3>
                    <div className="bg-paper rounded-2xl p-4 text-sm leading-relaxed text-ink">
                      {result.rewrite_summary}
                    </div>
                  </div>
                )}

                {isPro && result.interview_tips && result.interview_tips.length > 0 && (
                  <div className="card shadow-sm">
                    <h3 className="font-display text-lg mb-3 flex items-center gap-2">
                      <Award size={17} className="text-accent" /> Interview Preparation Tips
                    </h3>
                    <div className="space-y-2">
                      {result.interview_tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2 bg-paper rounded-xl px-4 py-3">
                          <span className="text-accent font-bold text-sm flex-shrink-0">{i + 1}.</span>
                          <p className="text-sm text-ink">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isPro && result.linkedin_tip && (
                  <div className="card shadow-sm bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-400">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">💼</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1">LinkedIn Optimization</p>
                        <p className="text-ink-muted text-sm">{result.linkedin_tip}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!isPro && (
                  <div className="card bg-gradient-to-br from-ink to-ink-soft text-white text-center py-8 shadow-md">
                    <Crown size={32} className="text-accent mx-auto mb-3" />
                    <h3 className="font-display text-2xl mb-2">Unlock Full Analysis</h3>
                    <p className="text-white/60 text-sm mb-1">Pro: ₹99/month</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/60 mb-5 max-w-xs mx-auto mt-3">
                      {['All suggestions', 'Rewrite examples', 'LinkedIn tips', 'Interview tips', 'Summary rewrite', 'Full keywords'].map(f => (
                        <div key={f} className="flex items-center gap-1.5 bg-white/5 rounded-lg px-3 py-1.5">
                          <CheckCircle size={10} className="text-accent" /> {f}
                        </div>
                      ))}
                    </div>
                    <Link href="/pricing" className="btn-primary mx-auto shadow-lg">
                      Upgrade to Pro — ₹99/month
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
