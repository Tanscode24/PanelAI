'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import * as api from '@/lib/api'
import { AGENTS as agents } from '@/lib/agents'
import { useInterview } from '@/hooks/useInterview'
import { usePathname } from 'next/navigation'
import {
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Code2,
  Clock3,
  FileText,
  Flame,
  Gauge,
  Headphones,
  History as HistoryIcon,
  Lightbulb,
  Menu,
  MessageSquare,
  Play,
  Plus,
  Radar,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react'


/* =========================================================
   Shared
   ========================================================= */

function Logo() {
  return (
    <Link
      href="/"
      className="logo"
    >
      <span className="logo-mark">
        <span />
      </span>

      <span>
        Panel
        <span className="logo-ai">
          AI
        </span>
      </span>
    </Link>
  )
}


function MarketingNav() {
  return (
    <header className="nav">

      <Logo />

      <nav className="nav-links">
        <a href="#features">
          Features
        </a>

        <a href="#how">
          How it works
        </a>

        <a href="#agents">
          Agents
        </a>

        <a href="#pricing">
          Pricing
        </a>

        <a href="#about">
          About
        </a>
      </nav>

      <div className="nav-actions">

        <Link
          href="/login"
          className="text-link"
        >
          Log in
        </Link>

        <Link
          href="/dashboard"
          className="button button-primary"
        >
          Get started
          <ArrowRight size={16} />
        </Link>

      </div>

      <button
        className="icon-button mobile-menu"
        aria-label="Open menu"
      >
        <Menu />
      </button>

    </header>
  )
}


function Footer() {
  return (
    <footer className="footer">

      <Logo />

      <span>
        © 2025 PanelAI. Built for better interviews.
      </span>

      <div>
        <a href="#privacy">
          Privacy
        </a>

        <a href="#terms">
          Terms
        </a>

        <a href="#help">
          Help center
        </a>
      </div>

    </footer>
  )
}


function AgentPill({
  agent,
}: {
  agent: typeof agents[number]
}) {

  const Icon =
    agent.icon

  return (
    <div
      className={`agent-pill ${Array.isArray(agent.color) ? agent.color.join(' ') : agent.color}`}
    >

      <span className="agent-icon">
        <Icon size={16} />
      </span>

      <span>
        {agent.short}
      </span>

      <span className="live-dot" />

    </div>
  )
}


/* =========================================================
   Landing
   ========================================================= */

function Landing() {

  return (
    <div className="marketing">

      <MarketingNav />

      <main>

        <section className="hero section">

          <div className="hero-copy">

            <div className="eyebrow">
              <Sparkles size={14} />
              The future of interview prep
            </div>

            <h1>
              Your personal
              <br />
              <em>
                AI interview panel.
              </em>
            </h1>

            <p className="hero-sub">
              Four specialized AI agents. One comprehensive
              interview. Practice with a panel that thinks
              like your next hiring team.
            </p>

            <div className="hero-actions">

              <Link
                href="/dashboard"
                className="button button-primary button-large"
              >
                Start practicing
                <ArrowRight size={18} />
              </Link>

              <a
                href="#how"
                className="button button-ghost button-large"
              >
                <Play
                  size={16}
                  fill="currentColor"
                />
                See how it works
              </a>

            </div>

            <div className="social-proof">

              <div className="avatars">
                <span>
                  JD
                </span>

                <span>
                  SK
                </span>

                <span>
                  AM
                </span>

                <span>
                  +
                </span>
              </div>

              <p>
                <strong>
                  10,000+
                </strong>{' '}
                candidates are practicing
                <br />
                with PanelAI
              </p>

            </div>

          </div>


          <div className="hero-visual">

            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="panel-core">

              <Radar size={42} />

              <strong>
                PanelAI
              </strong>

              <span>
                AI PANEL ACTIVE
              </span>

            </div>

            {agents.map(
              (
                agent,
                i,
              ) => (

                <div
                  key={agent.name}
                  className={`orbit-agent orbit-agent-${i}`}
                >
                  <AgentPill
                    agent={agent}
                  />
                </div>

              ),
            )}

            <div className="connection connection-a" />
            <div className="connection connection-b" />
            <div className="connection connection-c" />
            <div className="connection connection-d" />

          </div>

        </section>


        <section className="trusted">

          <span>
            Trusted by ambitious candidates at
          </span>

          <div>
            <strong>
              stripe
            </strong>

            <strong>
              notion
            </strong>

            <strong>
              airbnb
            </strong>

            <strong>
              vercel
            </strong>

            <strong>
              linear
            </strong>
          </div>

        </section>


        <section
          id="agents"
          className="section section-light"
        >

          <div className="section-heading">

            <div>

              <div className="eyebrow">
                One panel. Four perspectives.
              </div>

              <h2>
                Meet your interviewers.
              </h2>

            </div>

            <p>
              Each agent brings a distinct lens to your
              interview, so you get feedback that is as
              nuanced as the real thing.
            </p>

          </div>


          <div className="agent-grid">

            {agents.map(
              (agent) => {

                const Icon =
                  agent.icon

                return (
                  <article
                    className={`agent-card ${Array.isArray(agent.color) ? agent.color.join(' ') : agent.color}`}
                    key={agent.name}
                  >

                    <div className="agent-card-top">

                      <div className="large-agent-icon">
                        <Icon />
                      </div>

                      <span className="status">
                        <i />
                        Ready
                      </span>

                    </div>

                    <h3>
                      {agent.name}
                    </h3>

                    <p>
                      {agent.focus}
                    </p>

                    <div className="agent-card-footer">
                      <span>
                        AI specialist
                      </span>

                      <ChevronRight size={16} />
                    </div>

                  </article>
                )
              },
            )}

          </div>

        </section>


        <section
          id="how"
          className="section how"
        >

          <div className="eyebrow">
            How it works
          </div>

          <h2>
            Practice like it&apos;s the real thing.
          </h2>

          <div className="steps">

            {[
              [
                '01',
                'Configure',
                'Choose your role, level, and interview focus.',
              ],
              [
                '02',
                'Interview',
                'Meet your AI panel in a realistic voice interview.',
              ],
              [
                '03',
                'Improve',
                'Get clear, actionable feedback after every session.',
              ],
            ].map(
              (
                [n, t, d],
              ) => (

                <div
                  className="step"
                  key={n}
                >

                  <span>
                    {n}
                  </span>

                  <div>

                    <h3>
                      {t}
                    </h3>

                    <p>
                      {d}
                    </p>

                  </div>

                </div>

              ),
            )}

          </div>

        </section>


        <section className="quote-section">

          <div className="quote-mark">
            “
          </div>

          <blockquote>
            The closest thing to a real interview I&apos;ve
            found online. The feedback from each agent helped
            me see exactly where I was leaving points on the table.
          </blockquote>

          <div className="quote-person">

            <span>
              AM
            </span>

            <div>
              <strong>
                Alex Morgan
              </strong>

              <small>
                Software Engineer · Hired at Stripe
              </small>
            </div>

          </div>

        </section>


        <section
          id="pricing"
          className="cta section"
        >

          <div>

            <div className="eyebrow">
              Ready when you are
            </div>

            <h2>
              Turn interview anxiety
              <br />
              <em>
                into confidence.
              </em>
            </h2>

            <p>
              Start your first panel session free.
              No credit card required.
            </p>

          </div>

          <Link
            href="/dashboard"
            className="button button-primary button-large"
          >
            Get started free
            <ArrowRight size={18} />
          </Link>

        </section>

      </main>

      <Footer />

    </div>
  )
}


/* =========================================================
   Sidebar
   ========================================================= */

function Sidebar() {

  const path =
    usePathname()

  const items = [
    [
      '/dashboard',
      'Dashboard',
      Gauge,
    ],
    [
      '/interview/setup',
      'New interview',
      Plus,
    ],
    [
      '/history',
      'Interview history',
      HistoryIcon,
    ],
    [
      '/analytics',
      'Analytics',
      BarChart3,
    ],
  ] as const


  return (
    <aside className="sidebar">

      <Logo />

      <div className="side-label">
        Workspace
      </div>

      <nav>

        {items.map(
          (
            [href, label, Icon],
          ) => (

            <Link
              className={
                path === href
                  ? 'active'
                  : ''
              }
              href={href}
              key={href}
            >

              <Icon size={18} />

              {label}

              {label === 'New interview' && (
                <span className="new-badge">
                  NEW
                </span>
              )}

            </Link>

          ),
        )}

      </nav>


      <div className="side-divider" />

      <div className="side-label">
        Account
      </div>

      <nav>

        <Link
          className={
            path === '/profile'
              ? 'active'
              : ''
          }
          href="/profile"
        >
          <Users size={18} />
          Profile
        </Link>

        <Link
          className={
            path === '/settings'
              ? 'active'
              : ''
          }
          href="/settings"
        >
          <Settings size={18} />
          Settings
        </Link>

      </nav>


      <div className="side-bottom">

        <a>
          <CircleHelp size={18} />
          Help center
        </a>

        <div className="user-chip">

          <span>
            AM
          </span>

          <div>
            <strong>
              Alex Morgan
            </strong>

            <small>
              Free plan
            </small>
          </div>

          <ChevronDown size={15} />

        </div>

      </div>

    </aside>
  )
}


export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="app-shell">

      <Sidebar />

      <main className="app-main">

        <div className="mobile-app-top">

          <Logo />

          <button className="icon-button">
            <Menu />
          </button>

        </div>

        {children}

      </main>

    </div>
  )
}


