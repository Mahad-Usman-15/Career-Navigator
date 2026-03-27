'use client'

import { useState } from 'react'
import { toast } from 'sonner'

// T036: Download Report via window.print() (ADR-005)
// T037: Share Report via POST /api/report/share
export default function DashboardActions() {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleDownload = () => {
    window.print()
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const res = await fetch('/api/report/share', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not generate share link.')
        return
        
      }
      setShareUrl(data.shareUrl)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  const handleCopy = async () => {
    if (!shareUrl) return
    setCopying(true)
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Could not copy link.')
    } finally {
      setCopying(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden">
      <button
        onClick={handleDownload}
        className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] hover:opacity-90 transition-opacity"
      >
        Download Report (PDF)
      </button>

      {!shareUrl ? (
        <button
          onClick={handleShare}
          disabled={sharing}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white bg-[#2a2a2a] border border-white/10 hover:border-white/20 transition-all disabled:opacity-50"
        >
          {sharing ? 'Generating link…' : 'Share Report'}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={shareUrl}
            className="px-3 py-1.5 rounded-lg text-xs text-white/70 bg-[#2a2a2a] border border-white/10 w-64 truncate"
          />
          <button
            onClick={handleCopy}
            disabled={copying}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#3b82f6] hover:bg-[#2563eb] transition-colors disabled:opacity-50"
          >
            {copying ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
