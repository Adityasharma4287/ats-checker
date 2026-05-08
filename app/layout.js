import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export const metadata = {
  title: 'ResumeATS — Beat the Bots, Land the Job',
  description: 'AI-powered ATS resume checker.',
  keywords: 'ATS checker, resume score, resume optimizer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
       <link rel="icon" href="/favicon.png" type="image/png" />
<link rel="shortcut icon" href="/favicon.png" />
<link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-paper text-ink antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
