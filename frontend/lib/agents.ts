import type { AgentId } from '@/types/agent'

import {
  Code2,
  Network,
  Users,
  Wrench,
} from 'lucide-react'

import type {
  LucideIcon,
} from 'lucide-react'


export type AgentConfig = {
  id: AgentId
  name: string
  short: string
  role: string
  displayName: string
  description: string
  focus: string

  /*
   * Existing live page uses:
   * agent.color.join(' ')
   */
  color: string[]

  icon: LucideIcon
}


/* =========================================================
   AGENTS
   ========================================================= */

export const AGENTS: AgentConfig[] = [

  {
    id: 'technical',

    name: 'NOVA',

    short: 'NOVA',

    role: 'Technical Interviewer',

    displayName: 'Technical',

    description:
      'Evaluates technical knowledge, problem solving, and engineering fundamentals.',

    focus:
      'Technical Knowledge & Problem Solving',

    color: [
      'bg-blue-500',
      'text-blue-400',
      'border-blue-500/30',
    ],

    icon: Wrench,
  },


  {
    id: 'behavioural',

    name: 'MIRA',

    short: 'MIRA',

    role: 'Behavioural Interviewer',

    displayName: 'Behavioural',

    description:
      'Evaluates communication, teamwork, leadership, and behavioural skills.',

    focus:
      'Communication & Behavioural Skills',

    color: [
      'bg-purple-500',
      'text-purple-400',
      'border-purple-500/30',
    ],

    icon: Users,
  },


  {
    id: 'product',

    name: 'ATLAS',

    short: 'ATLAS',

    role: 'System Design Interviewer',

    displayName: 'System Design',

    description:
      'Evaluates architecture, scalability, trade-offs, and system design thinking.',

    focus:
      'Architecture & System Design',

    color: [
      'bg-green-500',
      'text-green-400',
      'border-green-500/30',
    ],

    icon: Network,
  },


  {
    id: 'hiring',

    name: 'BYTE',

    short: 'BYTE',

    role: 'Coding Interviewer',

    displayName: 'Coding',

    description:
      'Evaluates coding ability, algorithms, data structures, and implementation.',

    focus:
      'Coding & Algorithms',

    color: [
      'bg-orange-500',
      'text-orange-400',
      'border-orange-500/30',
    ],

    icon: Code2,
  },

]


/* =========================================================
   LOOKUP BY ID
   ========================================================= */

export const AGENT_BY_ID: Record<
  AgentId,
  AgentConfig
> = {
  technical:
    AGENTS[0],

  behavioural:
    AGENTS[1],

  product:
    AGENTS[2],

  hiring:
    AGENTS[3],
}