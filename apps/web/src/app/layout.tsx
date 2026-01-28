import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VibeCoder - AI Code Marketplace",
  description: "Buy and sell AI-generated code and software. Discover high-quality components, APIs, and tools created with AI assistance.",
  keywords: ["AI", "code", "marketplace", "components", "APIs", "software", "developer", "tools"],
  authors: [{ name: "VibeCoder" }],
  openGraph: {
    title: "VibeCoder - AI Code Marketplace",
    description: "Buy and sell AI-generated code and software",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
