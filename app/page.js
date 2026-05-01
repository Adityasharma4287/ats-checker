import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { CheckCircle, ArrowRight, Zap, Target, FileText, TrendingUp } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen grain">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Target size={16} className="text-white" />
          </div>
          <span className="font-display text-xl text-ink">ResumeATS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="btn-ghost text-sm">Pricing</Link>
          <Link href="/login" className="btn-ghost text-sm">Login</Link>
          <Link href="/signup" className="btn-primary text-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent-light text-accent px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <Zap size={14} />
          AI-powered ATS scoring in under 10 seconds
        </div>
        
        <h1 className="font-display text-6xl md:text-7xl leading-tight mb-6">
          Your resume is
          <br />
          <span className="text-gradient italic">failing ATS bots.</span>
          <br />
          Fix it now.
        </h1>
        
        <p className="text-ink-muted text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          75% of resumes never reach a human. Paste your resume, paste the job description — 
          get an instant ATS score, missing keywords, and exact fixes in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup" className="btn-primary text-base px-8 py-4">
            Check My Resume Free
            <ArrowRight size={18} />
          </Link>
          <Link href="/pricing" className="btn-secondary text-base px-8 py-4">
            View Pricing
          </Link>
        </div>
        
        <p className="text-ink-muted/60 text-sm mt-4">No credit card • 3 free checks every month</p>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-6">
          {[
            { num: '75%', label: 'resumes rejected by ATS before human review' },
            { num: '10s', label: 'average time to get your ATS score' },
            { num: '3x', label: 'higher callback rate with optimized resumes' },
          ].map((s, i) => (
            <div key={i} className="card text-center">
              <div className="font-display text-4xl text-accent mb-2">{s.num}</div>
              <div className="text-ink-muted text-sm leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="font-display text-4xl text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FileText, step: '01', title: 'Paste your resume', desc: 'Copy-paste your resume text. No PDF upload needed — plain text works best.' },
            { icon: Target, step: '02', title: 'Add job description', desc: 'Paste the job description you\'re applying for. Our AI matches against it.' },
            { icon: TrendingUp, step: '03', title: 'Get your score + fixes', desc: 'Instant ATS score, missing keywords, section feedback, and rewrite suggestions.' },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="card relative overflow-hidden">
              <div className="absolute top-4 right-4 font-display text-5xl text-paper-warm select-none">{step}</div>
              <div className="w-10 h-10 bg-accent-light rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-accent" />
              </div>
              <h3 className="font-display text-xl mb-2">{title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-ink text-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-4xl text-center mb-4">Everything you need to get past ATS</h2>
          <p className="text-white/50 text-center mb-12">Free plan includes the basics. Pro unlocks everything.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'ATS compatibility score out of 100',
              'Keyword gap analysis vs job description',
              'Section-by-section feedback (Summary, Skills, Experience)',
              'Suggested rewrite for weak sections',
              'Hard vs soft skills breakdown',
              'Format and structure warnings',
              'LinkedIn profile optimization tips',
              'Download analysis as PDF report',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-accent flex-shrink-0" />
                <span className="text-sm text-white/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-5xl mb-4">Ready to fix your resume?</h2>
        <p className="text-ink-muted mb-8">Start free. No credit card required.</p>
        <Link href="/signup" className="btn-primary text-base px-10 py-4">
          Check My Resume — It's Free
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-paper-warm py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-muted/60">
          <span>© 2024 ResumeATS. Made for students & job seekers.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-ink transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-ink transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
