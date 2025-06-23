'use server';

import { z } from 'zod';
import {
  generateRecipeFromIngredients,
  type GenerateRecipeFromIngredientsOutput,
} from '@/ai/flows/generate-recipe-from-ingredients';

const recipeSchema = z.object({
  ingredients: z.string().min(3, 'Please enter at least one ingredient.'),
  dietaryRestrictions: z.string().optional(),
  cookingTime: z.string().optional(),
});

type State = {
  message?: string | null;
  recipe?: GenerateRecipeFromIngredientsOutput | null;
  error?: boolean;
};

export async function generateRecipeAction(
  prevState: State,
  formData: FormData
): Promise<State> {
  const validatedFields = recipeSchema.safeParse({
    ingredients: formData.get('ingredients'),
    dietaryRestrictions: formData.get('dietaryRestrictions'),
    cookingTime: formData.get('cookingTime'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.ingredients?.[0],
      error: true,
    };
  }

  try {
    const result = await generateRecipeFromIngredients(validatedFields.data);
    return { recipe: result, message: 'Recipe generated successfully!', error: false };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to generate recipe. Please try again later.', error: true };
  }
}
