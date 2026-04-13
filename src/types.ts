/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum LessonType {
  PPP = 'PPP',
  TBLT = 'TBLT',
  ESA = 'ESA',
  OTHER = 'Other',
}

export enum SkillFocus {
  READING = 'Reading',
  WRITING = 'Writing',
  LISTENING = 'Listening',
  SPEAKING = 'Speaking',
  GRAMMAR = 'Grammar',
  VOCABULARY = 'Vocabulary',
  PRONUNCIATION = 'Pronunciation',
}

export enum ReflectionStep {
  DESCRIPTION = 'Description',
  FEELINGS = 'Feelings',
  EVALUATION = 'Evaluation',
  ANALYSIS = 'Analysis',
  CONCLUSION = 'Conclusion',
  ACTION_PLAN = 'Action Plan',
}

export interface ReflectionData {
  id?: string;
  userId: string;
  createdAt: any; // Firestore Timestamp
  lessonType: LessonType;
  skillFocus: SkillFocus[];
  week: number;
  
  // Gibbs Cycle Steps
  description: string;
  feelings: string;
  evaluation: string;
  analysis: string;
  conclusion: string;
  actionPlan: string;
  
  // AI Analysis
  aiFeedback?: {
    summary?: string;
    depthScore: number; // 1-10 (Bloom's Taxonomy)
    teachingEffectiveness: string;
    classroomManagement: string;
    studentEngagement: string;
    instructionClarity: string;
    constructiveFeedback: string;
    suggestedStrategies: string[];
    personalizedGoals: string[];
    ttt_stt_check?: string;
  };
  
  // Gamification
  xpEarned: number;
  badgesEarned: string[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  collegeId: string;
  photoURL?: string;
  level: number;
  xp: number;
  streak: number;
  lastReflectionDate?: any;
  badges: string[];
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  createdAt?: any;
  role?: 'admin' | 'trainee' | 'supervisor';
}

export interface PeerFeedback {
  id: string;
  reflectionId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: any;
  rating?: number;
  isSupervisor?: boolean;
}

export interface Invitation {
  id: string;
  senderId: string;
  senderName: string;
  email: string;
  role: 'peer' | 'supervisor';
  status: 'pending' | 'accepted';
  createdAt: string;
}
