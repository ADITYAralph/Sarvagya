"use client";

import { motion, type Variants } from "framer-motion";
import React from "react";

/* ─── Animation Variants ─────────────────────────────────── */

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const fadeSlideUp: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

/* ─── Page Transition (Staggered Container) ──────────────── */

export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="p-6 md:p-12 max-w-7xl mx-auto"
        >
            {children}
        </motion.div>
    );
}

/* ─── Stagger Container ──────────────────────────────────── */

export function StaggerContainer({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: 0.08,
                        delayChildren: delay,
                    },
                },
            }}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Card Animation (Enhanced) ──────────────────────────── */

export function CardAnimation({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay,
            }}
            whileHover={{ scale: 1.008, transition: { duration: 0.2 } }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Glass Card ─────────────────────────────────────────── */

export function GlassCard({
    children,
    className = "",
    neon = false,
    hover = true,
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    neon?: boolean;
    hover?: boolean;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay,
            }}
            whileHover={
                hover
                    ? { scale: 1.012, transition: { duration: 0.25, ease: "easeOut" } }
                    : undefined
            }
            className={`${neon ? 'glass-card-neon' : 'glass-card'} rounded-3xl ${className}`}
        >
            {children}
        </motion.div>
    );
}

/* ─── Section Reveal ─────────────────────────────────────── */

export function SectionReveal({
    children,
    className = "",
    delay = 0,
}: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Animated Button (Enhanced) ─────────────────────────── */

export function AnimatedButton({
    children,
    onClick,
    variant = 'primary',
    className = "",
    disabled = false,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
    disabled?: boolean;
}) {
    const base = "px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer focus-neon relative overflow-hidden";
    const primary = "bg-[#f05e38] text-white hover:bg-[#ff7c5c] shadow-neon-sm hover:shadow-neon";
    const secondary = "bg-black/[0.03] text-[#1c1c1a] border border-black/10 hover:border-[#f05e38]/40 hover:shadow-neon-sm backdrop-blur-sm";

    return (
        <motion.button
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variant === 'primary' ? primary : secondary} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </motion.button>
    );
}

/* ─── Skeleton Pulse Loader ──────────────────────────────── */

export function SkeletonPulse({
    lines = 3,
    className = "",
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="shimmer-skeleton h-3 rounded-lg"
                    style={{
                        width: `${85 - i * 12}%`,
                        animationDelay: `${i * 0.15}s`,
                    }}
                />
            ))}
        </div>
    );
}

/* ─── Glow Chip / Capsule Badge ──────────────────────────── */

export function GlowChip({
    children,
    color = "neon",
    className = "",
}: {
    children: React.ReactNode;
    color?: "neon" | "blue" | "orange" | "rose" | "amber" | "purple" | "emerald" | "indigo";
    className?: string;
}) {
    const colorMap: Record<string, string> = {
        neon: "bg-[#f05e38]/8 border-[#f05e38]/25 text-[#f05e38]",
        blue: "bg-blue-400/8 border-blue-400/25 text-blue-400",
        orange: "bg-orange-400/8 border-orange-400/25 text-orange-400",
        rose: "bg-rose-400/8 border-rose-400/25 text-rose-400",
        amber: "bg-amber-400/8 border-amber-400/25 text-amber-400",
        purple: "bg-purple-400/8 border-purple-400/25 text-purple-400",
        emerald: "bg-emerald-400/8 border-emerald-400/25 text-emerald-400",
        indigo: "bg-indigo-400/8 border-indigo-400/25 text-indigo-400",
    };

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glow-chip ${colorMap[color] || colorMap.neon} ${className}`}
        >
            {children}
        </motion.span>
    );
}