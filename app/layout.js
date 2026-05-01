import './globals.css'

export const metadata = {
  title: 'ResumeATS — Beat the Bots, Land the Job',
  description: 'AI-powered ATS resume checker. See your score, find missing keywords, get actionable feedback in seconds.',
  keywords: 'ATS checker, resume score, resume optimizer, job application, keywords',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