function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string
  title: string
  children?: React.ReactNode
}) {

  return (
    <div className="page-header">

      <div>

        <div className="eyebrow">
          {eyebrow}
        </div>

        <h1>
          {title}
        </h1>

      </div>

      {children}

    </div>
  )
}


function Stat({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: any
  label: string
  value: string
  change: string
}) {

  return (
    <div className="stat-card">

      <div className="stat-icon">
        <Icon size={19} />
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

      <small className="positive">
        <TrendingUp size={13} />
        {change}
      </small>

    </div>
  )
}


/* =========================================================
   Dashboard
   ========================================================= */

function Dashboard() {

  return (
    <AppShell>

      <PageHeader
        eyebrow="Tuesday, September 3, 2025"
        title="Good morning, Alex."
      >

        <Link
          href="/interview/setup"
          className="button button-primary"
        >
          <Plus size={17} />
          New interview
        </Link>

      </PageHeader>


      <div className="stats-grid">

        <Stat
          icon={Flame}
          label="Current streak"
          value="7 days"
          change="+2 days"
        />

        <Stat
          icon={Target}
          label="Interviews completed"
          value="24"
          change="+4 this month"
        />

        <Stat
          icon={TrendingUp}
          label="Average score"
          value="84%"
          change="+8% this month"
        />

        <Stat
          icon={Clock3}
          label="Practice time"
          value="12.4h"
          change="+2.1h this month"
        />

      </div>


      <div className="dashboard-grid">

        <section className="dash-card performance">

          <div className="card-heading">

            <div>

              <h2>
                Performance overview
              </h2>

              <p>
                Your average panel score over time
              </p>

            </div>

            <select>
              <option>
                Last 30 days
              </option>

              <option>
                Last 90 days
              </option>
            </select>

          </div>


          <div className="chart">

            <div className="chart-y">
              <span>100</span>
              <span>75</span>
              <span>50</span>
              <span>25</span>
              <span>0</span>
            </div>

            <div className="chart-area">

              <div className="chart-lines" />

              <svg
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
              >

                <defs>

                  <linearGradient
                    id="fill"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop
                      offset="0"
                      stopColor="#ff1493"
                      stopOpacity=".22"
                    />

                    <stop
                      offset="1"
                      stopColor="#ff1493"
                      stopOpacity="0"
                    />
                  </linearGradient>

                </defs>

                <path
                  d="M0 150 C45 143 50 125 85 135 S140 115 165 120 S215 92 245 108 S290 96 325 82 S370 100 398 70 S450 62 475 52 S525 65 555 30 S585 28 600 20 L600 180 L0 180Z"
                  fill="url(#fill)"
                />

                <path
                  d="M0 150 C45 143 50 125 85 135 S140 115 165 120 S215 92 245 108 S290 96 325 82 S370 100 398 70 S450 62 475 52 S525 65 555 30 S585 28 600 20"
                  fill="none"
                  stroke="#ff1493"
                  strokeWidth="3"
                />

              </svg>


              <div className="chart-x">
                <span>
                  Aug 5
                </span>

                <span>
                  Aug 12
                </span>

                <span>
                  Aug 19
                </span>

                <span>
                  Aug 26
                </span>

                <span>
                  Sep 3
                </span>
              </div>

            </div>

          </div>

        </section>


        <section className="dash-card recent">

          <div className="card-heading">

            <div>

              <h2>
                Recent interviews
              </h2>

              <p>
                Your latest practice sessions
              </p>

            </div>

            <Link
              href="/history"
              className="text-link"
            >
              View all
              <ArrowRight size={14} />
            </Link>

          </div>


          <div className="recent-list">

            {[
              [
                'Senior Frontend Engineer',
                'Technical + Product',
                '92%',
                'Today',
              ],
              [
                'Product Manager',
                'Full panel',
                '86%',
                'Yesterday',
              ],
              [
                'Software Engineer',
                'Technical',
                '78%',
                'Aug 28',
              ],
            ].map(
              (
                [t, s, score, date],
              ) => (

                <div
                  className="recent-row"
                  key={t}
                >

                  <div className="mini-file">
                    <FileText size={17} />
                  </div>

                  <div>

                    <strong>
                      {t}
                    </strong>

                    <small>
                      {s} · {date}
                    </small>

                  </div>

                  <b>
                    {score}
                  </b>

                  <ChevronRight size={15} />

                </div>

              ),
            )}

          </div>

        </section>

      </div>


      <section className="agent-overview">

        <div className="card-heading">

          <div>

            <h2>
              Panel performance
            </h2>

            <p>
              How each interviewer is scoring you
            </p>

          </div>

          <Link
            href="/analytics"
            className="text-link"
          >
            Detailed analytics
            <ArrowRight size={14} />
          </Link>

        </div>


        <div className="overview-grid">

          {agents.map(
            (a) => (

              <div
                className="overview-agent"
                key={a.name}
              >

                <AgentPill
                  agent={a}
                />

                <div className="score-line">

                  <span
                    style={{
                      width:
                        `0%`,
                    }}
                  />

                  <b>
                    
                  </b>

                </div>

              </div>

            ),
          )}

        </div>

      </section>

    </AppShell>
  )
}


