# AI Roleplay Frontend

This is the frontend client for the **AI Roleplay** application, built to deliver a seamless, responsive, and highly interactive user experience. Features include voice capability for mobile and web, streamlined scenario selection, and real-time chat with the AI.

## 🛠️ Tech Stack & Architecture
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) for extremely fast hot-module replacement and builds.
- **Language**: TypeScript for strict typing and robustness.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a sleek, responsive, and utility-first design.
- **HTTP Client**: [Axios](https://axios-http.com/) to communicate back to the Node/Express server.
- **Icons**: [Lucide React](https://lucide.dev/) for crisp, scalable vectors.
- **Device Support**: Optimized for desktop and mobile, with secure HTTPS development tools (`@vitejs/plugin-basic-ssl`) included so mobile voice features (like the Microphone) can be tested locally over the network.

## 📂 Project Structure

- `/src/api` - Abstractions for all backend interactions (`roleplayApi.ts`).
- `/src/axios` - Preconfigured Axios instance containing request/response interceptors.
- `/src/screens` - Main UI views/pages (e.g., `HomeScreen`, `RoleplayScreen`).
- `/src/utils` - Helper functions including separated schema validations.
- `/src/App.tsx` - Main routing and component layout.

## 📦 Installation & Setup

1. **Install Dependencies**:
   Ensure you have Node.js installed, then run:
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` to set up your local development environment:
   ```bash
   cp .env.example .env
   ```
   **Required Configuration:**
   ```env
   # Base URL for the local or production backend API
   # Example: http://localhost:3000/api/v1
   VITE_APP_BASE_URL=http://localhost:3000/api/v1
   ```

3. **Start the Development Server**:
   Run Vite to serve the application locally:
   ```bash
   npm run dev
   ```
   *(Note: The server will typically start at `http://localhost:5173` or similar. Check your console output.)*

4. **Production Build**:
   To compile and minify for production deployments:
   ```bash
   npm run build
   ```

## 🎤 Key Features (Voice & Mobile Integration)
Because this application depends heavily on **Microphone and Speech Synthesis APIs**, Vite's Basic SSL plugin is enabled in development. This allows you to securely expose your local dev server securely across your network so you can test audio/voice functionalities directly on mobile devices!
