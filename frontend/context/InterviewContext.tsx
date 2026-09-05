'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import * as api from '@/lib/api'

import type {
  AgentId,
} from '@/types/agent'


/* =========================================================
   Types
   ========================================================= */

type InterviewFormat =
  | 'full-panel'
  | 'technical'
  | 'behavioural'
  | 'product'
  | 'hiring'


export type InterviewConfig = {
  candidateName: string
  format: InterviewFormat
  role: string
  experience: string
  difficulty: string
  duration: number
  context: string
}


export type TranscriptMessage = {
  id: string
  speaker: 'user' | 'agent'
  agent?: AgentId | string
  message: string
  timestamp?: number
}


export type AgentStatus =
  | 'waiting'
  | 'active'
  | 'completed'


export type InterviewResult = any


export type InterviewContextValue = {
  interviewConfig: InterviewConfig

  interviewSession: any

  currentAgent: AgentId

  currentQuestion: string

  transcript: TranscriptMessage[]

  agentStatuses: Record<
    AgentId,
    AgentStatus
  >

  elapsedTime: number

  isInterviewActive: boolean

  isListening: boolean

  isLoading: boolean

  isMuted: boolean

  cameraOn: boolean

  screenSharing: boolean

  result: InterviewResult | null

  error: string | null

  updateConfig: (
    config: Partial<InterviewConfig>,
  ) => void

  startInterview: () => Promise<void>

  endInterview: () => Promise<void>

  setCurrentAgent: (
    agent: AgentId,
  ) => void

  addTranscriptMessage: (
    message: TranscriptMessage,
  ) => void

  advanceAgent: () => Promise<void>

  toggleMic: () => void

  toggleCamera: () => void

  toggleScreenShare: () => void
}


/* =========================================================
   Default config
   ========================================================= */

const defaultConfig: InterviewConfig = {
  candidateName: '',
  format: 'full-panel',
  role: 'Software Engineer',
  experience: '2 years',
  difficulty: 'medium',
  duration: 30,
  context: '',
}


/* =========================================================
   Agent state
   ========================================================= */

const defaultAgentStatuses: Record<
  AgentId,
  AgentStatus
> = {
  technical: 'waiting',
  behavioural: 'waiting',
  product: 'waiting',
  hiring: 'waiting',
}


const AGENT_ORDER: AgentId[] = [
  'technical',
  'behavioural',
  'product',
  'hiring',
]


/* =========================================================
   FRONTEND → BACKEND AGENT
   ========================================================= */

function frontendToBackendAgent(
  value: unknown,
): string | undefined {

  switch (value) {

    case 'technical':
      return 'technical'

    case 'behavioural':
      return 'behavioral'

    case 'product':
      return 'system_design'

    case 'hiring':
      return 'coding'

    default:
      return undefined
  }
}


/* =========================================================
   BACKEND → FRONTEND AGENT
   ========================================================= */

function backendToFrontendAgent(
  value: unknown,
): AgentId {

  switch (value) {

    case 'technical':
      return 'technical'

    case 'behavioral':
      return 'behavioural'

    case 'behavioural':
      return 'behavioural'

    case 'system_design':
      return 'product'

    case 'product':
      return 'product'

    case 'coding':
      return 'hiring'

    case 'hiring':
      return 'hiring'

    default:
      return 'technical'
  }
}


/* =========================================================
   Initial questions
   ========================================================= */

function getInitialQuestion(
  agent: AgentId,
): string {

  switch (agent) {

    case 'technical':
      return 'Tell me about your technical experience and the projects you have worked on.'

    case 'behavioural':
      return 'Tell me about a challenging situation you faced and how you handled it.'

    case 'product':
      return 'How would you approach designing a scalable system for a large number of users?'

    case 'hiring':
      return 'Let us work through a coding problem. Explain your approach before writing the solution.'

    default:
      return 'Please introduce yourself and tell me about your experience.'
  }
}


/* =========================================================
   Context
   ========================================================= */

const InterviewContext =
  createContext<
    InterviewContextValue | null
  >(null)


/* =========================================================
   Provider
   ========================================================= */

