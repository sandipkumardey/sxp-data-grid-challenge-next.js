import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ThemeProvider } from "@/components/providers/theme-provider";
import "./globals.css";

// Primary sans-serif font
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: 'swap'
});

// Monospace font
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Lynk - Modern Job Application Dashboard",
  description: "A modern dashboard for managing job applications with advanced filtering, sorting, and analytics capabilities.",
  keywords: ["job search", "applications", "dashboard", "career", "hiring"],
  authors: [{ name: "Your Name" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} font-mono antialiased min-h-screen bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </ThemeProvider>
      </body>
    </html>
  );
}
