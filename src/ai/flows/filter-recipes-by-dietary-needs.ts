'use server';

/**
 * @fileOverview Filters recipes based on user dietary restrictions provided in natural language.
 *
 * - filterRecipesByDietaryNeeds - A function that filters recipes based on dietary restrictions.
 * - FilterRecipesByDietaryNeedsInput - The input type for the filterRecipesByDietaryNeeds function.
 * - FilterRecipesByDietaryNeedsOutput - The return type for the filterRecipesByDietaryNeeds function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FilterRecipesByDietaryNeedsInputSchema = z.object({
  dietaryRestrictions: z
    .string()
    .describe(
      'A natural language description of the users dietary restrictions, e.g., vegan, gluten-free, etc.'
    ),
  recipes: z
    .string()
    .describe('A list of recipes to filter, represented as a string.'),
});
export type FilterRecipesByDietaryNeedsInput = z.infer<
  typeof FilterRecipesByDietaryNeedsInputSchema
>;

const FilterRecipesByDietaryNeedsOutputSchema = z.object({
  filteredRecipes: z
    .string()
    .describe('A list of recipes that match the dietary restrictions.'),
});
export type FilterRecipesByDietaryNeedsOutput = z.infer<
  typeof FilterRecipesByDietaryNeedsOutputSchema
>;

export async function filterRecipesByDietaryNeeds(
  input: FilterRecipesByDietaryNeedsInput
): Promise<FilterRecipesByDietaryNeedsOutput> {
  return filterRecipesByDietaryNeedsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'filterRecipesByDietaryNeedsPrompt',
  input: {schema: FilterRecipesByDietaryNeedsInputSchema},
  output: {schema: FilterRecipesByDietaryNeedsOutputSchema},
  prompt: `You are a helpful assistant that filters recipes based on dietary restrictions.

  The user has the following dietary restrictions: {{{dietaryRestrictions}}}.

  Here are the recipes to filter: {{{recipes}}}.

  Return only the recipes that match the dietary restrictions.
  The filtered recipes MUST be returned as a string.
  `,
});

const filterRecipesByDietaryNeedsFlow = ai.defineFlow(
  {
    name: 'filterRecipesByDietaryNeedsFlow',
    inputSchema: FilterRecipesByDietaryNeedsInputSchema,
    outputSchema: FilterRecipesByDietaryNeedsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
