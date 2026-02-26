import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, identity } = await req.json();

    const apiKey = process.env.LK_API_KEY;
    const apiSecret = process.env.LK_API_SECRET;
    const wsUrl = process.env.LK_WS_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "LiveKit not configured" }, { status: 500 });
    }

    const roomName = `session_${sessionId}`;
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
    return NextResponse.json({ token, wsUrl });
  } catch (err: any) {
    console.error("Token error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
