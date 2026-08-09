"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-6 md:p-12 max-w-7xl mx-auto"
        >
            {children}
        </motion.div>
    );
}

export function CardAnimation({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay }}
        >
            {children}
        </motion.div>
    );
}

export function AnimatedButton({
    children,
    onClick,
    variant = 'primary',
    className = ""
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
}) {
    const base = "px-6 py-3 rounded-full font-bold text-sm tracking-wide transition duration-300 cursor-pointer";
    const primary = "bg-[#76B900] text-black hover:bg-[#88d400]";
    const secondary = "bg-[#1A1A1A] text-white border border-[#333] hover:border-[#76B900]";

    return (
        <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className={`${base} ${variant === 'primary' ? primary : secondary} ${className}`}
        >
            {children}
        </motion.button>
    );
}