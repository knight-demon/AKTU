'use server';

/**
 * @fileOverview Generates tricky, hard-level practice questions with detailed explanations.
 *
 * - generateImportantQuestions - A function that generates important questions.
 * - GenerateImportantQuestionsInput - The input type for the generateImportantQuestions function.
 * - GenerateImportantQuestionsOutput - The return type for the generateImportantQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImportantQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate important questions.'),
  numQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateImportantQuestionsInput = z.infer<typeof GenerateImportantQuestionsInputSchema>;

const GenerateImportantQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The question text.'),
      explanation: z.string().describe('A detailed explanation of the answer.'),
    })
  ).describe('An array of tricky, hard-level practice questions with detailed explanations.'),
});
export type GenerateImportantQuestionsOutput = z.infer<typeof GenerateImportantQuestionsOutputSchema>;

export async function generateImportantQuestions(input: GenerateImportantQuestionsInput): Promise<GenerateImportantQuestionsOutput> {
  return generateImportantQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImportantQuestionsPrompt',
  input: {schema: GenerateImportantQuestionsInputSchema},
  output: {schema: GenerateImportantQuestionsOutputSchema},
  prompt: `You are an expert in creating tricky, hard-level practice questions for the AKTU syllabus.  Generate {{numQuestions}} questions on the topic of {{topic}}.  For each question, provide a detailed explanation of the answer.  Format the output as a JSON array of questions, where each question has a "question" field and an "explanation" field. Make the questions and explanations interesting and engaging.  Focus on the trickiest aspects of the topic.  Do not provide questions outside the given topic.

Example Output:
[
  {
    "question": "Question 1",
    "explanation": "Explanation 1"
  },
  {
    "question": "Question 2",
    "explanation": "Explanation 2"
  }
]
`,
});

const generateImportantQuestionsFlow = ai.defineFlow(
  {
    name: 'generateImportantQuestionsFlow',
    inputSchema: GenerateImportantQuestionsInputSchema,
    outputSchema: GenerateImportantQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
