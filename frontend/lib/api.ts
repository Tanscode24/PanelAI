const API_BASE =
  (
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:8000'
  ).replace(/\/$/, '')


async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url =
    `${API_BASE}${path}`

  console.log(
    `[PanelAI API] ${options.method || 'GET'} ${url}`,
  )

  let response: Response

  try {
    response = await fetch(
      url,
      {
        ...options,
        headers: {
          'Content-Type':
            'application/json',
          ...(options.headers || {}),
        },
      },
    )
  } catch (error) {
    console.error(
      `[PanelAI API] Network error: ${url}`,
      error,
    )

    throw new Error(
      `Unable to connect to PanelAI backend at ${API_BASE}`,
    )
  }


  const text =
    await response.text()


  let data: any = null


  if (text) {
    try {
      data =
        JSON.parse(text)
    } catch {
      data = text
    }
  }


  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data?.detail
        ? data.detail
        : typeof data === 'string' &&
          data.trim()
          ? data
          : `Request failed with status ${response.status}`

    console.error(
      `[PanelAI API] ${response.status}: ${message}`,
    )

    throw new Error(
      message,
    )
  }


  return data as T
}


/* =========================================================
   Types
   ========================================================= */

export type StartInterviewConfig = {
  candidateName: string
  format?: string
  role?: string
  experience?: string
  difficulty?: string
  duration?: number
  context?: string
}


export type StartInterviewResponse = {
  session: any

  agent: {
    agent_type: string
    agent_name: string
    pipeline_id?: string
    agent_id?: string
    channel_name?: string
    candidate_uid?: number
    prompt?: string
    agora?: any
  }

  agora?: {
    app_id?: string
    candidate_token?: string
    candidate_uid?: number
    channel_name?: string
  }
}


/* =========================================================
   Start interview
   ========================================================= */

export async function startInterview(
  config: StartInterviewConfig,
): Promise<StartInterviewResponse> {

  const response =
    await request<StartInterviewResponse>(
      '/api/interview/start',
      {
        method: 'POST',

        body: JSON.stringify({
          candidate_name:
            config.candidateName,

          interview_type:
            config.format ||
            'full-panel',

          role:
            config.role ||
            'Software Engineer',

          experience:
            config.experience ||
            '',

          difficulty:
            config.difficulty ||
            'medium',

          duration:
            config.duration ||
            30,

          context:
            config.context ||
            '',
        }),
      },
    )


  /*
   * Backend returns:
   *
   * {
   *   session: {...},
   *   agent: {...},
   *   agora: {...}
   * }
   *
   * Copy Agora information into session as well,
   * because the live page reads it from interviewSession.
   */

  if (
    response.session &&
    response.agora
  ) {
    response.session.app_id =
      response.agora.app_id

    response.session.candidate_token =
      response.agora.candidate_token

    response.session.candidate_uid =
      response.agora.candidate_uid

    response.session.channel_name =
      response.agora.channel_name
  }


  /*
   * Also support Agora information returned
   * inside the agent response.
   */

  if (
    response.session &&
    response.agent
  ) {
    if (
      !response.session.app_id &&
      response.agent.agora?.app_id
    ) {
      response.session.app_id =
        response.agent.agora.app_id
    }

    if (
      !response.session.candidate_token &&
      response.agent.agora?.candidate_token
    ) {
      response.session.candidate_token =
        response.agent.agora.candidate_token
    }

    if (
      !response.session.candidate_uid &&
      response.agent.candidate_uid
    ) {
      response.session.candidate_uid =
        response.agent.candidate_uid
    }

    if (
      !response.session.channel_name &&
      response.agent.channel_name
    ) {
      response.session.channel_name =
        response.agent.channel_name
    }
  }


  return response
}


/* =========================================================
   Get interview session
   ========================================================= */

