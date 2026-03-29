/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReflectionStep, LessonType, SkillFocus } from './types';

export const GIBBS_STEPS = [
  {
    id: ReflectionStep.DESCRIPTION,
    title: 'Description',
    description: 'What happened?',
    questions: [
      'What was the lesson objective?',
      'Who were the students?',
      'What activities did you use?',
      'What was the sequence of the lesson?',
    ],
    sentenceStarters: [
      'The lesson focused on...',
      'I started the class by...',
      'The main activity was...',
      'Most students were...',
    ],
  },
  {
    id: ReflectionStep.FEELINGS,
    title: 'Feelings',
    description: 'What were you thinking and feeling?',
    questions: [
      'How did you feel before the lesson?',
      'How did you feel during the lesson?',
      'How did you feel after the lesson?',
      'What do you think the students were feeling?',
    ],
    sentenceStarters: [
      'Before the lesson, I felt...',
      'During the activity, I noticed I was...',
      'After the lesson, I felt a sense of...',
      'I think the students were feeling...',
    ],
  },
  {
    id: ReflectionStep.EVALUATION,
    title: 'Evaluation',
    description: 'What was good and bad about the experience?',
    questions: [
      'What went well in the lesson?',
      'What didn’t go as planned?',
      'How did the students respond to the activities?',
      'Were the instructions clear?',
    ],
    sentenceStarters: [
      'The most successful part was...',
      'One challenge I faced was...',
      'The students responded well to...',
      'I noticed that my instructions were...',
    ],
  },
  {
    id: ReflectionStep.ANALYSIS,
    title: 'Analysis',
    description: 'What sense can you make of the situation?',
    questions: [
      'Why did things go well (or not)?',
      'How does this relate to ELT theory (e.g., PPP, TBLT)?',
      'What was the balance between TTT and STT?',
      'How did classroom management affect the learning?',
    ],
    sentenceStarters: [
      'I believe the activity worked because...',
      'This relates to the concept of...',
      'The TTT was higher than expected because...',
      'Classroom management was key to...',
    ],
  },
  {
    id: ReflectionStep.CONCLUSION,
    title: 'Conclusion',
    description: 'What else could you have done?',
    questions: [
      'What have you learned from this experience?',
      'What would you do differently next time?',
      'What skills do you need to develop further?',
    ],
    sentenceStarters: [
      'From this lesson, I learned that...',
      'If I were to teach this again, I would...',
      'I need to improve my skills in...',
    ],
  },
  {
    id: ReflectionStep.ACTION_PLAN,
    title: 'Action Plan',
    description: 'If it arose again, what would you do?',
    questions: [
      'What is your goal for the next lesson?',
      'How will you implement what you’ve learned?',
      'What resources or support do you need?',
    ],
    sentenceStarters: [
      'My main goal for next week is...',
      'To improve, I will try to...',
      'I will look for resources on...',
    ],
  },
];

export const LESSON_TYPES = Object.values(LessonType);
export const SKILL_FOCUSES = Object.values(SkillFocus);

export const BADGES = [
  { id: 'deep_thinker', name: 'Deep Thinker', description: 'Complete a high-quality reflection', icon: '🧠' },
  { id: 'consistent_reflector', name: 'Consistent Reflector', description: 'Reflect for 3 days in a row', icon: '🔥' },
  { id: 'elt_expert', name: 'ELT Expert', description: 'Analyze 5 different lesson types', icon: '🎓' },
  { id: 'instruction_master', name: 'Instruction Master', description: 'Receive high scores for instruction clarity', icon: '📢' },
  { id: 'engagement_pro', name: 'Engagement Pro', description: 'Receive high scores for student engagement', icon: '🤝' },
];
