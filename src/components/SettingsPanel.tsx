/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Globe, Moon, Sun, Bell, Shield, User, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { auth } from '../firebase';

export default function SettingsPanel({ profile }: { profile: UserProfile | null }) {
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your account preferences and application settings.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="glass-card p-6 rounded-3xl flex flex-col items-center text-center space-y-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-2xl">
              {profile?.displayName?.[0]}
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900">{profile?.displayName}</h3>
              <p className="text-sm text-slate-500">{profile?.email}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
              Level {profile?.level || 1} Trainee
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all border border-red-100"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl space-y-8">
            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Globe size={18} className="text-primary-500" />
                Localization
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Language</p>
                  <p className="text-xs text-slate-500">Choose your preferred interface language.</p>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                  <option value="en">English (UK)</option>
                  <option value="ar">العربية (Arabic)</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Moon size={18} className="text-primary-500" />
                Appearance
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Dark Mode</p>
                  <p className="text-xs text-slate-500">Switch between light and dark themes.</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    darkMode ? "bg-primary-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    darkMode ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Bell size={18} className="text-primary-500" />
                Notifications
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Push Notifications</p>
                  <p className="text-xs text-slate-500">Get alerted about peer feedback and AI insights.</p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    notifications ? "bg-primary-600" : "bg-slate-200"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                    notifications ? "left-7" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
