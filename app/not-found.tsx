import Link from 'next/link'

export const metadata = {
  title: '404 — Page Not Found | Career Navigator',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#171717] flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        {/* Large 404 */}
        <p className="text-[120px] font-black leading-none bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent select-none">
          404
        </p>

        <h1 className="text-2xl font-bold text-white mt-2 mb-3">
          Page not found
        </h1>
        <p className="text-white/50 text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          If you followed a shared report link, it may have been revoked.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/"
            className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] hover:opacity-90 transition-opacity"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white bg-[#222222] border border-white/10 hover:border-white/20 transition-all"
          >
            Dashboard
          </Link>
        </div>

      </div>
    </div>
  )
}
