/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { ReflectionData, LessonType, SkillFocus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function analyzeReflection(reflection: Partial<ReflectionData>) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert ELT (English Language Teaching) mentor. 
    Analyze the following teacher reflection based on Gibbs Reflective Cycle and Bloom's Taxonomy.
    
    Lesson Details:
    - Lesson Type: ${reflection.lessonType}
    - Skill Focus: ${reflection.skillFocus?.join(', ')}
    
    Reflection Content:
    - Description: ${reflection.description}
    - Feelings: ${reflection.feelings}
    - Evaluation: ${reflection.evaluation}
    - Analysis: ${reflection.analysis}
    - Conclusion: ${reflection.conclusion}
    - Action Plan: ${reflection.actionPlan}
    
    Provide constructive, actionable, and encouraging feedback for a pre-service teacher.
    Include:
    1. A depth score (1-10) based on Bloom's Taxonomy (1=Remembering, 10=Creating/Deep Evaluation).
    2. Specific feedback on teaching effectiveness, classroom management, student engagement, and instruction clarity.
    3. Suggested teaching strategies relevant to the lesson type and skills.
    4. Personalized improvement goals.
    5. A check on TTT (Teacher Talking Time) vs STT (Student Talking Time) if mentioned.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          depthScore: { type: Type.NUMBER },
          teachingEffectiveness: { type: Type.STRING },
          classroomManagement: { type: Type.STRING },
          studentEngagement: { type: Type.STRING },
          instructionClarity: { type: Type.STRING },
          constructiveFeedback: { type: Type.STRING },
          suggestedStrategies: { type: Type.ARRAY, items: { type: Type.STRING } },
          personalizedGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
          ttt_stt_check: { type: Type.STRING },
        },
        required: [
          "depthScore", 
          "teachingEffectiveness", 
          "classroomManagement", 
          "studentEngagement", 
          "instructionClarity", 
          "constructiveFeedback", 
          "suggestedStrategies", 
          "personalizedGoals"
        ],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function analyzeVideoReflection(reflection: string, timestamp: number) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert ELT (English Language Teaching) Mentor.
    A trainee teacher has provided a reflection on a specific moment in their recorded lesson (at ${Math.floor(timestamp / 60)}:${(timestamp % 60).toString().padStart(2, '0')}).
    
    Reflection: "${reflection}"
    
    Provide a brief, insightful analysis (max 100 words) of this specific moment.
    Focus on:
    1. What the teacher noticed.
    2. A potential ELT principle at play (e.g., Scaffolding, TTT vs STT, Concept Checking).
    3. One quick suggestion for next time.
    
    Keep the tone encouraging and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("AI Video Analysis Error:", error);
    return "AI Mentor is currently unavailable for video analysis.";
  }
}

export async function generateAdaptiveQuestions(lessonType: LessonType, skillFocus: SkillFocus[], previousReflectionsCount: number) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Generate 3 adaptive, scaffolded reflection questions for an ELT trainee teacher.
    Context:
    - Lesson Type: ${lessonType}
    - Skill Focus: ${skillFocus.join(', ')}
    - Experience Level: ${previousReflectionsCount > 5 ? 'Intermediate' : 'Beginner'}
    
    The questions should be clear, beginner-friendly, and progressively deeper.
    Focus on ELT-specific pedagogical aspects like instruction checking questions (ICQs), concept checking questions (CCQs), student-centeredness, and task-based learning.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  return JSON.parse(response.text);
}