/* =========================================================
   Setup
   ========================================================= */

function Setup() {

  const [
    selected,
    setSelected,
  ] = useState(
    'Full panel',
  )


  const options = [
    'Full panel',
    'Technical',
    'Product',
    'Behavioural',
  ]


  return (
    <AppShell>

      <PageHeader
        eyebrow="New interview"
        title="Configure your interview"
      >

        <span className="save-note">
          <Check size={15} />
          Settings autosaved
        </span>

      </PageHeader>


      <div className="setup-layout">

        <section className="setup-card">

          <h2>
            Interview format
          </h2>

          <p>
            Choose who you&apos;d like to meet today.
          </p>


          <div className="format-options">

            {options.map(
              (
                x,
                i,
              ) => (

                <button
                  className={
                    selected === x
                      ? 'selected'
                      : ''
                  }
                  key={x}
                  onClick={() =>
                    setSelected(x)
                  }
                >

                  <span>

                    {i === 0
                      ? <Users size={20} />
                      : i === 1
                        ? <Code2 size={20} />
                        : i === 2
                          ? <Lightbulb size={20} />
                          : <Brain size={20} />}

                  </span>

                  <div>

                    <strong>
                      {x}
                    </strong>

                    <small>
                      {i === 0
                        ? 'All four interviewers'
                        : `${x} interviewer only`}
                    </small>

                  </div>

                  {selected === x && (
                    <Check size={17} />
                  )}

                </button>

              ),
            )}

          </div>


          <div className="form-row">

            <label>

              Role you&apos;re applying for

              <input
                placeholder="e.g. Senior Product Designer"
              />

            </label>


            <label>

              Experience level

              <select>

                <option>
                  Mid-level (3–5 years)
                </option>

                <option>
                  Senior (5+ years)
                </option>

              </select>

            </label>

          </div>


          <label className="textarea-label">

            Anything else we should know?

            <span>
              Optional
            </span>

            <textarea
              placeholder="Paste a job description or add context for your panel..."
            />

          </label>


          <Link
            href="/interview/live"
            className="button button-primary button-full"
          >
            Start interview
            <ArrowRight size={17} />
          </Link>

        </section>


        <aside className="prep-card">

          <div className="prep-icon">
            <Sparkles />
          </div>

          <h3>
            Make the most of it
          </h3>

          <p>
            Your panel will ask follow-up questions and adapt
            to your answers in real time.
          </p>

          <ul>

            <li>
              <Check size={15} />
              Find a quiet space
            </li>

            <li>
              <Check size={15} />
              Allow 25–35 minutes
            </li>

            <li>
              <Check size={15} />
              Speak your answers out loud
            </li>

          </ul>

        </aside>

      </div>

    </AppShell>
  )
}


