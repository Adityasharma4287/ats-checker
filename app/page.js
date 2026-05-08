export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { CheckCircle, ArrowRight, Zap, Target, FileText, TrendingUp, Star, Users, Award, Shield } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen grain overflow-hidden">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-accent to-accent-hover rounded-xl flex items-center justify-center shadow-sm">
            <Target size={18} className="text-white" />
          </div>
          <span className="font-display text-xl text-ink">ResumeATS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="btn-ghost text-sm">Pricing</Link>
          <Link href="/login" className="btn-ghost text-sm">Login</Link>
          <Link href="/signup" className="btn-primary text-sm shadow-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent-light text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-accent/20">
              <Zap size={14} />
              AI-powered • Free • Instant Results
            </div>
            <h1 className="font-display text-6xl md:text-7xl leading-tight mb-6">
              Get Past
              <br />
              <span className="text-gradient italic">ATS Bots.</span>
              <br />
              Land Interviews.
            </h1>
            <p className="text-ink-muted text-lg max-w-lg mb-8 leading-relaxed">
              75% resumes are rejected before a human sees them. Check your ATS score, find missing keywords, and get AI-powered fixes in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/signup" className="btn-primary text-base px-8 py-4 shadow-md hover:shadow-lg transition-all">
                Check My Resume Free
                <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" className="btn-secondary text-base px-8 py-4">
                View Plans
              </Link>
            </div>
            <p className="text-ink-muted/50 text-xs flex items-center gap-3">
              <span className="flex items-center gap-1"><CheckCircle size={11} className="text-success" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle size={11} className="text-success" /> Unlimited checks</span>
              <span className="flex items-center gap-1"><CheckCircle size={11} className="text-success" /> AI-powered</span>
            </p>
          </div>

          {/* Right — Animated Score Card */}
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-accent/10 rounded-3xl blur-3xl scale-110" />
            
            {/* Mock result card */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-paper-warm">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-light rounded-xl flex items-center justify-center">
                    <Target size={16} className="text-accent" />
                  </div>
                  <span className="font-semibold text-sm">ATS Analysis Result</span>
                </div>
                <span className="bg-success-light text-success text-xs font-bold px-3 py-1.5 rounded-full">✅ Strong Match</span>
              </div>

              {/* Score ring mock */}
              <div className="flex items-center gap-6 mb-5">
                <div className="relative">
                  <svg width="100" height="100" viewBox="0 0 100 100" className="animate-pulse-slow">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#EDE9E0" strokeWidth="8" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#2D6A4F" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray="239"
                      strokeDashoffset="57"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50px 50px' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-2xl font-bold text-success">76</span>
                    <span className="text-xs text-ink-muted">/100</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl mb-1">ATS Score: 76/100</p>
                  <p className="text-ink-muted text-xs leading-relaxed">Strong match for React Developer position. Add Docker and TypeScript to reach 90+.</p>
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs font-bold text-success mb-2">✅ Found (6)</p>
                  <div className="flex flex-wrap gap-1">
                    {['React', 'Node.js', 'SQL', 'JavaScript', 'Git', 'REST'].map(k => (
                      <span key={k} className="text-xs bg-success-light text-success px-2 py-0.5 rounded-full border border-success/20">{k}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-warn mb-2">❌ Missing (3)</p>
                  <div className="flex flex-wrap gap-1">
                    {['Docker', 'TypeScript', 'AWS'].map(k => (
                      <span key={k} className="text-xs bg-warn-light text-warn px-2 py-0.5 rounded-full border border-warn/20">{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestion preview */}
              <div className="bg-accent-light rounded-xl p-3 border border-accent/15">
                <div className="flex gap-2">
                  <span className="text-xs bg-accent text-white px-2 py-0.5 rounded-full font-bold h-fit">🔴 high</span>
                  <p className="text-xs text-ink"><strong>Skills:</strong> Add Docker and TypeScript to your skills section to match job requirements.</p>
                </div>
              </div>

              {/* AI Coach preview */}
              <div className="mt-3 bg-paper rounded-xl p-3 flex items-center gap-2">
                <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap size={13} className="text-white" />
                </div>
                <p className="text-xs text-ink-muted">💬 <strong>AI Coach:</strong> "Aapka score 76 hai. Docker add karne se 85+ ho sakta hai!"</p>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-3 -right-3 bg-white shadow-lg rounded-2xl px-3 py-2 flex items-center gap-1.5 border border-paper-warm animate-bounce" style={{ animationDuration: '3s' }}>
              <span className="text-base">⚡</span>
              <span className="text-xs font-bold">10 sec result</span>
            </div>
            <div className="absolute -bottom-3 -left-3 bg-white shadow-lg rounded-2xl px-3 py-2 flex items-center gap-1.5 border border-paper-warm animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <span className="text-base">🆓</span>
              <span className="text-xs font-bold">100% Free</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-ink text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-6 text-center">
            {[
              { num: '75%', label: 'Resumes rejected by ATS', icon: '😱' },
              { num: '10s', label: 'To get your ATS score', icon: '⚡' },
              { num: '3x', label: 'More callbacks with optimization', icon: '📈' },
              { num: '100%', label: 'Free to use', icon: '🆓' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="font-display text-4xl text-accent mb-1">{s.num}</div>
                <div className="text-white/50 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="font-display text-5xl text-center mb-4">How it works</h2>
        <p className="text-ink-muted text-center mb-12">3 steps. 10 seconds. Higher callback rate.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FileText, step: '01', title: 'Upload or Paste Resume', desc: 'PDF upload karo ya text paste karo. Koi account required nahi pehle check ke liye.' },
            { icon: Target, step: '02', title: 'Add Job Description', desc: 'LinkedIn ya Naukri se job description paste karo. AI match karega.' },
            { icon: TrendingUp, step: '03', title: 'Get Score + AI Tips', desc: 'Instant ATS score, missing keywords, suggestions aur AI coach se chat karo.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="card relative overflow-hidden hover:shadow-md transition-all">
              <div className="absolute top-4 right-4 font-display text-6xl text-paper-warm select-none font-bold">{step}</div>
              <div className="w-12 h-12 bg-gradient-to-br from-accent-light to-accent/10 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <Icon size={22} className="text-accent" />
              </div>
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gradient-to-br from-paper to-white py-20 border-t border-paper-warm">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-5xl text-center mb-4">Everything you need</h2>
          <p className="text-ink-muted text-center mb-12">Free plan includes basics. Pro unlocks everything.</p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { feature: 'ATS compatibility score out of 100', free: true },
              { feature: 'Keyword gap analysis vs job description', free: true },
              { feature: 'Score breakdown by category', free: true },
              { feature: 'AI Resume Coach (Hindi + English)', free: true },
              { feature: 'Detailed section-wise feedback', free: false },
              { feature: 'Rewrite examples with AI', free: false },
              { feature: 'LinkedIn profile optimization tips', free: false },
              { feature: 'AI-generated summary rewrite', free: false },
              { feature: 'Interview preparation tips', free: false },
              { feature: 'PDF & DOC file upload', free: true },
            ].map(({ feature, free }) => (
              <div key={feature} className={`flex items-center gap-3 rounded-xl px-4 py-3 ${free ? 'bg-white border border-paper-warm' : 'bg-paper'}`}>
                <CheckCircle size={15} className={free ? 'text-success flex-shrink-0' : 'text-accent flex-shrink-0'} />
                <span className="text-sm text-ink">{feature}</span>
                {!free && <span className="ml-auto text-xs bg-accent-light text-accent px-2 py-0.5 rounded-full font-medium flex-shrink-0">Pro</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-success-light text-success px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-success/20">
          <Star size={14} /> 100% Free to Start
        </div>
        <h2 className="font-display text-5xl mb-4">Ready to fix your resume?</h2>
        <p className="text-ink-muted mb-8">No credit card. No limits. Start in seconds.</p>
        <Link href="/signup" className="btn-primary text-base px-10 py-4 shadow-lg hover:shadow-xl transition-all">
          Check My Resume — It's Free
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-paper-warm py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-muted/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
              <Target size={12} className="text-white" />
            </div>
            <span>© 2024 ResumeATS</span>
          </div>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-ink transition-colors">Login</Link>
            <Link href="/signup" className="hover:text-ink transition-colors">Sign Up Free</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
