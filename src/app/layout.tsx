import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: "EatoAI",
  description:
    "EatoAI – Smart Health Assistant | Recipe Generator & Meal Planner",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="favicon.ico" />
        <meta name="theme-color" content="#ff6b00" />
      </head>

      {/* 
        ❗ NO HEADER HERE  
        Header must be loaded only on dashboard pages (after login)
      */}
      
      <body className="min-h-screen bg-background text-foreground antialiased">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
