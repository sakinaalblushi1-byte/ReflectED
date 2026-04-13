/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Star, ShieldCheck, Send, Loader2, Mail, Plus, Trash2, CheckCircle2, Clock, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, PeerFeedback, ReflectionData, Invitation } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { cn } from '../lib/utils';

// We'll keep mock peers for demo if no real peers exist yet
const MOCK_PEERS: ReflectionData[] = [
  {
    id: 'mock_1',
    userId: 'peer_1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lessonType: 'PPP' as any,
    skillFocus: ['Speaking' as any],
    week: 1,
    description: 'The students were very engaged during the controlled practice, but the production stage was a bit chaotic.',
    feelings: 'I felt a bit overwhelmed.',
    evaluation: 'Good engagement.',
    analysis: 'Need better instructions.',
    conclusion: 'I will prepare more clear instructions next time.',
    actionPlan: 'Write instructions on the board.',
    xpEarned: 120,
    badgesEarned: [],
  },
  {
    id: 'mock_2',
    userId: 'peer_2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    lessonType: 'TBLT' as any,
    skillFocus: ['Listening' as any],
    week: 1,
    description: 'The task was too difficult for the level, but they tried their best.',
    feelings: 'Encouraged by their effort.',
    evaluation: 'Task difficulty was high.',
    analysis: 'Scaffolding was insufficient.',
    conclusion: 'I need to break down the task more.',
    actionPlan: 'Use more pre-teaching.',
    xpEarned: 110,
    badgesEarned: [],
  }
];