/* =========================================================
   Legacy Live
   ========================================================= */

function Live() {

  const [
    ended,
    setEnded,
  ] = useState(false)


  const [
    muted,
    setMuted,
  ] = useState(false)


  return (
    <div className="live-page">

      <header className="live-header">

        <Logo />

        <div className="live-status">

          <span className="live-dot" />

          Panel active

          <b>
            18:42
          </b>

        </div>

        <button
          className="button button-dark"
          onClick={() =>
            setEnded(true)
          }
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

              Excellent connection

            </span>

          </div>


          <div className="speaker">

            <div className="speaker-orb">

              <Brain size={38} />

              <div className="sound-bars">
                <i />
                <i />
                <i />
                <i />
              </div>

            </div>


            <h1>
              Behavioural Interviewer
            </h1>

            <p>
              Exploring your leadership and collaboration style
            </p>


            <div className="speaking">

              <span />
              <span />
              <span />
              <span />

              Speaking

            </div>

          </div>


          <div className="live-controls">

            <button
              className={`control ${
                muted
                  ? 'on'
                  : ''
              }`}
              onClick={() =>
                setMuted(!muted)
              }
            >
              <Headphones size={20} />
            </button>

            <button
              className="control end"
              onClick={() =>
                setEnded(true)
              }
            >
              <X size={21} />
            </button>

            <button className="control">
              <MessageSquare size={20} />
            </button>

          </div>

        </div>


        <aside className="transcript">

          <div className="transcript-head">

            <strong>
              Live transcript
            </strong>

            <span>

              <span className="live-dot" />

              Live

            </span>

          </div>


          <div className="transcript-body">

            <div className="transcript-line agent">

              <span>
                BI
              </span>

              <div>

                <small>
                  Behavioural Interviewer
                </small>

                <p>
                  Tell me about a time you had to navigate
                  a disagreement with a teammate. What was
                  your approach?
                </p>

              </div>

            </div>


            <div className="transcript-line user">

              <span>
                AM
              </span>

              <div>

                <small>
                  You
                </small>

                <p>
                  I started by making sure I understood their
                  perspective. We scheduled time to talk
                  one-on-one...
                </p>

              </div>

            </div>


            <div className="typing">

              <i />
              <i />
              <i />

              PanelAI is listening

            </div>

          </div>


          <div className="transcript-tip">

            <Zap size={15} />

            Take your time. There&apos;s no rush.

          </div>

        </aside>

      </main>


      {ended && (

        <div className="modal-backdrop">

          <div className="end-modal">

            <button
              className="close-modal"
              onClick={() =>
                setEnded(false)
              }
            >
              <X />
            </button>

            <div className="modal-icon">
              <Check />
            </div>

            <h2>
              End this interview?
            </h2>

            <p>
              Your progress is saved. You&apos;ll receive your
              full panel feedback when processing is complete.
            </p>

            <div className="modal-actions">

              <button
                className="button button-ghost"
                onClick={() =>
                  setEnded(false)
                }
              >
                Keep going
              </button>

              <Link
                href="/interview/result"
                className="button button-primary"
              >
                End & review
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

        </div>

      )}

    </div>
  )
}

