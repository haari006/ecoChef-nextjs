'use server';

/**
 * @fileOverview Validates if a list of ingredients conforms to a given dietary restriction.
 *
 * - validateIngredientsWithDietaryNeeds - A function that validates ingredients against dietary needs.
 * - ValidateIngredientsWithDietaryNeedsInput - The input type for the validation function.
 * - ValidateIngredientsWithDietaryNeedsOutput - The return type for the validation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateIngredientsWithDietaryNeedsInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients.'),
  dietaryRestrictions: z
    .string()
    .describe('The dietary restriction to validate against (e.g., vegan, gluten-free).'),
});
export type ValidateIngredientsWithDietaryNeedsInput = z.infer<
  typeof ValidateIngredientsWithDietaryNeedsInputSchema
>;

const ValidateIngredientsWithDietaryNeedsOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the ingredients are valid for the given dietary restriction.'),
  reason: z.string().optional().describe('The reason why the ingredients are not valid. This should be a user-friendly explanation. For example, "Chicken is not a vegan ingredient."'),
});
export type ValidateIngredientsWithDietaryNeedsOutput = z.infer<
  typeof ValidateIngredientsWithDietaryNeedsOutputSchema
>;

export async function validateIngredientsWithDietaryNeeds(
  input: ValidateIngredientsWithDietaryNeedsInput
): Promise<ValidateIngredientsWithDietaryNeedsOutput> {
  return validateIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateIngredientsPrompt',
  input: {schema: ValidateIngredientsWithDietaryNeedsInputSchema},
  output: {schema: ValidateIngredientsWithDietaryNeedsOutputSchema},
  prompt: `You are an expert nutritionist. Your task is to validate if a given list of ingredients is compliant with a specific dietary restriction.

  Ingredients: {{{ingredients}}}
  Dietary Restriction: {{{dietaryRestrictions}}}

  Analyze the ingredients. If any ingredient violates the dietary restriction, set 'isValid' to false and provide a simple, clear 'reason' explaining the conflict (e.g., "Milk is not a vegan ingredient."). If all ingredients are compliant, set 'isValid' to true and leave the reason empty.
  `,
});

const validateIngredientsFlow = ai.defineFlow(
  {
    name: 'validateIngredientsFlow',
    inputSchema: ValidateIngredientsWithDietaryNeedsInputSchema,
    outputSchema: ValidateIngredientsWithDietaryNeedsOutputSchema,
  },
  async input => {
    if (input.dietaryRestrictions === 'none' || !input.dietaryRestrictions) {
        return { isValid: true };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
