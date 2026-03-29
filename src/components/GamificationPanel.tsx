/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Zap, TrendingUp, Star, Shield, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { BADGES } from '../constants';

export default function GamificationPanel({ profile }: { profile: UserProfile | null }) {
  const xpToNextLevel = 1000;
  const progress = ((profile?.xp || 0) % xpToNextLevel) / xpToNextLevel * 100;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-slate-900">Achievements</h1>
          <p className="text-slate-500">Track your professional growth and earn rewards.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-card p-8 rounded-3xl text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * progress) / 100}
                  className="text-primary-600 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-primary-600">{profile?.level || 1}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Level</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Level {profile?.level || 1} Trainee</h3>
              <p className="text-sm text-slate-500">{xpToNextLevel - ((profile?.xp || 0) % xpToNextLevel)} XP to Level {(profile?.level || 1) + 1}</p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-slate-900">{profile?.xp || 0}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Total XP</p>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-slate-900">{profile?.streak || 0}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">Day Streak</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl space-y-8">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
              <Award size={18} className="text-primary-500" />
              Your Badges
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {BADGES.map((badge) => {
                const isEarned = profile?.badges?.includes(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "p-6 rounded-2xl flex flex-col items-center text-center space-y-3 transition-all border-2",
                      isEarned 
                        ? "bg-white border-primary-100 shadow-lg shadow-primary-50" 
                        : "bg-slate-50 border-transparent grayscale opacity-50"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                      isEarned ? "bg-primary-100 text-primary-600" : "bg-slate-200 text-slate-400"
                    )}>
                      {badge.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900">{badge.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight">{badge.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
