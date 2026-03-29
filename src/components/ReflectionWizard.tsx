/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, ReflectionStep, LessonType, SkillFocus, ReflectionData } from '../types';
import { GIBBS_STEPS, LESSON_TYPES, SKILL_FOCUSES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2, MessageSquare, BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';
import { analyzeReflection, generateAdaptiveQuestions } from '../services/gemini';
import { db, collection, addDoc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import ReflectionReport from './ReflectionReport';

export default function ReflectionWizard({ profile, onComplete }: { profile: UserProfile | null, onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [lessonType, setLessonType] = useState<LessonType>(LessonType.PPP);
  const [skillFocus, setSkillFocus] = useState<SkillFocus[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReflectionData | null>(null);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questions = await generateAdaptiveQuestions(lessonType, skillFocus, 0); // Assuming 0 reflections for now
        setAdaptiveQuestions(questions);
      } catch (error) {
        console.error('Failed to fetch adaptive questions:', error);
      }
    };
    fetchQuestions();
  }, [lessonType, skillFocus]);

  const currentStepData = GIBBS_STEPS[step];

  const handleNext = async () => {
    if (step < GIBBS_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setIsAnalyzing(true);
      try {
        const reflectionData: Partial<ReflectionData> = {
          userId: profile?.uid || '',
          lessonType,
          skillFocus,
          week: 1, // Dynamic week logic could be added
          description: responses[ReflectionStep.DESCRIPTION] || '',
          feelings: responses[ReflectionStep.FEELINGS] || '',
          evaluation: responses[ReflectionStep.EVALUATION] || '',
          analysis: responses[ReflectionStep.ANALYSIS] || '',
          conclusion: responses[ReflectionStep.CONCLUSION] || '',
          actionPlan: responses[ReflectionStep.ACTION_PLAN] || '',
        };

        const aiFeedback = await analyzeReflection(reflectionData);
        
        const finalReflection: ReflectionData = {
          ...reflectionData as ReflectionData,
          createdAt: Timestamp.now(),
          aiFeedback,
          xpEarned: 100 + (aiFeedback.depthScore * 10),
          badgesEarned: aiFeedback.depthScore >= 8 ? ['deep_thinker'] : [],
        };

        // Save to Firestore
        const reflectionsPath = 'reflections';
        try {
          await addDoc(collection(db, reflectionsPath), finalReflection);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, reflectionsPath);
        }
        
        setAnalysisResult(finalReflection);
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };


  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const updateResponse = (val: string) => {
    setResponses({ ...responses, [currentStepData.id]: val });
  };

  if (analysisResult) {
    return (
      <div className="space-y-8">
        <ReflectionReport reflection={analysisResult} onBack={onComplete} />
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-primary-100 rounded-3xl flex items-center justify-center text-primary-600"
        >
          <BrainCircuit size={48} />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-2xl font-display font-bold text-slate-900">AI Mentor is Analyzing...</h2>
          <p className="text-slate-500">Evaluating your reflection based on Bloom's Taxonomy and ELT principles.</p>
        </div>
        <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3 }}
            className="h-full bg-primary-500"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-slate-900">Guided Reflection</h1>
          <p className="text-slate-500">Step {step + 1} of {GIBBS_STEPS.length}: {currentStepData.title}</p>
        </div>
        <div className="flex gap-1">
          {GIBBS_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-8 rounded-full transition-all",
                i <= step ? "bg-primary-500" : "bg-slate-200"
              )}
            />
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-8 rounded-3xl space-y-6"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">{currentStepData.description}</h2>
              <div className="space-y-2">
                {currentStepData.questions.map((q, i) => (
                  <p key={i} className="text-slate-600 flex gap-2">
                    <span className="text-primary-500 font-bold">?</span> {q}
                  </p>
                ))}
                {step === 0 && adaptiveQuestions.length > 0 && (
                  <div className="mt-4 p-4 bg-primary-50 rounded-2xl border border-primary-100 space-y-2">
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={14} />
                      AI Mentor's Adaptive Questions
                    </p>
                    {adaptiveQuestions.map((q, i) => (
                      <p key={i} className="text-sm text-primary-800 font-medium">
                        {q}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <textarea
              value={responses[currentStepData.id] || ''}
              onChange={(e) => updateResponse(e.target.value)}
              placeholder="Type your reflection here..."
              className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
            />

            <div className="flex flex-wrap gap-2">
              {currentStepData.sentenceStarters.map((s, i) => (
                <button
                  key={i}
                  onClick={() => updateResponse((responses[currentStepData.id] || '') + s)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-primary-500 hover:text-primary-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-slate-900 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
              Back
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold shadow-lg shadow-primary-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {step === GIBBS_STEPS.length - 1 ? 'Finish & Analyze' : 'Next Step'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-primary-600 font-bold">
              <Sparkles size={20} />
              AI Assistant
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              "Great start! Try to be specific about the student reactions during the task. Did they seem engaged or confused?"
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-900">Lesson Context</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Lesson Type</label>
                <select
                  value={lessonType}
                  onChange={(e) => setLessonType(e.target.value as LessonType)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Skill Focus</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_FOCUSES.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        if (skillFocus.includes(s)) setSkillFocus(skillFocus.filter(f => f !== s));
                        else setSkillFocus([...skillFocus, s]);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs transition-all",
                        skillFocus.includes(s)
                          ? "bg-primary-500 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
