# PanelAI

> AI-powered software engineering panel interviews with specialized AI interviewers, real-time voice interaction, automatic scoring, and final evaluation.

## 🚀 Overview

PanelAI is an AI-powered technical interview platform designed to simulate a realistic software engineering panel interview.

Instead of interacting with a single interviewer, candidates can go through multiple specialized interview agents, each responsible for a different area of the interview.

PanelAI currently supports:

- Technical interviews
- Behavioral interviews
- System design interviews
- Coding interviews
- Real-time voice interaction
- Dynamic interview questions
- Interview transcript collection
- Automatic agent scoring
- Final interview evaluation
- Multi-agent panel progression

The platform uses **Agora Conversational AI** for real-time AI interviewer interaction.

---

## ✨ Features

### 🤖 AI Interview Panel

PanelAI supports multiple specialized interview agents:

| Agent | Focus |
|---|---|
| NOVA | Technical |
| MIRA | Behavioral |
| ATLAS | System Design |
| BYTE | Coding |

For a full-panel interview, the agents are executed in sequence.

```text
Candidate
    │
    ▼
┌──────────────┐
│    NOVA      │
│  Technical   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    MIRA      │
│  Behavioral  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    ATLAS     │
│ System Design│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    BYTE      │
│    Coding    │
└──────┬───────┘
       │
       ▼
 Final Evaluation
