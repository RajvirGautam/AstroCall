# 🔮 AstroCall — Live Video Consultations with Astrologers

A full-stack, production-ready MVP platform for real-time video and audio consultations with certified astrologers. Built with **Next.js 14**, **Firebase** (Auth & Firestore), **LiveKit Cloud** (WebRTC), and **Tailwind CSS**.

---

## ✨ Advanced MVP Features

The current iteration of AstroCall has advanced significantly from its initial foundation, now featuring a robust suite of tools for both users and astrologers:

### 🔐 Authentication & Roles
*   **Role-Based Access Control:** Secure Firebase Auth distinguishing between `user`, `astrologer`, and `admin` roles, directing users to isolated dashboard environments.
*   **Session Management:** Persistent login states with secure token validation across route protections.

### 🎥 Real-Time Communication
*   **HD Video/Audio Calls:** Powered by LiveKit Cloud for low-latency, high-quality WebRTC streaming.
*   **Global Call Notifications:** An advanced `GlobalCallAlert` system that listens to Firestore changes to notify users of incoming calls across *any* route/page in the app.
*   **In-Call Controls:** Toggle microphone/camera, real-time connection status, and precise session duration timers.

### 💼 Dashboards & Management
*   **Astrologer Dashboard:** Toggle online/offline status, edit profile bio, track earnings, and view a history of completed sessions and reviews.
*   **User Dashboard:** View past calls, submit post-call ratings, review past interactions, and monitor active sessions.
*   **Admin Panel:** Promote standard users to verified astrologers and view system-wide logs.

### 🌟 Discovery & Engagement
*   **Astrologer Directory:** Live online status indicators, dynamically calculated ratings, specialties, and language filters.
*   **Post-Call Rating System:** Integrated 1–5 star reviews with comments, dynamically updating the astrologer's aggregate rating.
*   **Dynamic UI Elements:** Beautiful, responsive glass-morphism designs including a `GlassNavBar` and an interactive `StarCanvas` background.

---

## 🏗️ Architecture

AstroCall uses a modern serverless architecture optimized for real-time data flow and low maintenance overhead:

*   **Frontend (Next.js 14 App Router):** Provides Server-Side Rendering (SSR) for robust SEO on public pages (like the Astrologer Directory) and static generation where applicable.
*   **Backend / API:** Next.js API Routes handle secure server-side logic, specifically communicating with the LiveKit Server SDK to mint JWTs for secure video room access. Firebase Cloud Functions (`functions/src/index.ts`) operate as event-driven background workers (e.g., aggregating session data when a call ends).
*   **Database (Firebase Firestore):** A NoSQL strictly-typed schema ensures instant synchronization of call status, rating updates, and user states across all connected clients via websocket listeners.
*   **WebRTC Infrastructure (LiveKit):** Bypasses the complexity of maintaining custom TURN/STUN servers. Next.js APIs generate tokens, while the React frontend connects directly to LiveKit's global edge network.

---

## 🤔 Technical Decisions

1.  **Firebase Firestore over SQL:** Selected for its out-of-the-box real-time document listeners. Features like the `GlobalCallAlert` and live online status indicators are trivial to implement securely using Firestore snapshot listeners compared to building a custom WebSocket server.
2.  **LiveKit over Raw WebRTC:** Writing raw WebRTC is error-prone, especially handling network reconnections, mobile network hopping, and browser inconsistencies. LiveKit provides a stable, declarative React SDK (`@livekit/components-react`) that abstracts this complexity.
3.  **Next.js App Router:** Chose Next.js for its built-in API routes. Minting LiveKit tokens requires a backend to securely hold the `LK_API_SECRET`. By using Next.js, we eliminate the need for a separate Node/Express backend infrastructure for the MVP.
4.  **Tailwind CSS + Custom UI Components:** Eliminated heavy component libraries in favor of raw Tailwind combined with custom-built React components (like `GlassNavBar` and `RatingModal`) to maintain strict control over the cosmic "glassmorphism" aesthetic.

---

## 🤖 AI Usage Notes

In alignment with the PRD, AI tools were utilized minimally and strategically to accelerate development without compromising architectural integrity:

*   **UI & Boilerplate Generation:** Generative AI was primarily used to quickly scaffold React components, Tailwind utility classes, and boilerplate layouts (e.g., generating the complex CSS required for the `StarCanvas` animation and the initial `GlassNavBar` responsive states).
*   **Minimal Logic Interference:** Core business logic—such as the Next.js API token generation, Firebase security rules (`firestore.rules`), and the complex state management of the `GlobalCallAlert`—were authored and orchestrated manually to ensure security and exact adherence to the product requirements.
*   **Debugging & Refactoring:** AI served as a pair-programming assistant to resolve specific React dependency array warnings, type-check TS interfaces, and format the comprehensive Firebase schema structure.

---

## 🚀 Setup & Local Development

### 1. Requirements
*   Node.js 20+
*   Firebase Project (Auth, Firestore, Functions, Hosting)
*   LiveKit Cloud Project

### 2. Environment Variables (`.env.local`)
Create `.env.local` inside the `frontend/` directory.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

LK_API_KEY=your_livekit_api_key
LK_API_SECRET=your_livekit_api_secret
LK_WS_URL=wss://your-project.livekit.cloud
```

### 3. Installation & Execution

```bash
# Clone the repository
git clone <repo_url>
cd astro-call

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev
# → http://localhost:3050
```

*Note: Cloud functions run separately. Ensure Firebase CLI is installed and configured if deploying backend logic.*

---

## 📁 Core Firestore Schema

```typescript
users/{uid}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── role: "user" | "astrologer" | "admin"
  └── createdAt: number

astrologers/{uid}     // Additional data linked to users
  ├── name: string
  ├── bio: string
  ├── specialties: string[]
  ├── isOnline: boolean
  ├── rating: number
  └── totalCalls: number

sessions/{id}
  ├── userId: string
  ├── astroId: string
  ├── status: "pending" | "active" | "ended"
  ├── roomName: string
  ├── startedAt: number | null
  └── durationSeconds: number
```

---
*Built with ✨ cosmic intention*
