import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PuzzleVerse', // Updated App Name
  description: 'An endless journey of challenging puzzle games.', // Updated Description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The 'light' or 'dark' class will be added dynamically to <html> by useTheme hook
    <html lang="en" className="light"> {/* Start with default light, hook will adjust */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}> {/* Removed bg-background */}
        {children}
        <Toaster /> {/* Add Toaster */}
      </body>
    </html>
  );
}
