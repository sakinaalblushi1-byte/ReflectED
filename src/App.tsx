/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  db, 
  doc, 
  getDoc, 
  setDoc,
  Timestamp,
  handleFirestoreError,
  OperationType 
} from './firebase';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { UserProfile } from './types';
import { LogIn, LogOut, LayoutDashboard, PenTool, Award, Users, Settings, Menu, X, Sparkles, Video, Mail, Lock, User as UserIcon, ArrowRight, Github } from 'lucide-react';
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
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);

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
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Trainee Teacher',
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
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      setAuthError(error.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else if (authMode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else if (authMode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent!');
        setAuthMode('login');
      }
    } catch (error: any) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
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

  if (!user && !showAuthForm) {
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
          className="relative z-10 max-w-3xl space-y-8"
        >
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-200 transform rotate-12">
              <Sparkles size={40} />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl font-display font-black text-slate-900 tracking-tight">
              Reflect<span className="text-primary-600">ED</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 font-light max-w-2xl mx-auto leading-relaxed">
              The AI-powered mentor that turns your teaching experiences into professional growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAuthForm(true);
              }}
              className="group relative px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
            >
              Get Started for Free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthForm(true);
              }}
              className="px-8 py-4 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all transform hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          </div>

          <div className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
            {[
              { title: 'AI Analysis', desc: 'Get deep insights into your teaching patterns.' },
              { title: 'Peer Network', desc: 'Collaborate with fellow trainee teachers.' },
              { title: 'Growth Tracking', desc: 'Visualize your journey with gamified levels.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-6 rounded-2xl bg-slate-50/50 border border-slate-100 backdrop-blur-sm"
              >
                <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user && showAuthForm) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        {/* Back Button for mobile */}
        <button 
          onClick={() => setShowAuthForm(false)}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 text-slate-500 hover:text-slate-900"
        >
          <ArrowRight className="rotate-180" size={24} />
        </button>
        <div className="hidden lg:flex lg:w-1/2 bg-primary-600 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                <Sparkles size={32} />
              </div>
              <span className="text-3xl font-display font-bold">ReflectED</span>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 max-w-lg"
            >
              <h2 className="text-5xl font-display font-bold leading-tight">
                Elevate your teaching through AI-powered reflection.
              </h2>
              <p className="text-xl text-primary-100 font-light">
                The ultimate companion for pre-service ELT teachers. Analyze your lessons, track your growth, and collaborate with peers.
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-3xl font-bold">10k+</p>
              <p className="text-primary-200 text-sm uppercase tracking-wider">Active Teachers</p>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">50k+</p>
              <p className="text-primary-200 text-sm uppercase tracking-wider">Reflections Analyzed</p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary-500 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-400 rounded-full blur-[100px] opacity-30" />
        </div>

        {/* Right Side: Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md space-y-8"
          >
            <div className="text-center lg:text-left">
              <div className="lg:hidden flex justify-center mb-6">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Sparkles size={32} />
                </div>
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-900">
                {authMode === 'login' ? 'Welcome Back' : authMode === 'register' ? 'Create Account' : 'Reset Password'}
              </h1>
              <p className="text-slate-500 mt-2">
                {authMode === 'login' ? 'Enter your details to access your dashboard.' : authMode === 'register' ? 'Join the community of reflective teachers.' : 'Enter your email to receive a reset link.'}
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {authMode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {authMode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}

              {authMode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot')}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {authError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100"
                >
                  {authError}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-primary-200 disabled:opacity-70"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {authMode === 'login' ? 'Sign In' : authMode === 'register' ? 'Create Account' : 'Send Reset Link'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-50 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-6 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-slate-50 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
            </div>

            <p className="text-center text-slate-600">
              {authMode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setAuthMode('register')} className="font-semibold text-primary-600 hover:text-primary-700">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setAuthMode('login')} className="font-semibold text-primary-600 hover:text-primary-700">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>
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

