"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import { analyzeResumeDeep, fetchPresetRoles } from "@/lib/api";
import { ATSDeepAnalysis, WordAnnotation, SectionScore, JDMatchResult } from "@/lib/types";
import { PageTransition, CardAnimation, AnimatedButton, GlassCard, GlowChip, SkeletonPulse } from "@/components/Animations";
import { motion, AnimatePresence } from "framer-motion";
import {
    UploadCloud, CheckCircle, BrainCircuit, BarChart3, AlertCircle,
    RefreshCw, Sparkles, AlertTriangle, FileText, Zap, Target,
    TrendingUp, Shield, ChevronDown, ChevronRight, Eye, Award,
    BookOpen, PenTool, LayoutGrid, Type, Gauge, Briefcase,
    ClipboardList, ChevronUp, X, Search, FileCheck2, XCircle,
} from "lucide-react";

// ─── Color Constants ───────────────────────────────────────
const COLORS = {
    strong_keyword: { bg: "rgba(240, 94, 56, 0.08)", border: "#f05e38", text: "#f05e38", label: "Keyword" },
    action_verb:    { bg: "rgba(59, 130, 246, 0.08)", border: "#3b82f6", text: "#2563eb", label: "Action Verb" },
    metric:         { bg: "rgba(16, 185, 129, 0.08)", border: "#10b981", text: "#059669", label: "Metric" },
    filler:         { bg: "rgba(239, 68, 68, 0.08)", border: "#ef4444", text: "#dc2626", label: "Filler" },
    buzzword:       { bg: "rgba(139, 92, 246, 0.08)", border: "#8b5cf6", text: "#7c3aed", label: "Buzzword" },
    neutral:        { bg: "transparent", border: "transparent", text: "#6e6d6a", label: "Neutral" },
} as const;

type ClassificationType = keyof typeof COLORS;

// ─── Score Ring Component ──────────────────────────────────
function ScoreRing({ score, grade, size = 160 }: { score: number; grade: string; size?: number }) {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const gradeColor = score >= 80 ? "#f05e38" : score >= 60 ? "#f59e0b" : score >= 40 ? "#ef4444" : "#ec4899";

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="8" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={gradeColor} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.5s ease-out", filter: `drop-shadow(0 0 8px ${gradeColor}25)` }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-neutral-800">{score}</span>
                <span className="text-xs font-bold tracking-wider" style={{ color: gradeColor }}>{grade}</span>
            </div>
        </div>
    );
}

// ─── JD Score Ring (smaller) ───────────────────────────────
function JDScoreRing({ score }: { score: number }) {
    const size = 96;
    const radius = (size - 12) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 75 ? "#f05e38" : score >= 50 ? "#f59e0b" : "#ef4444";
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(0,0,0,0.04)" strokeWidth="6" />
                <circle cx={size/2} cy={size/2} r={radius} fill="none"
                    stroke={color} strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.5s ease-out", filter: `drop-shadow(0 0 6px ${color}25)` }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black text-neutral-800">{score}</span>
                <span className="text-[9px] font-bold text-neutral-400">JD Match</span>
            </div>
        </div>
    );
}

