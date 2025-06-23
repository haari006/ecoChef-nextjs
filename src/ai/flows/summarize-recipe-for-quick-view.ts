'use server';
/**
 * @fileOverview Summarizes a recipe for a quick view, highlighting key steps and ingredients.
 *
 * - summarizeRecipeForQuickView - A function that summarizes the recipe.
 * - SummarizeRecipeForQuickViewInput - The input type for the summarizeRecipeForQuickView function.
 * - SummarizeRecipeForQuickViewOutput - The return type for the summarizeRecipeForQuickView function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRecipeForQuickViewInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.string().describe('The ingredients required for the recipe.'),
  instructions: z.string().describe('The cooking instructions for the recipe.'),
});
export type SummarizeRecipeForQuickViewInput = z.infer<typeof SummarizeRecipeForQuickViewInputSchema>;

const SummarizeRecipeForQuickViewOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the recipe including key ingredients and steps.'),
});
export type SummarizeRecipeForQuickViewOutput = z.infer<typeof SummarizeRecipeForQuickViewOutputSchema>;

export async function summarizeRecipeForQuickView(input: SummarizeRecipeForQuickViewInput): Promise<SummarizeRecipeForQuickViewOutput> {
  return summarizeRecipeForQuickViewFlow(input);
}

const summarizeRecipeForQuickViewPrompt = ai.definePrompt({
  name: 'summarizeRecipeForQuickViewPrompt',
  input: {schema: SummarizeRecipeForQuickViewInputSchema},
  output: {schema: SummarizeRecipeForQuickViewOutputSchema},
  prompt: `Summarize the following recipe for a quick view, highlighting the key ingredients and steps:

Recipe Name: {{{recipeName}}}
Ingredients: {{{ingredients}}}
Instructions: {{{instructions}}}

Summary:`,
});

const summarizeRecipeForQuickViewFlow = ai.defineFlow(
  {
    name: 'summarizeRecipeForQuickViewFlow',
    inputSchema: SummarizeRecipeForQuickViewInputSchema,
    outputSchema: SummarizeRecipeForQuickViewOutputSchema,
  },
  async input => {
    const {output} = await summarizeRecipeForQuickViewPrompt(input);
    return output!;
  }
);
