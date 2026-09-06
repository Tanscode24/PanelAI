/**
 * app/api/agora/token/route.ts
 *
 * Proxies Agora token requests to the FastAPI backend.
 *
 * Local:
 *   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
 *
 * Vercel:
 *   NEXT_PUBLIC_API_URL can be omitted because
 *   the backend is exposed through the Vercel service routing.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const backendBase = (
      process.env.NEXT_PUBLIC_API_URL || ''
    ).replace(/\/$/, '')

    const backendUrl = `${backendBase}/api/agora/token`

    const upstream = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!upstream.ok) {
      const msg = await upstream.text()

      return NextResponse.json(
        { error: msg },
        { status: upstream.status },
      )
    }

    const data = await upstream.json()

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : 'Token generation failed',
      },
      { status: 500 },
    )
  }
}