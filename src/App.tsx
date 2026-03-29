/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, db, doc, getDoc, updateDoc, Timestamp } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { UserProfile } from './types';
import { LogIn, LogOut, LayoutDashboard, PenTool, Award, Users, Settings, Menu, X, Sparkles, Video } from 'lucide-react';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile
        const profileRef = doc(db, 'users', currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as UserProfile);
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Trainee Teacher',
            photoURL: currentUser.photoURL || undefined,
            level: 1,
            xp: 0,
            streak: 0,
            badges: [],
            language: 'en',
            theme: 'light',
          };
          // We'll save this once Firebase is fully set up
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab('dashboard');
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
      <div className="min-h-screen bg-primary-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full glass-card p-8 rounded-3xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-primary-500 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg shadow-primary-200">
            <Sparkles size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold text-slate-900">ReflectED</h1>
            <p className="text-slate-600">AI-Powered Reflective Growth for ELT Teachers</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-4 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary-200"
          >
            <LogIn size={20} />
            Sign in with Google
          </button>
          <p className="text-xs text-slate-400">
            Join thousands of pre-service teachers enhancing their practice through AI mentorship.
          </p>
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

