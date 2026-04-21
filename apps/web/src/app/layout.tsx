import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import AppShell from "@/components/AppShell";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import { PlannerProvider } from "@/context/PlannerContext";
import { PomodoroProvider } from "@/context/PomodoroContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Weatherwise Planner",
  description: "A wellness planner with live weather and USD/COP updates powered by a Railway worker and Supabase Realtime.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a1a1a" />
        <link rel="icon" href="/icon-192.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/opendyslexic" />
      </head>
      <body className="h-full">
        <ClerkProvider>
          <PlannerProvider>
            <PomodoroProvider>
              <AppShell>{children}</AppShell>
            </PomodoroProvider>
          </PlannerProvider>
        </ClerkProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
