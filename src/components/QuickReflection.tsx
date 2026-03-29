/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Zap, Send, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { analyzeReflection } from '../services/gemini';
import { db, collection, addDoc, Timestamp } from '../firebase';
import { UserProfile, ReflectionData, LessonType, SkillFocus } from '../types';

export default function QuickReflection({ profile, onComplete }: { profile: UserProfile | null, onComplete: () => void }) {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    try {
      const reflectionData: Partial<ReflectionData> = {
        userId: profile?.uid || '',
        lessonType: LessonType.OTHER,
        skillFocus: [],
        week: 1,
        description: content,
        feelings: 'Quick reflection',
        evaluation: 'Quick reflection',
        analysis: 'Quick reflection',
        conclusion: 'Quick reflection',
        actionPlan: 'Quick reflection',
      };

      const aiFeedback = await analyzeReflection(reflectionData);
      
      const finalReflection: ReflectionData = {
        ...reflectionData as ReflectionData,
        createdAt: Timestamp.now(),
        aiFeedback,
        xpEarned: 50,
        badgesEarned: [],
      };

      await addDoc(collection(db, 'reflections'), finalReflection);
      onComplete();
    } catch (error) {
      console.error('Quick reflection failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="glass-card p-8 rounded-3xl space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 text-primary-600 font-bold">
        <Zap size={24} />
        Quick 2-Minute Reflection
      </div>
      <p className="text-sm text-slate-500">Short on time? Just write a few sentences about your lesson and get instant AI feedback.</p>
      
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind about today's lesson?"
        className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
      />

      <button
        onClick={handleSubmit}
        disabled={isAnalyzing || !content.trim()}
        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all disabled:opacity-50"
      >
        {isAnalyzing ? (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <BrainCircuit size={20} />
          </motion.div>
        ) : (
          <Send size={20} />
        )}
        {isAnalyzing ? 'Analyzing...' : 'Send to AI Mentor'}
      </button>
    </div>
  );
}
