// src/ai/flows/generate-recipe-from-ingredients.ts
'use server';
/**
 * @fileOverview Generates a recipe based on a list of ingredients provided by the user.
 *
 * - generateRecipeFromIngredients - A function that generates a recipe from ingredients.
 * - GenerateRecipeFromIngredientsInput - The input type for the generateRecipeFromIngredients function.
 * - GenerateRecipeFromIngredientsOutput - The return type for the generateRecipeFromIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeFromIngredientsInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available to use in the recipe.'),
  dietaryRestrictions: z
    .string()
    .optional()
    .describe('Optional dietary restrictions, such as vegan, vegetarian, or gluten-free.'),
  cookingTime: z
    .string()
    .optional()
    .describe('Optional cooking time preference, such as quick (under 30 minutes), medium (30-60 minutes), or long (over 60 minutes).'),
});
export type GenerateRecipeFromIngredientsInput = z.infer<
  typeof GenerateRecipeFromIngredientsInputSchema
>;

const GenerateRecipeFromIngredientsOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('Step-by-step instructions for preparing the recipe.'),
  cookingTime: z.string().describe('The estimated cooking time for the recipe.'),
  dietaryInformation: z.string().optional().describe('Dietary information, such as whether the recipe is vegan, vegetarian, or gluten-free.'),
});
export type GenerateRecipeFromIngredientsOutput = z.infer<
  typeof GenerateRecipeFromIngredientsOutputSchema
>;

export async function generateRecipeFromIngredients(
  input: GenerateRecipeFromIngredientsInput
): Promise<GenerateRecipeFromIngredientsOutput> {
  return generateRecipeFromIngredientsFlow(input);
}

const generateRecipeFromIngredientsPrompt = ai.definePrompt({
  name: 'generateRecipeFromIngredientsPrompt',
  input: {schema: GenerateRecipeFromIngredientsInputSchema},
  output: {schema: GenerateRecipeFromIngredientsOutputSchema},
  prompt: `You are a recipe creation expert. Given a list of ingredients, dietary restrictions, and cooking time preferences, you will generate a detailed recipe.

  Ingredients: {{{ingredients}}}
  Dietary Restrictions: {{{dietaryRestrictions}}}
  Cooking Time: {{{cookingTime}}}

  Create a recipe using the provided ingredients, adhering to any specified dietary restrictions and cooking time preferences. The recipe should include a name, a list of ingredients, step-by-step instructions, and the estimated cooking time. Provide dietary information if applicable.
  Output the recipe in a structured format, including:
  - recipeName: The name of the generated recipe.
  - ingredients: A list of ingredients required for the recipe.
  - instructions: Step-by-step instructions for preparing the recipe.
  - cookingTime: The estimated cooking time for the recipe.
  - dietaryInformation: Dietary information, such as whether the recipe is vegan, vegetarian, or gluten-free.
  `,
});

const generateRecipeFromIngredientsFlow = ai.defineFlow(
  {
    name: 'generateRecipeFromIngredientsFlow',
    inputSchema: GenerateRecipeFromIngredientsInputSchema,
    outputSchema: GenerateRecipeFromIngredientsOutputSchema,
  },
  async input => {
    const {output} = await generateRecipeFromIngredientsPrompt(input);
    return output!;
  }
);
