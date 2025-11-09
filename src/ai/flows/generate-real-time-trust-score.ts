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
  language: z.string().optional().describe('The language of the review text.'),
});
export type GenerateRealTimeTrustScoreInput = z.infer<typeof GenerateRealTimeTrustScoreInputSchema>;

const GenerateRealTimeTrustScoreOutputSchema = z.object({
  trustScore: z.number().describe('A score between 0 and 1 indicating the trustworthiness of the review, where 0 is least trustworthy and 1 is most trustworthy.'),
  predictedLabel: z.enum(['genuine', 'fake']).describe('The predicted label for the review (genuine or fake).'),
  explanation: z.string().describe('An explanation of why the review was classified as genuine or fake.'),
});
export type GenerateRealTimeTrustScoreOutput = z.infer<typeof GenerateRealTimeTrustScoreOutputSchema>;


export async function generateRealTimeTrustScore(input: GenerateRealTimeTrustScoreInput, token: string): Promise<GenerateRealTimeTrustScoreOutput> {
  return generateRealTimeTrustScoreFlow({input, token});
}

const flowInputSchema = z.object({
  input: GenerateRealTimeTrustScoreInputSchema,
  token: z.string(),
});


const generateRealTimeTrustScoreFlow = ai.defineFlow(
  {
    name: 'generateRealTimeTrustScoreFlow',
    inputSchema: flowInputSchema,
    outputSchema: GenerateRealTimeTrustScoreOutputSchema,
  },
  async ({ input, token }) => {
    // Step 1: Call the external Python service for the core prediction
    let mlResponse;
    try {
      const response = await fetch('http://localhost:5001/api/v1/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          text: input.reviewText,
          lang: input.language || 'en',
          metadata: {
            verified: true, // Defaulting to true for now
            account_age_days: 30 // Defaulting to 30 days for now
          }
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ detail: 'Prediction service returned an error.' }));
        throw new Error(`ML service failed: ${errorBody.detail || response.statusText}`);
      }
      mlResponse = await response.json();
    } catch (error) {
       if (error instanceof Error) {
         if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
            throw new Error('Could not connect to the ML analysis service. Please ensure the Python service is running.');
         }
         throw new Error(error.message); // Re-throw other specific errors
      }
      throw new Error('An unexpected error occurred while analyzing the review.');
    }
    
    // Step 2: Use Genkit to generate a human-readable explanation
    const explanationPrompt = ai.definePrompt({
        name: 'summarizePredictionPrompt',
        input: { schema: z.object({ reviewText: z.string(), prediction: z.any() }) },
        output: { schema: z.object({ explanation: z.string() })},
        prompt: `A machine learning model analyzed the following review:

Review: "{{reviewText}}"

The model's prediction was:
- Label: {{prediction.label}}
- Trust Score: {{prediction.trust_score}}

{{#if prediction.explanation.shap}}
- Key Factors (SHAP values): {{prediction.explanation.shap}}
{{else}}
{{! This block is empty, so nothing will be rendered if shap data is missing }}
{{/if}}

Based on the model's output, generate a concise, user-friendly explanation (2-3 sentences) of why the review was classified this way. Explain in simple terms, as if you were talking to a non-technical user. Do not mention SHAP values or the model itself. Frame the explanation from the perspective of an AI analysis. For example, "Our analysis suggests this review is likely [genuine/fake] because...".`,
    });

    const { output } = await explanationPrompt({
        reviewText: input.reviewText,
        prediction: mlResponse,
    });

    if (!output) {
      throw new Error("Could not generate an explanation for the analysis.");
    }
    
    return {
      trustScore: mlResponse.trust_score,
      predictedLabel: mlResponse.label,
      explanation: output.explanation,
    };
  }
);
