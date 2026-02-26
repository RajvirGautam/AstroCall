import type { Metadata } from "next";
import "@/styles/globals.css";
import "@livekit/components-styles";
import { AuthProvider } from "@/hooks/useAuth";


export const metadata: Metadata = {
  title: "AstroCall – Connect with the Stars",
  description: "Live video calls with certified astrologers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
