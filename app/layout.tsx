import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PWAProvider } from "@/context/PWAContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Book Exchange",
  description: "Buy and sell used books instantly.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2C3E50",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import PageTransition from "@/components/PageTransition";

// ... imports ...

import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import BottomNav from "@/components/BottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 md:pb-0`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <PWAProvider>
            <PageTransition>
              {children}
            </PageTransition>
            <BottomNav />
            <PWAInstallPrompt />
            <ServiceWorkerRegister />
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
