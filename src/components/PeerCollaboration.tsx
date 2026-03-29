/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Star, ShieldCheck, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile, PeerFeedback, ReflectionData } from '../types';
import { db, collection, query, where, orderBy, onSnapshot, addDoc, Timestamp, handleFirestoreError, OperationType } from '../firebase';
import { cn } from '../lib/utils';

export default function PeerCollaboration({ profile }: { profile: UserProfile | null }) {
  const [activeTab, setActiveTab] = useState<'peer' | 'supervisor'>('peer');
  const [feedback, setFeedback] = useState('');
  const [reflections, setReflections] = useState<ReflectionData[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<ReflectionData | null>(null);
  const [feedbacks, setFeedbacks] = useState<PeerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all reflections (except current user's if we want, but for now all)
  useEffect(() => {
    if (!profile) return;

    const reflectionsPath = 'reflections';
    const q = query(
      collection(db, reflectionsPath),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReflectionData));
      setReflections(data);
      if (data.length > 0 && !selectedReflection) {
        setSelectedReflection(data[0]);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, reflectionsPath);
    });

    return () => unsubscribe();
  }, [profile]);

  // Fetch feedback for selected reflection
  useEffect(() => {
    if (!selectedReflection) return;

    const feedbackPath = 'peerFeedback';
    const q = query(
      collection(db, feedbackPath),
      where('reflectionId', '==', selectedReflection.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerFeedback));
      setFeedbacks(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, feedbackPath);
    });

    return () => unsubscribe();
  }, [selectedReflection]);

  const handlePostFeedback = async () => {
    if (!profile || !selectedReflection || !feedback.trim()) return;

    setSubmitting(true);
    const feedbackPath = 'peerFeedback';
    try {
      const newFeedback: Partial<PeerFeedback> = {
        reflectionId: selectedReflection.id,
        authorId: profile.uid,
        authorName: profile.displayName,
        content: feedback,
        rating: 5, // Default rating
        isSupervisor: profile.role === 'supervisor' || profile.role === 'admin',
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, feedbackPath), newFeedback);
      setFeedback('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, feedbackPath);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

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
          {/* Reflection Selector for Peers */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {reflections.map((ref) => (
              <button
                key={ref.id}
                onClick={() => setSelectedReflection(ref)}
                className={cn(
                  "flex-shrink-0 px-6 py-4 rounded-3xl border-2 transition-all text-left space-y-2",
                  selectedReflection?.id === ref.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-slate-100 bg-white hover:border-slate-200"
                )}
              >
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{ref.lessonType}</p>
                <p className="font-bold text-slate-900 line-clamp-1">{ref.description.substring(0, 30)}...</p>
                <p className="text-[10px] text-slate-500">By {ref.userId === profile?.uid ? 'You' : 'Peer'}</p>
              </button>
            ))}
          </div>

          {selectedReflection && (
            <div className="space-y-6">
              <div className="glass-card p-8 rounded-3xl bg-white border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Reflection Details</h3>
                <p className="text-slate-600 italic mb-6">"{selectedReflection.description}"</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReflection.skillFocus.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={20} className="text-primary-500" />
                  Feedback ({feedbacks.length})
                </h3>
                {feedbacks
                  .filter(f => activeTab === 'supervisor' ? f.isSupervisor : !f.isSupervisor)
                  .map((f) => (
                    <motion.div
                      key={f.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-6 rounded-3xl space-y-4 bg-white border border-slate-100 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                            {f.authorName[0]}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{f.authorName}</h4>
                            <p className="text-xs text-slate-500">
                              {f.createdAt instanceof Timestamp ? f.createdAt.toDate().toLocaleDateString() : 'Just now'}
                            </p>
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
                
                {feedbacks.filter(f => activeTab === 'supervisor' ? f.isSupervisor : !f.isSupervisor).length === 0 && (
                  <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-500">No feedback yet for this reflection.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-4 bg-white border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary-500" />
              Give Feedback
            </h3>
            <p className="text-sm text-slate-500">
              {selectedReflection 
                ? `Providing feedback on ${selectedReflection.lessonType} lesson.`
                : "Select a peer's reflection to provide constructive feedback."}
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write your feedback here..."
              disabled={!selectedReflection || submitting}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none text-sm disabled:opacity-50"
            />
            <button 
              onClick={handlePostFeedback}
              disabled={!selectedReflection || !feedback.trim() || submitting}
              className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              Post Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
