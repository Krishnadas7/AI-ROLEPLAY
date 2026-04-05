# 🎭 AI Roleplay

> An AI-powered roleplay training platform for telecom support scenarios. Practice real customer conversations with an AI persona, get instant voice responses, and receive detailed performance scores.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
  - [Root `.env`](#root-env)
  - [Backend `.env`](#backend-env)
  - [Frontend `.env`](#frontend-env)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Pages & Screens](#pages--screens)
- [Data Models](#data-models)
- [Deployment](#deployment)

---

## Overview

AI Roleplay is a full-stack web application that simulates real customer support interactions. Trainees identify themselves, choose a scenario (e.g. a customer whose phone was stolen), and have a live voice conversation with an AI agent powered by Claude. At the end of the session, the system evaluates the conversation and generates a scored rubric covering:

- **Relevance** — Did the trainee address the customer's actual problem?
- **Clarity** — Were responses clear and easy to understand?
- **Completeness** — Was all necessary information provided?
- **Confidence** — Did the trainee sound confident and in control?

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| Axios | HTTP client |
| React Router DOM v7 | Client-side routing |
| Web Speech API | Voice input (microphone) & TTS output |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Anthropic SDK (Claude) | AI conversation engine |
| Zod | Request validation |
| Morgan | HTTP request logging |
| CORS | Cross-origin resource sharing |
| dotenv | Environment variable loading |

---

## Project Structure

```
AI-ROLEPLAY/
├── .env                        ← Root env overview (project-wide config reference)
├── .env.example                ← Root env template (safe to commit)
├── README.md
│
├── frontend/                   ← React + TypeScript (Vite)
│   ├── .env                    ← Frontend env (Vite variables)
│   ├── .env.example            ← Frontend env template
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── vercel.json             ← Vercel deployment config
│   └── src/
│       ├── App.tsx             ← Root component + screen state manager
│       ├── main.tsx            ← Entry point
│       ├── api/                ← Axios API call functions
│       ├── axios/              ← Axios instance configuration
│       ├── components/         ← Reusable UI components
│       ├── pages/              ← Top-level page containers
│       │   ├── HomePage.tsx
│       │   ├── RoleplayPage.tsx
│       │   ├── ScorePage.tsx
│       │   ├── NotFoundPage.tsx
│       │   └── ServerErrorPage.tsx
│       ├── screens/            ← Screen-level UI layouts
│       └── utils/              ← Shared utility functions
│
└── backend/                    ← Node.js + Express REST API
    ├── .env                    ← Backend env (secrets live here)
    ├── .env.example            ← Backend env template
    ├── index.js                ← Server entry point
    ├── app.js                  ← Express app setup (CORS, routes, middleware)
    ├── config/                 ← DB connection configuration
    ├── controllers/            ← Route handler logic
    ├── middlewares/            ← Custom middleware (error handler, etc.)
    ├── models/                 ← Mongoose schemas
    │   ├── ScenarioModel.js
    │   ├── MessageModel.js
    │   └── ScoreModel.js
    ├── routes/                 ← Express route definitions
    │   ├── roleplayRoutes.js
    │   ├── sessionRoutes.js
    │   └── userRoutes.js
    ├── services/               ← Business logic & AI service layer
    └── validations/            ← Zod validation schemas
```

---

## Environment Configuration

The project uses **three levels** of `.env` files. Each is independent and must be configured separately.

---

### Root `.env`

Located at: `AI-ROLEPLAY/.env`

This file is a **project-wide reference** — it documents deployment URLs and points to where the real config lives. It is **not loaded by any application** directly.

```env
PROJECT_NAME=AI-ROLEPLAY
PROJECT_VERSION=1.0.0

# Deployment URLs
FRONTEND_URL=https://ai-roleplay-1.onrender.com
BACKEND_URL=https://ai-roleplay-api.onrender.com
LOCAL_FRONTEND_URL=http://localhost:5173
LOCAL_BACKEND_URL=http://localhost:3000

NODE_ENV=development
```

> ℹ️ See `.env.example` at the root for the full template.

---

### Backend `.env`

Located at: `AI-ROLEPLAY/backend/.env`

Loaded by `dotenv` in `index.js`. Contains all server secrets.

| Variable | Required | Description | Example |
|---|---|---|---|
| `NODE_ENV` | ✅ | App environment | `development` \| `production` |
| `PORT` | ✅ | Express server port | `3000` |
| `DB` | ✅ | MongoDB Atlas connection string | `mongodb+srv://...` |
| `DB1` | ➖ | Local MongoDB connection (fallback) | `mongodb://localhost:27017/airoleplay` |
| `CLAUDE_API_KEY` | ✅ | Anthropic API key for Claude | `sk-ant-api03-...` |
| `AI_MODEL` | ✅ | Claude model version to use | `claude-3-haiku-20240307` |

```env
# AI-ROLEPLAY / backend / .env

NODE_ENV=development
PORT=3000
DB=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/airoleplay
DB1=mongodb://localhost:27017/airoleplay
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx
AI_MODEL=claude-3-haiku-20240307
```

> ⚠️ Never commit the real `backend/.env` to Git. Use `backend/.env.example` as the safe template.

---

### Frontend `.env`

Located at: `AI-ROLEPLAY/frontend/.env`

Loaded automatically by Vite. All variables **must** be prefixed with `VITE_` to be accessible in the browser.

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_APP_BASE_URL` | ✅ | Base URL for all API calls | `http://localhost:3000/api/v1` |

```env
# AI-ROLEPLAY / frontend / .env

# Local development
VITE_APP_BASE_URL=http://localhost:3000/api/v1

# Production (swap when deploying)
# VITE_APP_BASE_URL=https://ai-roleplay-api.onrender.com/api/v1
```

> ⚠️ Never commit the real `frontend/.env` to Git. Use `frontend/.env.example` as the safe template.

---

## Getting Started

### Prerequisites

- Node.js `>= 18`
- npm `>= 9`
- MongoDB Atlas account (or local MongoDB)
- Anthropic API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/AI-ROLEPLAY.git
cd AI-ROLEPLAY
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# → Fill in DB, CLAUDE_API_KEY, AI_MODEL in backend/.env

# Frontend
cp frontend/.env.example frontend/.env
# → Fill in VITE_APP_BASE_URL in frontend/.env
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run in development

```bash
# Terminal 1 — Backend (from /backend)
npm run dev
# → Server starts at http://localhost:3000

# Terminal 2 — Frontend (from /frontend)
npm run dev
# → App starts at http://localhost:5173
```

---

## API Reference

**Base URL:** `http://localhost:3000/api/v1`

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |

### User

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/user/identify` | Identify or register a user by name & email |

### Roleplay

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/message` | Send a message to the AI and receive a response |

### Session

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/session/start` | Start a new roleplay session |
| `POST` | `/session/end` | End a session and trigger AI scoring |
| `GET` | `/session/history` | Get session history for a user |
| `GET` | `/session/:sessionId/details` | Get full details & score for a session |

---

## Pages & Screens

| Page | Route / Screen | Description |
|---|---|---|
| `HomePage` | `home` | User identification, scenario selection, session history |
| `RoleplayPage` | `roleplay` | Live voice/text conversation with the AI persona |
| `ScorePage` | `score` | Post-session performance rubric and feedback |
| `NotFoundPage` | `404` | Not found error state |
| `ServerErrorPage` | `500` | Server error fallback state |

Navigation is managed via a screen state machine in `App.tsx` (no URL-based routing).

---

## Data Models

### Scenario
```
title         String   — Scenario display name
description   String   — Scenario context/brief
aiPersona:
  name        String   — AI character name
  age         Number   — AI character age
  tone        String   — AI conversation tone
```

### Message
```
sessionId     ObjectId (ref: Session)
sender        String   — "user" | "ai"
text          String   — Message content
timestamp     Date
```

### Score
```
sessionId     ObjectId (ref: Session)
overallScore  Number   — Aggregate score (0–100)
criteria:
  relevance     Number
  clarity       Number
  completeness  Number
  confidence    Number
feedback:
  relevance     String  — AI-generated feedback per criterion
  clarity       String
  completeness  String
  confidence    String
summary         String  — Overall session summary
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Render / Vercel | `https://ai-roleplay-1.onrender.com` |
| Backend | Render | `https://ai-roleplay-api.onrender.com` |
| Database | MongoDB Atlas | Configured via `DB` env variable |

### CORS Allowed Origins (backend)

The backend explicitly allows requests from:
- `https://ai-roleplay-1.onrender.com` (production frontend)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (local backend)

To add a new origin, update `allowedOrigins` in `backend/app.js`.

---

> Built with ❤️ using React, Express, and Claude AI.
