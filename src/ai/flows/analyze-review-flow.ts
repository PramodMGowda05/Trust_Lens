'use server';
/**
 * @fileOverview A Genkit flow for analyzing customer reviews.
 *
 * This file defines the `analyzeReview` flow, which takes a customer review
 * and determines whether it is genuine or fake, providing a trust score and
 * a brief explanation for its classification.
 *
 * - analyzeReview - A function that handles the review analysis process.
 * - AnalyzeReviewInput - The input type for the analyzeReview function.
 * - AnalyzeReviewOutput - The return type for the analyzeReview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AnalyzeReviewInputSchema = z.object({
  reviewText: z.string().describe('The full text content of the customer review.'),
  language: z.string().describe('The language of the review (e.g., "en", "es").'),
});
export type AnalyzeReviewInput = z.infer<typeof AnalyzeReviewInputSchema>;

const AnalyzeReviewOutputSchema = z.object({
  trustScore: z.number().describe('A score from 0.0 to 1.0 indicating the likelihood that the review is genuine. Higher scores mean more trustworthy.'),
  predictedLabel: z.enum(['genuine', 'fake']).describe('The classification of the review.'),
  explanation: z.string().describe('A brief, one-sentence explanation for the classification and score, highlighting the key factors.'),
});
export type AnalyzeReviewOutput = z.infer<typeof AnalyzeReviewOutputSchema>;

export async function analyzeReview(input: AnalyzeReviewInput): Promise<AnalyzeReviewOutput> {
  return analyzeReviewFlow(input);
}

const analyzeReviewPrompt = ai.definePrompt({
  name: 'analyzeReviewPrompt',
  input: { schema: AnalyzeReviewInputSchema },
  output: { schema: AnalyzeReviewOutputSchema },
  prompt: `You are an expert in fake review detection. Your task is to analyze the following customer review and determine if it is genuine or fake.

  Your analysis should be based on factors like:
  - Overly positive or negative language
  - Lack of specific details
  - Generic praise or criticism
  - Unusual phrasing or grammar
  - Mention of competing products
  - Presence of spam-like content or links

  Review Language: {{{language}}}
  Review Text:
  """
  {{{reviewText}}}
  """

  Based on your analysis, provide a trust score, a predicted label ('genuine' or 'fake'), and a concise, one-sentence explanation for your decision. The trust score should be a value between 0.0 (definitely fake) and 1.0 (definitely genuine).`,
});

const analyzeReviewFlow = ai.defineFlow(
  {
    name: 'analyzeReviewFlow',
    inputSchema: AnalyzeReviewInputSchema,
    outputSchema: AnalyzeReviewOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeReviewPrompt(input);
    if (!output) {
      throw new Error("Analysis failed to produce an output.");
    }
    return output;
  }
);