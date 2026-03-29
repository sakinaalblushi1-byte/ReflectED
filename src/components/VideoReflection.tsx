/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Video, Play, Pause, Plus, Trash2, BrainCircuit, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { analyzeVideoReflection } from '../services/gemini';

interface TimestampReflection {
  id: string;
  time: number;
  content: string;
  aiInsight?: string;
}

export default function VideoReflection() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [reflections, setReflections] = useState<TimestampReflection[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  const addReflection = () => {
    if (!videoRef.current) return;
    const newRef: TimestampReflection = {
      id: Math.random().toString(36).substr(2, 9),
      time: videoRef.current.currentTime,
      content: '',
    };
    setReflections([...reflections, newRef].sort((a, b) => a.time - b.time));
  };

  const updateReflection = (id: string, content: string) => {
    setReflections(reflections.map(r => r.id === id ? { ...r, content } : r));
  };

  const deleteReflection = (id: string) => {
    setReflections(reflections.filter(r => r.id !== id));
  };

  const analyzeMoment = async (id: string) => {
    const reflection = reflections.find(r => r.id === id);
    if (!reflection || !reflection.content) return;

    setIsAnalyzing(id);
    try {
      const aiInsight = await analyzeVideoReflection(reflection.content, reflection.time);
      setReflections(reflections.map(r => 
        r.id === id ? { ...r, aiInsight } : r
      ));
    } catch (error) {
      console.error('Video analysis failed:', error);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-slate-900">Video Reflection</h1>
          <p className="text-slate-500">Analyze your teaching moments with AI-powered insights.</p>
        </div>
      </header>

      {!videoUrl ? (
        <div className="glass-card p-12 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
            <Video size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Upload Teaching Video</h3>
            <p className="text-slate-500 max-w-xs">Select a video of your lesson to start timestamped reflection.</p>
          </div>
          <label className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-semibold cursor-pointer hover:bg-primary-700 transition-all shadow-lg shadow-primary-200">
            Select Video File
            <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full"
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-4 bg-black/50 backdrop-blur-md p-2 rounded-xl">
                <button onClick={() => videoRef.current?.paused ? videoRef.current.play() : videoRef.current?.pause()} className="text-white">
                  {videoRef.current?.paused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <div className="flex-1 h-1 bg-white/20 rounded-full">
                  <div 
                    className="h-full bg-primary-500 rounded-full" 
                    style={{ width: `${(currentTime / (videoRef.current?.duration || 1)) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white font-mono">{formatTime(currentTime)}</span>
              </div>
            </div>
            <button
              onClick={addReflection}
              className="w-full py-4 bg-white border-2 border-primary-600 text-primary-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-50 transition-all"
            >
              <Plus size={20} />
              Add Reflection at {formatTime(currentTime)}
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Play size={18} className="text-primary-500" />
              Timestamped Reflections
            </h3>
            <AnimatePresence initial={false}>
              {reflections.length === 0 ? (
                <p className="text-slate-400 text-center py-12 italic">No reflections added yet. Play the video and click "Add Reflection" at key moments.</p>
              ) : (
                reflections.map((ref) => (
                  <motion.div
                    key={ref.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-6 rounded-2xl space-y-4 border-l-4 border-l-primary-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold font-mono">
                        {formatTime(ref.time)}
                      </span>
                      <button onClick={() => deleteReflection(ref.id)} className="text-slate-400 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <textarea
                      value={ref.content}
                      onChange={(e) => updateReflection(ref.id, e.target.value)}
                      placeholder="What was happening here? How did you feel?"
                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                    />
                    {ref.aiInsight ? (
                      <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 text-xs text-primary-800 flex gap-3">
                        <Sparkles size={16} className="shrink-0 text-primary-500" />
                        <p>{ref.aiInsight}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => analyzeMoment(ref.id)}
                        disabled={isAnalyzing === ref.id || !ref.content}
                        className="flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-700 disabled:opacity-50"
                      >
                        {isAnalyzing === ref.id ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                            <BrainCircuit size={14} />
                          </motion.div>
                        ) : (
                          <BrainCircuit size={14} />
                        )}
                        Get AI Insight
                      </button>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
