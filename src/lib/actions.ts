
'use server';

import { generateImportantQuestions } from '@/ai/flows/generate-important-questions';
import { personalizedResponse } from '@/ai/flows/personalized-response';

export async function getPersonalizedResponse(query: string, photoDataUri?: string) {
  try {
    const result = await personalizedResponse({ query, photoDataUri });
    return { success: true, response: result.response };
  } catch (error) {
    console.error('Error getting personalized response:', error);
    return { success: false, error: 'Sorry, something went wrong. Please try again.' };
  }
}

export async function getImportantQuestions(topic: string) {
  try {
    const result = await generateImportantQuestions({ topic, numQuestions: 5 });
    return { success: true, questions: result.questions };
  } catch (error) {
    console.error('Error getting important questions:', error);
    return { success: false, error: 'Sorry, something went wrong. Please try again.' };
  }
}
