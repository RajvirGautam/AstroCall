# 🔮 AstroCall — Live Video Consultations with Astrologers

A full-stack, production-ready platform for real-time video calls with certified astrologers, built with **Next.js 14**, **Firebase**, **LiveKit Cloud**, and **Tailwind CSS**.

---

## ✨ Features

| Feature | Details |
|--------|---------|
| 🔐 Auth & Roles | Firebase Auth with `user` / `astrologer` / `admin` roles |
| 🔮 Astrologer Directory | Live online status, ratings, languages, specialties |
| 📹 HD Video Calls | LiveKit Cloud — mic/camera toggle, reconnect, end-call |
| ⏱️ Call Timer | Real-time session duration display |
| ⭐ Rating Modal | Post-call review with 1–5 stars + comment |
| 👤 User Dashboard | Past calls, reviews given, stats |
| 🌟 Astrologer Dashboard | Online/offline toggle, bio editor, earnings view |
| ⚙️ Admin Panel | Promote users to astrologers, full session log |
| 🔥 Firestore | Real-time data sync across all clients |
| ☁️ Cloud Functions | Secure JWT token generation for LiveKit rooms |

---

## 🗂️ Project Structure

```
astro-call/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── astrologers/page.tsx      # Astrologer listing
│   │   ├── call/[sessionId]/page.tsx # Video call room
│   │   ├── dashboard/
│   │   │   ├── user/page.tsx         # User dashboard
│   │   │   └── astrologer/page.tsx   # Astrologer dashboard
│   │   ├── admin/page.tsx            # Admin panel
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── api/token/route.ts        # NextJS API → LiveKit token
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── AstrologerCard.tsx
│   │   └── RatingModal.tsx
│   ├── hooks/
│   │   ├── useAuth.tsx               # AuthContext + Firebase Auth
│   │   └── useCallTimer.ts           # Live call duration timer
│   ├── lib/
│   │   ├── firebase.ts               # Firebase initialization
│   │   └── sessions.ts               # Firestore session helpers
│   ├── types/index.ts
│   └── styles/globals.css
├── functions/
│   └── src/index.ts                  # Firebase Cloud Functions
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
└── .env.local.example
```

---

## 🚀 Setup Guide

### 1. Clone & Install

```bash
git clone https://github.com/your-username/astro-call
cd astro-call
npm install

cd functions
npm install
cd ..
```

### 2. Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project → Enable **Authentication** (Email/Password)
3. Create **Firestore** database (production mode)
4. Enable **Firebase Hosting** + **Cloud Functions**
5. Get your Web App config from Project Settings

### 3. LiveKit Cloud

1. Sign up at [livekit.io](https://livekit.io)
2. Create a new project
3. Note your **API Key**, **API Secret**, and **WebSocket URL**

### 4. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# LiveKit (for Next.js API route)
LK_API_KEY=your_livekit_api_key
LK_API_SECRET=your_livekit_api_secret
LK_WS_URL=wss://your-project.livekit.cloud
```

### 5. Deploy Firebase Rules & Indexes

```bash
firebase login
firebase use --add   # Select your project
firebase deploy --only firestore:rules,firestore:indexes
```

### 6. Deploy Cloud Functions

```bash
# Set LiveKit secrets in Firebase config
firebase functions:config:set \
  livekit.api_key="YOUR_LK_API_KEY" \
  livekit.api_secret="YOUR_LK_API_SECRET" \
  livekit.ws_url="wss://your-project.livekit.cloud"

cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 7. Seed Demo Astrologers

After deploying functions, call the seed endpoint once:
```
https://your-region-your-project.cloudfunctions.net/seedDemoData?secret=astrocall-seed-2024
```

### 8. Create Test Accounts

Register these accounts at `/auth/register`:

| Email | Password | Role |
|-------|----------|------|
| user@demo.com | demo1234 | User |
| astro@demo.com | demo1234 | Astrologer |
| admin@demo.com | demo1234 | User → promote to Admin |

To promote admin, manually update in Firebase Console:
`users/{uid}` → set `role: "admin"`

### 9. Run Locally

```bash
npm run dev
# → http://localhost:3000
```

### 10. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## 📁 Firestore Schema

```
users/{uid}
  ├── uid: string
  ├── email: string
  ├── displayName: string
  ├── role: "user" | "astrologer" | "admin"
  ├── photoURL?: string
  └── createdAt: number

astrologers/{uid}
  ├── uid: string
  ├── name: string
  ├── bio: string
  ├── photoURL: string
  ├── languages: string[]
  ├── specialties: string[]
  ├── isOnline: boolean
  ├── rating: number
  ├── totalReviews: number
  ├── totalCalls: number
  └── ratePerMinute: number

sessions/{id}
  ├── userId: string
  ├── userName: string
  ├── astroId: string
  ├── astroName: string
  ├── status: "pending" | "active" | "ended"
  ├── roomName: string
  ├── startedAt: number | null
  ├── endedAt: number | null
  ├── durationSeconds: number
  └── createdAt: number

reviews/{id}
  ├── sessionId: string
  ├── userId: string
  ├── astroId: string
  ├── userName: string
  ├── rating: number (1–5)
  ├── comment: string
  └── createdAt: number
```

---

## 🔧 Cloud Functions

### `createRoomToken` (Callable)
- **Auth required**: Yes
- **Input**: `{ sessionId, identity }`
- **Output**: `{ token, wsUrl }`
- Verifies participant is part of session before issuing JWT

### `onSessionEnded` (Firestore Trigger)
- Fires when `sessions/{id}.status` → `"ended"`
- Increments `astrologers/{astroId}.totalCalls`

### `seedDemoData` (HTTP)
- Seeds 4 demo astrologers into Firestore
- Protected by query secret

---

## 🎨 Design System

- **Font Display**: Cinzel (serif, elegant)
- **Font Body**: Cormorant Garamond (italic serif)
- **Font Mono**: DM Mono
- **Theme**: Deep cosmic purple + gold accents
- **Animations**: Float, pulse-glow, star-twinkle, slide-up

---

## 📝 License

MIT — feel free to build your own constellation.

---

*Built with ✨ cosmic intention*
