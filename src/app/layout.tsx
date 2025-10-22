import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Job Applications Dashboard | SXP Data Grid Challenge",
  description: "A sophisticated data grid implementation with Next.js and AG Grid",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
              {children}
            </div>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
