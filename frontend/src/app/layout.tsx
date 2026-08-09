import React from 'react';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sarvagya | AI Placement Engine & Career Platform',
  description: 'Sarvagya is an AI-powered college placement platform for ATS resume scoring, AI mock interviews, automated roadmaps, and coding practice.',
  keywords: ['Sarvagya', 'AI Placement', 'ATS Resume Analyzer', 'AI Mock Interview', 'Placement Roadmap'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0b0f19] text-gray-100 min-h-screen font-sans antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
