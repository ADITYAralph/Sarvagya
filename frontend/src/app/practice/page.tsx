"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { fetchAptitudeQuestions, evaluateCodeSubmission } from "@/lib/api";
import { AptitudeQuestion, CodeEvaluation } from "@/lib/types";
import { PageTransition, CardAnimation, AnimatedButton, GlassCard, GlowChip } from "@/components/Animations";
import { Code2, Play, RefreshCw, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PracticePage() {
    const [mode, setMode] = useState<'aptitude' | 'coding'>('aptitude');
    const [aptitudeQuestions, setAptitudeQuestions] = useState<AptitudeQuestion[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    
    // Coding Evaluator
    const [code, setCode] = useState(`def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`);
    const [language, setLanguage] = useState("python");
    const [evaluatingCode, setEvaluatingCode] = useState(false);
    const [codeEval, setCodeEval] = useState<CodeEvaluation | null>(null);

    useEffect(() => {
        loadAptitude();
    }, []);

    const loadAptitude = async () => {
        const questions = await fetchAptitudeQuestions();
        setAptitudeQuestions(questions);
    };

    const handleEvaluateCode = async () => {
        setEvaluatingCode(true);
        try {
            const res = await evaluateCodeSubmission("Two Sum (Hash Map)", code, language);
            setCodeEval(res);
        } catch (err) {
            console.error(err);
        } finally {
            setEvaluatingCode(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4ECE6] text-[#1c1c1a] flex flex-col font-sans">
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageTransition>
                    <div className="space-y-8">
                        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="inline-flex items-center gap-2 text-[#2563eb] text-sm font-semibold uppercase tracking-wider"
                                >
                                    <Code2 className="w-5 h-5" /> Sarvagya Arena Module
                                </motion.div>
                                <h1 className="font-serif text-4xl md:text-5xl font-black tracking-tight text-neutral-800">
                                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Practice</span> <span className="gradient-text">Arena</span>
                                </h1>
                            </div>

                            <div className="flex bg-black/[0.02] p-1.5 rounded-2xl border border-black/[0.04] backdrop-blur-sm">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMode('aptitude')}
                                    className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        mode === 'aptitude' ? 'text-white' : 'text-neutral-500 hover:text-neutral-800'
                                    }`}
                                >
                                    {mode === 'aptitude' && (
                                        <motion.div
                                            layoutId="practiceModePill"
                                            className="absolute inset-0 bg-[#1D1B18] rounded-xl shadow-sm"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">Aptitude Quizzes</span>
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMode('coding')}
                                    className={`relative px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        mode === 'coding' ? 'text-white' : 'text-neutral-500 hover:text-neutral-800'
                                    }`}
                                >
                                    {mode === 'coding' && (
                                        <motion.div
                                            layoutId="practiceModePill"
                                            className="absolute inset-0 bg-[#1D1B18] rounded-xl shadow-sm"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10">Coding IDE</span>
                                </motion.button>
                            </div>
                        </header>

                        {/* Aptitude Mode */}
                        {mode === 'aptitude' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {aptitudeQuestions.map((q) => (
                                    <CardAnimation key={q.id}>
                                        <div className="bg-white border border-neutral-200/50 rounded-3xl p-6 space-y-4 shadow-sm">
                                            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                                <GlowChip color="orange">{q.category}</GlowChip>
                                            </div>

                                            <h3 className="text-base font-bold text-[#0f172a]">{q.question}</h3>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {q.options.map((opt, idx) => {
                                                    const isSelected = selectedAnswers[q.id] === idx;
                                                    return (
                                                        <motion.button
                                                            key={idx}
                                                            whileHover={{ scale: 1.01 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [q.id]: idx })}
                                                            className={`p-4 rounded-2xl text-left text-sm font-medium border transition-all duration-300 ${
                                                                isSelected
                                                                    ? 'bg-[#2563eb]/8 border-[#2563eb]/30 text-[#2563eb] shadow-sm'
                                                                    : 'bg-neutral-50 border-neutral-200/60 text-[#334155] hover:border-neutral-300 hover:bg-white'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </motion.button>
                                                    );
                                                })}
                                            </div>

                                            {selectedAnswers[q.id] !== undefined && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/50 text-xs text-[#475569]"
                                                >
                                                    <span className="font-bold text-[#2563eb] block mb-1">
                                                        Correct Option: {q.options[q.correct_option]}
                                                    </span>
                                                    <p>{q.explanation}</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </CardAnimation>
                                ))}
                            </motion.div>
                        )}

                        {/* Coding Mode */}
                        {mode === 'coding' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                            >
                                <GlassCard delay={0.1} hover={false} className="p-6 space-y-4 bg-white border border-neutral-200/50">
                                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                                        <h3 className="text-base font-bold text-[#0f172a]">Two Sum (Hash Map Lookup)</h3>
                                        <GlowChip color="emerald">Easy</GlowChip>
                                    </div>

                                    <p className="text-xs text-[#334155] leading-relaxed">
                                        Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.
                                    </p>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs font-bold text-neutral-500 uppercase">Code Editor</span>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="px-3 py-1.5 border border-neutral-200 bg-white text-xs text-[#1c1c1a] rounded-xl outline-none"
                                        >
                                            <option value="python">Python 3</option>
                                            <option value="javascript">JavaScript</option>
                                        </select>
                                    </div>

                                    <textarea
                                        rows={10}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-[#1C1B18] font-mono text-xs outline-none focus:border-[#2563eb]/40 transition-all"
                                    />

                                    <AnimatedButton onClick={handleEvaluateCode} className="w-full flex items-center justify-center gap-2 py-3 bg-[#2563eb] text-white hover:bg-[#1d4ed8]">
                                        {evaluatingCode ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                        <span>Run Code Evaluator</span>
                                    </AnimatedButton>
                                </GlassCard>

                                <GlassCard delay={0.2} hover={false} className="p-6 space-y-4 min-h-[420px] bg-white border border-neutral-200/50">
                                    <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2 border-b border-neutral-100 pb-3">
                                        <Sparkles className="w-4 h-4 text-[#2563eb]" /> Evaluation Output
                                    </h3>

                                    {codeEval ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-bold text-[#2563eb] uppercase">Execution Result</span>
                                                    <h4 className="text-lg font-bold text-[#0f172a] mt-0.5">{codeEval.is_correct ? "Passed All Test Cases" : "Failed Edge Cases"}</h4>
                                                </div>
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                                    className="text-3xl font-black text-[#2563eb]"
                                                >
                                                    {codeEval.score}/100
                                                </motion.span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 text-center text-xs">
                                                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/50">
                                                    <span className="text-[10px] text-neutral-500 font-medium">Time Complexity</span>
                                                    <div className="font-bold text-indigo-600 mt-1">{codeEval.time_complexity}</div>
                                                </div>
                                                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/50">
                                                    <span className="text-[10px] text-neutral-500 font-medium">Space Complexity</span>
                                                    <div className="font-bold text-purple-600 mt-1">{codeEval.space_complexity}</div>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-neutral-50 rounded-xl text-xs text-[#334155] border border-neutral-200/50">
                                                <span className="font-bold text-[#2563eb] block mb-1">Feedback:</span>
                                                {codeEval.feedback}
                                            </div>

                                            {codeEval.suggestions && codeEval.suggestions.length > 0 && (
                                                <div className="p-3 bg-neutral-50 rounded-xl text-xs text-[#334155] border border-neutral-200/50">
                                                    <span className="font-bold text-amber-600 block mb-1">Optimization Tips:</span>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {codeEval.suggestions.map((s, i) => (
                                                            <li key={i}>{s}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <div className="text-center py-16 text-neutral-400 text-xs font-medium">
                                            Write or modify your code on the left and click &quot;Run Code Evaluator&quot; to get complexity & score analysis.
                                        </div>
                                    )}
                                </GlassCard>
                            </motion.div>
                        )}
                    </div>
                </PageTransition>
            </main>
        </div>
    );
}
