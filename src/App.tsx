/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  auth, 
  signInAnonymously,
  signOut,
  db, 
  doc, 
  getDoc, 
  setDoc,
  Timestamp,
  handleFirestoreError,
  OperationType 
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile } from './types';
import { LogOut, LayoutDashboard, PenTool, Award, Users, Settings, Menu, X, Sparkles, Video, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// Components
import Dashboard from './components/Dashboard';
import ReflectionWizard from './components/ReflectionWizard';
import VideoReflection from './components/VideoReflection';
import GamificationPanel from './components/GamificationPanel';
import PeerCollaboration from './components/PeerCollaboration';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reflect' | 'video' | 'gamification' | 'collaboration' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Auth State
  const [guestName, setGuestName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile
        const profilePath = `users/${currentUser.uid}`;
        const profileRef = doc(db, profilePath);
        let profileSnap;
        try {
          profileSnap = await getDoc(profileRef);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, profilePath);
          return;
        }
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || 'guest@reflected.app',
            displayName: currentUser.displayName || (currentUser.isAnonymous ? (guestName || 'Guest Teacher') : 'Trainee Teacher'),
            photoURL: currentUser.photoURL || null,
            level: 1,
            xp: 0,
            streak: 0,
            badges: [],
            language: 'en',
            theme: 'light',
            createdAt: Timestamp.now(),
            role: 'trainee',
          };
          try {
            await setDoc(profileRef, newProfile);
            setProfile(newProfile);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, profilePath);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [guestName]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Start failed:', error);
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('dashboard');
      setGuestName('');
    } catch (error) {
      console.error('Logout failed:', error);
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

  if (!user) {
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

          <form onSubmit={handleStart} className="space-y-4 pt-8">
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Enter your name"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
              />
            </div>

            {authError && (
              <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading || !guestName.trim()}
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
          </form>
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
                <p className="text-xs text-slate-500">Level {profile?.level} Trainee</p>
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

