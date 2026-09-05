// lib/agora.ts

export type AgoraJoinConfig = {
  appId: string
  channelName: string
  token: string
  uid: number
}

export type AgoraConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'failed'

export type AgoraSession = {
  appId: string
  channelName: string
  token: string
  uid: number
}


/* =========================================================
   Browser support
   ========================================================= */

export function isAgoraSupported(): boolean {
  return typeof window !== 'undefined'
}


/* =========================================================
   Load Agora SDK
   ========================================================= */

export async function loadAgora() {
  if (!isAgoraSupported()) {
    throw new Error(
      'Agora can only be initialized in the browser.',
    )
  }

  const AgoraRTC =
    await import('agora-rtc-sdk-ng')

  return AgoraRTC.default
}


/* =========================================================
   Create client
   ========================================================= */

export async function createAgoraClient() {
  const AgoraRTC =
    await loadAgora()

  return AgoraRTC.createClient({
    mode: 'rtc',
    codec: 'vp8',
  })
}


/* =========================================================
   Agora client type
   ========================================================= */

export type AgoraClient =
  Awaited<
    ReturnType<
      typeof createAgoraClient
    >
  >


/* =========================================================
   Connection manager
   =========================================================

   IMPORTANT:

   React Strict Mode can execute an effect twice.

   We therefore keep:
   - one client
   - one join promise
   - reference count

   A cleanup is NOT allowed to leave the client if
   another component/effect is still using it.
   ========================================================= */

let activeClient:
  AgoraClient | null = null

let activeJoinKey:
  string | null = null

let activeJoinPromise:
  Promise<AgoraClient> | null = null

let connectionUsers = 0


function makeJoinKey(
  config: AgoraJoinConfig,
) {
  return [
    config.appId,
    config.channelName,
    String(config.uid),
  ].join('|')
}


/* =========================================================
   Join Agora channel
   ========================================================= */

export async function joinAgoraChannel(
  config: AgoraJoinConfig,
): Promise<AgoraClient> {

  const joinKey =
    makeJoinKey(config)


  /* ---------------------------------------------
     Existing connected client
     --------------------------------------------- */

  if (
    activeClient &&
    activeJoinKey === joinKey
  ) {

    connectionUsers += 1

    console.log(
      '[Agora] Reusing existing client.',
      {
        users: connectionUsers,
        state: activeClient.connectionState,
      },
    )

    return activeClient
  }


  /* ---------------------------------------------
     Existing join in progress
     --------------------------------------------- */

  if (
    activeJoinPromise &&
    activeJoinKey === joinKey
  ) {

    connectionUsers += 1

    console.log(
      '[Agora] Reusing existing join.',
      {
        users: connectionUsers,
      },
    )

    return activeJoinPromise
  }


  /* ---------------------------------------------
     Different connection exists
     --------------------------------------------- */

  if (
    activeClient &&
    activeJoinKey !== joinKey
  ) {

    const oldClient =
      activeClient

    activeClient =
      null

    activeJoinKey =
      null

    connectionUsers =
      0

    try {
      await oldClient.leave()
    } catch {
      // Ignore cleanup errors.
    }
  }


  /* ---------------------------------------------
     Start new connection
     --------------------------------------------- */

  activeJoinKey =
    joinKey

  connectionUsers =
    1


  const joinPromise =
    (async () => {

      const client =
        await createAgoraClient()


      try {

        console.log(
          '[Agora] Joining channel:',
          {
            channel:
              config.channelName,

            uid:
              config.uid,

            users:
              connectionUsers,
          },
        )


        await client.join(
          config.appId,
          config.channelName,
          config.token || null,
          config.uid,
        )


        /*
         * Agora must report CONNECTED before
         * we give the client to the page.
         */

        if (
          client.connectionState !==
          'CONNECTED'
        ) {

          throw new Error(
            `Agora join completed but connection state is ${client.connectionState}`,
          )

        }


        console.log(
          '[Agora] Successfully joined:',
          {
            channel:
              config.channelName,

            uid:
              config.uid,
          },
        )


        activeClient =
          client


        /*
         * If every consumer disappeared while
         * the join was happening, immediately
         * release the client.
         */

        if (
          connectionUsers <= 0
        ) {

          try {
            await client.leave()
          } catch {
            // Ignore.
          }

          activeClient =
            null

          activeJoinKey =
            null

          connectionUsers =
            0

          throw new Error(
            'Agora connection was cancelled before becoming active.',
          )
        }


        return client

      } catch (error) {

        console.error(
          '[Agora] Join failed:',
          error,
        )


        try {
          await client.leave()
        } catch {
          // Ignore.
        }


        if (
          activeJoinKey ===
          joinKey
        ) {

          activeClient =
            null

          activeJoinKey =
            null

          connectionUsers =
            0
        }


        throw error

      }

    })()


  activeJoinPromise =
    joinPromise


  try {

    return await joinPromise

  } finally {

    if (
      activeJoinPromise ===
      joinPromise
    ) {

      activeJoinPromise =
        null
    }

  }
}


/* =========================================================
   Leave Agora channel
   =========================================================

   This is now a RELEASE operation.

   It does NOT immediately call client.leave().

   The actual Agora client is left only when the
   reference count reaches zero.
   ========================================================= */

