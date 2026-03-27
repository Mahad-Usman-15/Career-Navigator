// T053: Dynamic OG image using next/og
// Renders branded 1200×630 card with gradient background
// Usage: /api/og?title=Career+Navigator&description=AI-powered+career+guidance
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? 'Career Navigator'
  const description = searchParams.get('description') ?? 'AI-powered career guidance for students in Pakistan'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '60px',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1e1e1e 50%, #0f172a 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gradient accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(to right, #1e3a8a, #3b82f6, #60a5fa)',
          }}
        />

        {/* Brand tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '20px',
            padding: '6px 16px',
          }}
        >
          <span style={{ color: '#60a5fa', fontSize: '14px', fontWeight: 600 }}>
            Career Navigator
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.1,
            marginBottom: '20px',
            maxWidth: '900px',
          }}
        >
          {title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>

        {/* Bottom gradient line */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontSize: '16px',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          careernavigator.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