export function InterviewProvider({
  children,
}: {
  children: ReactNode
}) {

  const [
    interviewConfig,
    setInterviewConfig,
  ] = useState<InterviewConfig>(
    defaultConfig,
  )


  const [
    interviewSession,
    setInterviewSession,
  ] = useState<any>(null)


  const [
    currentAgent,
    setCurrentAgentState,
  ] = useState<AgentId>(
    'technical',
  )


  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(
    getInitialQuestion(
      'technical',
    ),
  )


  const [
    transcript,
    setTranscript,
  ] = useState<
    TranscriptMessage[]
  >([])


  const [
    agentStatuses,
    setAgentStatuses,
  ] = useState<
    Record<
      AgentId,
      AgentStatus
    >
  >(defaultAgentStatuses)


  const [
    elapsedTime,
    setElapsedTime,
  ] = useState(0)


  const [
    isInterviewActive,
    setIsInterviewActive,
  ] = useState(false)


  const [
    isListening,
    setIsListening,
  ] = useState(false)


  const [
    isLoading,
    setIsLoading,
  ] = useState(false)


  const [
    isMuted,
    setIsMuted,
  ] = useState(false)


  const [
    cameraOn,
    setCameraOn,
  ] = useState(true)


  const [
    screenSharing,
    setScreenSharing,
  ] = useState(false)


  const [
    result,
    setResult,
  ] = useState<
    InterviewResult | null
  >(null)


  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null)


  /* =======================================================
     Timer
     ======================================================= */

  useEffect(() => {

    if (!isInterviewActive) {
      return
    }


    const interval =
      window.setInterval(() => {

        setElapsedTime(
          (value) =>
            value + 1,
        )

      }, 1000)


    return () => {

      window.clearInterval(
        interval,
      )

    }

  }, [
    isInterviewActive,
  ])


  /* =======================================================
     Update config
     ======================================================= */

  const updateConfig =
    useCallback(
      (
        config: Partial<InterviewConfig>,
      ) => {

        setInterviewConfig(
          (current) => ({
            ...current,
            ...config,
          }),
        )

      },
      [],
    )


  /* =======================================================
     Set current agent
     ======================================================= */

  const setCurrentAgent =
    useCallback(
      (agent: AgentId) => {

        setCurrentAgentState(
          agent,
        )


        setCurrentQuestion(
          getInitialQuestion(
            agent,
          ),
        )


        setAgentStatuses(
          (current) => ({
            ...current,
            [agent]: 'active',
          }),
        )

      },
      [],
    )


  /* =======================================================
     Start interview
     ======================================================= */

  const startInterview =
    useCallback(
      async () => {

        try {

          setIsLoading(
            true,
          )

          setError(
            null,
          )


          const response =
            await api.startInterview(
              interviewConfig as any,
            )


          const session =
            response?.session ||
            response


          const agentData =
            response?.agent ||
            {}


          const agent =
            backendToFrontendAgent(
              agentData.agent_type ||
              session?.agent_type ||
              'technical',
            )


          /*
           * Preserve all Agora information.
           */

          const normalizedSession = {
            ...session,

            app_id:
              response?.agora?.app_id ||
              session?.app_id,

            candidate_token:
              response?.agora?.candidate_token ||
              session?.candidate_token,

            candidate_uid:
              response?.agora?.candidate_uid ||
              session?.candidate_uid,

            channel_name:
              response?.agora?.channel_name ||
              session?.channel_name,
          }


          setInterviewSession(
            normalizedSession,
          )


          setCurrentAgentState(
            agent,
          )


          setCurrentQuestion(
            agentData.prompt ||
            session?.prompt ||
            getInitialQuestion(
              agent,
            ),
          )


          setTranscript([])


          setAgentStatuses({

            technical:
              'waiting',

            behavioural:
              'waiting',

            product:
              'waiting',

            hiring:
              'waiting',

            [agent]:
              'active',
          })


          setElapsedTime(
            0,
          )


          setResult(
            null,
          )


          setIsInterviewActive(
            true,
          )

        } catch (err) {

          console.error(
            'Failed to start interview:',
            err,
          )


          setError(
            err instanceof Error
              ? err.message
              : 'Failed to start interview.',
          )


          throw err

        } finally {

          setIsLoading(
            false,
          )

        }

      },
      [
        interviewConfig,
      ],
    )


  /* =======================================================
     Add transcript
     ======================================================= */

  const addTranscriptMessage =
    useCallback(
      (
        message: TranscriptMessage,
      ) => {

        /*
         * Update UI immediately.
         */

        setTranscript(
          (current) => [
            ...current,

            {
              ...message,

              timestamp:
                message.timestamp ||
                Date.now(),
            },
          ],
        )


        const sessionId =
          interviewSession?.session_id


        if (
          !sessionId ||
          !message.message.trim()
        ) {
          return
        }


        const backendAgent =
          frontendToBackendAgent(
            message.agent ||
            currentAgent,
          )


        void api
          .addTranscript({

            session_id:
              sessionId,

            speaker:
              message.speaker ===
              'user'
                ? 'candidate'
                : 'agent',

            text:
              message.message.trim(),

            agent:
              backendAgent,

          } as any)

          .catch((err) => {

            console.error(
              'Failed to send transcript to backend:',
              err,
            )

          })

      },
      [
        interviewSession,
        currentAgent,
      ],
    )


  /* =======================================================
     Advance to next agent
     ======================================================= */

  const advanceAgent =
    useCallback(
      async () => {

        const sessionId =
          interviewSession?.session_id


        if (!sessionId) {

          throw new Error(
            'Interview session is missing.',
          )

        }


        try {

          setIsLoading(
            true,
          )

          setError(
            null,
          )


          const response =
            await api.advanceInterview(
              sessionId,
            )


          const completedAgent =
            backendToFrontendAgent(
              response?.completed_agent ||
              currentAgent,
            )


          setAgentStatuses(
            (current) => ({
              ...current,

              [completedAgent]:
                'completed',
            }),
          )


          const nextBackendAgent =
            response?.next_agent


          /*
           * FULL PANEL IS COMPLETE
           *
           * Only now do we request final
           * evaluation.
           */

          if (!nextBackendAgent) {

            try {

              const evaluation =
                await api.evaluateInterview(
                  sessionId,
                )


              setResult(
                evaluation,
              )

            } catch (evaluationError) {

              console.error(
                'Final evaluation failed:',
                evaluationError,
              )


              /*
               * Keep the interview result page
               * reachable even if evaluation fails.
               */

              setError(
                evaluationError instanceof Error
                  ? evaluationError.message
                  : 'Final evaluation failed.',
              )

            }


            setIsInterviewActive(
              false,
            )


            return
          }


          const nextAgent =
            backendToFrontendAgent(
              nextBackendAgent,
            )


          setCurrentAgentState(
            nextAgent,
          )


          setCurrentQuestion(
            response?.next_question ||
            getInitialQuestion(
              nextAgent,
            ),
          )


          setAgentStatuses(
            (current) => ({
              ...current,

              [nextAgent]:
                'active',
            }),
          )

        } catch (err) {

          console.error(
            'Failed to advance interview:',
            err,
          )


          setError(
            err instanceof Error
              ? err.message
              : 'Failed to move to the next panel.',
          )


          throw err

        } finally {

          setIsLoading(
            false,
          )

        }

      },
      [
        interviewSession,
        currentAgent,
      ],
    )


  /* =======================================================
     End interview
     =======================================================

     IMPORTANT:

     "End interview" is different from
     "Complete full panel".

     If the user ends early, we DO NOT call
     final evaluation because the backend
     correctly rejects it.

     We simply close the frontend interview.

     If the last panel has already completed,
     advanceAgent() handles evaluation.
     ======================================================= */

  const endInterview =
    useCallback(
      async () => {

        const sessionId =
          interviewSession?.session_id


        if (!sessionId) {

          console.warn(
            'Cannot end interview: session ID is missing.',
          )


          setIsInterviewActive(
            false,
          )

          return
        }


        try {

          setIsLoading(
            true,
          )

          setError(
            null,
          )


          /*
           * IMPORTANT:
           *
           * Do NOT call evaluateInterview()
           * here.
           *
           * The backend only permits final
           * evaluation after the complete
           * panel has reached evaluation stage.
           */


          /*
           * Tell backend that the interview
           * has ended.
           */

          try {

            await api.endInterview(
              sessionId,
            )

          } catch (err) {

            console.error(
              'Backend end interview failed:',
              err,
            )

          }


          /*
           * If a previous full-panel evaluation
           * already exists, preserve it.
           *
           * Otherwise result remains null.
           */

          setIsInterviewActive(
            false,
          )

        } catch (err) {

          console.error(
            'Failed to finish interview:',
            err,
          )


          setError(
            err instanceof Error
              ? err.message
              : 'Failed to finish interview.',
          )


          setIsInterviewActive(
            false,
          )

        } finally {

          setIsLoading(
            false,
          )

        }

      },
      [
        interviewSession,
      ],
    )


  /* =======================================================
     Controls
     ======================================================= */

  const toggleMic =
    useCallback(
      () => {

        setIsMuted(
          (value) =>
            !value,
        )

      },
      [],
    )


  const toggleCamera =
    useCallback(
      () => {

        setCameraOn(
          (value) =>
            !value,
        )

      },
      [],
    )


  const toggleScreenShare =
    useCallback(
      () => {

        setScreenSharing(
          (value) =>
            !value,
        )

      },
      [],
    )


  /* =======================================================
     Context value
     ======================================================= */

  const value =
    useMemo<InterviewContextValue>(
      () => ({

        interviewConfig,

        interviewSession,

        currentAgent,

        currentQuestion,

        transcript,

        agentStatuses,

        elapsedTime,

        isInterviewActive,

        isListening,

        isLoading,

        isMuted,

        cameraOn,

        screenSharing,

        result,

        error,

        updateConfig,

        startInterview,

        endInterview,

        setCurrentAgent,

        addTranscriptMessage,

        advanceAgent,

        toggleMic,

        toggleCamera,

        toggleScreenShare,

      }),

      [
        interviewConfig,
        interviewSession,
        currentAgent,
        currentQuestion,
        transcript,
        agentStatuses,
        elapsedTime,
        isInterviewActive,
        isListening,
        isLoading,
        isMuted,
        cameraOn,
        screenSharing,
        result,
        error,
        updateConfig,
        startInterview,
        endInterview,
        setCurrentAgent,
        addTranscriptMessage,
        advanceAgent,
        toggleMic,
        toggleCamera,
        toggleScreenShare,
      ],
    )


  return (

    <InterviewContext.Provider
      value={value}
    >
      {children}
    </InterviewContext.Provider>

  )
}


/* =========================================================
   Hook
   ========================================================= */

export function useInterview(): InterviewContextValue {

  const context =
    useContext(
      InterviewContext,
    )


  if (!context) {

    throw new Error(
      'useInterview must be used inside InterviewProvider',
    )

  }


  return context
}