export default function PeerCollaboration({ profile }: { profile: UserProfile | null }) {
  const [activeTab, setActiveTab] = useState<'peer' | 'supervisor'>('peer');
  const [feedback, setFeedback] = useState('');
  const [reflections, setReflections] = useState<ReflectionData[]>([]);
  const [peerReflections, setPeerReflections] = useState<ReflectionData[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<ReflectionData | null>(null);
  const [feedbacks, setFeedbacks] = useState<PeerFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Invitation State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'peer' | 'supervisor'>('peer');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<any[]>([]);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (!profile) return;

    // Load user's reflections
    const reflectionsRef = collection(db, 'reflections');
    const q = query(reflectionsRef, where('userId', '==', profile.uid), orderBy('createdAt', 'desc'));
    
    const unsubReflections = onSnapshot(q, (snapshot) => {
      const userReflections = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReflectionData));
      // For demo, we still mix with mock peers if empty
      const allReflections = userReflections.length > 0 ? userReflections : [...MOCK_PEERS];
      setReflections(allReflections);
      if (allReflections.length > 0 && !selectedReflection) {
        setSelectedReflection(allReflections[0]);
      }
      setLoading(false);
    });

    // Load invitations sent by user
    const invitationsRef = collection(db, 'invitations');
    const qInv = query(invitationsRef, where('senderId', '==', profile.uid), orderBy('createdAt', 'desc'));
    const unsubInvitations = onSnapshot(qInv, (snapshot) => {
      setInvitations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
    });

    // Load invitations received by user
    const qReceived = query(invitationsRef, where('email', '==', profile.email?.toLowerCase()), orderBy('createdAt', 'desc'));
    const unsubReceived = onSnapshot(qReceived, async (snapshot) => {
      const received = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setReceivedInvitations(received);

      // Fetch reflections from accepted invitations
      const acceptedSenders = received.filter(inv => inv.status === 'accepted').map(inv => inv.senderId);
      if (acceptedSenders.length > 0) {
        const qPeers = query(reflectionsRef, where('userId', 'in', acceptedSenders), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(qPeers);
        setPeerReflections(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReflectionData)));
      } else {
        setPeerReflections([]);
      }
    });

    return () => {
      unsubReflections();
      unsubInvitations();
      unsubReceived();
    };
  }, [profile]);

  useEffect(() => {
    if (!selectedReflection) return;

    // Load feedback from Firestore
    const feedbackRef = collection(db, 'reflections', selectedReflection.id, 'feedback');
    const q = query(feedbackRef, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerFeedback)));
    });

    return () => unsubscribe();
  }, [selectedReflection]);

  const handlePostFeedback = async () => {
    if (!profile || !selectedReflection || !feedback.trim()) return;

    setSubmitting(true);
    try {
      const newFeedback: Omit<PeerFeedback, 'id'> = {
        reflectionId: selectedReflection.id,
        authorId: profile.uid,
        authorName: profile.displayName,
        content: feedback,
        rating: 5,
        isSupervisor: profile.role === 'supervisor' || profile.role === 'admin',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'reflections', selectedReflection.id, 'feedback'), newFeedback);
      setFeedback('');
    } catch (error) {
      console.error("Error posting feedback:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const newInvitation = {
        senderId: profile.uid,
        senderName: profile.displayName,
        email: inviteEmail.toLowerCase(),
        role: inviteRole,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'invitations'), newInvitation);
      setInviteEmail('');
    } catch (error) {
      console.error("Error sending invitation:", error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'accepted'
      });
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'invitations', id));
    } catch (error) {
      console.error("Error deleting invitation:", error);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyInviteLink = (id: string) => {
    const link = `${window.location.origin}?invite=${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateInviteEmail = (email: string, role: string) => {
    const subject = encodeURIComponent(`Invitation to collaborate on ReflectED`);
    const body = encodeURIComponent(`Hi!\n\nI've invited you to be my ${role} on ReflectED, the AI-powered mentor for trainee teachers.\n\nPlease sign in at ${window.location.origin} using this email address to see my reflections and provide feedback.\n\nBest regards,\n${profile?.displayName}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
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
          {/* Reflection Selector */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Reflections to Review</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[...reflections, ...peerReflections, ...MOCK_PEERS].map((ref) => (
                <button
                  key={ref.id}
                  onClick={() => setSelectedReflection(ref)}
                  className={cn(
                    "flex-shrink-0 px-6 py-4 rounded-3xl border-2 transition-all text-left space-y-2 w-64",
                    selectedReflection?.id === ref.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  )}
                >
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{ref.lessonType}</p>
                  <p className="font-bold text-slate-900 line-clamp-1">{ref.description.substring(0, 30)}...</p>
                  <p className="text-[10px] text-slate-500">
                    {ref.userId === profile?.uid ? 'Your Reflection' : 'Peer Reflection'}
                  </p>
                </button>
              ))}
            </div>
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
                              {new Date(f.createdAt).toLocaleDateString()}
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
              <Mail size={18} className="text-primary-500" />
              Invite Collaborators
            </h3>
            <p className="text-sm text-slate-500">
              Invite your supervisor or peers to review your reflections. 
              <span className="block mt-1 text-xs text-amber-600 font-medium">
                Note: Automated emails require a service provider. Use the mail icon below after inviting to send a manual email.
              </span>
            </p>
            <form onSubmit={handleSendInvitation} className="space-y-3">
              <input
                type="email"
                placeholder="Collaborator's email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInviteRole('peer')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                    inviteRole === 'peer' ? "bg-primary-50 border-primary-200 text-primary-600" : "border-slate-100 text-slate-500"
                  )}
                >
                  Peer
                </button>
                <button
                  type="button"
                  onClick={() => setInviteRole('supervisor')}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                    inviteRole === 'supervisor' ? "bg-primary-50 border-primary-200 text-primary-600" : "border-slate-100 text-slate-500"
                  )}
                >
                  Supervisor
                </button>
              </div>
              <button
                type="submit"
                disabled={isInviting || !inviteEmail.trim()}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                {isInviting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                Send Invitation
              </button>
            </form>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4 bg-white border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Mail size={18} className="text-primary-500" />
              Received Invitations
            </h3>
            <div className="space-y-3">
              {receivedInvitations.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4 italic">No invitations received.</p>
              ) : (
                receivedInvitations.map((inv) => (
                  <div key={inv.id} className="p-4 bg-primary-50 rounded-2xl border border-primary-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{inv.senderName}</p>
                        <p className="text-xs text-slate-500">Invited you as {inv.role}</p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-1 rounded",
                        inv.status === 'accepted' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {inv.status}
                      </span>
                    </div>
                    {inv.status === 'pending' && (
                      <button
                        onClick={() => handleAcceptInvitation(inv.id)}
                        className="w-full py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all"
                      >
                        Accept Invitation
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl space-y-4 bg-white border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-primary-500" />
              Sent Invitations
            </h3>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {invitations.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 italic">No invitations sent yet.</p>
                ) : (
                  invitations.map((inv) => (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{inv.email}</p>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded",
                            inv.role === 'supervisor' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {inv.role}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            {inv.status === 'pending' ? <Clock size={10} /> : <CheckCircle2 size={10} />}
                            {inv.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => copyInviteLink(inv.id)}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                          title="Copy Invite Link"
                        >
                          {copiedId === inv.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                        <button 
                          onClick={() => generateInviteEmail(inv.email, inv.role)}
                          className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg"
                          title="Send Email"
                        >
                          <Mail size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteInvitation(inv.id)}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

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