function Result() {
  const [
    open,
    setOpen,
  ] = useState<number | null>(0)

  const {
    result: contextResult,
    interviewSession,
    elapsedTime,
  } = useInterview()

  /*
   * Result can come from Context after the final
   * panel evaluation, OR directly from the backend.
   *
   * This prevents the result page from showing
   * "Evaluation unavailable" just because React
   * state was lost during navigation.
   */

  const [
    backendResult,
    setBackendResult,
  ] = useState<any>(null)

  const [
    isFetchingResult,
    setIsFetchingResult,
  ] = useState(false)

  const [
    resultError,
    setResultError,
  ] = useState<string | null>(null)


  /*
   * Context result has priority.
   */

  const result =
    contextResult ||
    backendResult


  /* =======================================================
     Fetch evaluation from backend
     ======================================================= */

  useEffect(() => {

    /*
     * If Context already contains the evaluation,
     * there is nothing to fetch.
     */

    if (contextResult) {
      return
    }


    const sessionId =
      interviewSession?.session_id


    /*
     * We need the backend session ID.
     */

    if (!sessionId) {

      setResultError(
        'Interview session was not found. Please complete a new interview.',
      )

      return
    }


    let cancelled = false


    const fetchEvaluation =
      async () => {

        try {

          setIsFetchingResult(
            true,
          )

          setResultError(
            null,
          )


          console.log(
            '[PanelAI] Fetching final evaluation:',
            sessionId,
          )


          /*
           * Your backend exposes final evaluation
           * through this API call.
           */

          const evaluation =
            await api.evaluateInterview(
              sessionId,
            )


          if (
            !cancelled
          ) {

            console.log(
              '[PanelAI] Backend evaluation received:',
              evaluation,
            )


            setBackendResult(
              evaluation,
            )

          }

        } catch (
          error
        ) {

          console.error(
            '[PanelAI] Evaluation fetch failed:',
            error,
          )


          if (
            !cancelled
          ) {

            setResultError(
              error instanceof Error
                ? error.message
                : 'Unable to load interview evaluation.',
            )

          }

        } finally {

          if (
            !cancelled
          ) {

            setIsFetchingResult(
              false,
            )

          }

        }

      }


    void fetchEvaluation()


    return () => {

      cancelled =
        true

    }

  }, [
    contextResult,
    interviewSession?.session_id,
  ])


  /* =======================================================
     Helpers
     ======================================================= */

  const getNumber = (
    ...values: unknown[]
  ): number => {

    for (
      const value of values
    ) {

      if (
        typeof value === 'number' &&
        Number.isFinite(value)
      ) {

        return value

      }


      if (
        typeof value === 'string' &&
        value.trim() !== ''
      ) {

        const parsed =
          Number(value)


        if (
          Number.isFinite(parsed)
        ) {

          return parsed

        }

      }

    }


    return 0
  }


  const getText = (
    ...values: unknown[]
  ): string => {

    for (
      const value of values
    ) {

      if (
        typeof value === 'string' &&
        value.trim()
      ) {

        return value.trim()

      }

    }


    return ''
  }


  /* =======================================================
     Overall score
     ======================================================= */

  const overallScore =
    getNumber(
      result?.overall_score,
      result?.overallScore,
      result?.score,
      result?.total_score,
      result?.totalScore,
    )


  /* =======================================================
     Backend scores
     ======================================================= */

  const backendScores =
    result?.agent_scores ||
    result?.agentScores ||
    result?.scores ||
    {}


  const getAgentScore = (
    backendId: string,
    frontendId: string,
  ): number => {

    return getNumber(
      backendScores?.[backendId],
      backendScores?.[frontendId],
      result?.[backendId],
      result?.[frontendId],
    )
  }


  const novaScore =
    getAgentScore(
      'technical',
      'technical',
    )


  const miraScore =
    getAgentScore(
      'behavioral',
      'behavioural',
    )


  const atlasScore =
    getAgentScore(
      'system_design',
      'product',
    )


  const byteScore =
    getAgentScore(
      'coding',
      'hiring',
    )


  const toPercent = (
    score: number,
  ): number => {

    /*
     * Backend evaluator uses 0–10.
     * UI uses 0–100.
     */

    if (
      score <= 10
    ) {

      return Math.round(
        score * 10,
      )

    }


    return Math.round(
      score,
    )
  }


  const panelScores = {
    technical:
      toPercent(novaScore),

    behavioural:
      toPercent(miraScore),

    product:
      toPercent(atlasScore),

    hiring:
      toPercent(byteScore),
  }


  /* =======================================================
     Recommendation
     ======================================================= */

  const recommendation =
    getText(
      result?.recommendation,
      result?.decision,
      result?.result,
    )


  const performanceTitle =
    recommendation ||
    (
      overallScore >= 85
        ? 'Strong performance'
        : overallScore >= 70
          ? 'Good performance'
          : overallScore >= 55
            ? 'Solid foundation'
            : 'Room to improve'
    )


  /* =======================================================
     Observations
     ======================================================= */

  const observations =
    result?.agent_observations ||
    result?.agentObservations ||
    result?.observations ||
    {}


  const backendStrengths =
    Array.isArray(
      result?.strengths,
    )
      ? result.strengths
      : []


  const backendImprovements =
    Array.isArray(
      result?.improvements,
    )
      ? result.improvements
      : Array.isArray(
          result?.areas_to_improve,
        )
        ? result.areas_to_improve
        : Array.isArray(
            result?.areasToImprove,
          )
          ? result.areasToImprove
          : []


  const observationTexts =
    Object.values(
      observations || {},
    )
      .flatMap(
        (value: any) => {

          if (
            Array.isArray(value)
          ) {

            return value

          }


          if (
            typeof value === 'string'
          ) {

            return [
              value,
            ]

          }


          if (
            value &&
            typeof value === 'object'
          ) {

            return [
              value.feedback,
              value.observation,
              value.comment,
              value.notes,
            ].filter(
              Boolean,
            )

          }


          return []

        },
      )
      .map(
        (value) =>
          String(value),
      )
      .filter(
        Boolean,
      )


  const strengths =
    backendStrengths.length > 0

      ? backendStrengths.map(
          (item: any) =>
            typeof item === 'string'
              ? item
              : item?.text ||
                item?.title ||
                item?.feedback ||
                String(item),
        )

      : observationTexts.slice(
          0,
          3,
        )


  const improvements =
    backendImprovements.map(
      (item: any) =>
        typeof item === 'string'
          ? item
          : item?.text ||
            item?.title ||
            item?.feedback ||
            String(item),
    )


  /* =======================================================
     Feedback
     ======================================================= */

  const feedbackItems =
    improvements.map(
      (
        item: string,
        index: number,
      ) => {

        const parts =
          item.split(':')


        return {

          title:
            parts.length > 1
              ? parts[0].trim()
              : `Improvement ${index + 1}`,

          description:
            parts.length > 1
              ? parts
                  .slice(1)
                  .join(':')
                  .trim()
              : item,

        }

      },
    )


  /* =======================================================
     Metadata
     ======================================================= */

  const durationMinutes =
    Math.max(
      0,
      Math.round(
        elapsedTime / 60,
      ),
    )


  const format =
    interviewSession?.format ||
    interviewSession?.interview_format ||
    'full-panel'


  const experience =
    interviewSession?.experience ||
    '—'


  const hasResult =
    Boolean(result)


  /* =======================================================
     Loading
     ======================================================= */

  if (
    isFetchingResult &&
    !result
  ) {

    return (
      <AppShell>

        <PageHeader
          eyebrow="Interview complete · Today"
          title="Your panel debrief"
        />

        <div
          style={{
            minHeight:
              '400px',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            flexDirection:
              'column',

            gap:
              '14px',
          }}
        >

          <div className="eyebrow">
            Loading evaluation
          </div>

          <p
            style={{
              opacity:
                0.65,
            }}
          >
            Fetching your results from the PanelAI backend...
          </p>

        </div>

      </AppShell>
    )

  }


  /* =======================================================
     Render
     ======================================================= */

  return (
    <AppShell>

      <PageHeader
        eyebrow="Interview complete · Today"
        title="Your panel debrief"
      >

        <Link
          href="/interview/setup"
          className="button button-primary"
        >

          <Plus size={17} />

          New interview

        </Link>

      </PageHeader>


      {/* =================================================
          HERO
          ================================================= */}

      <div className="result-hero">

        <div className="overall-score">

          <div className="score-ring">

            <strong>

              {hasResult
                ? Math.round(
                    overallScore,
                  )
                : '—'}

            </strong>

            <span>
              /100
            </span>

          </div>


          <div>

            <div className="eyebrow">
              Overall panel score
            </div>

            <h2>

              {hasResult
                ? performanceTitle
                : 'Evaluation unavailable'}

            </h2>

            <p>

              {hasResult

                ? recommendation
                  ? `Panel recommendation: ${recommendation}.`
                  : 'Your evaluation has been completed by the interview panel.'

                : resultError ||
                  'No completed backend evaluation is available for this interview.'}

            </p>

          </div>

        </div>


        <div className="result-meta">

          <span>

            <Clock3 size={15} />

            {durationMinutes > 0
              ? `${durationMinutes} min`
              : '—'}

          </span>


          <span>

            <Users size={15} />

            {format === 'full-panel'
              ? 'Full panel'
              : String(format)}

          </span>


          <span>

            <Target size={15} />

            {experience}

          </span>

        </div>

      </div>


      {/* =================================================
          SCORES
          ================================================= */}

      <div className="result-grid">

        <section className="dash-card">

          <div className="card-heading">

            <div>

              <h2>
                Panel scores
              </h2>

              <p>
                Scores calculated by the backend evaluation
              </p>

            </div>

          </div>


          {agents.map(
            (a) => {

              const score =
                panelScores[
                  a.id as keyof typeof panelScores
                ] || 0


              return (

                <div
                  className="result-agent"
                  key={a.name}
                >

                  <AgentPill
                    agent={a}
                  />


                  <div className="result-bar">

                    <span
                      style={{
                        width:
                          `${score}%`,
                      }}
                    />

                  </div>


                  <strong>

                    {hasResult
                      ? `${score}%`
                      : '—'}

                  </strong>

                </div>

              )

            },
          )}

        </section>


        {/* =================================================
            IMPROVEMENTS
            ================================================= */}

        <section className="dash-card feedback-card">

          <div className="card-heading">

            <div>

              <h2>
                What to work on
              </h2>

              <p>
                Your highest-impact improvements
              </p>

            </div>

          </div>


          {feedbackItems.length > 0

            ? feedbackItems.map(
                (
                  item: {
      title: string
      description: string
    },
                  i:number,
                ) => (

                  <button
                    className="feedback-item"
                    onClick={() =>
                      setOpen(
                        open === i
                          ? null
                          : i,
                      )
                    }
                    key={
                      `${item.title}-${i}`
                    }
                  >

                    <div>

                      <span>
                        {i + 1}
                      </span>

                      <strong>
                        {item.title}
                      </strong>

                      {open === i && (

                        <p>
                          {item.description}
                        </p>

                      )}

                    </div>


                    <ChevronDown
                      className={
                        open === i
                          ? 'rotate'
                          : ''
                      }
                      size={17}
                    />

                  </button>

                ),
              )

            : (

              <div
                style={{
                  padding:
                    '20px 0',

                  opacity:
                    0.65,

                  fontSize:
                    '14px',
                }}
              >

                {hasResult
                  ? 'No specific improvement areas were returned by the backend.'
                  : 'Complete the full panel to generate your evaluation.'}

              </div>

            )}

        </section>

      </div>


      {/* =================================================
          STRENGTHS
          ================================================= */}

      <section className="strengths">

        <div className="strength">

          <span className="strength-icon">
            <Check />
          </span>

          <div>

            <h3>
              Strengths
            </h3>

            <p>

              {strengths.length > 0

                ? strengths
                    .slice(
                      0,
                      3,
                    )
                    .join(
                      ' · ',
                    )

                : hasResult

                  ? 'No specific strengths were returned by the backend.'

                  : 'Complete the interview to see your strengths.'}

            </p>

          </div>

        </div>


        {/* =================================================
            NEXT FOCUS
            ================================================= */}

        <div className="strength improve">

          <span className="strength-icon">
            <TrendingUp />
          </span>

          <div>

            <h3>
              Next focus
            </h3>

            <p>

              {improvements.length > 0

                ? improvements
                    .slice(
                      0,
                      3,
                    )
                    .map(
                      (
                        item: string,
                      ) =>
                        item
                          .split(':')[0]
                          .trim(),
                    )
                    .join(
                      ' · ',
                    )

                : hasResult

                  ? 'Keep practicing and review the panel feedback above.'

                  : 'Complete the interview to see your next focus areas.'}

            </p>

          </div>

        </div>

      </section>

    </AppShell>
  )
}
/* =========================================================
   History
   ========================================================= */

