export type UserRole = "user" | "astrologer" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: number;
}

export interface Astrologer {
  uid: string;
  name: string;
  bio: string;
  photoURL: string;
  languages: string[];
  specialties: string[];
  isOnline: boolean;
  rating: number;
  totalReviews: number;
  totalCalls: number;
  ratePerMinute: number; // in credits/INR
}

export interface Session {
  id: string;
  userId: string;
  astroId: string;
  astroName: string;
  userName: string;
  status: "pending" | "active" | "ended" | "declined";
  startedAt: number | null;
  endedAt: number | null;
  durationSeconds: number;
  roomName: string;
  createdAt?: number;
}

export interface Review {
  id: string;
  sessionId: string;
  userId: string;
  astroId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: number;
}
