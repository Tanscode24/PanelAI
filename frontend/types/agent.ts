export type AgentId = 'technical' | 'product' | 'hiring' | 'behavioural'
export type AgentStatus = 'waiting' | 'listening' | 'thinking' | 'speaking'
import type { LucideIcon } from 'lucide-react'
export type Agent = { id: AgentId; name: string; focus: string[]; short: string; color: 'blue' | 'teal' | 'amber' | 'pink'; icon: LucideIcon; score: number }
