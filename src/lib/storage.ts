/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, ReflectionData, PeerFeedback } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'reflected_profile',
  REFLECTIONS: 'reflected_reflections',
  FEEDBACK: 'reflected_feedback',
  INVITATIONS: 'reflected_invitations',
};

export interface Invitation {
  id: string;
  email: string;
  role: 'peer' | 'supervisor';
  status: 'pending' | 'accepted';
  createdAt: string;
}

export const storage = {
  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  },

  getReflections: (): ReflectionData[] => {
    const data = localStorage.getItem(STORAGE_KEYS.REFLECTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveReflection: (reflection: ReflectionData) => {
    const reflections = storage.getReflections();
    const index = reflections.findIndex(r => r.id === reflection.id);
    if (index >= 0) {
      reflections[index] = reflection;
    } else {
      reflections.push(reflection);
    }
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
  },

  deleteReflection: (id: string) => {
    const reflections = storage.getReflections().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(reflections));
  },

  getFeedback: (reflectionId: string): PeerFeedback[] => {
    const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    const allFeedback: PeerFeedback[] = data ? JSON.parse(data) : [];
    return allFeedback.filter(f => f.reflectionId === reflectionId);
  },

  saveFeedback: (feedback: PeerFeedback) => {
    const data = localStorage.getItem(STORAGE_KEYS.FEEDBACK);
    const allFeedback: PeerFeedback[] = data ? JSON.parse(data) : [];
    allFeedback.push(feedback);
    localStorage.setItem(STORAGE_KEYS.FEEDBACK, JSON.stringify(allFeedback));
  },

  getInvitations: (): Invitation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    return data ? JSON.parse(data) : [];
  },

  saveInvitation: (invitation: Invitation) => {
    const invitations = storage.getInvitations();
    invitations.push(invitation);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  },

  deleteInvitation: (id: string) => {
    const invitations = storage.getInvitations().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
  },

  clearAll: () => {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.FEEDBACK);
    localStorage.removeItem(STORAGE_KEYS.INVITATIONS);
  }
};
