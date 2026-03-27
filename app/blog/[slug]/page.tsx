// T055: MDX article renderer
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote/rsc'
import Link from 'next/link'

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

function getPost(slug: string) {
  const filePath = path.join(process.cwd(), 'content/blog', `${slug}.mdx`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  return { data, content }
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}
  return {
    title: `${post.data.title} — Career Navigator`,
    description: post.data.description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`,
    },
    openGraph: {
      title: post.data.title,
      description: post.data.description,
      images: [`${process.env.NEXT_PUBLIC_APP_URL}/api/og?title=${encodeURIComponent(post.data.title)}&description=${encodeURIComponent(post.data.description ?? '')}`],
    },
  }
}

export async function generateStaticParams() {
  const contentDir = path.join(process.cwd(), 'content/blog')
  if (!fs.existsSync(contentDir)) return []
  return fs.readdirSync(contentDir)
    .filter(f => f.endsWith('.mdx'))
    .map(f => ({ slug: f.replace('.mdx', '') }))
}

const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold text-white mt-8 mb-4" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold text-white mt-6 mb-3" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-medium text-white mt-5 mb-2" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-white/70 leading-relaxed mb-4" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-white/70 mb-4 space-y-1" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-white/70 mb-4 space-y-1" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-white/70" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-white font-semibold" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-blue-400 hover:underline" {...props} />
  ),
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen pt-24 px-6 pb-16 md:px-10 bg-[#171717]">
      <div className="max-w-3xl mx-auto">

        <Link href="/blog" className="text-xs text-white/40 hover:text-white/60 transition-colors mb-6 inline-block">
          ← Back to Blog
        </Link>

        <p className="text-xs text-white/40 mb-2">
          {post.data.date}{post.data.readTime ? ` · ${post.data.readTime}` : ''}
        </p>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent mb-2">
          {post.data.title}
        </h1>
        {post.data.description && (
          <p className="text-white/50 text-lg mb-8">{post.data.description}</p>
        )}

        <hr className="border-white/10 mb-8" />

        <article className="prose-custom">
          <MDXRemote source={post.content} components={mdxComponents} />
        </article>

      </div>
    </div>
  )
}
