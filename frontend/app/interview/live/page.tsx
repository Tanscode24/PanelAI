'use client'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { useRouter } from 'next/navigation'

import {
  useInterview,
} from '@/context/InterviewContext'

import {
  AGENT_BY_ID,
} from '@/lib/agents'

import type {
  AgentId,
} from '@/types/agent'

import {
  joinAgoraChannel,
  leaveAgoraChannel,
  createMicrophoneTrack,
  createCameraTrack,
  closeAgoraTracks,
} from '@/lib/agora'


/* =========================================================
   Types
   ========================================================= */

type AgoraClient =
  Awaited<
    ReturnType<
      typeof joinAgoraChannel
    >
  >


type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string

  onresult:
    | ((event: any) => void)
    | null

  onerror:
    | ((event: any) => void)
    | null

  onend:
    | (() => void)
    | null

  start: () => void
  stop: () => void
}


type SpeechRecognitionConstructor =
  new () => SpeechRecognitionInstance


/* =========================================================
   Agent helpers
   ========================================================= */

function getSafeAgentId(
  value: unknown,
  fallback: AgentId,
): AgentId {

  if (
    value === 'technical' ||
    value === 'behavioural' ||
    value === 'product' ||
    value === 'hiring'
  ) {
    return value
  }


  if (
    value === 'behavioral'
  ) {
    return 'behavioural'
  }


  if (
    value === 'system_design'
  ) {
    return 'product'
  }


  if (
    value === 'coding'
  ) {
    return 'hiring'
  }


  return fallback
}


/* =========================================================
   Live page
   ========================================================= */

