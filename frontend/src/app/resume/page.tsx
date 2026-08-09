"use client";

import { useState } from "react";
import { PageTransition, CardAnimation, AnimatedButton } from "@/components/Animations";
import { UploadCloud, CheckCircle, BrainCircuit, BarChart3, AlertCircle } from "lucide-react";

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !role) {
            alert("Please upload a resume PDF and enter a target role.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("target_role", role);

        try {
            const response = await fetch("http://localhost:8000/api/resume/analyze", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to analyze resume");

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            alert("Error contacting Sarvagya AI engine. Is the backend running on port 8000?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageTransition>
            <div className="space-y-12 py-8">
                <header className="space-y-3">
                    <div className="inline-flex items-center gap-2 text-[#76B900] text-sm font-semibold uppercase tracking-wider">
                        <BarChart3 className="w-5 h-5" /> Sarvagya ATS Module
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">Resume Review & ATS Scoring</h1>
                    <p className="text-[#999999] text-base md:text-lg max-w-2xl font-light">
                        Upload your resume to get instant ATS scores, keyword gaps, and actionable feedback powered by NVIDIA NIM AI models.
                    </p>
                </header>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Controls Form */}
                    <div className="md:col-span-1 space-y-6">
                        <CardAnimation delay={0.1}>
                            <div className="bg-[#111111] border border-[#222] rounded-3xl p-6 space-y-4">
                                <label className="text-sm font-bold uppercase tracking-wider text-[#999]">1. Target Job Role</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Software Engineer, Data Analyst"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-[#000] border border-[#333] rounded-2xl px-4 py-3 text-sm focus:border-[#76B900] outline-none text-white transition-colors"
                                />
                            </div>
                        </CardAnimation>

                        <CardAnimation delay={0.2}>
                            <div className="bg-[#111111] border border-[#222] rounded-3xl p-6 space-y-4">
                                <label className="text-sm font-bold uppercase tracking-wider text-[#999]">2. Upload PDF Resume</label>
                                <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${file ? 'border-[#76B900] bg-[#76B900]/5' : 'border-[#333] hover:border-[#666]'}`}>
                                    {file ? (
                                        <CheckCircle className="w-10 h-10 text-[#76B900] mx-auto mb-2" />
                                    ) : (
                                        <UploadCloud className="w-10 h-10 text-[#666] mx-auto mb-2" />
                                    )}
                                    <p className="text-xs text-[#999] truncate mb-4">{file ? file.name : "PDF format supported"}</p>
                                    <label className="cursor-pointer bg-[#1A1A1A] border border-[#333] hover:border-[#76B900] text-xs font-bold px-4 py-2 rounded-full inline-block transition-colors">
                                        {file ? "Change File" : "Browse Computer"}
                                        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </CardAnimation>

                        <AnimatedButton onClick={handleAnalyze} className="w-full flex items-center justify-center gap-2 py-4">
                            {loading ? "Analyzing with AI..." : "Scan Resume"}
                        </AnimatedButton>
                    </div>

                    {/* Analysis Output */}
                    <div className="md:col-span-2">
                        <CardAnimation delay={0.3}>
                            <div className="bg-[#111111] border border-[#222] rounded-3xl p-8 min-h-[480px]">
                                {result ? (
                                    <div className="space-y-8">
                                        {/* Score Header */}
                                        <div className="flex items-center justify-between border-b border-[#222] pb-6">
                                            <div>
                                                <h2 className="text-2xl font-bold">ATS Compatibility Score</h2>
                                                <p className="text-xs text-[#999] mt-1">Target Role: {role}</p>
                                            </div>
                                            <div className="bg-[#000] border-2 border-[#76B900] px-6 py-4 rounded-2xl text-center">
                                                <span className="text-4xl font-black text-[#76B900]">{result.ats_score}</span>
                                                <span className="text-xs text-[#999]"> / 100</span>
                                            </div>
                                        </div>

                                        {/* Summary Feedback */}
                                        {result.summary_feedback && (
                                            <div className="space-y-2">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#76B900]">Summary</h3>
                                                <p className="text-sm text-[#ccc] leading-relaxed">{result.summary_feedback}</p>
                                            </div>
                                        )}

                                        {/* Matching & Missing Keywords */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#222] space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#76B900] flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Matching Skills
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.matching_skills?.map((skill: string, i: number) => (
                                                        <span key={i} className="text-xs bg-[#76B900]/10 border border-[#76B900]/30 text-[#76B900] px-3 py-1 rounded-full">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#222] space-y-3">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" /> Missing Keywords
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.missing_keywords?.map((keyword: string, i: number) => (
                                                        <span key={i} className="text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 px-3 py-1 rounded-full">
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Key Improvements */}
                                        {result.key_improvements && (
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-[#999]">Recommended Action Items</h3>
                                                <ul className="space-y-2">
                                                    {result.key_improvements.map((item: string, i: number) => (
                                                        <li key={i} className="text-xs text-[#ccc] flex items-start gap-2 bg-[#000] p-3 rounded-xl border border-[#222]">
                                                            <span className="text-[#76B900] font-bold">•</span> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                                        <BrainCircuit className="w-16 h-16 text-[#333] animate-pulse" />
                                        <h3 className="text-lg font-bold text-[#666]">No Analysis Generated Yet</h3>
                                        <p className="text-xs text-[#555] max-w-sm">Enter your target role and upload your resume on the left to run Sarvagya AI ATS scoring.</p>
                                    </div>
                                )}
                            </div>
                        </CardAnimation>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}