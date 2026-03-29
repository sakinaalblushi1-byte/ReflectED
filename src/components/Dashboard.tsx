/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ReflectionDepthChart, SkillGrowthChart } from './AnalyticsCharts';
import { TrendingUp, Award, Zap, Calendar, ArrowUpRight, MessageSquare, Plus, Zap as ZapIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import QuickReflection from './QuickReflection';

export default function Dashboard({ profile }: { profile: UserProfile | null }) {
  const [showQuickReflect, setShowQuickReflect] = useState(false);

  if (showQuickReflect) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setShowQuickReflect(false)}
          className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        <QuickReflection profile={profile} onComplete={() => setShowQuickReflect(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-slate-900">Welcome back, {profile?.displayName?.split(' ')[0]}!</h1>
          <p className="text-slate-500">You're making great progress. Ready for your Week 1 reflection?</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowQuickReflect(true)}
            className="px-4 py-2 bg-amber-500 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all"
          >
            <ZapIcon size={16} />
            Quick Reflect
          </button>
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 shadow-sm">
            <Calendar size={16} className="text-primary-500" />
            Week 1
          </div>
          <div className="px-4 py-2 bg-primary-600 text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary-200">
            <Zap size={16} />
            {profile?.xp || 0} XP
          </div>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Reflection Streak</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-bold text-primary-600">{profile?.streak || 0}</p>
            <p className="text-sm font-bold text-slate-400">Days</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-green-600">
            <ArrowUpRight size={14} />
            Keep it up!
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Award size={80} />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Growth Level</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-bold text-primary-600">{profile?.level || 1}</p>
            <p className="text-sm font-bold text-slate-400">Trainee</p>
          </div>
          <div className="mt-4 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 w-1/3" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <MessageSquare size={80} />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">AI Insights</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-display font-bold text-primary-600">12</p>
            <p className="text-sm font-bold text-slate-400">Total</p>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-medium italic">"Your instruction clarity improved by 15% this week!"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Reflection Depth Trend</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bloom's Taxonomy</span>
          </div>
          <ReflectionDepthChart />
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Skill Growth</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                ENGAGEMENT
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <div className="w-2 h-2 rounded-full bg-primary-200" />
                CLARITY
              </div>
            </div>
          </div>
          <SkillGrowthChart />
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-6">Recent AI Feedback Summary</h2>
        <div className="space-y-4">
          {[
            { title: 'Classroom Management', score: 85, color: 'bg-green-500' },
            { title: 'Instruction Clarity', score: 72, color: 'bg-primary-500' },
            { title: 'Student Engagement', score: 64, color: 'bg-amber-500' },
          ].map((item) => (
            <div key={item.title} className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-700">{item.title}</span>
                <span className="text-slate-500">{item.score}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${item.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

