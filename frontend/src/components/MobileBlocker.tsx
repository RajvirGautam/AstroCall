"use client";
import { Laptop, Tablet } from "lucide-react";
import { useEffect, useState } from "react";

export default function MobileBlocker() {
    const [isStrictMobile, setIsStrictMobile] = useState(false);

    useEffect(() => {
        // Run on mount to catch "Request Desktop Site" bypassers by checking raw screen physical width
        const checkScreen = () => {
            if (window.screen.width < 768) {
                setIsStrictMobile(true);
            } else {
                setIsStrictMobile(false);
            }
        };
        checkScreen();
        window.addEventListener("resize", checkScreen);
        return () => window.removeEventListener("resize", checkScreen);
    }, []);

    // Combine Tailwind's md:hidden (for regular viewport sizing) with our strict JS check
    // If isStrictMobile is true, force flex regardless of tailwind breakpoints.
    return (
        <div className={`fixed inset-0 z-[99999] flex-col items-center justify-center bg-[#05020e]/85 backdrop-blur-xl p-8 text-center animate-in fade-in duration-500 ${isStrictMobile ? 'flex' : 'flex md:hidden'}`}>

            {/* Decorative floating shapes in background of modal */}
            <div className="absolute w-[300px] h-[300px] rounded-full bg-purple-900/20 blur-[80px] -z-10" />

            <div className="flex gap-4 mb-8 text-[#e9d5ff]">
                <Laptop className="w-10 h-10 animate-pulse" style={{ animationDelay: "0ms" }} />
                <Tablet className="w-10 h-10 animate-pulse" style={{ animationDelay: "500ms" }} />
            </div>

            <h1
                className="text-3xl font-black mb-4 text-white tracking-wider"
                style={{ fontFamily: "'Cinzel',serif" }}
            >
                Larger Screen Required
            </h1>

            <p
                className="text-[#c4b5fd] text-lg font-body leading-relaxed max-w-sm italic"
                style={{ fontFamily: "'Cormorant Garamond',serif" }}
            >
                The cosmos is vast, and so should be your viewing window. <br /><br />
                Please switch to a laptop, tablet, or monitor for a seamless cosmic connection.
            </p>

            <div className="mt-8 pt-6 border-t border-purple-900/30">
                <p className="text-[#6b7280] text-xs font-mono uppercase tracking-widest">
                    Mobile device detected
                </p>
                <p className="text-[#4b5563] text-[10px] mt-2 max-w-[240px] mx-auto">
                    Note: Desktop mode on small screens is explicitly unsupported to preserve the cosmic experience.
                </p>
            </div>
        </div>
    );
}