export async function getInterview(
  sessionId: string,
): Promise<any> {

  if (!sessionId) {
    throw new Error(
      'Interview session ID is missing.',
    )
  }


  return request<any>(
    `/api/interview/${encodeURIComponent(
      sessionId,
    )}`,
  )
}


/* =========================================================
   Add transcript
   ========================================================= */

export async function addTranscript(
  payload: {
    session_id: string
    speaker: string
    text: string
    agent?: string
  },
): Promise<any> {

  if (!payload.session_id) {
    throw new Error(
      'Interview session ID is missing.',
    )
  }


  if (
    !payload.text ||
    !payload.text.trim()
  ) {
    return {
      status: 'ignored',
    }
  }


  return request<any>(
    '/api/interview/transcript',
    {
      method: 'POST',

      body: JSON.stringify({
        session_id:
          payload.session_id,

        speaker:
          payload.speaker,

        text:
          payload.text.trim(),

        ...(payload.agent
          ? {
              agent:
                payload.agent,
            }
          : {}),
      }),
    },
  )
}


/* =========================================================
   Advance to next panel
   ========================================================= */

export async function advanceInterview(
  sessionId: string,
): Promise<any> {

  if (!sessionId) {
    throw new Error(
      'Interview session ID is missing.',
    )
  }


  return request<any>(
    `/api/interview/advance?session_id=${encodeURIComponent(
      sessionId,
    )}`,
    {
      method: 'POST',
    },
  )
}


/* =========================================================
   Automatic score
   ========================================================= */

export async function autoScoreAgent(
  sessionId: string,
): Promise<any> {

  if (!sessionId) {
    throw new Error(
      'Interview session ID is missing.',
    )
  }


  return request<any>(
    `/api/interview/${encodeURIComponent(
      sessionId,
    )}/auto-score`,
    {
      method: 'POST',
    },
  )
}


/* =========================================================
   Final evaluation
   ========================================================= */

export async function evaluateInterview(
  sessionId: string,
): Promise<any> {

  if (!sessionId) {
    throw new Error(
      'Interview session ID is missing.',
    )
  }


  /*
   * IMPORTANT:
   *
   * Backend uses:
   *
   * @app.post("/api/interview/{session_id}/evaluate")
   *
   * Therefore this MUST be POST.
   */

  return request<any>(
    `/api/interview/${encodeURIComponent(
      sessionId,
    )}/evaluate`,
    {
      method: 'POST',
    },
  )
}


/* =========================================================
   End interview
   ========================================================= */

export async function endInterview(
  sessionId: string,
): Promise<any> {

  if (!sessionId) {
    throw new Error(
      'Interview session ID is missing.',
    )
  }


  return request<any>(
    `/api/interview/end?session_id=${encodeURIComponent(
      sessionId,
    )}`,
    {
      method: 'POST',
    },
  )
}


/* =========================================================
   Result
   ========================================================= */

export async function getInterviewResult(
  sessionId: string,
): Promise<any> {

  if (!sessionId) {
    throw new Error(
      'Interview session ID is missing.',
    )
  }


  return evaluateInterview(
    sessionId,
  )
}


/* =========================================================
   Submit answer
   ========================================================= */

export async function submitAnswer(
  sessionId: string,
  answer: string,
  agent?: string,
): Promise<any> {

  return addTranscript({
    session_id:
      sessionId,

    speaker:
      'candidate',

    text:
      answer,

    agent,
  })
}


/* =========================================================
   Agora token
   ========================================================= */

export async function getAgoraToken(
  channelName?: string,
  uid?: number,
): Promise<any> {

  const params =
    new URLSearchParams()


  if (channelName) {
    params.set(
      'channel_name',
      channelName,
    )
  }


  if (uid !== undefined) {
    params.set(
      'uid',
      String(uid),
    )
  }


  const query =
    params.toString()


  return request<any>(
    `/api/agora/token${
      query
        ? `?${query}`
        : ''
    }`,
  )
}