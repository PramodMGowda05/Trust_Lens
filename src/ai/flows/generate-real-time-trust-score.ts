'use server';
/**
 * @fileOverview A flow that uses a GenAI model to generate a trust score for a review.
 *
 * - generateRealTimeTrustScore - A function that calls the underlying Genkit flow.
 * - GenerateRealTimeTrustScoreInput - The input type for the function.
 * - GenerateRealTimeTrustScoreOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateRealTimeTrustScoreInputSchema = z.object({
  reviewText: z.string().describe('The text content of the review.'),
  productOrService: z.string().describe('The product or service being reviewed.'),
  platform: z.string().describe('The platform where the review was submitted (e.g., Amazon, Yelp).'),
  language: z.string().optional().describe('The language of the review text. If provided, the analysis should consider linguistic nuances of that language.'),
});
export type GenerateRealTimeTrustScoreInput = z.infer<typeof GenerateRealTimeTrustScoreInputSchema>;

const GenerateRealTimeTrustScoreOutputSchema = z.object({
  trustScore: z.number().min(0).max(1).describe('A score between 0 and 1 indicating the trustworthiness of the review, where 0 is least trustworthy and 1 is most trustworthy.'),
  predictedLabel: z.enum(['genuine', 'fake']).describe('The predicted label for the review (genuine or fake).'),
  explanation: z.string().describe('A concise, user-friendly explanation (2-3 sentences) of why the review was classified this way. Explain in simple terms, as if talking to a non-technical user.'),
});
export type GenerateRealTimeTrustScoreOutput = z.infer<typeof GenerateRealTimeTrustScoreOutputSchema>;


export async function generateRealTimeTrustScore(input: GenerateRealTimeTrustScoreInput): Promise<GenerateRealTimeTrustScoreOutput> {
  return generateRealTimeTrustScoreFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateTrustScorePrompt',
    input: { schema: GenerateRealTimeTrustScoreInputSchema },
    output: { schema: GenerateRealTimeTrustScoreOutputSchema },
    prompt: `You are an expert AI at detecting fake or deceptive online reviews. Analyze the following review details and provide a trust score, a predicted label (genuine or fake), and a brief explanation.

Consider the following factors in your analysis:
- The review's tone and emotional extremity.
- The level of specific, concrete detail provided.
- The use of generic phrases or marketing language.
- The context of the product/service and platform.
- If a language is provided, consider any cultural or linguistic nuances.

Review Details:
- Product/Service: {{{productOrService}}}
- Platform: {{{platform}}}
{{#if language}}- Language: {{{language}}}{{/if}}
- Review Text: "{{{reviewText}}}"

Your output must be a valid JSON object matching the specified schema.
The explanation should be concise and easy for a non-technical user to understand. For example, "Our analysis suggests this review is likely [genuine/fake] because..."`,
});


const generateRealTimeTrustScoreFlow = ai.defineFlow(
  {
    name: 'generateRealTimeTrustScoreFlow',
    inputSchema: GenerateRealTimeTrustScoreInputSchema,
    outputSchema: GenerateRealTimeTrustScoreOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);

    if (!output) {
        throw new Error("The AI model failed to generate an analysis. Please try again.");
    }

    return output;
  }
);
