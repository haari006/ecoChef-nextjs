'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  generateRecipeFromIngredients,
  type GenerateRecipeFromIngredientsOutput,
} from '@/ai/flows/generate-recipe-from-ingredients';
import clientPromise from '@/lib/mongodb';
import { auth } from '@/lib/firebase';
import { ObjectId } from 'mongodb';

// Schema for generating a recipe
const recipeSchema = z.object({
  ingredients: z.string().min(3, 'Please enter at least one ingredient.'),
  dietaryRestrictions: z.string().optional(),
  cookingTime: z.string().optional(),
});

// State for the recipe generation form
export type GenerateRecipeState = {
  message?: string | null;
  recipe?: (GenerateRecipeFromIngredientsOutput & { _id: string }) | null;
  error?: boolean;
};

export async function generateRecipeAction(
  prevState: GenerateRecipeState,
  formData: FormData
): Promise<GenerateRecipeState> {
  const user = auth.currentUser;
  if (!user) {
    return { message: 'You must be logged in to generate a recipe.', error: true };
  }

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
    const generatedRecipe = await generateRecipeFromIngredients(validatedFields.data);

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('recipes').insertOne({
      ...generatedRecipe,
      userId: user.uid,
      createdAt: new Date(),
    });

    revalidatePath('/recipes');

    return {
      recipe: { ...generatedRecipe, _id: result.insertedId.toString() },
      message: 'Recipe generated successfully!',
      error: false,
    };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to generate recipe. Please try again later.', error: true };
  }
}

// Schema for submitting feedback
const feedbackSchema = z.object({
    recipeId: z.string(),
    rating: z.coerce.number().min(1).max(5),
    comment: z.string().optional(),
});

// State for the feedback form
export type FeedbackState = {
    message?: string;
    error?: boolean;
    success?: boolean;
};

export async function submitFeedbackAction(
    prevState: FeedbackState,
    formData: FormData
): Promise<FeedbackState> {
    const user = auth.currentUser;
    if (!user) {
        return { message: "You must be logged in to submit feedback.", error: true };
    }

    const validatedFields = feedbackSchema.safeParse({
        recipeId: formData.get('recipeId'),
        rating: formData.get('rating'),
        comment: formData.get('comment'),
    });

    if (!validatedFields.success) {
        return { message: "Invalid data provided.", error: true };
    }
    
    try {
        const client = await clientPromise;
        const db = client.db();
        await db.collection('feedback').insertOne({
            ...validatedFields.data,
            userId: user.uid,
            userName: user.displayName,
            createdAt: new Date(),
        });
        
        revalidatePath(`/recipes/${validatedFields.data.recipeId}`);
        return { message: "Thank you for your feedback!", success: true };
    } catch (e) {
        console.error(e);
        return { message: "Failed to submit feedback.", error: true };
    }
}

// Action to get all recipes
export async function getRecipes() {
    try {
        const client = await clientPromise;
        const db = client.db();
        const recipes = await db.collection('recipes').find({}).sort({ createdAt: -1 }).toArray();
        return JSON.parse(JSON.stringify(recipes)) as (GenerateRecipeFromIngredientsOutput & { _id: string; })[];
    } catch (e) {
        console.error(e);
        return [];
    }
}

// Action to get a single recipe by ID
export async function getRecipe(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        if (!ObjectId.isValid(id)) {
            return null;
        }
        const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });
        if (!recipe) return null;
        return JSON.parse(JSON.stringify(recipe)) as (GenerateRecipeFromIngredientsOutput & { _id: string; });
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Action to get feedback for a recipe
export async function getFeedbackForRecipe(recipeId: string) {
    try {
        const client = await clientPromise;
        const db = client.db();
        const feedback = await db.collection('feedback').find({ recipeId }).sort({ createdAt: -1 }).toArray();
        return JSON.parse(JSON.stringify(feedback));
    } catch (e) {
        console.error(e);
        return [];
    }
}
