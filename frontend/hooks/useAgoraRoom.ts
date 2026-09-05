/**
 * hooks/useAgoraRoom.ts
 * React hook that manages an Agora session for a single interview room.
 *
 * Usage:
 *   const { localVideoRef, joined, muted, cameraOff, ... } = useAgoraRoom({ channel })
 */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AgoraRoom } from '@/lib/agora'

interface UseAgoraRoomOptions {
  channel: string          // usually the interviewId
  autoJoin?: boolean       // default true
  backendBase?: string     // default '/api'
}

export function useAgoraRoom({ channel, autoJoin = true, backendBase = '/api' }: UseAgoraRoomOptions) {
  const roomRef = useRef<AgoraRoom | null>(null)
  const localVideoRef = useRef<HTMLDivElement>(null)

  const [joined, setJoined] = useState(false)
  const [muted, setMuted] = useState(false)
  const [cameraOff, setCameraOff] = useState(false)
  const [sharingScreen, setSharingScreen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Join ──────────────────────────────────────────────────────────────────
  const join = useCallback(async () => {
    try {
      // Lazy-import so Next.js SSR doesn't explode
      const { createAgoraRoom } = await import('@/lib/agora')
      const room = await createAgoraRoom({ channel, backendBase })
      await room.join()
      roomRef.current = room

      // Play local video into the ref'd div
      if (localVideoRef.current && room.localVideo) {
        room.localVideo.play(localVideoRef.current)
      }

      // Subscribe to remote users
      room.client.on('user-published', async (user, mediaType) => {
        await room.client.subscribe(user, mediaType)
        // Remote audio plays automatically; video needs a container if you want it
        if (mediaType === 'audio') user.audioTrack?.play()
      })

      setJoined(true)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join Agora room')
    }
  }, [channel, backendBase])

  // ── Leave ─────────────────────────────────────────────────────────────────
  const leave = useCallback(async () => {
    await roomRef.current?.leave()
    roomRef.current = null
    setJoined(false)
    setMuted(false)
    setCameraOff(false)
    setSharingScreen(false)
  }, [])

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const toggleMic = useCallback(async () => {
    const next = !muted
    await roomRef.current?.muteAudio(next)
    setMuted(next)
  }, [muted])

  const toggleCamera = useCallback(async () => {
    const next = !cameraOff
    await roomRef.current?.muteVideo(next)
    setCameraOff(next)
  }, [cameraOff])

  const toggleScreenShare = useCallback(async () => {
    if (!roomRef.current) return
    if (sharingScreen) {
      await roomRef.current.stopScreenShare()
      setSharingScreen(false)
    } else {
      const track = await roomRef.current.startScreenShare()
      if (track) setSharingScreen(true)
    }
  }, [sharingScreen])

  // ── Auto-join / cleanup ───────────────────────────────────────────────────
  useEffect(() => {
    if (autoJoin && channel) join()
    return () => { leave() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel])

  return {
    localVideoRef,
    joined,
    muted,
    cameraOff,
    sharingScreen,
    error,
    join,
    leave,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  }
}
