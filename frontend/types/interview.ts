export type InterviewType =
  | 'technical'
  | 'behavioral'
  | 'system_design'
  | 'coding'

export type InterviewFormat =
  | 'full-panel'
  | InterviewType

export type InterviewDifficulty =
  | 'easy'
  | 'medium'
  | 'hard'

export type InterviewConfig = {
  candidateName: string
  format: InterviewFormat
  role: string
  experience: string
  difficulty: InterviewDifficulty
  duration: number
  context: string
}

export type TranscriptMessage = {
  id: string
  speaker: 'agent' | 'candidate'
  agent?: string
  message: string
  timestamp?: string
}

export type InterviewSession = {
  session_id: string
  candidate_name: string
  interview_type: InterviewType
  status: string

  agent_name: string
  agent_id: string | null

  app_id: string
  channel_name: string

  candidate_uid: number
  candidate_token: string

  prompt: string

  agora_agent?: {
    agent_id?: string
    create_ts?: number
    status?: string
    [key: string]: unknown
  }

  transcript?: TranscriptMessage[]
}

export type InterviewResult = {
  overallScore: number
  agentScores: Record<string, number>
  strengths: string[]
  improvements: string[]
  summary: string

  questionReviews: {
    question: string
    score: number
    feedback: string
  }[]
}