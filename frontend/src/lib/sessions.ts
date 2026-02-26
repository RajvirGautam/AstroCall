import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Session } from "@/types";

export async function createSession(
  userId: string,
  userName: string,
  astroId: string,
  astroName: string
): Promise<string> {
  const roomName = `room_${userId}_${astroId}_${Date.now()}`;
  const ref = await addDoc(collection(db, "sessions"), {
    userId,
    userName,
    astroId,
    astroName,
    status: "pending",
    startedAt: null,
    endedAt: null,
    durationSeconds: 0,
    roomName,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function startSession(sessionId: string) {
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "active",
    startedAt: Date.now(),
  });
}

export async function endSession(sessionId: string, startedAt: number | null) {
  const endedAt = Date.now();
  const durationSeconds = startedAt ? Math.floor((endedAt - startedAt) / 1000) : 0;
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "ended",
    endedAt,
    durationSeconds,
  });
  return { endedAt, durationSeconds };
}

export async function declineSession(sessionId: string) {
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "declined",
  });
}

export async function cancelSession(sessionId: string) {
  await updateDoc(doc(db, "sessions", sessionId), {
    status: "declined",
  });
}

export async function submitReview(
  sessionId: string,
  userId: string,
  userName: string,
  astroId: string,
  rating: number,
  comment: string
) {
  await addDoc(collection(db, "reviews"), {
    sessionId,
    userId,
    astroId,
    userName,
    rating,
    comment,
    createdAt: Date.now(),
  });

  // Update astrologer rating average
  // (In production, use a Cloud Function for atomic updates)
  const { getDoc, doc: getDocRef, runTransaction } = await import("firebase/firestore");
  const astroRef = doc(db, "astrologers", astroId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(astroRef);
    if (!snap.exists()) return;
    const data = snap.data();
    const total = (data.totalReviews || 0) + 1;
    const newRating = ((data.rating || 0) * (total - 1) + rating) / total;
    tx.update(astroRef, { rating: Math.round(newRating * 10) / 10, totalReviews: total });
  });
}
