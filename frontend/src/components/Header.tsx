'use client';

import React from 'react';
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
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streakCount?: number;
  userName?: string;
}

export default function Header({ activeTab, setActiveTab, streakCount = 7, userName = "Aditya Kaushik" }: HeaderProps) {
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume', label: 'ATS Resume AI', icon: FileText },
    { id: 'interview', label: 'Mock Interviewer', icon: MessageSquareCode },
    { id: 'roadmap', label: 'Placement Roadmap', icon: Map },
    { id: 'practice', label: 'Practice Arena', icon: Code2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-md border-b border-indigo-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold tracking-tight gradient-text">
                  Sarvagya
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-indigo-400" /> AI Engine
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium">
                AI-Powered College Placement & Career Platform
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-gray-900/60 p-1.5 rounded-xl border border-gray-800">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status & User Profile */}
          <div className="flex items-center space-x-4">
            {/* Streak Counter Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-semibold shadow-inner">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
              <span>{streakCount} Day Streak</span>
            </div>

            {/* FastAPI Status Pill */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>FastAPI Live</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-2 border-l border-gray-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {userName.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-bold text-gray-200">{userName}</div>
                <div className="text-[10px] text-gray-400">SDE Aspirant</div>
              </div>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-gray-800 gap-2 no-scrollbar">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/60 text-gray-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
