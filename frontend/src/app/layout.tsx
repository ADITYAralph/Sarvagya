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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#080808] text-gray-100 min-h-screen font-sans antialiased selection:bg-[#76B900]/30 selection:text-white">
        {/* Ambient Mesh Background */}
        <div className="ambient-mesh" aria-hidden="true" />
        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
