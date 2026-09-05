'use client'

import {
  useState,
} from 'react'

import {
  useRouter,
} from 'next/navigation'

import {
  AppShell,
} from '@/app/page'

import {
  useInterview,
} from '@/hooks/useInterview'


export default function SetupPage() {

  const router =
    useRouter()


  const {
    interviewConfig,
    updateConfig,
    startInterview,
    isLoading,
    error,
  } =
    useInterview()


  const [
    localError,
    setLocalError,
  ] =
    useState<string | null>(
      null,
    )


  const set = (
    patch: Parameters<
      typeof updateConfig
    >[0],
  ) => {

    updateConfig(patch)
  }


  const handleStart =
    async () => {

      setLocalError(null)


      if (
        !interviewConfig.candidateName.trim()
      ) {

        setLocalError(
          'Please enter your name.',
        )

        return
      }


      try {

        await startInterview()

        router.push(
          '/interview/live',
        )

      } catch {

        // Error is already stored
        // by InterviewContext.
      }
    }


  return (
    <AppShell>

      <div className="page-header">

        <div>

          <div className="eyebrow">
            New interview
          </div>

          <h1>
            Configure your interview
          </h1>

        </div>

      </div>


      <section className="setup-card">

        {/* ================================================= */}
        {/* CANDIDATE NAME */}
        {/* ================================================= */}

        <label>

          Your name

          <input
            value={
              interviewConfig.candidateName
            }
            onChange={event =>
              set({
                candidateName:
                  event.target.value,
              })
            }
            placeholder="e.g. Tarush Jain"
          />

        </label>


        {/* ================================================= */}
        {/* INTERVIEW FORMAT */}
        {/* ================================================= */}

        <h2>
          Interview format
        </h2>

        <p>
          Choose who you&apos;d like
          to meet today.
        </p>


        <div className="format-options">

          {[
            [
              'full-panel',
              'Full panel',
              'All four interviewers',
            ],

            [
              'technical',
              'Technical',
              'NOVA · Technical',
            ],

            [
              'behavioral',
              'Behavioral',
              'MIRA · Behavioral',
            ],

            [
              'system_design',
              'System Design',
              'ATLAS · System Design',
            ],

            [
              'coding',
              'Coding',
              'BYTE · Coding',
            ],

          ].map(
            ([
              value,
              label,
              description,
            ]) => (

              <button
                type="button"
                className={
                  interviewConfig.format ===
                  value
                    ? 'selected'
                    : ''
                }
                key={value}
                onClick={() =>
                  set({
                    format:
                      value as
                        typeof interviewConfig.format,
                  })
                }
              >

                <strong>
                  {label}
                </strong>

                <small>
                  {description}
                </small>

              </button>

            ),
          )}

        </div>


        {/* ================================================= */}
        {/* ROLE + EXPERIENCE */}
        {/* ================================================= */}

        <div className="form-row">

          <label>

            Role you&apos;re applying for

            <input
              value={
                interviewConfig.role
              }
              onChange={event =>
                set({
                  role:
                    event.target.value,
                })
              }
              placeholder="e.g. Software Engineer"
            />

          </label>


          <label>

            Experience level

            <select
              value={
                interviewConfig.experience
              }
              onChange={event =>
                set({
                  experience:
                    event.target.value,
                })
              }
            >

              <option>
                Entry level
              </option>

              <option>
                Mid-level (3–5 years)
              </option>

              <option>
                Senior (5+ years)
              </option>

            </select>

          </label>

        </div>


        {/* ================================================= */}
        {/* DIFFICULTY + DURATION */}
        {/* ================================================= */}

        <div className="form-row">

          <label>

            Difficulty

            <select
              value={
                interviewConfig.difficulty
              }
              onChange={event =>
                set({
                  difficulty:
                    event.target.value as
                      'easy'
                      | 'medium'
                      | 'hard',
                })
              }
            >

              <option value="easy">
                Easy
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="hard">
                Hard
              </option>

            </select>

          </label>


          <label>

            Duration

            <select
              value={
                interviewConfig.duration
              }
              onChange={event =>
                set({
                  duration:
                    Number(
                      event.target.value,
                    ),
                })
              }
            >

              <option value="30">
                30 minutes
              </option>

              <option value="45">
                45 minutes
              </option>

              <option value="60">
                60 minutes
              </option>

            </select>

          </label>

        </div>


        {/* ================================================= */}
        {/* CONTEXT */}
        {/* ================================================= */}

        <label className="textarea-label">

          Anything else we should know?

          <span>
            Optional
          </span>

          <textarea
            value={
              interviewConfig.context
            }
            onChange={event =>
              set({
                context:
                  event.target.value,
              })
            }
            placeholder="Paste a job description or add context for your panel..."
          />

        </label>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {(localError || error) && (

          <div
            role="alert"
            style={{
              marginTop: 12,
              color: '#f87171',
            }}
          >

            {localError || error}

          </div>

        )}


        {/* ================================================= */}
        {/* START */}
        {/* ================================================= */}

        <button
          type="button"
          className="button button-primary button-full"
          disabled={isLoading}
          onClick={handleStart}
        >

          {isLoading
            ? 'Starting AI interviewer…'
            : 'Start interview'}

        </button>

      </section>

    </AppShell>
  )
}