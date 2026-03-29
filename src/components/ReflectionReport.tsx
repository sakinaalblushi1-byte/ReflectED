/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, TrendingUp, Target, Lightbulb, CheckCircle2, ArrowRight, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { ReflectionData } from '../types';

export default function ReflectionReport({ reflection, onBack }: { reflection: ReflectionData, onBack: () => void }) {
  const { aiFeedback } = reflection;
  
  if (!aiFeedback) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 max-w-4xl mx-auto pb-12"
    >
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-slate-900">AI Mentor Report</h1>
          <p className="text-slate-500">Your reflection has been analyzed. Here are your insights.</p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          Back to Dashboard
        </button>
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
                  strokeDashoffset={377 - (377 * (aiFeedback.depthScore || 0) * 10) / 100}
                  className="text-primary-600 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold text-primary-600">{aiFeedback.depthScore || 0}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Depth Score</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900">Reflection Depth</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Based on Bloom's Taxonomy, your reflection shows a high level of critical evaluation.
              </p>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Target size={18} className="text-primary-500" />
              Personalized Goals
            </h3>
            <ul className="space-y-3">
              {aiFeedback.personalizedGoals?.map((goal, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="shrink-0 text-primary-500 mt-0.5" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="glass-card p-6 rounded-3xl bg-primary-600 text-white space-y-4 shadow-xl shadow-primary-200">
            <h3 className="font-bold flex items-center gap-2">
              <BrainCircuit size={18} />
              TTT vs STT Check
            </h3>
            <p className="text-xs leading-relaxed opacity-90">
              {aiFeedback.ttt_stt_check}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Award size={24} className="text-amber-500" />
                Mentor Feedback
              </h3>
              <p className="text-slate-600 leading-relaxed italic">
                "{aiFeedback.constructiveFeedback}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" />
                  Key Insights
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Classroom Management</p>
                    <p className="text-xs text-slate-600">{aiFeedback.classroomManagement}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Student Engagement</p>
                    <p className="text-xs text-slate-600">{aiFeedback.studentEngagement}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Instruction Clarity</p>
                    <p className="text-xs text-slate-600">{aiFeedback.instructionClarity}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb size={18} className="text-amber-500" />
                  Growth Strategies
                </h4>
                <ul className="space-y-3">
                  {aiFeedback.suggestedStrategies?.map((strategy, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <ArrowRight size={16} className="shrink-0 text-primary-400 mt-0.5" />
                      {strategy}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