function History() {

  return (
    <AppShell>

      <PageHeader
        eyebrow="Your practice archive"
        title="Interview history"
      >

        <Link
          href="/interview/setup"
          className="button button-primary"
        >
          <Plus size={17} />
          New interview
        </Link>

      </PageHeader>


      <div className="history-toolbar">

        <div className="search-box">

          <Target size={16} />

          <input
            placeholder="Search interviews..."
          />

        </div>


        <select>

          <option>
            All formats
          </option>

          <option>
            Full panel
          </option>

          <option>
            Technical
          </option>

        </select>


        <select>

          <option>
            Newest first
          </option>

          <option>
            Highest score
          </option>

        </select>

      </div>


      <section className="history-table">

        <div className="table-head">

          <span>
            Interview
          </span>

          <span>
            Format
          </span>

          <span>
            Date
          </span>

          <span>
            Score
          </span>

          <span />

        </div>


        {[
          [
            'Senior Frontend Engineer',
            'Full panel',
            'Sep 3, 2025',
            '92%',
          ],
          [
            'Product Manager',
            'Full panel',
            'Sep 2, 2025',
            '86%',
          ],
          [
            'Software Engineer',
            'Technical',
            'Aug 28, 2025',
            '78%',
          ],
          [
            'Senior Product Designer',
            'Product',
            'Aug 21, 2025',
            '84%',
          ],
          [
            'Engineering Manager',
            'Behavioural',
            'Aug 14, 2025',
            '81%',
          ],
        ].map(
          (r) => (

            <div
              className="table-row"
              key={r[0]}
            >

              <div>

                <span className="mini-file">
                  <FileText size={16} />
                </span>

                <strong>
                  {r[0]}
                </strong>

              </div>

              <span>
                {r[1]}
              </span>

              <span>
                {r[2]}
              </span>

              <b>
                {r[3]}
              </b>

              <ChevronRight size={16} />

            </div>

          ),
        )}

      </section>

    </AppShell>
  )
}