export async function leaveAgoraChannel(
  client:
    AgoraClient | null,
) {

  if (!client) {
    return
  }


  /*
   * If this is the active shared client,
   * release one owner.
   */

  if (
    activeClient === client
  ) {

    connectionUsers =
      Math.max(
        0,
        connectionUsers - 1,
      )


    console.log(
      '[Agora] Released client.',
      {
        remainingUsers:
          connectionUsers,
      },
    )


    /*
     * Another effect/component is still using it.
     */

    if (
      connectionUsers > 0
    ) {
      return
    }


    /*
     * No users remain.
     * Actually leave Agora.
     */

    activeClient =
      null

    activeJoinKey =
      null

    try {

      if (
        client.connectionState ===
        'CONNECTED'
      ) {

        await client.leave()

      }

    } catch (error) {

      console.error(
        '[Agora] Failed to leave channel:',
        error,
      )

    }

    return
  }


  /*
   * Stale client that is no longer the
   * active shared connection.
   */

  try {

    if (
      client.connectionState ===
      'CONNECTED'
    ) {

      await client.leave()

    }

  } catch (error) {

    console.error(
      '[Agora] Failed to leave stale client:',
      error,
    )

  }
}


/* =========================================================
   Create microphone
   ========================================================= */

export async function createMicrophoneTrack() {

  const AgoraRTC =
    await loadAgora()

  return AgoraRTC.createMicrophoneAudioTrack()
}


/* =========================================================
   Create camera
   ========================================================= */

export async function createCameraTrack() {

  const AgoraRTC =
    await loadAgora()

  return AgoraRTC.createCameraVideoTrack()
}


/* =========================================================
   Publish tracks
   ========================================================= */

export async function publishAgoraTracks(
  client:
    AgoraClient,

  tracks:
    Array<unknown>,
) {

  if (
    client.connectionState !==
    'CONNECTED'
  ) {

    throw new Error(
      `Cannot publish Agora tracks because client is ${client.connectionState}.`,
    )

  }


  await client.publish(
    tracks as Parameters<
      typeof client.publish
    >[0],
  )
}


/* =========================================================
   Unpublish track
   ========================================================= */

export async function unpublishAgoraTrack(
  client:
    AgoraClient,

  track: {
    stop?: () => void
    close?: () => void
  } | null,
) {

  if (!track) {
    return
  }


  try {

    if (
      client.connectionState ===
      'CONNECTED'
    ) {

      await client.unpublish(
        track as Parameters<
          typeof client.unpublish
        >[0],
      )

    }

  } catch (error) {

    console.error(
      'Failed to unpublish Agora track:',
      error,
    )

  }


  track.stop?.()
  track.close?.()
}


/* =========================================================
   Microphone enabled
   ========================================================= */

export async function setMicrophoneEnabled(
  track: {
    setEnabled:
      (
        enabled: boolean,
      ) => Promise<void>
  } | null,

  enabled: boolean,
) {

  if (!track) {
    return
  }


  await track.setEnabled(
    enabled,
  )
}


/* =========================================================
   Camera enabled
   ========================================================= */

export async function setCameraEnabled(
  track: {
    setEnabled:
      (
        enabled: boolean,
      ) => Promise<void>
  } | null,

  enabled: boolean,
) {

  if (!track) {
    return
  }


  await track.setEnabled(
    enabled,
  )
}


/* =========================================================
   Subscribe remote user
   ========================================================= */

export async function subscribeToRemoteUser(
  client:
    AgoraClient,

  user: {
    uid:
      string | number

    hasAudio:
      boolean

    hasVideo:
      boolean
  },
) {

  if (
    client.connectionState !==
    'CONNECTED'
  ) {

    return
  }


  if (user.hasAudio) {

    await client.subscribe(
      user as Parameters<
        typeof client.subscribe
      >[0],

      'audio',
    )
  }


  if (user.hasVideo) {

    await client.subscribe(
      user as Parameters<
        typeof client.subscribe
      >[0],

      'video',
    )
  }
}


/* =========================================================
   Play remote audio
   ========================================================= */

export function playRemoteAudio(
  user: {
    audioTrack?: {
      play: () => void
    }
  },
) {

  user.audioTrack?.play()
}


/* =========================================================
   Play remote video
   ========================================================= */

export function playRemoteVideo(
  user: {
    videoTrack?: {
      play:
        (
          element:
            HTMLElement | string,
        ) => void
    }
  },

  element:
    HTMLElement | string,
) {

  user.videoTrack?.play(
    element,
  )
}


/* =========================================================
   Close one track
   ========================================================= */

export function closeAgoraTrack(
  track: {
    stop?: () => void
    close?: () => void
  } | null,
) {

  if (!track) {
    return
  }


  track.stop?.()
  track.close?.()
}


/* =========================================================
   Close multiple tracks
   ========================================================= */

export function closeAgoraTracks(
  tracks:
    Array<{
      stop?: () => void
      close?: () => void
    }>,
) {

  tracks.forEach(
    (track) => {
      track.stop?.()
      track.close?.()
    },
  )
}