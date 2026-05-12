import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NovaMine",
  description: "Mining App built with Next.js + Firebase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      
      {/* ADS SCRIPT (Direct tag) */}
      <Script
        src="https://quge5.com/88/tag.min.js"
        strategy="afterInteractive"
        data-zone="238765"
        data-cfasync="false"
      />

      <body className="min-h-full flex flex-col bg-black text-white">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
