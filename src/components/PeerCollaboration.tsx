/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, MessageSquare, Star, ShieldCheck, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, PeerFeedback } from '../types';

export default function PeerCollaboration({ profile }: { profile: UserProfile | null }) {
  const [activeTab, setActiveTab] = useState<'peer' | 'supervisor'>('peer');
  const [feedback, setFeedback] = useState('');

  const mockPeerFeedback: PeerFeedback[] = [
    {
      id: '1',
      reflectionId: 'ref1',
      authorId: 'peer1',
      authorName: 'Ahmed Al-Farsi',
      content: 'I really liked how you handled the transition between the reading task and the speaking activity. Very smooth!',
      createdAt: { seconds: 1711712429, nanoseconds: 0 } as any,
      rating: 5,
    },
    {
      id: '2',
      reflectionId: 'ref1',
      authorId: 'sup1',
      authorName: 'Dr. Sarah Smith',
      content: 'Good use of CCQs, but try to give students more wait time after asking a question.',
      createdAt: { seconds: 1711712429, nanoseconds: 0 } as any,
      rating: 4,
      isSupervisor: true,
    }
  ];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-slate-900">Collaboration</h1>
          <p className="text-slate-500">Connect with peers and supervisors for professional growth.</p>
        </div>
      </header>

      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('peer')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'peer' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <Users size={18} />
          Peer Feedback
        </button>
        <button
          onClick={() => setActiveTab('supervisor')}
          className={cn(
            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
            activeTab === 'supervisor' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ShieldCheck size={18} />
          Supervisor Comments
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {mockPeerFeedback
            .filter(f => activeTab === 'supervisor' ? f.isSupervisor : !f.isSupervisor)
            .map((f) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-3xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      {f.authorName[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{f.authorName}</h4>
                      <p className="text-xs text-slate-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < (f.rating || 0) ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 leading-relaxed">{f.content}</p>
              </motion.div>
            ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary-500" />
              Give Feedback
            </h3>
            <p className="text-sm text-slate-500">Select a peer's reflection to provide constructive feedback.</p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-sm"
            />
            <button className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all">
              <Send size={18} />
              Post Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
