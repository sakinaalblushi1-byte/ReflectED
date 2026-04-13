/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import { LogOut, LayoutDashboard, PenTool, Award, Users, Settings, Menu, X, Sparkles, Video, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth, db, googleProvider } from './lib/firebase';
import { onAuthStateChanged, signInAnonymously, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Components
import Dashboard from './components/Dashboard';
import ReflectionWizard from './components/ReflectionWizard';
import VideoReflection from './components/VideoReflection';
import GamificationPanel from './components/GamificationPanel';
import PeerCollaboration from './components/PeerCollaboration';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [user, setUser] = useState<{ uid: string; displayName: string | null; email: string | null } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reflect' | 'video' | 'gamification' | 'collaboration' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth State
  const [guestName, setGuestName] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({ 
          uid: firebaseUser.uid, 
          displayName: firebaseUser.displayName,
          email: firebaseUser.email 
        });
        
        // Listen to profile changes
        const profileRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(profileRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            setProfile(null);
          }
          setLoading(false);
        });

        return () => unsubProfile();
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !collegeId.trim()) return;
    
    setAuthLoading(true);
    try {
      // Use anonymous auth for simplicity as requested "write their name"
      const userCredential = await signInAnonymously(auth);
      const firebaseUser = userCredential.user;

      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'anonymous@reflected.app',
        displayName: guestName,
        collegeId: collegeId,
        photoURL: firebaseUser.photoURL || null,
        level: 1,
        xp: 0,
        streak: 0,
        badges: [],
        language: 'en',
        theme: 'light',
        createdAt: new Date().toISOString(),
        role: 'trainee',
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error with Google sign in:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('dashboard');
      setGuestName('');
      setCollegeId('');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-100 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full space-y-8"
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-200 transform rotate-12">
              <Sparkles size={40} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight">
              Reflect<span className="text-primary-600">ED</span>
            </h1>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              The AI-powered mentor for trainee teachers.
            </p>
          </div>

          {!user ? (
            <form onSubmit={handleStart} className="space-y-4 pt-8">
              <div className="space-y-4">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
                  />
                </div>

                <div className="relative">
                  <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="College ID"
                    required
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading || !guestName.trim() || !collegeId.trim()}
                className="w-full py-4 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-primary-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {authLoading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Start Reflecting
                    <ArrowRight size={24} />
                  </>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500 uppercase tracking-wider font-bold text-xs">Or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full py-4 px-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-3"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                Sign in with Google
              </button>
            </form>
          ) : (
            <div className="space-y-6 pt-8">
              <div className="p-6 bg-primary-50 rounded-3xl border border-primary-100">
                <p className="text-primary-800 font-medium">Welcome, {user.email}!</p>
                <p className="text-primary-600 text-sm mt-1">Please complete your profile to continue.</p>
              </div>
              <form onSubmit={handleStart} className="space-y-4">
                <div className="space-y-4 text-left">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Display Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
                    />
                  </div>

                  <label className="block text-sm font-bold text-slate-700 ml-1">College ID</label>
                  <div className="relative">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="College ID"
                      required
                      value={collegeId}
                      onChange={(e) => setCollegeId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !guestName.trim() || !collegeId.trim()}
                  className="w-full py-4 px-8 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-xl shadow-xl shadow-primary-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {authLoading ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Complete Profile
                      <ArrowRight size={24} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reflect', label: 'Reflect', icon: PenTool },
    { id: 'video', label: 'Video Analysis', icon: Video },
    { id: 'gamification', label: 'Growth', icon: Award },
    { id: 'collaboration', label: 'Peers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
              <Sparkles size={24} />
            </div>
            <span className="text-2xl font-display font-bold text-slate-900">ReflectED</span>
          </div>

          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  activeTab === item.id
                    ? "bg-primary-50 text-primary-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-4">
              <img
                src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}`}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-primary-100"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{profile?.displayName}</p>
                <p className="text-xs text-slate-500 truncate">ID: {profile?.collegeId}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard profile={profile} />}
              {activeTab === 'reflect' && <ReflectionWizard profile={profile} onComplete={() => setActiveTab('dashboard')} />}
              {activeTab === 'video' && <VideoReflection />}
              {activeTab === 'gamification' && <GamificationPanel profile={profile} />}
              {activeTab === 'collaboration' && <PeerCollaboration profile={profile} />}
              {activeTab === 'settings' && <SettingsPanel profile={profile} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

