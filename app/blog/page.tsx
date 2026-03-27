// T055: Blog landing page — lists all MDX articles
import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export const metadata = {
  title: 'Blog — Career Navigator',
  description: 'Career guidance articles, tips for students in Pakistan, and insights on navigating the job market.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog`,
  },
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/api/og?title=Career+Navigator+Blog&description=Career+guidance+for+students+in+Pakistan`],
  },
}

interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  readTime?: string
}

function getPosts(): PostMeta[] {
  const contentDir = path.join(process.cwd(), 'content/blog')
  if (!fs.existsSync(contentDir)) return []

  return fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.mdx'))
    .map(file => {
      const slug = file.replace('.mdx', '')
      const raw = fs.readFileSync(path.join(contentDir, file), 'utf8')
      const { data } = matter(raw)
      return {
        slug,
        title: data.title ?? slug,
        description: data.description ?? '',
        date: data.date ?? '',
        readTime: data.readTime
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function BlogPage() {
  const posts = getPosts()

  return (
    <div className="min-h-screen pt-24 px-6 pb-10 md:px-10 bg-[#171717]">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-white/50 mt-1">Career guidance for students in Pakistan</p>
        </div>

        {posts.length === 0 ? (
          <p className="text-white/40 text-sm">No articles yet. Check back soon.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block">
                <div className="rounded-2xl p-6 bg-[#222222] hover:bg-[#2a2a2a] transition-colors border border-white/5 hover:border-white/10">
                  <p className="text-xs text-white/40 mb-2">{post.date}{post.readTime ? ` · ${post.readTime}` : ''}</p>
                  <h2 className="text-lg font-semibold text-white mb-1">{post.title}</h2>
                  <p className="text-sm text-white/50">{post.description}</p>
                  <span className="text-xs text-blue-400 mt-3 inline-block">Read article →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
