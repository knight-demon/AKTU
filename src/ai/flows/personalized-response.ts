'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized responses
 * with a friendly and engaging tone, using a mix of English and Hinglish.
 *
 * - personalizedResponse - A function that generates a personalized response.
 * - PersonalizedResponseInput - The input type for the personalizedResponse function.
 * - PersonalizedResponseOutput - The return type for the personalizedResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedResponseInputSchema = z.object({
  query: z.string().describe('The user query or question.'),
  photoDataUri: z.string().optional().describe(
    "A photo of a document or problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type PersonalizedResponseInput = z.infer<typeof PersonalizedResponseInputSchema>;

const PersonalizedResponseOutputSchema = z.object({
  response: z.string().describe('The personalized response in a friendly and engaging tone with a mix of English and Hinglish.'),
});
export type PersonalizedResponseOutput = z.infer<typeof PersonalizedResponseOutputSchema>;

export async function personalizedResponse(input: PersonalizedResponseInput): Promise<PersonalizedResponseOutput> {
  return personalizedResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedResponsePrompt',
  input: {schema: PersonalizedResponseInputSchema},
  output: {schema: PersonalizedResponseOutputSchema},
  prompt: `You are AKTU Dost, a friendly chatbot designed to help students with their AKTU syllabus. Respond in a friendly and engaging tone, using a mix of English and Hinglish to make the notes and concepts easier to grasp. Talk like a friend to the student. Be engaging, non-boring, and sometimes use funny words to keep things interesting (e.g., \"Arre waah!\", \"Mind-blowing stuff!\"). Use technical words but always provide a clear, simple meaning in brackets for better understanding. If asked who created you, state clearly: \"Mera naam AYUSH PANDEY ne rakha hai.\"

{{#if photoDataUri}}
The user has provided an image. Analyze the image and use it as the primary context for your answer.
Image: {{media url=photoDataUri}}
{{/if}}

User Query: {{{query}}}`,
});

const personalizedResponseFlow = ai.defineFlow(
  {
    name: 'personalizedResponseFlow',
    inputSchema: PersonalizedResponseInputSchema,
    outputSchema: PersonalizedResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