export default function LivePage() {

  const router =
    useRouter()


  const {
    currentAgent,
    currentQuestion,
    transcript,
    elapsedTime,
    isInterviewActive,
    endInterview,
    advanceAgent,
    addTranscriptMessage,
    isMuted,
    cameraOn,
    screenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    interviewSession,
    isLoading,
  } = useInterview()


  const agent =
    AGENT_BY_ID[currentAgent]


  const Icon =
    agent?.icon


  /* =======================================================
     Agora refs
     ======================================================= */

  const clientRef =
    useRef<AgoraClient | null>(
      null,
    )


  const microphoneTrackRef =
    useRef<
      Awaited<
        ReturnType<
          typeof createMicrophoneTrack
        >
      > | null
    >(null)


  const cameraTrackRef =
    useRef<
      Awaited<
        ReturnType<
          typeof createCameraTrack
        >
      > | null
    >(null)


  /*
   * Each connection effect gets its own generation.
   *
   * This prevents an old async connection from
   * modifying the state of a newer connection.
   */

  const connectionGenerationRef =
    useRef(0)


  /* =======================================================
     Speech recognition refs
     ======================================================= */

  const recognitionRef =
    useRef<
      SpeechRecognitionInstance | null
    >(null)


  const lastFinalTranscriptRef =
    useRef('')


  /* =======================================================
     State
     ======================================================= */

  const [
    agoraConnected,
    setAgoraConnected,
  ] = useState(false)


  const [
    agoraError,
    setAgoraError,
  ] = useState<string | null>(null)


  const [
    isJoining,
    setIsJoining,
  ] = useState(false)


  const [
    isTranscribing,
    setIsTranscribing,
  ] = useState(false)


  /* =========================================================
     AGORA CONNECTION
     ========================================================= */

  useEffect(() => {

    if (
      !isInterviewActive ||
      !interviewSession
    ) {
      return
    }


    /*
     * Every execution receives a unique generation.
     */

    const generation =
      ++connectionGenerationRef.current


    let cancelled =
      false


    let localClient:
      AgoraClient | null = null


    let localMicrophone:
      Awaited<
        ReturnType<
          typeof createMicrophoneTrack
        >
      > | null = null


    let localCamera:
      Awaited<
        ReturnType<
          typeof createCameraTrack
        >
      > | null = null


    const isCurrent =
      () =>
        !cancelled &&
        generation ===
          connectionGenerationRef.current


    const connect =
      async () => {

        try {

          setIsJoining(
            true,
          )

          setAgoraError(
            null,
          )

          setAgoraConnected(
            false,
          )


          const session =
            interviewSession as any


          /* ---------------------------------------------
             Credentials
             --------------------------------------------- */

          const appId =
            session.app_id ||
            process.env
              .NEXT_PUBLIC_AGORA_APP_ID


          const channelName =
            session.channel_name


          const token =
            session.candidate_token


          const uid =
            Number(
              session.candidate_uid,
            )


          /* ---------------------------------------------
             Validate
             --------------------------------------------- */

          if (!appId) {

            throw new Error(
              'Agora App ID is missing.',
            )

          }


          if (!channelName) {

            throw new Error(
              'Agora channel name is missing.',
            )

          }


          if (!token) {

            throw new Error(
              'Agora candidate token is missing.',
            )

          }


          if (
            !Number.isInteger(uid) ||
            uid <= 0
          ) {

            throw new Error(
              'Agora candidate UID is missing or invalid.',
            )

          }


          console.log(
            '[PanelAI] Agora connection:',
            {
              channelName,
              uid,
              generation,
            },
          )


          /* ---------------------------------------------
             JOIN
             --------------------------------------------- */

          const client =
            await joinAgoraChannel({
              appId,
              channelName,
              token,
              uid,
            })


          localClient =
            client


          /*
           * The effect may have been cleaned up
           * while join was in progress.
           */

          if (!isCurrent()) {

            console.warn(
              '[PanelAI] Stale Agora connection after join.',
            )

            await leaveAgoraChannel(
              client,
            )

            return
          }


          /*
           * Absolutely verify Agora state.
           */

          if (
            client.connectionState !==
            'CONNECTED'
          ) {

            throw new Error(
              `Agora client is not connected after join: ${client.connectionState}`,
            )

          }


          clientRef.current =
            client


          console.log(
            '[PanelAI] Agora JOINED:',
            {
              state:
                client.connectionState,

              channel:
                channelName,

              uid,
            },
          )


          /* ---------------------------------------------
             Remote AI agent
             --------------------------------------------- */

          client.on(
            'user-published',
            async (
              user,
              mediaType,
            ) => {

              if (
                !isCurrent()
              ) {
                return
              }


              try {

                if (
                  client.connectionState !==
                  'CONNECTED'
                ) {
                  return
                }


                await client.subscribe(
                  user,
                  mediaType,
                )


                if (
                  mediaType ===
                  'audio'
                ) {

                  user.audioTrack?.play()

                  console.log(
                    '[PanelAI] AI audio subscribed.',
                  )

                }

              } catch (
                error
              ) {

                console.error(
                  '[PanelAI] Remote subscribe failed:',
                  error,
                )

              }

            },
          )


          client.on(
            'user-unpublished',
            (
              user,
              mediaType,
            ) => {

              console.log(
                '[PanelAI] Remote user unpublished:',
                user.uid,
                mediaType,
              )

            },
          )


          client.on(
            'user-left',
            (user) => {

              console.log(
                '[PanelAI] Remote user left:',
                user.uid,
              )

            },
          )


          /* ---------------------------------------------
             Check before microphone
             --------------------------------------------- */

          if (
            !isCurrent() ||
            client.connectionState !==
              'CONNECTED'
          ) {

            return
          }


          /* ---------------------------------------------
             MICROPHONE
             --------------------------------------------- */

          localMicrophone =
            await createMicrophoneTrack()


          if (
            !isCurrent() ||
            client.connectionState !==
              'CONNECTED'
          ) {

            closeAgoraTracks([
              localMicrophone,
            ])

            localMicrophone =
              null

            return
          }


          microphoneTrackRef.current =
            localMicrophone


          /* ---------------------------------------------
             CAMERA
             --------------------------------------------- */

          localCamera =
            await createCameraTrack()


          if (
            !isCurrent() ||
            client.connectionState !==
              'CONNECTED'
          ) {

            closeAgoraTracks([
              localMicrophone,
              localCamera,
            ])

            localMicrophone =
              null

            localCamera =
              null

            return
          }


          cameraTrackRef.current =
            localCamera


          /* ---------------------------------------------
             Current controls
             --------------------------------------------- */

          await localMicrophone.setEnabled(
            !isMuted,
          )


          await localCamera.setEnabled(
            cameraOn,
          )


          /* ---------------------------------------------
             FINAL CHECK BEFORE PUBLISH
             --------------------------------------------- */

          if (
            !isCurrent()
          ) {

            console.warn(
              '[PanelAI] Connection became stale before publish.',
            )

            return
          }


          if (
            client.connectionState !==
            'CONNECTED'
          ) {

            throw new Error(
              `Cannot publish because Agora connection state is ${client.connectionState}.`,
            )

          }


          if (
            clientRef.current !==
            client
          ) {

            throw new Error(
              'Agora client changed before publishing.',
            )

          }


          console.log(
            '[PanelAI] Publishing candidate tracks:',
            {
              state:
                client.connectionState,

              uid,

              generation,
            },
          )


          /* ---------------------------------------------
             PUBLISH
             --------------------------------------------- */

          await client.publish([
            localMicrophone,
            localCamera,
          ])


          /* ---------------------------------------------
             Verify publish
             --------------------------------------------- */

          if (
            !isCurrent()
          ) {
            return
          }


          console.log(
            '[PanelAI] Candidate tracks published successfully.',
          )


          setAgoraConnected(
            true,
          )

          setIsJoining(
            false,
          )


        } catch (
          error
        ) {

          console.error(
            '[PanelAI] Agora connection failed:',
            error,
          )


          if (
            isCurrent()
          ) {

            setAgoraConnected(
              false,
            )

            setIsJoining(
              false,
            )

            setAgoraError(
              error instanceof Error
                ? error.message
                : 'Unable to connect to the interview.',
            )

          }

        }

      }


    void connect()


    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {

      cancelled =
        true


      /*
       * Invalidate this connection generation.
       */

      if (
        connectionGenerationRef.current ===
        generation
      ) {

        connectionGenerationRef.current +=
          1

      }


      const cleanup =
        async () => {

          console.log(
            '[PanelAI] Cleaning up Agora generation:',
            generation,
          )


          /* ---------------------------------------------
             Close local tracks
             --------------------------------------------- */

          closeAgoraTracks(
            [
              localMicrophone,
              localCamera,
            ].filter(
              Boolean,
            ) as any,
          )


          if (
            microphoneTrackRef.current ===
            localMicrophone
          ) {

            microphoneTrackRef.current =
              null

          }


          if (
            cameraTrackRef.current ===
            localCamera
          ) {

            cameraTrackRef.current =
              null

          }


          /* ---------------------------------------------
             Release Agora client
             --------------------------------------------- */

          if (
            localClient
          ) {

            await leaveAgoraChannel(
              localClient,
            )

          }


          if (
            clientRef.current ===
            localClient
          ) {

            clientRef.current =
              null

          }


          /*
           * Only the current generation may
           * modify connection UI.
           */

          if (
            generation ===
            connectionGenerationRef.current - 1
          ) {

            setAgoraConnected(
              false,
            )

          }


          console.log(
            '[PanelAI] Agora cleanup complete:',
            generation,
          )

        }


      void cleanup()

    }

  }, [
    isInterviewActive,
    interviewSession,
  ])


  /* =========================================================
     MICROPHONE SYNC
     ========================================================= */

  useEffect(() => {

    const track =
      microphoneTrackRef.current


    if (!track) {
      return
    }


    void track
      .setEnabled(
        !isMuted,
      )
      .catch((error) => {

        console.error(
          'Failed to change microphone state:',
          error,
        )

      })

  }, [
    isMuted,
  ])


  /* =========================================================
     CAMERA SYNC
     ========================================================= */

  useEffect(() => {

    const track =
      cameraTrackRef.current


    if (!track) {
      return
    }


    void track
      .setEnabled(
        cameraOn,
      )
      .catch((error) => {

        console.error(
          'Failed to change camera state:',
          error,
        )

      })

  }, [
    cameraOn,
  ])


  /* =========================================================
     SPEECH RECOGNITION
     ========================================================= */

  useEffect(() => {

    if (
      !isInterviewActive ||
      isMuted
    ) {
      return
    }


    if (
      typeof window ===
      'undefined'
    ) {
      return
    }


    const SpeechRecognition =
      (
        window as any
      ).SpeechRecognition ||
      (
        window as any
      ).webkitSpeechRecognition


    if (!SpeechRecognition) {

      console.warn(
        'Browser speech recognition is not supported.',
      )

      setIsTranscribing(
        false,
      )

      return
    }


    const recognition =
      new (
        SpeechRecognition as SpeechRecognitionConstructor
      )()


    recognition.continuous =
      true

    recognition.interimResults =
      true

    recognition.lang =
      'en-US'


    recognition.onresult =
      (event: any) => {

        let finalText =
          ''


        for (
          let i =
            event.resultIndex;

          i <
          event.results.length;

          i++
        ) {

          const result =
            event.results[i]


          const text =
            result?.[0]?.transcript ||
            ''


          if (
            result?.isFinal
          ) {

            finalText +=
              text

          }

        }


        const cleaned =
          finalText.trim()


        if (!cleaned) {
          return
        }


        if (
          cleaned ===
          lastFinalTranscriptRef.current
        ) {
          return
        }


        lastFinalTranscriptRef.current =
          cleaned


        addTranscriptMessage({

          id:
            `candidate-${Date.now()}`,

          speaker:
            'user',

          agent:
            currentAgent,

          message:
            cleaned,

        })

      }


    recognition.onerror =
      (event: any) => {

        if (
          event?.error ===
          'no-speech'
        ) {

          console.log(
            '[Speech] No speech detected.',
          )

        } else {

          console.warn(
            'Speech recognition error:',
            event?.error,
          )

        }


        setIsTranscribing(
          false,
        )

      }


    recognition.onend =
      () => {

        setIsTranscribing(
          false,
        )

      }


    recognitionRef.current =
      recognition


    try {

      recognition.start()

      setIsTranscribing(
        true,
      )

    } catch (
      error
    ) {

      console.warn(
        'Speech recognition could not start:',
        error,
      )

      setIsTranscribing(
        false,
      )

    }


    return () => {

      try {
        recognition.stop()
      } catch {
        // Already stopped.
      }


      recognitionRef.current =
        null


      setIsTranscribing(
        false,
      )

    }

  }, [
    isInterviewActive,
    isMuted,
    currentAgent,
    addTranscriptMessage,
  ])


  /* =========================================================
     FINISH
     ========================================================= */

  const finish =
    async () => {

      try {

        if (
          recognitionRef.current
        ) {

          try {
            recognitionRef.current.stop()
          } catch {
            // Ignore.
          }

        }


        if (
          clientRef.current
        ) {

          const client =
            clientRef.current

          clientRef.current =
            null

          await leaveAgoraChannel(
            client,
          )

        }


        closeAgoraTracks(
          [
            microphoneTrackRef.current,
            cameraTrackRef.current,
          ].filter(
            Boolean,
          ) as any,
        )


        microphoneTrackRef.current =
          null

        cameraTrackRef.current =
          null


        setAgoraConnected(
          false,
        )


        await endInterview()


        router.push(
          '/interview/result',
        )

      } catch (
        error
      ) {

        console.error(
          'Failed to finish interview:',
          error,
        )

        router.push(
          '/interview/result',
        )

      }

    }


  /* =========================================================
     NEXT PANEL
     ========================================================= */

  const nextPanel =
    async () => {

      try {

        if (
          recognitionRef.current
        ) {

          try {
            recognitionRef.current.stop()
          } catch {
            // Ignore.
          }

        }


        await advanceAgent()

      } catch (
        error
      ) {

        console.error(
          'Failed to advance panel:',
          error,
        )

      }

    }


  /* =========================================================
     No active interview
     ========================================================= */

  if (!isInterviewActive) {

    return (

      <div className="setup-card">

        <h1>
          No active interview
        </h1>

        <button
          className="button button-primary"
          onClick={() =>
            router.push(
              '/interview/setup',
            )
          }
        >
          Start interview
        </button>

      </div>

    )

  }


  /* =========================================================
     Agent unavailable
     ========================================================= */

  if (!agent) {

    return (

      <div className="setup-card">

        <h1>
          Interview agent unavailable
        </h1>

        <button
          className="button button-primary"
          onClick={() =>
            router.push(
              '/interview/setup',
            )
          }
        >
          Return to setup
        </button>

      </div>

    )

  }


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="live-page">

      <header className="live-header">

        <span className="logo">

          Panel

          <span className="logo-ai">
            AI
          </span>

        </span>


        <div className="live-status">

          <span className="live-dot" />

          Panel active

          <b>

            {String(
              Math.floor(
                elapsedTime / 60,
              ),
            ).padStart(
              2,
              '0',
            )}

            :

            {String(
              elapsedTime % 60,
            ).padStart(
              2,
              '0',
            )}

          </b>

        </div>


        <button
          className="button button-dark"
          onClick={finish}
          disabled={isLoading}
        >
          End interview
        </button>

      </header>


      <main className="live-content">

        <div className="live-stage">

          <div className="stage-top">

            <span className="eyebrow">
              Currently speaking
            </span>

            <span className="connection">

              <span className="live-dot" />

              {isJoining

                ? 'Connecting...'

                : agoraConnected

                  ? 'Excellent connection'

                  : 'Connection unavailable'}

            </span>

          </div>


          {agoraError && (

            <div
              style={{
                marginBottom:
                  '20px',

                padding:
                  '12px 16px',

                borderRadius:
                  '10px',

                background:
                  'rgba(255, 80, 80, 0.08)',

                border:
                  '1px solid rgba(255, 80, 80, 0.2)',

                fontSize:
                  '14px',
              }}
            >

              {agoraError}

            </div>

          )}


          <div className="speaker">

            <div
              className={`speaker-orb ${
                Array.isArray(
                  agent.color,
                )
                  ? agent.color.join(' ')
                  : agent.color
              }`}
            >

              {Icon && (
                <Icon size={38} />
              )}

            </div>


            <h1>
              {agent.name}
            </h1>


            <p>
              {agent.focus}
            </p>


            <div className="speaking">

              {agoraConnected

                ? 'Speaking'

                : isJoining

                  ? 'Connecting'

                  : 'Waiting'}

            </div>


            <h2 className="live-question">

              {currentQuestion ||
                `Interviewing with ${agent.name}`}

            </h2>

          </div>


          <div className="live-controls">

            <button
              className={`control ${
                isMuted
                  ? 'on'
                  : ''
              }`}
              onClick={
                toggleMic
              }
              disabled={
                !agoraConnected
              }
            >

              {isMuted
                ? 'Unmute'
                : 'Mute'}

            </button>


            <button
              className={`control ${
                !cameraOn
                  ? 'on'
                  : ''
              }`}
              onClick={
                toggleCamera
              }
              disabled={
                !agoraConnected
              }
            >

              {cameraOn
                ? 'Camera'
                : 'Camera off'}

            </button>


            <button
              className={`control ${
                screenSharing
                  ? 'on'
                  : ''
              }`}
              onClick={
                toggleScreenShare
              }
              disabled={
                !agoraConnected
              }
            >

              {screenSharing
                ? 'Stop share'
                : 'Share screen'}

            </button>


            <button
              className="control"
              onClick={
                nextPanel
              }
              disabled={
                isLoading ||
                !agoraConnected
              }
            >

              {isLoading
                ? 'Moving...'
                : 'Next panel'}

            </button>


            <button
              className="control end"
              onClick={
                finish
              }
            >
              End
            </button>

          </div>


          <div
            style={{
              marginTop:
                '16px',

              textAlign:
                'center',

              fontSize:
                '13px',

              opacity:
                0.7,
            }}
          >

            {isTranscribing

              ? '● Listening to your answer'

              : 'Speech transcription unavailable'}

          </div>

        </div>


        <aside className="transcript">

          <div className="transcript-head">

            <strong>
              Live transcript
            </strong>

            <span>

              <span className="live-dot" />

              {isTranscribing
                ? 'Live'
                : 'Waiting'}

            </span>

          </div>


          <div className="transcript-body">

            {transcript.map(
              (message) => {

                const messageAgentId =
                  getSafeAgentId(
                    message.agent,
                    currentAgent,
                  )


                const messageAgent =
                  AGENT_BY_ID[
                    messageAgentId
                  ]


                return (

                  <div
                    className={`transcript-line ${
                      message.speaker ===
                      'agent'
                        ? 'agent'
                        : 'user'
                    }`}
                    key={
                      message.id
                    }
                  >

                    <span>

                      {message.speaker ===
                      'agent'

                        ? messageAgent.short
                            .slice(
                              0,
                              2,
                            )
                            .toUpperCase()

                        : 'AM'}

                    </span>


                    <div>

                      <small>

                        {message.speaker ===
                        'agent'

                          ? messageAgent.name

                          : 'You'}

                      </small>


                      <p>
                        {message.message}
                      </p>

                    </div>

                  </div>

                )

              },
            )}


            <div className="typing">

              {isTranscribing

                ? 'PanelAI is listening'

                : 'Waiting for speech...'}

            </div>

          </div>

        </aside>

      </main>

    </div>

  )

}