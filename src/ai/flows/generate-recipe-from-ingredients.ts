
// src/ai/flows/generate-recipe-from-ingredients.ts
'use server';
/**
 * @fileOverview Generates recipes based on a list of ingredients provided by the user.
 *
 * - generateRecipeFromIngredients - A function that generates recipes from ingredients.
 * - GenerateRecipeFromIngredientsInput - The input type for the generateRecipeFromIngredients function.
 * - GenerateRecipeFromIngredientsOutput - The return type for the generateRecipeFromingredients function.
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
  strict: z.boolean().optional().describe('If true, the model should ONLY use the provided ingredients and not suggest any new ones.')
});
export type GenerateRecipeFromIngredientsInput = z.infer<
  typeof GenerateRecipeFromIngredientsInputSchema
>;

const RecipeSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  ingredients: z.array(z.string()).describe('A list of all ingredients required for the recipe.'),
  missingIngredients: z.array(z.string()).optional().describe('A list of ingredients required for the recipe that were NOT in the user\'s original list.'),
  instructions: z.array(z.string()).describe('Step-by-step instructions for preparing the recipe.'),
  cookingTime: z.string().describe('The estimated cooking time for the recipe.'),
  dietaryInformation: z.string().optional().describe('Dietary information, such as whether the recipe is vegan, vegetarian, or gluten-free.'),
  tags: z.array(z.string()).optional().describe('A list of 3-5 relevant tags for the recipe, like "dinner", "quick", "healthy", "dessert".'),
});

const GenerateRecipeFromIngredientsOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('A list of 3 generated recipes.'),
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
  prompt: `You are a recipe creation expert. Given a list of ingredients, dietary restrictions, and cooking time preferences, you will generate three distinct and detailed recipes.

  Ingredients: {{{ingredients}}}
  Dietary Restrictions: {{{dietaryRestrictions}}}
  Cooking Time: {{{cookingTime}}}
  {{#if strict}}
  IMPORTANT: You MUST ONLY use the ingredients from the list provided. Do not suggest or add any other ingredients. The 'missingIngredients' field for all recipes MUST be an empty array.
  {{else}}
  IMPORTANT: For each recipe, you MUST identify which ingredients are required but were not in the original list provided by the user. Populate these in the 'missingIngredients' field. If no extra ingredients are needed, return an empty array for 'missingIngredients'.
  {{/if}}

  Create three different recipes using the provided ingredients, adhering to any specified dietary restrictions and cooking time preferences. Each recipe should include a name, a list of all ingredients, step-by-step instructions, and the estimated cooking time. 
    
  Output the recipes in a structured format within a 'recipes' array.
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
