"use client";
import React, { useRef, useEffect } from "react";

interface StarParticle {
    x: number; y: number; bx: number; by: number;
    r: number; op: number; speed: number; phase: number;
    vx: number; vy: number;
}

export default function StarCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<StarParticle[]>([]);
    const mouseRef = useRef({ x: -999, y: -999 });
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const cv = canvasRef.current; if (!cv) return;
        const ctx = cv.getContext("2d")!;
        const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
        resize();
        window.addEventListener("resize", resize);
        starsRef.current = Array.from({ length: 260 }, () => {
            const bx = Math.random() * 100, by = Math.random() * 100;
            const tier = Math.random();
            return {
                x: bx, y: by, bx, by,
                r: tier > 0.9 ? 1.6 + Math.random() * 0.8 : tier > 0.6 ? 0.8 + Math.random() * 0.6 : 0.2 + Math.random() * 0.4,
                op: 0.15 + Math.random() * 0.7,
                speed: 0.3 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2, vx: 0, vy: 0,
            };
        });
        const onMove = (e: MouseEvent) => { mouseRef.current = { x: (e.clientX / cv.width) * 100, y: (e.clientY / cv.height) * 100 }; };
        window.addEventListener("mousemove", onMove);
        const draw = (ts: number) => {
            ctx.clearRect(0, 0, cv.width, cv.height);
            const mx = mouseRef.current.x, my = mouseRef.current.y;
            starsRef.current.forEach(s => {
                const dx = s.bx - mx, dy = s.by - my, dist = Math.hypot(dx, dy);
                if (dist < 10) { const f = (10 - dist) / 10; s.vx += Math.cos(Math.atan2(dy, dx)) * f * 0.5; s.vy += Math.sin(Math.atan2(dy, dx)) * f * 0.5; }
                s.vx += (s.bx - s.x) * 0.04; s.vy += (s.by - s.y) * 0.04;
                s.vx *= 0.88; s.vy *= 0.88; s.x += s.vx * 0.15; s.y += s.vy * 0.15;
                const op = s.op * (0.5 + 0.5 * Math.sin(ts / 1000 * s.speed + s.phase));
                // Larger stars get a tiny colour tint
                if (s.r > 1.2) ctx.fillStyle = `rgba(220,200,255,${op})`;
                else ctx.fillStyle = `rgba(255,255,255,${op})`;
                ctx.beginPath(); ctx.arc((s.x / 100) * cv.width, (s.y / 100) * cv.height, s.r, 0, Math.PI * 2); ctx.fill();
            });
            rafRef.current = requestAnimationFrame(draw);
        };
        rafRef.current = requestAnimationFrame(draw);
        return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
    }, []);
    return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />;
}
