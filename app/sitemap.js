export default function sitemap() {
  return [
    {
      url: 'https://ats-checker-lac.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://ats-checker-lac.vercel.app/dashboard',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
}
