"use client";

import Link from "next/link";
import { PageTransition, CardAnimation, AnimatedButton } from "@/components/Animations";
import { BarChart3, BrainCircuit, Target, ArrowRight, Zap, Sparkles } from "lucide-react";

const coreFeatures = [
  {
    name: "Sarvagya ATS",
    description: "Scan your resume against job descriptions, calculate match percentages, and fix critical keyword gaps.",
    icon: BarChart3,
    href: "/resume",
    badge: "AI Powered",
  },
  {
    name: "Sarvagya Prep",
    description: "Interactive mock interviews tailored to your target role with instant feedback on answer quality.",
    icon: BrainCircuit,
    href: "/interview",
    badge: "Interactive",
  },
  {
    name: "Sarvagya Path",
    description: "Personalized placement roadmap and daily problem recommendations tailored to your timeline.",
    icon: Target,
    href: "/roadmap",
    badge: "Custom Plan",
  },
];

export default function HomePage() {
  return (
    <PageTransition>
      <div className="space-y-20 py-8">
        {/* Hero Section */}
        <header className="text-center space-y-6 pt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A1A1A] border border-[#76B900]/30 text-[#76B900] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            NVIDIA NIM Accelerated Engine
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
            SARVAGYA<span className="text-[#76B900]">.AI</span>
          </h1>

          <p className="text-lg md:text-2xl text-[#999999] max-w-3xl mx-auto font-light leading-relaxed">
            Your all-knowing career & placement assistant. Harness artificial intelligence to audit resumes, master technical interviews, and execute daily preparation roadmaps.
          </p>

          <div className="pt-4 flex justify-center gap-4">
            <Link href="/resume">
              <AnimatedButton variant="primary" className="flex items-center gap-2 text-base px-8 py-4">
                Launch Platform <ArrowRight className="w-5 h-5" />
              </AnimatedButton>
            </Link>
          </div>
        </header>

        {/* Core Feature Cards */}
        <section className="grid md:grid-cols-3 gap-8">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <CardAnimation key={feature.name} delay={index * 0.15}>
                <Link href={feature.href} className="group block h-full">
                  <div className="bg-[#111111] border border-[#222222] rounded-3xl p-8 hover:border-[#76B900] transition-all duration-300 h-full flex flex-col justify-between group-hover:shadow-[0_0_30px_rgba(118,185,0,0.15)]">
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="p-4 rounded-2xl bg-[#1A1A1A] text-[#76B900] border border-[#333]">
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-mono text-[#999999] bg-[#1A1A1A] px-3 py-1 rounded-full border border-[#222]">
                          {feature.badge}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#76B900] transition-colors">
                          {feature.name}
                        </h3>
                        <p className="text-[#999999] leading-relaxed text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-8 flex items-center text-[#76B900] font-semibold text-sm group-hover:translate-x-1 transition-transform">
                      Explore Module <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              </CardAnimation>
            );
          })}
        </section>

        {/* Streak & Stats Banner */}
        <CardAnimation delay={0.5}>
          <section className="bg-[#111111] border border-[#222222] rounded-3xl p-10 neon-border flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 text-[#76B900]">
                <Zap className="w-5 h-5 fill-[#76B900]" />
                <span className="font-bold uppercase tracking-wider text-xs">Placement Streak</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">Daily Consistency Tracker</h2>
              <p className="text-[#999999] text-sm max-w-md">Solve daily coding challenges and practice mock interview questions to stay placement-ready.</p>
            </div>

            <div className="bg-[#000000] border border-[#333] px-10 py-6 rounded-2xl text-center">
              <span className="text-6xl font-black text-[#76B900]">12</span>
              <p className="text-xs uppercase font-bold tracking-widest text-[#999999] mt-1">Days Active</p>
            </div>
          </section>
        </CardAnimation>
      </div>
    </PageTransition>
  );
}