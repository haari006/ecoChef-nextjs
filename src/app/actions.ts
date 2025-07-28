'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  generateRecipeFromIngredients,
  type GenerateRecipeFromIngredientsOutput,
} from '@/ai/flows/generate-recipe-from-ingredients';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { verifySession } from '@/lib/server-auth';

// Schema for generating a recipe
const recipeSchema = z.object({
  ingredients: z.string().min(3, 'Please enter at least one ingredient.'),
  dietaryRestrictions: z.string().optional(),
  cookingTime: z.string().optional(),
});

// Define the shape of a single recipe for use in the state
type Recipe = GenerateRecipeFromIngredientsOutput['recipes'][0] & { _id: string };

// State for the recipe generation form
export type GenerateRecipeState = {
  message?: string | null;
  recipes?: Recipe[] | null;
  error?: boolean;
};

export async function generateRecipeAction(
  idToken: string | null,
  prevState: GenerateRecipeState,
  formData: FormData
): Promise<GenerateRecipeState> {
  let user;
  try {
    user = await verifySession(idToken);
  } catch (e) {
    if (e instanceof Error) {
        return { message: e.message, error: true };
    }
    return { message: 'An unknown authentication error occurred.', error: true };
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
    const generationResult = await generateRecipeFromIngredients(validatedFields.data);

    if (!generationResult.recipes || generationResult.recipes.length === 0) {
      return { message: 'Could not generate any recipes. Please try different ingredients.', error: true };
    }

    const recipesToInsert = generationResult.recipes.map(recipe => ({
      ...recipe,
      userId: user.uid,
      createdAt: new Date(),
    }));

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection('recipes').insertMany(recipesToInsert);

    revalidatePath('/recipes');

    const insertedRecipes = Object.values(result.insertedIds).map((id, index) => ({
      ...generationResult.recipes[index],
      _id: id.toString(),
    }));

    return {
      recipes: insertedRecipes,
      message: 'Recipes generated successfully!',
      error: false,
    };
  } catch (e) {
    console.error(e);
    return { message: 'Failed to generate recipes. Please try again later.', error: true };
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
    idToken: string | null,
    prevState: FeedbackState,
    formData: FormData
): Promise<FeedbackState> {
    let user;
    try {
        user = await verifySession(idToken);
    } catch (e) {
        if (e instanceof Error) {
            return { message: e.message, error: true };
        }
        return { message: 'An unknown authentication error occurred.', error: true };
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
            userName: user.name || user.email,
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
        // This is a temporary type assertion. In a real app, you'd want to validate the shape of the data from the DB
        return JSON.parse(JSON.stringify(recipes)) as (GenerateRecipeFromIngredientsOutput['recipes'][0] & { _id: string; })[];
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
        // This is a temporary type assertion. In a real app, you'd want to validate the shape of the data from the DB
        return JSON.parse(JSON.stringify(recipe)) as (GenerateRecipeFromIngredientsOutput['recipes'][0] & { _id: string; });
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
