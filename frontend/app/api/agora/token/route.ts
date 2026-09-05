/**
 * app/api/agora/token/route.ts
 *
 * Next.js App Router API route that proxies token requests to your FastAPI backend.
 * The Agora App ID and App Certificate live server-side; the browser never sees them.
 *
 * Required env vars (server-side, no NEXT_PUBLIC_ prefix needed here):
 *   NEXT_PUBLIC_API_BASE=http://localhost:8000   (reuse the same var)
 *
 * FastAPI endpoint expected:
 *   POST /api/agora/token
 *   Body: { channel: string, uid: number }
 *   Response: { token: string }
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const backendBase = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000'

    const upstream = await fetch(`${backendBase}/api/agora/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!upstream.ok) {
      const msg = await upstream.text()
      return NextResponse.json({ error: msg }, { status: upstream.status })
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Token generation failed' },
      { status: 500 }
    )
  }
}
