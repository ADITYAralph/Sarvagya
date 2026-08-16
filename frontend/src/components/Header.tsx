'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  MessageSquareCode, 
  Map, 
  Code2, 
  LayoutDashboard,
  Flame,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  streakCount?: number;
  userName?: string;
}

export default function Header({ activeTab, setActiveTab, streakCount = 7, userName = "Aditya Kaushik" }: HeaderProps) {
  const pathname = usePathname();

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { id: 'resume', label: 'ATS Resume AI', icon: FileText, href: '/resume' },
    { id: 'interview', label: 'Mock Interviewer', icon: MessageSquareCode, href: '/interview' },
    { id: 'roadmap', label: 'Placement Roadmap', icon: Map, href: '/roadmap' },
    { id: 'practice', label: 'Practice Arena', icon: Code2, href: '/practice' },
  ];

  const currentTab = activeTab || (
    pathname === '/resume' ? 'resume' :
    pathname === '/interview' ? 'interview' :
    pathname === '/roadmap' ? 'roadmap' :
    pathname === '/practice' ? 'practice' : 'dashboard'
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 bg-[#ffffff]/90 backdrop-blur-xl border-b border-black/[0.05] shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab && setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-[#f05e38] via-[#ff7c5c] to-[#d04622] p-0.5 shadow-neon-sm group-hover:shadow-neon transition-shadow duration-300">
              <div className="w-full h-full bg-[#ffffff] rounded-[10px] flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-5 h-5 text-[#f05e38]" />
                </motion.div>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold tracking-tight gradient-text">
                  Sarvagya
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#f05e38]/10 text-[#f05e38] border border-[#f05e38]/20 rounded-full flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-[#f05e38]" /> AI Engine
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 font-medium tracking-wide">
                AI-Powered College Placement & Career Platform
              </p>
            </div>
          </Link>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-black/[0.02] p-1.5 rounded-2xl border border-black/[0.04] backdrop-blur-sm">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              
              if (setActiveTab) {
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-[#f05e38]'
                        : 'text-neutral-500 hover:text-neutral-800'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-[#f05e38]/10 border border-[#f05e38]/20 rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#f05e38]' : ''}`} />
                      <span>{tab.label}</span>
                    </span>
                  </motion.button>
                );
              }

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-[#f05e38]'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="absolute inset-0 bg-[#f05e38]/10 border border-[#f05e38]/20 rounded-xl"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#f05e38]' : ''}`} />
                    <span>{tab.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status & User Profile */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/8 border border-amber-500/25 rounded-full text-amber-600 text-xs font-semibold backdrop-blur-sm"
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{streakCount} Day Streak</span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/8 border border-emerald-500/25 rounded-full text-emerald-600 text-xs font-medium backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>FastAPI Live</span>
            </motion.div>

            <div className="flex items-center space-x-3 pl-3 border-l border-black/[0.06]">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f05e38] to-[#d04622] text-white flex items-center justify-center font-bold text-sm shadow-neon-sm">
                {userName.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-neutral-800">{userName}</div>
                <div className="text-[10px] text-neutral-500">SDE Aspirant</div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-black/[0.06] gap-2 no-scrollbar">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            if (setActiveTab) {
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#f05e38]/10 text-[#f05e38] border border-[#f05e38]/20'
                      : 'bg-black/[0.02] text-neutral-500 border border-black/[0.04]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            }
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#f05e38]/10 text-[#f05e38] border border-[#f05e38]/20'
                    : 'bg-black/[0.02] text-neutral-500 border border-black/[0.04]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </motion.header>
  );
}
