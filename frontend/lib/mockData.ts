import type { AgentId } from '@/types/agent'
export const QUESTIONS: Record<AgentId, string[]> = {
 technical:['Explain how you would design a rate limiter for a high-traffic API.','How would you design a scalable notification system?'],
 product:['How would you improve a food delivery application?','How would you prioritize a roadmap with limited resources?'],
 hiring:['Tell me about a time you led a difficult project.','How do you help a team recover from a missed goal?'],
 behavioural:['Tell me about a time you disagreed with a teammate.','Describe a situation where you had to adapt quickly.'],
}
