"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { fetchRoadmap } from "@/lib/api";
import { RoadmapResponse } from "@/lib/types";
import { PageTransition, CardAnimation, AnimatedButton, GlassCard, GlowChip } from "@/components/Animations";
import { Target, Calendar, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RoadmapPage() {
    const [role, setRole] = useState("Software Development Engineer (SDE-1)");
    const [weeks, setWeeks] = useState(4);
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);

    const loadRoadmap = async () => {
        setLoading(true);
        try {
            const data = await fetchRoadmap(role, weeks);
            setRoadmap(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoadmap();
    }, []);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        loadRoadmap();
    };

    return (
        <div className="min-h-screen bg-[#F4ECE6] text-[#1c1c1a] flex flex-col font-sans">
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageTransition>
                    <div className="space-y-8">
                        <header className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 text-[#f05e38] text-sm font-semibold uppercase tracking-wider"
                            >
                                <Target className="w-5 h-5" /> Sarvagya Path Module
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-800">
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Placement Preparation</span> <span className="gradient-text">Roadmap</span>
                            </h1>
                            <p className="text-[#334155] text-base md:text-lg max-w-2xl font-light">
                                Customized weekly prep schedule with daily problem recommendations aligned to your target job timeline.
                            </p>
                        </header>

                        {/* Config Form */}
                        <GlassCard delay={0.1} hover={false} className="p-6 bg-white border border-neutral-200/50">
                            <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Target Role</label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full border border-neutral-200 bg-white rounded-2xl px-4 py-3 text-sm outline-none text-[#1c1c1a]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Duration</label>
                                    <select
                                        value={weeks}
                                        onChange={(e) => setWeeks(Number(e.target.value))}
                                        className="border border-neutral-200 bg-white rounded-2xl px-4 py-3 text-sm outline-none text-[#1c1c1a]"
                                    >
                                        <option value={4}>4 Weeks Prep</option>
                                        <option value={8}>8 Weeks Prep</option>
                                        <option value={12}>12 Weeks Intensive</option>
                                    </select>
                                </div>
                                <AnimatedButton onClick={() => {}} className="flex items-center justify-center gap-2 py-3 px-6 shrink-0 bg-[#f05e38] text-white hover:bg-[#ff7c5c]">
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                                    <span>Generate Plan</span>
                                </AnimatedButton>
                            </form>
                        </GlassCard>

                        {/* Weeks Display */}
                        {roadmap && (
                            <div className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl bg-[#f05e38]/8 border border-[#f05e38]/20 text-[#f05e38] text-sm font-medium"
                                >
                                    🎯 <strong>Strategy Overview:</strong> {roadmap.overall_strategy}
                                </motion.div>

                                <div className="space-y-6">
                                    {roadmap.weeks.map((week) => (
                                        <CardAnimation key={week.week} delay={0.1 * week.week}>
                                            <div className="bg-white border border-neutral-200/50 rounded-3xl p-6 space-y-4 shadow-sm">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-neutral-100 pb-3 gap-2">
                                                    <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                                                        <motion.span
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ type: "spring", delay: 0.1 * week.week }}
                                                            className="w-8 h-8 rounded-xl bg-[#f05e38] text-white font-bold text-xs flex items-center justify-center shadow-sm"
                                                        >
                                                            W{week.week}
                                                        </motion.span>
                                                        <span>{week.title}</span>
                                                    </h3>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {week.focus_areas.map((fa, idx) => (
                                                            <GlowChip key={idx} color="orange">
                                                                {fa}
                                                            </GlowChip>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                                    {week.daily_tasks.map((dt, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.05 * idx + 0.1 * week.week }}
                                                            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                                                            className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/60 space-y-2 hover:border-[#f05e38]/40 transition-colors duration-300"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-bold uppercase text-[#f05e38]">{dt.day}</span>
                                                                <span className="text-[10px] text-neutral-500 font-medium">{dt.topic}</span>
                                                            </div>
                                                            <p className="text-xs text-neutral-800 font-medium leading-snug">{dt.task}</p>
                                                            <span className="text-[10px] text-indigo-600 font-semibold block pt-2 border-t border-neutral-100">
                                                                Target: {dt.problem}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardAnimation>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </PageTransition>
            </main>
        </div>
    );
}
