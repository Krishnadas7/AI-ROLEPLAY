# AI Roleplay Backend

This is the backend API for the AI Roleplay application, dynamically built with **Express**, **Mongoose**, and the **Anthropic Claude API** to power interactive, AI-driven roleplay scenarios.

## 🚀 Features
- **User Identification**: Automatically tracks sessions based on user identity (name/email).
- **Session Management**: Start, maintain, and end roleplay sessions natively.
- **AI Integration**: AI-powered interactive roleplay messaging using **Claude 3 Haiku**.
- **Session History & Evaluation**: View past sessions along with detailed evaluations and scores provided by the AI.

## 🛠️ Tech Stack
- **Server Environment**: Node.js
- **API Framework**: Express.js
- **Database & ODM**: MongoDB & Mongoose
- **AI Integrations**: `@anthropic-ai/sdk`
- **Middleware**: Morgan (logging), CORS (Cross-Origin Resource Sharing)

## 📦 Installation & Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables:**
   Copy the provided `.env.example` to a `.env` file and populate your configurations.
   ```bash
   cp .env.example .env
   ```
   **Required Variables:**
   ```env
   NODE_ENV=development
   PORT=3000
   DB=your_mongodb_connection_string
   CLAUDE_API_KEY=your_anthropic_api_key
   AI_MODEL=claude-3-haiku-20240307
   ```

3. **Start the server:**
   - **Development mode** (auto-reloads on edits using `nodemon`):
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```

## 🔗 API Documentation

The Base URL for all endpoints is `/api/v1`.

### 🩺 System & Health
- `GET /health` - Checks if the server is running.

### 👤 User Options
- `POST /user/identify` 
  - **Body Payload:** `{ name, email }`
  - Identify or register a user within the system.

### 🎮 Session Options
- `POST /session/start` 
  - **Body Payload:** `{ userId, scenarioId }`
  - Start a new roleplay session based on a predefined scenario.
- `POST /session/end` 
  - **Body Payload:** `{ sessionId }`
  - Terminate the session and trigger an AI evaluation/score.
- `GET /session/history?userId={id}` 
  - Retrieve the full history of a user's completed or in-progress sessions.
- `GET /session/:sessionId/details` 
  - Fetch deep analytics, messages, and evaluations for a specific session.

### 💬 Roleplay
- `POST /message` 
  - **Body Payload:** `{ sessionId, text }`
  - Send a user's roleplay prompt and await Claude's roleplayed response.
