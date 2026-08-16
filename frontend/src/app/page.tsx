"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { PageTransition, CardAnimation, AnimatedButton, GlassCard, GlowChip, SectionReveal } from "@/components/Animations";
import { BarChart3, BrainCircuit, Target, ArrowRight, Zap, Sparkles, Code2 } from "lucide-react";
import { motion } from "framer-motion";

const coreFeatures = [
  {
    name: "Sarvagya ATS",
    description: "Scan your resume against job descriptions, calculate match percentages, and fix critical keyword gaps.",
    icon: BarChart3,
    href: "/resume",
    badge: "AI Powered",
    color: "neon" as const,
  },
  {
    name: "Sarvagya Prep",
    description: "Interactive mock interviews tailored to your target role with instant feedback on answer quality.",
    icon: BrainCircuit,
    href: "/interview",
    badge: "Interactive",
    color: "purple" as const,
  },
  {
    name: "Sarvagya Path",
    description: "Personalized placement roadmap and daily problem recommendations tailored to your timeline.",
    icon: Target,
    href: "/roadmap",
    badge: "Custom Plan",
    color: "blue" as const,
  },
  {
    name: "Practice Arena",
    description: "Quantitative aptitude quizzes and real-time DSA coding IDE evaluation.",
    icon: Code2,
    href: "/practice",
    badge: "Interactive IDE",
    color: "emerald" as const,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F4ECE6] text-[#1c1c1a] flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageTransition>
          <div className="space-y-16 py-4">
            {/* Hero Section */}
            <header className="text-center space-y-6 pt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-[#2563eb] text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-sm shadow-sm"
              >
                <Sparkles className="w-4 h-4 animate-spin text-[#2563eb]" style={{ animationDuration: '3s' }} />
                NVIDIA NIM Accelerated Engine
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-6xl md:text-8xl font-black tracking-tighter"
              >
                <span className="text-[#0f172a]">SARVAGYA</span><span className="text-[#2563eb]">.AI</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-lg md:text-2xl text-[#334155] max-w-3xl mx-auto font-light leading-relaxed"
              >
                Your all-knowing career & placement assistant. Harness artificial intelligence to audit resumes, master technical interviews, and execute daily preparation roadmaps.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="pt-4 flex justify-center gap-4"
              >
                <Link href="/resume">
                  <AnimatedButton variant="primary" className="flex items-center gap-2 text-base px-8 py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-md">
                    Launch Platform <ArrowRight className="w-5 h-5" />
                  </AnimatedButton>
                </Link>
              </motion.div>
            </header>

            {/* Core Feature Cards */}
            <SectionReveal>
              <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {coreFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <CardAnimation key={feature.name} delay={index * 0.1}>
                      <Link href={feature.href} className="group block h-full">
                        <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 h-full flex flex-col justify-between hover:border-[#2563eb]/40 hover:shadow-lg transition-all duration-300">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="p-3 rounded-2xl bg-blue-50 text-[#2563eb] border border-blue-100 group-hover:border-[#2563eb]/30 group-hover:shadow-sm transition-all duration-300">
                                <Icon className="w-6 h-6" />
                              </div>
                              <GlowChip color="blue">
                                {feature.badge}
                              </GlowChip>
                            </div>

                            <div className="space-y-2">
                              <h3 className="text-xl font-bold tracking-tight text-[#0f172a] group-hover:text-[#2563eb] transition-colors duration-300">
                                {feature.name}
                              </h3>
                              <p className="text-[#475569] leading-relaxed text-xs">
                                {feature.description}
                              </p>
                            </div>
                          </div>

                          <div className="pt-6 flex items-center text-[#2563eb] font-bold text-xs group-hover:translate-x-1.5 transition-transform duration-300">
                            Explore Module <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </div>
                        </div>
                      </Link>
                    </CardAnimation>
                  );
                })}
              </section>
            </SectionReveal>

            {/* Streak & Stats Banner */}
            <SectionReveal delay={0.2}>
              <CardAnimation delay={0.4}>
                <section className="bg-white border border-neutral-200/60 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left shadow-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-[#2563eb]">
                      <Zap className="w-5 h-5 fill-[#2563eb]" />
                      <span className="font-bold uppercase tracking-wider text-xs">Placement Streak</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#0f172a]">Daily Consistency Tracker</h2>
                    <p className="text-[#475569] text-xs max-w-md">Solve daily coding challenges and practice mock interview questions to stay placement-ready.</p>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 px-8 py-5 rounded-2xl text-center shadow-inner">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.6 }}
                      className="text-5xl font-black text-[#2563eb] block"
                    >
                      7
                    </motion.span>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-[#475569] mt-1">Days Streak</p>
                  </div>
                </section>
              </CardAnimation>
            </SectionReveal>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}