"use client";
import {
    useLocalParticipant,
    useRemoteParticipants,
    useTracks,
    VideoTrack,
    type TrackReference,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";

interface Props {
    onEndCall: () => void;
    callEnded: boolean;
    timerDisplay: string;
    otherName: string;
    chatOpen: boolean;
    setChatOpen: (v: boolean) => void;
}

export default function CustomCallRoom({
    onEndCall,
    callEnded,
    otherName,
    chatOpen,
}: Props) {
    const { localParticipant, microphoneTrack, cameraTrack, isMicrophoneEnabled, isCameraEnabled } =
        useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();

    // Remote camera tracks — withPlaceholder:false → only real TrackReference items
    const remoteCameraTracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: false }],
        { onlySubscribed: true }
    ).filter(t => !t.participant.isLocal) as TrackReference[];

    // Local camera track for PIP
    const localCameraTracks = useTracks(
        [{ source: Track.Source.Camera, withPlaceholder: false }],
        { onlySubscribed: false }
    ).filter(t => t.participant.isLocal) as TrackReference[];

    const toggleMic = () => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    const toggleCamera = () => localParticipant.setCameraEnabled(!isCameraEnabled);

    const remoteTrack = remoteCameraTracks[0];
    const localTrack = localCameraTracks[0];
    const remoteParticipant = remoteParticipants[0];

    return (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>

            {/* ── Remote video (full screen) ─────────────────────────────── */}
            <div style={{ flex: 1, position: "relative", background: "#0a0318", overflow: "hidden" }}>
                {remoteTrack ? (
                    <VideoTrack
                        trackRef={remoteTrack}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    /* Remote placeholder — no video yet */
                    <div style={{
                        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 16
                    }}>
                        <div style={{
                            width: 110, height: 110, borderRadius: "50%",
                            background: "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(245,158,11,0.12))",
                            border: "2px solid rgba(124,58,237,0.5)", display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: 46
                        }}>
                            🔮
                        </div>
                        <p style={{ fontFamily: "'Cinzel',serif", color: "#c084fc", fontSize: "0.9rem" }}>
                            {remoteParticipant ? `${otherName} connected` : `Waiting for ${otherName}…`}
                        </p>
                    </div>
                )}

                {/* ── PIP self-view — bottom right ─────────────────────────── */}
                <div style={{
                    position: "absolute",
                    bottom: 30,
                    right: chatOpen ? 30 : 30,
                    width: 140,
                    height: 180,
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "3px solid white",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    background: "#0d0520",
                    zIndex: 20,
                }}>
                    {localTrack ? (
                        <VideoTrack
                            trackRef={localTrack}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <VideoOff style={{ width: 24, height: 24, color: "#7c3aed" }} />
                        </div>
                    )}
                    {/* "You" label */}
                    <div style={{
                        position: "absolute", bottom: 6, left: 6,
                        background: "rgba(5,2,14,0.7)", borderRadius: 6,
                        padding: "2px 7px",
                    }}>
                        <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.55rem", color: "#c084fc", letterSpacing: "0.06em" }}>YOU</span>
                    </div>
                </div>
            </div>

            {/* ── Floating Control bar ───────────────────────────────────────────── */}
            <div style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
                background: "rgba(13, 5, 32, 0.8)", backdropFilter: "blur(20px)",
                padding: "8px 24px", borderRadius: 32,
                border: "1px solid rgba(139,92,246,0.15)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                zIndex: 30,
            }}>

                {/* Mic toggle */}
                <ControlBtn
                    onClick={toggleMic}
                    active={isMicrophoneEnabled}
                    activeIcon={<Mic style={{ width: 18, height: 18 }} />}
                    inactiveIcon={<MicOff style={{ width: 18, height: 18 }} />}
                />

                {/* Camera toggle */}
                <ControlBtn
                    onClick={toggleCamera}
                    active={isCameraEnabled}
                    activeIcon={<Video style={{ width: 18, height: 18 }} />}
                    inactiveIcon={<VideoOff style={{ width: 18, height: 18 }} />}
                />

                {/* End call — centre red button */}
                <button
                    onClick={onEndCall}
                    disabled={callEnded}
                    style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: callEnded ? "rgba(127,29,29,0.4)" : "linear-gradient(135deg, #ef4444, #dc2626)",
                        border: "none", cursor: callEnded ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: callEnded ? "none" : "0 4px 16px rgba(220,38,38,0.4)",
                        transition: "all 0.2s", opacity: callEnded ? 0.5 : 1, flexShrink: 0,
                        marginLeft: 8,
                    }}
                >
                    {/* phone-down icon  */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
                    </svg>
                </button>
            </div>

            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap');
      `}</style>
        </div>
    );
}

// ── Small reusable control button ─────────────────────────────────────────────
function ControlBtn({
    onClick, active, activeIcon, inactiveIcon,
}: {
    onClick: () => void;
    active: boolean;
    activeIcon: React.ReactNode;
    inactiveIcon: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                width: 40, height: 40, borderRadius: "50%",
                background: active ? "rgba(109,40,217,0.15)" : "rgba(220,38,38,0.12)",
                border: `1px solid ${active ? "rgba(139,92,246,0.3)" : "rgba(220,38,38,0.3)"}`,
                color: active ? "#e9d5ff" : "#f87171",
                cursor: "pointer", transition: "all 0.2s",
            }}
        >
            {active ? activeIcon : inactiveIcon}
        </button>
    );
}