// ─── Dimension Bar Component ───────────────────────────────
function DimensionBar({ label, score, icon }: { label: string; score: number; icon?: React.ReactNode }) {
    const barColor = score >= 80 ? "#f05e38" : score >= 60 ? "#f59e0b" : score >= 40 ? "#ef4444" : "#ec4899";
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-neutral-500 font-medium">
                    {icon}
                    {label}
                </span>
                <span className="font-bold" style={{ color: barColor }}>{score}%</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200/50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${barColor}88, ${barColor})`,
                        boxShadow: `0 0 8px ${barColor}15`,
                    }}
                />
            </div>
        </div>
    );
}

// ─── Section Score Card Component ──────────────────────────
function SectionCard({ section }: { section: SectionScore }) {
    const [expanded, setExpanded] = useState(false);
    const scoreColor = section.score >= 70 ? "#f05e38" : section.score >= 45 ? "#f59e0b" : "#ef4444";

    return (
        <div className="glass-card rounded-2xl overflow-hidden bg-white border border-neutral-200/50">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {expanded ? <ChevronDown className="w-4 h-4 text-neutral-400" /> : <ChevronRight className="w-4 h-4 text-neutral-400" />}
                    <span className="text-sm font-bold capitalize text-neutral-800">{section.section_name}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-2 text-[10px] text-neutral-500">
                        <span>🔑 {section.action_verb_count}</span>
                        <span>📊 {section.metric_count}</span>
                        {section.filler_count > 0 && <span className="text-rose-500 font-bold">⚠ {section.filler_count}</span>}
                    </div>
                    <div
                        className="px-2.5 py-0.5 rounded-full text-xs font-black"
                        style={{ background: `${scoreColor}12`, color: scoreColor, border: `1px solid ${scoreColor}25` }}
                    >
                        {section.score}
                    </div>
                </div>
            </button>
            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-3 pt-1 border-t border-neutral-100 space-y-2"
                >
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                            <div className="text-[10px] text-neutral-400 uppercase">Actions</div>
                            <div className="text-sm font-bold text-blue-500">{section.action_verb_count}</div>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                            <div className="text-[10px] text-neutral-400 uppercase">Metrics</div>
                            <div className="text-sm font-bold text-emerald-500">{section.metric_count}</div>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-2 border border-neutral-100">
                            <div className="text-[10px] text-neutral-400 uppercase">Fillers</div>
                            <div className="text-sm font-bold text-rose-500">{section.filler_count}</div>
                        </div>
                    </div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{section.feedback}</p>
                    <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                        <span>Keyword Density: {(section.keyword_density * 100).toFixed(1)}%</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

// ─── Word Stats Donut Component ────────────────────────────
function WordStatsDonut({ result }: { result: ATSDeepAnalysis }) {
    const segments = [
        { label: "Keywords", count: result.strong_keyword_count, color: COLORS.strong_keyword.border },
        { label: "Actions", count: result.action_verb_count, color: COLORS.action_verb.border },
        { label: "Metrics", count: result.metric_count, color: COLORS.metric.border },
        { label: "Fillers", count: result.filler_count, color: COLORS.filler.border },
        { label: "Neutral", count: Math.max(0, result.total_words - result.strong_keyword_count - result.action_verb_count - result.metric_count - result.filler_count), color: "#dcdad4" },
    ];
    const total = result.total_words || 1;

    return (
        <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                <Type className="w-3.5 h-3.5" /> Word Distribution
            </h4>
            <div className="flex items-center gap-4">
                <div className="flex-1 space-y-1.5">
                    {segments.filter(s => s.count > 0).map((seg) => (
                        <div key={seg.label} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: seg.color, boxShadow: `0 0 6px ${seg.color}25` }} />
                            <span className="text-[10px] text-neutral-500 w-16">{seg.label}</span>
                            <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(2, (seg.count / total) * 100)}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ background: seg.color }}
                                />
                            </div>
                            <span className="text-[10px] font-bold text-neutral-600 w-8 text-right">{seg.count}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-center text-[10px] text-neutral-400">
                Total: {result.total_words} words analyzed
            </div>
        </div>
    );
}

// ─── Annotated Resume Viewer Component ─────────────────────
function AnnotatedResumeViewer({ result }: { result: ATSDeepAnalysis }) {
    const [hoveredWord, setHoveredWord] = useState<WordAnnotation | null>(null);
    const [showLegend, setShowLegend] = useState(true);

    const annotationMap = useMemo(() => {
        const map = new Map<string, WordAnnotation>();
        for (const ann of result.word_annotations) {
            map.set(`${ann.line}:${ann.position}`, ann);
        }
        return map;
    }, [result.word_annotations]);

    const lines = useMemo(() => result.resume_text.split("\n"), [result.resume_text]);

    const renderLine = useCallback((line: string, lineIdx: number) => {
        if (!line.trim()) return <br key={lineIdx} />;
        if (line.trim().startsWith("--- PAGE")) return null;

        const parts: React.ReactNode[] = [];
        let lastEnd = 0;
        const wordRegex = /[A-Za-z0-9#+./-]+/g;
        let match;

        while ((match = wordRegex.exec(line)) !== null) {
            if (match.index > lastEnd) {
                parts.push(<span key={`${lineIdx}-gap-${lastEnd}`} className="text-neutral-700">{line.slice(lastEnd, match.index)}</span>);
            }
            const word = match[0];
            const ann = annotationMap.get(`${lineIdx}:${match.index}`);
            if (ann && ann.classification !== "neutral") {
                const colorConfig = COLORS[ann.classification as ClassificationType] || COLORS.neutral;
                parts.push(
                    <span
                        key={`${lineIdx}-${match.index}`}
                        className="relative cursor-pointer rounded px-0.5 -mx-0.5 transition-all duration-150 font-bold"
                        style={{ background: colorConfig.bg, borderBottom: `2px solid ${colorConfig.border}`, color: colorConfig.text }}
                        onMouseEnter={() => setHoveredWord(ann)}
                        onMouseLeave={() => setHoveredWord(null)}
                    >
                        {word}
                    </span>
                );
            } else {
                parts.push(<span key={`${lineIdx}-${match.index}`} className="text-neutral-800">{word}</span>);
            }
            lastEnd = match.index + word.length;
        }

        if (lastEnd < line.length) {
            parts.push(<span key={`${lineIdx}-end`} className="text-neutral-800">{line.slice(lastEnd)}</span>);
        }

        return <div key={lineIdx} className="leading-relaxed min-h-[1.2em]">{parts}</div>;
    }, [annotationMap]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5" /> Annotated Resume
                </h4>
                <button onClick={() => setShowLegend(!showLegend)} className="text-[10px] text-neutral-500 hover:text-neutral-800 transition-colors">
                    {showLegend ? "Hide" : "Show"} Legend
                </button>
            </div>
            {showLegend && (
                <div className="flex flex-wrap gap-3 px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200/50">
                    {Object.entries(COLORS).filter(([k]) => k !== "neutral").map(([key, val]) => (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-3 h-1.5 rounded-full" style={{ background: val.border, boxShadow: `0 0 6px ${val.border}25` }} />
                            <span className="text-[10px] text-neutral-500">{val.label}</span>
                        </div>
                    ))}
                </div>
            )}
            {hoveredWord && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-10 flex items-center gap-3 px-3 py-2 bg-white border border-neutral-200 shadow-sm rounded-xl"
                >
                    <span className="text-sm font-bold px-2 py-0.5 rounded"
                        style={{ background: COLORS[hoveredWord.classification as ClassificationType]?.bg, color: COLORS[hoveredWord.classification as ClassificationType]?.text, border: `1px solid ${COLORS[hoveredWord.classification as ClassificationType]?.border}` }}>
                        {hoveredWord.word}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: COLORS[hoveredWord.classification as ClassificationType]?.text }}>
                        {COLORS[hoveredWord.classification as ClassificationType]?.label}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium">
                        Impact: {hoveredWord.impact_score > 0 ? "+" : ""}{hoveredWord.impact_score.toFixed(1)}
                    </span>
                </motion.div>
            )}
            <div className="bg-neutral-50 border border-neutral-200/50 rounded-2xl p-4 max-h-[500px] overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed text-neutral-800 shadow-inner">
                {lines.map((line, i) => renderLine(line, i))}
            </div>
        </div>
    );
}

// ─── JD Gap Analysis Panel ─────────────────────────────────
function JDGapPanel({ jd }: { jd: JDMatchResult }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
        >
            {/* Header row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-neutral-200/50 pb-5">
                <JDScoreRing score={jd.jd_match_score} />
                <div className="flex-1 space-y-2">
                    <h3 className="text-base font-black text-neutral-800">JD Compatibility Score</h3>
                    <p className="text-xs text-neutral-500">
                        Mode: <span className="text-[#f05e38] font-semibold capitalize">{jd.match_mode}</span>
                        {jd.role_name && <> · Role: <span className="text-[#f05e38] font-semibold">{jd.role_name}</span></>}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        <GlowChip color="neon">{jd.present_keywords.length} matched</GlowChip>
                        <GlowChip color="rose">{jd.missing_required.length} required missing</GlowChip>
                        {jd.missing_preferred.length > 0 && <GlowChip color="amber">{jd.missing_preferred.length} preferred missing</GlowChip>}
                        {jd.partial_matches.length > 0 && <GlowChip color="blue">{jd.partial_matches.length} partial</GlowChip>}
                    </div>
                </div>
            </div>

            {/* Keyword grids */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Present */}
                {jd.present_keywords.length > 0 && (
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-[#f05e38]/10 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#f05e38] flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Present in Resume
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {jd.present_keywords.map((kw, i) => (
                                <span key={i} className="text-[10px] bg-[#f05e38]/8 border border-[#f05e38]/20 text-[#f05e38] px-2 py-0.5 rounded-full">{kw}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Missing required */}
                {jd.missing_required.length > 0 && (
                    <div className="bg-neutral-50 p-4 rounded-2xl border border-rose-500/15 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                            <XCircle className="w-3.5 h-3.5" /> Required — Missing
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                            {jd.missing_required.map((kw, i) => (
                                <span key={i} className="text-[10px] bg-rose-500/8 border border-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full">{kw}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Partial matches */}
            {jd.partial_matches.length > 0 && (
                <div className="bg-neutral-50 p-4 rounded-2xl border border-blue-400/15 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-blue-500 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Partial Matches (use exact terms)
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {jd.partial_matches.map((m, i) => (
                            <span key={i} className="text-[10px] bg-blue-400/8 border border-blue-400/20 text-blue-600 px-2 py-0.5 rounded-full">{m}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Preferred missing */}
            {jd.missing_preferred.length > 0 && (
                <div className="bg-neutral-50 p-4 rounded-2xl border border-amber-400/15 space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Preferred — Nice to Have
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {jd.missing_preferred.map((kw, i) => (
                            <span key={i} className="text-[10px] bg-amber-400/8 border border-amber-400/20 text-amber-600 px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Gaps */}
            {(jd.education_gap || jd.experience_gap) && (
                <div className="space-y-2">
                    {jd.experience_gap && (
                        <div className="flex items-start gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200/40">
                            <Briefcase className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <span>{jd.experience_gap}</span>
                        </div>
                    )}
                    {jd.education_gap && (
                        <div className="flex items-start gap-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200/40">
                            <BookOpen className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <span>{jd.education_gap}</span>
                        </div>
                    )}
                </div>
            )}

            {/* JD Recommendations */}
            {jd.jd_recommendations.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">JD-Specific Recommendations</h4>
                    {jd.jd_recommendations.map((rec, i) => (
                        <div key={i} className="text-xs text-neutral-600 flex items-start gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200/40">
                            <span className="text-[#f05e38] font-bold shrink-0">{i + 1}.</span> {rec}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}


// ─── Main Page Component ───────────────────────────────────
export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ATSDeepAnalysis | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "annotated" | "sections" | "actions" | "jd">("overview");
    const [error, setError] = useState<string | null>(null);

    // Unified role state — role IS the preset for JD matching
    const [role, setRole] = useState("");           // selected role from dropdown
    const [roleSearch, setRoleSearch] = useState("");// search text in dropdown
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [presetRoles, setPresetRoles] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1); // Keyboard navigation index

    // JD extra — only "none" or "custom" now (preset = role itself)
    const [jdMode, setJdMode] = useState<"none" | "custom">("none");
    const [customJd, setCustomJd] = useState("");

    useEffect(() => {
        fetchPresetRoles().then(roles => {
            console.log("fetchPresetRoles returned:", roles);
            setPresetRoles(roles || []);
        }).catch(err => {
            console.error("fetchPresetRoles failed:", err);
        });
    }, []);

    const filteredRoles = useMemo(() => {
        const query = roleSearch.trim().toLowerCase();
        console.log("Filtering roles, query:", query, "presetRoles size:", presetRoles.length);
        if (!query) return presetRoles;
        const matched = presetRoles.filter(r => r.toLowerCase().includes(query));
        console.log("Filtered roles matches:", matched.length, matched);
        return matched;
    }, [presetRoles, roleSearch]);

    // Reset active keyboard focus index when query changes
    useEffect(() => {
        setActiveIndex(-1);
    }, [roleSearch]);

    // When a role is selected from the dropdown
    const selectRole = (r: string) => {
        setRole(r);
        setRoleSearch("");
        setShowRoleDropdown(false);
        setError(null);
    };

    const clearRole = () => {
        setRole("");
        setRoleSearch("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showRoleDropdown) {
            if (e.key === "ArrowDown") {
                setShowRoleDropdown(true);
            }
            return;
        }

        const hasCustom = roleSearch.trim() && !presetRoles.includes(roleSearch.trim());
        const totalItems = filteredRoles.length + (hasCustom ? 1 : 0);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) => (prev + 1) % totalItems);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => (prev - 1 + totalItems) % totalItems);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < totalItems) {
                if (hasCustom) {
                    if (activeIndex === 0) {
                        selectRole(roleSearch.trim());
                    } else {
                        selectRole(filteredRoles[activeIndex - 1]);
                    }
                } else {
                    selectRole(filteredRoles[activeIndex]);
                }
            } else if (filteredRoles.length > 0) {
                selectRole(filteredRoles[0]);
            } else if (roleSearch.trim()) {
                selectRole(roleSearch.trim());
            }
        } else if (e.key === "Escape") {
            setShowRoleDropdown(false);
            setActiveIndex(-1);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        const ext = selected.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx') {
            setError("Only .pdf and .docx resume files are accepted.");
            return;
        }
        setFile(selected);
        setResult(null);
        setError(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (!dropped) return;
        const ext = dropped.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx') {
            setError("Only .pdf and .docx resume files are accepted.");
            return;
        }
        setFile(dropped);
        setResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (!file || !role.trim()) {
            setError("Please select a Target Job Role and upload your resume.");
            return;
        }
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await analyzeResumeDeep(
                file,
                role,
                // The selected role IS always the preset for JD gap analysis
                // unless the user chose to skip JD matching entirely
                jdMode === "none" ? "" : role,
                jdMode === "custom" ? customJd : "",
            );
            setResult(data);
            setActiveTab("overview");
        } catch (err: any) {
            setError(err?.message || "Analysis failed. Ensure the backend server is running on port 8000.");
        } finally {
            setLoading(false);
        }
    };

    const dimensionIcons: Record<string, React.ReactNode> = {
        "Keyword Match": <Target className="w-3 h-3" />,
        "Action Verbs": <PenTool className="w-3 h-3" />,
        "Quantified Impact": <TrendingUp className="w-3 h-3" />,
        "Section Completeness": <LayoutGrid className="w-3 h-3" />,
        "Formatting": <FileText className="w-3 h-3" />,
        "Readability": <BookOpen className="w-3 h-3" />,
        "Relevance": <Zap className="w-3 h-3" />,
        "Brevity": <Type className="w-3 h-3" />,
        "Technical Depth": <BrainCircuit className="w-3 h-3" />,
        "ATS Parsability": <Shield className="w-3 h-3" />,
        "Consistency": <Gauge className="w-3 h-3" />,
        "Professional Tone": <Award className="w-3 h-3" />,
    };

    const dimensionData = result ? [
        { label: "Keyword Match", score: result.keyword_match_score },
        { label: "Action Verbs", score: result.action_verb_score },
        { label: "Quantified Impact", score: result.quantified_impact_score },
        { label: "Section Completeness", score: result.section_completeness_score },
        { label: "Formatting", score: result.formatting_score },
        { label: "Readability", score: result.readability_score },
        { label: "Relevance", score: result.relevance_score },
        { label: "Brevity", score: result.brevity_score },
        { label: "Technical Depth", score: result.technical_depth_score },
        { label: "ATS Parsability", score: result.ats_parsability_score },
        { label: "Consistency", score: result.consistency_score },
        { label: "Professional Tone", score: result.professional_tone_score },
    ] : [];

    const tabs = [
        { key: "overview" as const, label: "Overview", icon: <BarChart3 className="w-3.5 h-3.5" /> },
        { key: "annotated" as const, label: "Annotated", icon: <Eye className="w-3.5 h-3.5" /> },
        { key: "sections" as const, label: "Sections", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
        { key: "actions" as const, label: "Actions", icon: <Zap className="w-3.5 h-3.5" /> },
        ...(result?.jd_match ? [{ key: "jd" as const, label: "JD Match", icon: <Briefcase className="w-3.5 h-3.5" /> }] : []),
    ];

    return (
        <div className="min-h-screen bg-[#F4ECE6] text-neutral-800 flex flex-col font-sans">
            <Header />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PageTransition>
                    <div className="space-y-8">
                        {/* Page Header */}
                        <header className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 text-[#f05e38] text-sm font-semibold uppercase tracking-wider"
                            >
                                <BarChart3 className="w-5 h-5" /> Sarvagya ATS Deep Scanner
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-neutral-800">
                                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Real-Time Resume</span> <span className="gradient-text">ATS Scorer</span>
                            </h1>
                            <p className="text-neutral-500 text-base md:text-lg max-w-3xl font-light">
                                Upload your <span className="text-[#f05e38] font-bold">.docx OR .pdf</span> resume for word-level analysis across 12 professional dimensions.
                                Optionally match against a Job Description to identify gaps — exactly as an HR screener would.
                            </p>
                        </header>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* ─── Left Controls Panel ─── */}
                            <div className="md:col-span-1 space-y-4">

                                {/* ── Step 1: Unified Role Selector ── */}
                                <GlassCard delay={0.1} className="p-5 space-y-3 bg-white border border-neutral-200/50">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">1. Select Your Target Job Role</label>

                                    {/* Selected role display */}
                                    {role ? (
                                        <div className="flex items-center gap-2 bg-[#f05e38]/8 border border-[#f05e38]/25 rounded-2xl px-4 py-3">
                                            <Briefcase className="w-4 h-4 text-[#f05e38] shrink-0" />
                                            <span className="flex-1 text-sm font-bold text-[#f05e38] truncate">{role}</span>
                                            <button
                                                onClick={clearRole}
                                                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-neutral-400 font-medium">
                                            No role selected — pick one below ({presetRoles.length} loaded, {filteredRoles.length} matches)
                                        </p>
                                    )}

                                    {/* Searchable dropdown */}
                                    <div className="relative">
                                        <div className="glass-input rounded-xl px-3 py-2 flex items-center gap-2 border border-neutral-200 bg-white">
                                            <Search className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                            <input
                                                className="flex-1 bg-transparent text-xs text-neutral-800 outline-none placeholder-neutral-400"
                                                placeholder="Search or type a custom role..."
                                                value={roleSearch}
                                                onChange={(e) => { setRoleSearch(e.target.value); setShowRoleDropdown(true); }}
                                                onKeyDown={handleKeyDown}
                                                onFocus={() => setShowRoleDropdown(true)}
                                                onBlur={() => setTimeout(() => setShowRoleDropdown(false), 150)}
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {showRoleDropdown && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -4 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute z-30 w-full mt-1 bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden"
                                                >
                                                    <div className="max-h-52 overflow-y-auto custom-scrollbar">
                                                        {/* Custom typed entry */}
                                                        {roleSearch.trim() && !presetRoles.includes(roleSearch.trim()) && (
                                                            <button
                                                                onMouseDown={() => selectRole(roleSearch.trim())}
                                                                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 border-b border-neutral-100 transition-colors ${
                                                                    activeIndex === 0
                                                                        ? "bg-neutral-100 text-[#f05e38]"
                                                                        : "text-[#f05e38] hover:bg-[#f05e38]/8"
                                                                }`}
                                                            >
                                                                <span className="font-bold">+ Use:</span> &quot;{roleSearch.trim()}&quot;
                                                            </button>
                                                        )}
                                                        {filteredRoles.map((r, idx) => {
                                                            const itemIndex = roleSearch.trim() && !presetRoles.includes(roleSearch.trim()) ? idx + 1 : idx;
                                                            const isHovered = activeIndex === itemIndex;
                                                            const isSelected = role === r;
                                                            return (
                                                                <button
                                                                    key={r}
                                                                    onMouseDown={() => selectRole(r)}
                                                                    className={`w-full text-left px-3 py-2.5 text-xs transition-colors ${
                                                                        isSelected
                                                                            ? "bg-[#f05e38]/8 text-[#f05e38] font-bold"
                                                                            : isHovered
                                                                                ? "bg-neutral-100 text-neutral-800"
                                                                                : "text-neutral-700 hover:bg-neutral-50"
                                                                    }`}
                                                                >
                                                                    {r}
                                                                </button>
                                                            );
                                                        })}
                                                        {filteredRoles.length === 0 && !roleSearch.trim() && (
                                                            <div className="px-3 py-4 text-xs text-neutral-400 text-center">Type to search roles...</div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {role && (
                                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                                            <Target className="w-3 h-3 text-[#f05e38]" />
                                            <span>This role will be used for ATS scoring <span className="text-[#f05e38] font-semibold">and</span> JD gap analysis</span>
                                        </div>
                                    )}
                                </GlassCard>

                                {/* Upload DOCX / PDF */}
                                <GlassCard delay={0.15} className="p-5 space-y-3 bg-white border border-neutral-200/50">
                                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">2. Upload Resume (.pdf or .docx)</label>
                                    <div
                                        className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
                                            file
                                                ? "border-[#f05e38]/50 bg-[#f05e38]/5 shadow-sm"
                                                : "border-neutral-200 bg-neutral-50/50 hover:border-neutral-400 hover:bg-white"
                                        }`}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        {file ? (
                                            <>
                                                <FileCheck2 className="w-8 h-8 text-[#f05e38] mx-auto mb-2" />
                                                <p className="text-xs text-[#f05e38] font-semibold truncate px-2 mb-1">{file.name}</p>
                                                <p className="text-[10px] text-neutral-500 mb-3">{(file.size / 1024).toFixed(1)} KB · Document</p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                                                <p className="text-xs text-neutral-600 mb-1">Drag & drop or browse</p>
                                                <p className="text-[10px] text-neutral-400 mb-3">.pdf or .docx format</p>
                                            </>
                                        )}
                                        <label className="cursor-pointer bg-white border border-neutral-200 hover:border-[#f05e38]/40 hover:bg-neutral-50 text-xs font-bold px-4 py-2 rounded-full inline-block transition-all duration-300">
                                            {file ? "Change File" : "Browse Computer"}
                                            <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                                        <Shield className="w-3 h-3" />
                                        <span>Accepted formats: .pdf and .docx · Other files will be rejected.</span>
                                    </div>
                                </GlassCard>

                                {/* ── Step 3: Extra JD options (Skip / Paste Custom) ── */}
                                <GlassCard delay={0.2} className="p-5 space-y-3 bg-white border border-neutral-200/50">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                            3. Additional JD <span className="text-neutral-400">(Optional)</span>
                                        </label>
                                        {role && jdMode !== "none" && (
                                            <span className="text-[10px] text-[#f05e38] font-semibold flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> Role preset active
                                            </span>
                                        )}
                                    </div>

                                    {/* Only Skip / Paste JD — no separate preset picker needed */}
                                    <div className="flex gap-2">
                                        {(["none", "custom"] as const).map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setJdMode(m)}
                                                className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold transition-all duration-200 border ${
                                                    jdMode === m
                                                        ? "bg-[#f05e38]/10 border-[#f05e38]/30 text-[#f05e38]"
                                                        : "bg-neutral-50 border-neutral-200 text-neutral-500 hover:text-neutral-700"
                                                }`}
                                            >
                                                {m === "none" ? "Role Match Only" : "Paste Full JD"}
                                            </button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {jdMode === "custom" && (
                                            <motion.div key="custom" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                                                <textarea
                                                    rows={6}
                                                    placeholder="Paste the full job description text here for deeper keyword matching..."
                                                    value={customJd}
                                                    onChange={(e) => setCustomJd(e.target.value)}
                                                    className="w-full glass-input rounded-xl px-3 py-2.5 text-xs outline-none border border-neutral-200 bg-white resize-none custom-scrollbar"
                                                />
                                                {customJd.trim() && (
                                                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#f05e38]">
                                                        <CheckCircle className="w-3 h-3" /> {customJd.trim().split(/\s+/).length} words — full JD will override role preset
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                        {jdMode === "none" && role && (
                                            <motion.div key="roleonly" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-neutral-500 leading-relaxed">
                                                Gap analysis will run against the <span className="text-[#f05e38] font-semibold">{role}</span> preset keyword library.
                                                Paste the actual JD for more precise matching.
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </GlassCard>

                                {/* Analyze Button */}
                                <AnimatedButton onClick={handleAnalyze} disabled={loading} className="w-full flex items-center justify-center gap-2 py-4">
                                    {loading ? (
                                        <><RefreshCw className="w-4 h-4 animate-spin" /> Deep Analyzing...</>
                                    ) : (
                                        <><Sparkles className="w-4 h-4" /> Deep ATS Scan</>
                                    )}
                                </AnimatedButton>

                                {/* Error */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 flex items-start gap-2"
                                    >
                                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}

                                {/* Word Stats (after analysis) */}
                                {result && result.is_valid !== false && (
                                    <GlassCard delay={0.4} className="p-5 bg-white border border-neutral-200/55">
                                        <WordStatsDonut result={result} />
                                    </GlassCard>
                                )}
                            </div>

                            {/* ─── Right Results Panel ─── */}
                            <div className="md:col-span-2">
                                <GlassCard delay={0.3} className="p-6 min-h-[600px] bg-white border border-neutral-200/50">
                                    {loading ? (
                                        /* Loading Skeleton */
                                        <div className="h-full min-h-[550px] flex flex-col items-center justify-center text-center space-y-6">
                                            <div className="relative flex items-center justify-center">
                                                <div className="w-24 h-24 rounded-full border-4 border-[#f05e38]/15 border-t-[#f05e38] animate-spin" />
                                                <BrainCircuit className="w-10 h-10 text-[#f05e38] absolute animate-pulse" />
                                            </div>
                                            <div className="space-y-3">
                                                <GlowChip color="neon" className="text-xs">
                                                    <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "3s" }} /> Word-Level ATS Engine
                                                </GlowChip>
                                                <h3 className="text-2xl font-black text-neutral-800 tracking-tight">Analyzing Every Word...</h3>
                                                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                                                    Classifying each word as keyword, action verb, metric, or filler.
                                                    Scoring 12 professional dimensions for <strong className="text-[#f05e38]">{role}</strong>.
                                                    {(jdMode !== "none") && " Running JD gap analysis..."}
                                                </p>
                                            </div>
                                            <div className="w-full max-w-sm space-y-3">
                                                <SkeletonPulse lines={3} />
                                                <div className="flex justify-between text-[10px] text-neutral-400">
                                                    <span>Extracting text...</span>
                                                    <span>Scoring dimensions...</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : result ? (
                                        result.is_valid === false ? (
                                            /* Invalid Document */
                                            <div className="space-y-6">
                                                <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                                                    <div className="flex items-center gap-3 text-rose-600">
                                                        <AlertTriangle className="w-6 h-6 shrink-0" />
                                                        <h3 className="text-lg font-bold">Document Rejected</h3>
                                                    </div>
                                                    <p className="text-sm text-neutral-700 leading-relaxed">
                                                        {result.error_message || "The uploaded document does not appear to be a valid resume."}
                                                    </p>
                                                </div>
                                                <div className="glass-card rounded-2xl p-6 space-y-4 bg-white border border-neutral-200">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600">Required Fixes</h4>
                                                    <ul className="space-y-2 text-xs text-neutral-600">
                                                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span>Upload a genuine .pdf or .docx resume.</li>
                                                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span>Ensure the document includes standard headers: Education, Experience, Skills, Projects.</li>
                                                        <li className="flex items-start gap-2"><span className="text-amber-500 font-bold">•</span>Ensure the document contains at least 50 words of readable content.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        ) : (
                                            /* ─── ANALYSIS RESULTS ─── */
                                            <div className="space-y-6">
                                                {/* Tab Navigation */}
                                                <div className="flex gap-1 bg-neutral-100 rounded-2xl p-1 border border-neutral-200 overflow-x-auto no-scrollbar">
                                                    {tabs.map((tab) => (
                                                        <button
                                                            key={tab.key}
                                                            onClick={() => setActiveTab(tab.key)}
                                                            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap px-2 ${
                                                                activeTab === tab.key
                                                                    ? "text-white"
                                                                    : "text-neutral-500 hover:text-neutral-800"
                                                            }`}
                                                        >
                                                            {activeTab === tab.key && (
                                                                <motion.div
                                                                    layoutId="resumeTabPill"
                                                                    className="absolute inset-0 bg-[#1D1B18] border border-[#1D1B18] rounded-xl"
                                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                                />
                                                            )}
                                                            <span className="relative z-10 flex items-center gap-1.5">{tab.icon} {tab.label}</span>
                                                            {tab.key === "jd" && (
                                                                <span className="relative z-10 ml-1 w-1.5 h-1.5 rounded-full bg-[#f05e38] animate-pulse" />
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* ─── OVERVIEW TAB ─── */}
                                                {activeTab === "overview" && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
                                                        <div className="flex flex-col sm:flex-row items-center gap-6 border-b border-neutral-200/50 pb-6">
                                                            <ScoreRing score={result.overall_score} grade={result.grade} />
                                                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                                                <h2 className="text-xl font-black text-neutral-850">ATS Compatibility Score</h2>
                                                                <p className="text-xs text-neutral-500">
                                                                    Target Role: <span className="text-[#f05e38] font-bold">{role}</span>
                                                                </p>
                                                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                                                    <GlowChip color="neon">{result.total_words} words</GlowChip>
                                                                    <GlowChip color="blue">{result.strong_keyword_count} keywords</GlowChip>
                                                                    <GlowChip color="orange">{result.action_verb_count} action verbs</GlowChip>
                                                                    {result.filler_count > 0 && <GlowChip color="rose">{result.filler_count} fillers</GlowChip>}
                                                                    {result.jd_match && <GlowChip color="purple">JD: {result.jd_match.jd_match_score}% match</GlowChip>}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">12-Dimension Professional Rubric</h3>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
                                                                {dimensionData.map((dim) => (
                                                                    <DimensionBar key={dim.label} label={dim.label} score={dim.score} icon={dimensionIcons[dim.label]} />
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-4">
                                                            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/50 space-y-3">
                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f05e38] flex items-center gap-2">
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Matching Skills ({result.matching_skills.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {result.matching_skills.slice(0, 15).map((skill, i) => (
                                                                        <span key={i} className="text-[10px] bg-[#f05e38]/8 border border-[#f05e38]/20 text-[#f05e38] px-2 py-0.5 rounded-full">{skill}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200/50 space-y-3">
                                                                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                                                                    <AlertCircle className="w-3.5 h-3.5" /> Missing Keywords ({result.missing_keywords.length})
                                                                </h4>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {result.missing_keywords.slice(0, 12).map((kw, i) => (
                                                                        <span key={i} className="text-[10px] bg-rose-50 border border-rose-200 text-rose-500 px-2 py-0.5 rounded-full">{kw}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {result.strengths.length > 0 && (
                                                            <div className="space-y-2">
                                                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Key Strengths</h3>
                                                                <div className="space-y-1.5">
                                                                    {result.strengths.map((s, i) => (
                                                                        <div key={i} className="text-xs text-neutral-600 flex items-start gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200/50">
                                                                            <span className="text-[#f05e38] font-bold shrink-0">✓</span> {s}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* ─── ANNOTATED TAB ─── */}
                                                {activeTab === "annotated" && result.resume_text && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                                        <AnnotatedResumeViewer result={result} />
                                                    </motion.div>
                                                )}

                                                {/* ─── SECTIONS TAB ─── */}
                                                {activeTab === "sections" && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
                                                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                                            <LayoutGrid className="w-3.5 h-3.5" /> Section-by-Section Scorecard
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {result.section_scores.map((sec, i) => <SectionCard key={i} section={sec} />)}
                                                        </div>
                                                        {result.section_scores.length === 0 && (
                                                            <div className="text-center py-12 text-neutral-500 text-sm">No sections detected in resume.</div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* ─── ACTIONS TAB ─── */}
                                                {activeTab === "actions" && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
                                                        {result.weak_phrases.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-2">
                                                                    <AlertTriangle className="w-3.5 h-3.5" /> Weak Phrases → Rewrites
                                                                </h3>
                                                                <div className="space-y-2">
                                                                    {result.weak_phrases.map((wp, i) => (
                                                                        <div key={i} className="bg-neutral-50 border border-neutral-200/50 rounded-xl p-3 space-y-2">
                                                                            <div className="text-[10px] text-neutral-500">{wp.location}</div>
                                                                            <div className="flex items-center gap-2 text-xs flex-wrap">
                                                                                <span className="bg-rose-50 text-rose-500 px-2 py-0.5 rounded border border-rose-200 line-through">&quot;{wp.phrase}&quot;</span>
                                                                                <span className="text-neutral-400">→</span>
                                                                                <span className="bg-[#f05e38]/8 text-[#f05e38] px-2 py-0.5 rounded border border-[#f05e38]/20">{wp.rewrite}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="space-y-3">
                                                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                                                                <Zap className="w-3.5 h-3.5" /> Recommended Action Items
                                                            </h3>
                                                            <div className="space-y-1.5">
                                                                {result.suggestions.map((item, i) => (
                                                                    <div key={i} className="text-xs text-neutral-600 flex items-start gap-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200/50">
                                                                        <span className="text-[#f05e38] font-bold shrink-0">{i + 1}.</span> {item}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {result.missing_keywords.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Keywords to Add</h3>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {result.missing_keywords.map((kw, i) => (
                                                                        <span key={i} className="text-[10px] bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-1 rounded-full font-medium">+ {kw}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                )}

                                                {/* ─── JD MATCH TAB ─── */}
                                                {activeTab === "jd" && result.jd_match && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                                                        <JDGapPanel jd={result.jd_match} />
                                                    </motion.div>
                                                )}
                                            </div>
                                        )
                                    ) : (
                                        /* Empty State */
                                        <div className="h-full min-h-[550px] flex flex-col items-center justify-center text-center space-y-5">
                                            <motion.div
                                                animate={{ y: [0, -8, 0] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                                className="relative"
                                            >
                                                <div className="w-20 h-20 rounded-full bg-[#f05e38]/5 border border-[#f05e38]/10 flex items-center justify-center">
                                                    <BrainCircuit className="w-10 h-10 text-neutral-400 animate-pulse" />
                                                </div>
                                            </motion.div>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-neutral-400">No Analysis Generated Yet</h3>
                                                <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                                                    Upload your .pdf or .docx resume and enter a target role to run the Sarvagya Deep ATS Scanner.
                                                    Optionally add a Job Description for gap analysis.
                                                </p>
                                            </div>
                                            <div className="flex gap-3 text-[10px] text-neutral-500 font-medium">
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#f05e38] shadow-sm" />Keywords</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" style={{ boxShadow: "0 0 6px rgba(59,130,246,0.15)" }} />Action Verbs</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 6px rgba(16,185,129,0.15)" }} />Metrics</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" style={{ boxShadow: "0 0 6px rgba(239,68,68,0.15)" }} />Fillers</span>
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>
                            </div>
                        </div>
                    </div>
                </PageTransition>
            </main>
        </div>
    );
}