/* =========================================================
   Analytics
   ========================================================= */

function Analytics() {

  const [
    range,
    setRange,
  ] = useState(
    '30 days',
  )


  return (
    <AppShell>

      <PageHeader
        eyebrow="Your progress"
        title="Analytics"
      >

        <div className="range-toggle">

          {[
            '7 days',
            '30 days',
            '90 days',
          ].map(
            (x) => (

              <button
                className={
                  range === x
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setRange(x)
                }
                key={x}
              >
                {x}
              </button>

            ),
          )}

        </div>

      </PageHeader>


      <div className="analytics-stats">

        <Stat
          icon={TrendingUp}
          label="Average score"
          value="84%"
          change="+8%"
        />

        <Stat
          icon={Target}
          label="Best category"
          value="91%"
          change="Hiring manager"
        />

        <Stat
          icon={Zap}
          label="Improvement"
          value="+22%"
          change="Since first session"
        />

      </div>


      <div className="analytics-grid">

        <section className="dash-card big-chart">

          <div className="card-heading">

            <div>

              <h2>
                Score progression
              </h2>

              <p>
                Your panel score is trending upward
              </p>

            </div>

            <span className="chart-legend">

              <i />

              Overall score

            </span>

          </div>


          <div className="analytics-chart">

            <div className="big-number">

              84

              <small>
                /100
              </small>

            </div>


            <svg
              viewBox="0 0 700 190"
              preserveAspectRatio="none"
            >

              <path
                d="M0 160 C50 164 74 142 112 148 S170 126 205 134 S255 115 300 120 S340 85 380 100 S430 76 470 80 S520 62 550 67 S610 38 700 25"
                fill="none"
                stroke="#ff1493"
                strokeWidth="4"
              />

              <path
                d="M0 160 C50 164 74 142 112 148 S170 126 205 134 S255 115 300 120 S340 85 380 100 S430 76 470 80 S520 62 550 67 S610 38 700 25 L700 190 L0 190Z"
                fill="#ff1493"
                opacity=".08"
              />

            </svg>

          </div>

        </section>


        <section className="dash-card categories">

          <div className="card-heading">

            <div>

              <h2>
                By category
              </h2>

              <p>
                Across all interviews
              </p>

            </div>

          </div>


          {[
            ['Communication', 88],
            ['Problem solving', 84],
            ['Leadership', 91],
            ['Product sense', 78],
            ['Technical depth', 76],
          ].map(([x, n]) => (
            <div className="category" key={x as string}>
              <div>
                <span>{x}</span>
                <b>{n}%</b>
              </div>

              <div className="progress">
                <span
                  style={{
                    width: `${n}%`,
                  }}
                />
              </div>
            </div>
          ))}

        </section>

      </div>

    </AppShell>
  )
}


