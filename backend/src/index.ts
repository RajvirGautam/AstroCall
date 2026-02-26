import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { AccessToken } from "livekit-server-sdk";

admin.initializeApp();
const db = admin.firestore();

// ─── createRoomToken ─────────────────────────────────────────────────────────
// Called by the client to get a LiveKit JWT token for a session.
export const createRoomToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
  }

  const { sessionId, identity } = data as { sessionId: string; identity: string };
  if (!sessionId || !identity) {
    throw new functions.https.HttpsError("invalid-argument", "sessionId and identity required");
  }

  // Verify session exists
  const sessionSnap = await db.collection("sessions").doc(sessionId).get();
  if (!sessionSnap.exists) {
    throw new functions.https.HttpsError("not-found", "Session not found");
  }
  const session = sessionSnap.data()!;

  // Only allow session participants
  const uid = context.auth.uid;
  if (uid !== session.userId && uid !== session.astroId) {
    throw new functions.https.HttpsError("permission-denied", "Not a participant in this session");
  }

  const apiKey = process.env.LK_API_KEY || functions.config().livekit?.api_key;
  const apiSecret = process.env.LK_API_SECRET || functions.config().livekit?.api_secret;
  const wsUrl = process.env.LK_WS_URL || functions.config().livekit?.ws_url;

  if (!apiKey || !apiSecret || !wsUrl) {
    throw new functions.https.HttpsError("internal", "LiveKit not configured");
  }

  const roomName = session.roomName || `session_${sessionId}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    ttl: "2h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return { token, wsUrl };
});

// ─── onSessionEnded ───────────────────────────────────────────────────────────
// Firestore trigger: update astrologer stats when session ends
export const onSessionEnded = functions.firestore
  .document("sessions/{sessionId}")
  .onUpdate(async (change) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only run when status changes to "ended"
    if (before.status === after.status || after.status !== "ended") return;

    const { astroId, durationSeconds } = after;
    if (!astroId) return;

    const astroRef = db.collection("astrologers").doc(astroId);
    await astroRef.update({
      totalCalls: admin.firestore.FieldValue.increment(1),
    });

    functions.logger.info(`Session ended. Astro ${astroId}, duration: ${durationSeconds}s`);
  });

// ─── seedDemoData ─────────────────────────────────────────────────────────────
// HTTP function to seed demo astrologers (call once during setup)
export const seedDemoData = functions.https.onRequest(async (req, res) => {
  // Simple secret check
  if (req.query.secret !== "astrocall-seed-2024") {
    res.status(403).send("Forbidden");
    return;
  }

  const demoAstrologers = [
    {
      uid: "demo_astro_1",
      name: "Pandit Vikram Sharma",
      bio: "25+ years in Vedic astrology and Kundali analysis. Specializing in career and marriage predictions.",
      photoURL: "https://api.dicebear.com/7.x/personas/svg?seed=vikram",
      languages: ["Hindi", "English"],
      specialties: ["Vedic Astrology", "Kundali", "Marriage"],
      isOnline: true,
      rating: 4.8,
      totalReviews: 234,
      totalCalls: 567,
      ratePerMinute: 15,
    },
    {
      uid: "demo_astro_2",
      name: "Priya Nair",
      bio: "Expert in Tarot and numerology. Helps clients navigate life transitions and find their true path.",
      photoURL: "https://api.dicebear.com/7.x/personas/svg?seed=priya",
      languages: ["English", "Malayalam"],
      specialties: ["Tarot", "Numerology", "Relationships"],
      isOnline: true,
      rating: 4.9,
      totalReviews: 412,
      totalCalls: 890,
      ratePerMinute: 12,
    },
    {
      uid: "demo_astro_3",
      name: "Dr. Arjun Mehta",
      bio: "PhD in Sanskrit with 15 years of Jyotish practice. Expert in Lal Kitab and remedies.",
      photoURL: "https://api.dicebear.com/7.x/personas/svg?seed=arjun",
      languages: ["English", "Hindi", "Gujarati"],
      specialties: ["Lal Kitab", "Jyotish", "Remedies"],
      isOnline: false,
      rating: 4.7,
      totalReviews: 178,
      totalCalls: 340,
      ratePerMinute: 20,
    },
    {
      uid: "demo_astro_4",
      name: "Sunita Rao",
      bio: "Palmistry and face reading specialist. 20 years of experience helping clients understand their destiny.",
      photoURL: "https://api.dicebear.com/7.x/personas/svg?seed=sunita",
      languages: ["Telugu", "English", "Hindi"],
      specialties: ["Palmistry", "Face Reading", "Destiny"],
      isOnline: true,
      rating: 4.6,
      totalReviews: 95,
      totalCalls: 210,
      ratePerMinute: 10,
    },
  ];

  const batch = db.batch();
  for (const astro of demoAstrologers) {
    batch.set(db.collection("astrologers").doc(astro.uid), astro);
  }
  await batch.commit();

  res.send({ success: true, seeded: demoAstrologers.length });
});
