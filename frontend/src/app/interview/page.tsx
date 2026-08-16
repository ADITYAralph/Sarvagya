"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { fetchInterviewQuestions, evaluateInterviewAnswer } from "@/lib/api";
import { QuestionsResponse, AnswerEvalResult } from "@/lib/types";
import { PageTransition, CardAnimation, AnimatedButton, GlassCard, GlowChip } from "@/components/Animations";
import { BrainCircuit, Play, Send, RefreshCw, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function InterviewPage() {
    const [role, setRole] = useState("Software Development Engineer");
    const [level, setLevel] = useState("Entry-level");
    const [loadingQ, setLoadingQ] = useState(false);
    const [questionsData, setQuestionsData] = useState<QuestionsResponse | null>(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [evaluating, setEvaluating] = useState(false);
    const [evalResult, setEvalResult] = useState<AnswerEvalResult | null>(null);

    const handleGenerateQuestions = async () => {
        setLoadingQ(true);
        setEvalResult(null);
        setUserAnswer("");
        setCurrentQIndex(0);
        try {
            const data = await fetchInterviewQuestions(role, level);
            setQuestionsData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingQ(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim() || !questionsData) return;
        setEvaluating(true);
        try {
            const currentQ = questionsData.questions[currentQIndex]?.question || "";
            const res = await evaluateInterviewAnswer(role, currentQ, userAnswer);
            setEvalResult(res);
        } catch (err) {
            console.error(err);
        } finally {
            setEvaluating(false);
        }
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
                                <BrainCircuit className="w-5 h-5" /> Sarvagya Prep Module
                            </motion.div>
                            <h1 className="font-serif text-4xl md:text-5xl font-black tracking-tight">
                                <span className="bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent">AI Mock</span>{" "} <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Interviewer</span>
                            </h1>
                            <p className="text-[#334155] text-base md:text-lg max-w-2xl font-light">
                                Practice role-specific technical and behavioral questions evaluated in real time by NVIDIA Llama-3.3 AI models.
                            </p>
                        </header>

                        {/* Controls Panel */}
                        <GlassCard delay={0.1} className="p-6 bg-white border border-neutral-200/50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Target Role</label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full border border-neutral-200 bg-white rounded-2xl px-4 py-2.5 text-sm outline-none text-[#1c1c1a]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Experience Level</label>
                                    <select
                                        value={level}
                                        onChange={(e) => setLevel(e.target.value)}
                                        className="w-full border border-neutral-200 bg-white rounded-2xl px-4 py-2.5 text-sm outline-none text-[#1c1c1a]"
                                    >
                                        <option value="Entry-level">Entry-level (0-2 YOE)</option>
                                        <option value="Mid-level">Mid-level (2-5 YOE)</option>
                                        <option value="Senior">Senior Lead (5+ YOE)</option>
                                    </select>
                                </div>
                                <div>
                                    <AnimatedButton onClick={handleGenerateQuestions} className="w-full flex items-center justify-center gap-2 py-3 bg-[#f05e38] text-white hover:bg-[#ff7c5c]">
                                        {loadingQ ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                        <span>Generate AI Questions</span>
                                    </AnimatedButton>
                                </div>
                            </div>
                        </GlassCard>

                        {/* Questions & Feedback Room */}
                        {questionsData ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <GlassCard delay={0.15} hover={false} className="lg:col-span-2 p-6 space-y-6 bg-white border border-neutral-200/50">
                                    <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                                        <GlowChip color="orange" className="text-xs">
                                            Question {currentQIndex + 1} of {questionsData.total_questions}
                                        </GlowChip>
                                        <GlowChip color="purple">
                                            {questionsData.questions[currentQIndex]?.category}
                                        </GlowChip>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/50">
                                        <h3 className="text-lg font-bold text-[#0f172a]">
                                            {questionsData.questions[currentQIndex]?.question}
                                        </h3>
                                        <p className="text-xs text-neutral-500 mt-2 font-medium">
                                            Focus: <strong className="text-[#f05e38]">{questionsData.questions[currentQIndex]?.focus_area}</strong>
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-neutral-500 font-bold">Hints:</span>
                                        {questionsData.questions[currentQIndex]?.hints?.map((h, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-[#f05e38]/8 border border-[#f05e38]/20 text-[#f05e38] text-[11px] rounded-lg">
                                                💡 {h}
                                            </span>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Your Answer</label>
                                        <textarea
                                            rows={5}
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            placeholder="Type your explanation here..."
                                            className="w-full p-4 rounded-2xl border border-neutral-200 bg-white text-[#1c1c1a] text-sm outline-none"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                                            disabled={currentQIndex === 0}
                                            className="px-4 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl text-xs font-semibold disabled:opacity-50 border border-neutral-200 transition-all"
                                        >
                                            Previous
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={handleSubmitAnswer}
                                            disabled={evaluating || !userAnswer.trim()}
                                            className="px-6 py-2.5 bg-[#f05e38] hover:bg-[#ff7c5c] text-white font-bold text-sm rounded-full shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
                                        >
                                            {evaluating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            <span>Evaluate Answer</span>
                                        </motion.button>

                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setCurrentQIndex((prev) => Math.min(questionsData.total_questions - 1, prev + 1))}
                                            disabled={currentQIndex === questionsData.total_questions - 1}
                                            className="px-4 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-600 rounded-xl text-xs font-semibold disabled:opacity-50 border border-neutral-200 transition-all"
                                        >
                                            Next
                                        </motion.button>
                                    </div>
                                </GlassCard>

                                <GlassCard delay={0.2} hover={false} className="p-6 space-y-6 bg-white border border-neutral-200/50">
                                    <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-neutral-100 pb-3">
                                        <Sparkles className="w-4 h-4 text-[#f05e38]" /> AI Evaluation
                                    </h3>

                                    {evalResult ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center shadow-sm">
                                                <span className="text-xs font-bold text-[#f05e38] uppercase">Overall Score</span>
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                    className="text-4xl font-black text-[#f05e38] mt-1"
                                                >
                                                    {evalResult.score}/100
                                                </motion.div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-200/50">
                                                    <span className="text-[10px] text-neutral-500">Technical</span>
                                                    <div className="font-bold text-indigo-600">{evalResult.technical_score}</div>
                                                </div>
                                                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-200/50">
                                                    <span className="text-[10px] text-neutral-500">Clarity</span>
                                                    <div className="font-bold text-emerald-600">{evalResult.communication_score}</div>
                                                </div>
                                                <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-200/50">
                                                    <span className="text-[10px] text-neutral-500 font-medium">Confidence</span>
                                                    <div className="font-bold text-pink-600">{evalResult.confidence_score}</div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-neutral-50 rounded-xl text-xs text-[#334155] border border-neutral-200/50">
                                                <span className="font-bold text-[#f05e38] block mb-1">Feedback:</span>
                                                {evalResult.feedback}
                                            </div>

                                            <div className="p-3 bg-neutral-50 rounded-xl text-xs text-[#334155] border border-neutral-200/50">
                                                <span className="font-bold text-purple-600 block mb-1">Model Concept:</span>
                                                {evalResult.model_answer}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-12 text-neutral-400 text-xs font-medium">
                                            Click &quot;Generate AI Questions&quot;, write your response, and click &quot;Evaluate Answer&quot; to view feedback.
                                        </div>
                                    )}
                                </GlassCard>
                            </div>
                        ) : (
                            <GlassCard delay={0.2} className="p-12 text-center space-y-4 bg-white border border-neutral-200/50">
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    <BrainCircuit className="w-16 h-16 text-neutral-400 mx-auto" />
                                </motion.div>
                                <h3 className="text-lg font-bold text-neutral-400">Ready for Mock Interview</h3>
                                <p className="text-xs text-neutral-500 max-w-sm mx-auto">Select your target role above and click &quot;Generate AI Questions&quot; to begin.</p>
                            </GlassCard>
                        )}
                    </div>
                </PageTransition>
            </main>
        </div>
    );
}