/* =========================================================
   Auth
   ========================================================= */

function Auth({
  signup = false,
}: {
  signup?: boolean
}) {

  return (
    <div className="auth-page">

      <div className="auth-left">

        <Logo />

        <div className="auth-testimonial">

          <div className="eyebrow">
            <Sparkles size={14} />
            Interview smarter
          </div>

          <h1>
            Confidence is
            <br />
            <em>
              practice.
            </em>
          </h1>

          <p>
            PanelAI gives you the practice, perspective,
            and feedback to walk into your next interview ready.
          </p>

          <div className="mini-panel">

            {agents.map(
              (a) => (
                <AgentPill
                  agent={a}
                  key={a.name}
                />
              ),
            )}

          </div>

        </div>

        <span className="auth-foot">
          © 2025 PanelAI
        </span>

      </div>


      <div className="auth-form">

        <div className="auth-form-inner">

          <div className="mobile-auth-logo">
            <Logo />
          </div>


          <div className="auth-heading">

            <h2>
              {signup
                ? 'Create your account'
                : 'Welcome back'}
            </h2>

            <p>
              {signup
                ? 'Start practicing with your personal AI panel.'
                : 'Your next great interview starts here.'}
            </p>

          </div>


          <button className="social-button">
            <span>
              G
            </span>

            Continue with Google
          </button>


          <div className="or">
            <span>
              or continue with email
            </span>
          </div>


          <label>

            Email address

            <input
              type="email"
              placeholder="you@example.com"
            />

          </label>


          <label>

            Password

            <div className="password-input">

              <input
                type="password"
                placeholder="At least 8 characters"
              />

              <button
                aria-label="Show password"
              >
                <ChevronDown size={16} />
              </button>

            </div>

          </label>


          {signup && (

            <div className="password-strength">
              <span />
              <span />
              <span />
              <span />
            </div>

          )}


          <button className="button button-primary button-full">

            {signup
              ? 'Create account'
              : 'Log in'}

            <ArrowRight size={16} />

          </button>


          <p className="switch-auth">

            {signup
              ? 'Already have an account?'
              : 'Don’t have an account?'}

            {' '}

            <Link
              href={
                signup
                  ? '/login'
                  : '/signup'
              }
            >

              {signup
                ? 'Log in'
                : 'Sign up'}

            </Link>

          </p>

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   Router
   ========================================================= */

export default function Page() {

  const path =
    usePathname()


  if (
    path === '/login'
  ) {
    return <Auth />
  }


  if (
    path === '/signup'
  ) {
    return (
      <Auth signup />
    )
  }


  if (
    path === '/dashboard'
  ) {
    return <Dashboard />
  }


  if (
    path === '/interview/setup'
  ) {
    return <Setup />
  }


  if (
    path === '/interview/live'
  ) {
    return <Live />
  }


  if (
    path === '/interview/result'
  ) {
    return <Result />
  }


  if (
    path === '/history'
  ) {
    return <History />
  }


  if (
    path === '/analytics'
  ) {
    return <Analytics />
  }


  return <Landing />
}