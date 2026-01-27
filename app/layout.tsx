import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
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

import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 md:pb-0 bg-background text-foreground`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <PWAProvider>
            <div className="flex flex-col min-h-dvh">
              <Header />
              <main className="flex-grow pt-16">
                <PageTransition>{children}</PageTransition>
              </main>
              <Suspense fallback={null}>
                <BottomNav />
              </Suspense>
              <PWAInstallPrompt />
              <ServiceWorkerRegister />
            </div>
          </PWAProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
