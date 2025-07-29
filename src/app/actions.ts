
// src/app/actions.ts
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
import { validateIngredientsWithDietaryNeeds } from '@/ai/flows/validate-ingredients-with-dietary-needs';

// Schema for generating a recipe
const recipeSchema = z.object({
  ingredients: z.string().min(1, "Please enter at least one ingredient."),
  dietaryRestrictions: z.string().optional(),
  cookingTime: z.string().optional(),
  isDialogFlow: z.string().optional().nullable().default("false"),
});

// Define the shape of a single recipe for use in the state
export type Recipe = GenerateRecipeFromIngredientsOutput["recipes"][0] & {
  _id: string;
  isFavorited?: boolean;
};

// State for the recipe generation form
export type GenerateRecipeState = {
  message?: string | null;
  recipes?: Recipe[] | null;
  error?: boolean;
  validationError?: string | null;
  isDialogFlow?: boolean;
};

export async function generateRecipeAction(
  prevState: GenerateRecipeState,
  formData: FormData
): Promise<GenerateRecipeState> {
  const idToken = formData.get("idToken") as string | null;
  let user;
  if (idToken) {
    try {
      user = await verifySession(idToken);
    } catch (e) {
      if (e instanceof Error) {
        return { message: e.message, error: true };
      }
      return {
        message: "An unknown authentication error occurred.",
        error: true,
      };
    }
  }

  const validatedFields = recipeSchema.safeParse({
    ingredients: formData.get("ingredients"),
    dietaryRestrictions: formData.get("dietaryRestrictions"),
    cookingTime: formData.get("cookingTime"),
    isDialogFlow: formData.get("isDialogFlow"),
  });

  console.error("Validation Error:", validatedFields.error);

  if (!validatedFields.success) {
    const flatErrors = validatedFields.error.flatten().fieldErrors;
    const firstError =
      flatErrors.ingredients?.[0] ||
      flatErrors.dietaryRestrictions?.[0] ||
      flatErrors.cookingTime?.[0] ||
      "Invalid input. Please check your entries.";

    return {
      message: firstError,
      error: true,
    };
  }

  const isDialogFlow = validatedFields.data.isDialogFlow !== "false";

  // Ingredient validation step
  if (
    validatedFields.data.dietaryRestrictions &&
    validatedFields.data.dietaryRestrictions !== "none"
  ) {
    const validationResult = await validateIngredientsWithDietaryNeeds({
      ingredients: validatedFields.data.ingredients,
      dietaryRestrictions: validatedFields.data.dietaryRestrictions,
    });
    if (!validationResult.isValid) {
      return {
        message: "Ingredient validation failed.",
        error: true,
        validationError:
          validationResult.reason ||
          "One or more ingredients do not match the selected dietary restriction.",
      };
    }
  }

  try {
    const generationResult = await generateRecipeFromIngredients({
      ...validatedFields.data,
      // If this is the second run (user confirmed ingredients), tell the AI to be strict.
      strict: !isDialogFlow,
    });

    if (
      !generationResult ||
      !generationResult.recipes ||
      generationResult.recipes.length === 0
    ) {
      return {
        message:
          "Could not generate any recipes. Please try different ingredients.",
        error: true,
      };
    }

    const recipesToInsert = generationResult.recipes.map((recipe) => ({
      ...recipe,
      userId: user?.uid ?? "guest", // Mark guest recipes
      createdAt: new Date(),
    }));

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection("recipes").insertMany(recipesToInsert);

    revalidatePath("/recipes");

    const insertedRecipes = Object.values(result.insertedIds).map(
      (id, index) => ({
        ...generationResult.recipes[index],
        _id: id.toString(),
      })
    );

    return {
      recipes: insertedRecipes,
      message: "Recipes generated successfully!",
      error: false,
      isDialogFlow: isDialogFlow,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "An unexpected error occurred.";
    return {
      message: `The AI failed to generate recipes. This could be due to a network issue or content restrictions. Please try again. (Error: ${errorMessage})`,
      error: true,
    };
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

const anonymousUsernames = [
    'Anonymous Artichoke', 'Mysterious Mushroom', 'Secretive Shallot', 'Incognito Ingredient',
    'Unnamed Umami', 'Hidden Herb', 'Classified Caraway', 'Covert Cilantro', 'Private Parsley'
];

export async function submitFeedbackAction(
    prevState: FeedbackState,
    formData: FormData
): Promise<FeedbackState> {
    const idToken = formData.get('idToken') as string | null;
    let user = null;
    if (idToken) {
        try {
            user = await verifySession(idToken);
        } catch (e) {
            // Ignore token verification errors for guests
        }
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

        const userId = user?.uid;
        const userName = user?.name || user?.email || anonymousUsernames[Math.floor(Math.random() * anonymousUsernames.length)];

        await db.collection('feedback').insertOne({
            ...validatedFields.data,
            userId: userId ?? 'guest',
            userName: userName,
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
export async function getRecipes(userId?: string | null) {
  try {
      const client = await clientPromise;
      const db = client.db();
      const recipes = await db.collection('recipes').find({}).sort({ createdAt: -1 }).toArray();

      if (userId) {
          const favorites = await db.collection('favorites').find({ userId }).toArray();
          const favoriteIds = new Set(favorites.map(f => f.recipeId.toString()));
          recipes.forEach(r => {
              (r as any).isFavorited = favoriteIds.has(r._id.toString());
          });
      }
      
      return JSON.parse(JSON.stringify(recipes)) as Recipe[];
  } catch (e) {
      console.error(e);
      return [];
  }
}

// Action to get a single recipe by ID
export async function getRecipe(id: string, userId?: string | null) {
  try {
      const client = await clientPromise;
      const db = client.db();
      if (!ObjectId.isValid(id)) {
          return null;
      }
      const recipe = await db.collection('recipes').findOne({ _id: new ObjectId(id) });
      if (!recipe) return null;

      if (userId) {
          const favorite = await db.collection('favorites').findOne({ userId, recipeId: new ObjectId(id) });
          (recipe as any).isFavorited = !!favorite;
      }
      return JSON.parse(JSON.stringify(recipe)) as Recipe;
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

// Action to toggle favorite status
export async function toggleFavoriteAction(idToken: string | null, recipeId: string) {
    let user;
    if (!idToken) {
        return { success: false, message: 'You must be logged in to favorite recipes.' };
    }
    try {
        user = await verifySession(idToken);
    } catch (e) {
        if (e instanceof Error) {
            return { success: false, message: e.message };
        }
        return { success: false, message: 'An unknown authentication error occurred.' };
    }

    if (!ObjectId.isValid(recipeId)) {
        return { success: false, message: 'Invalid recipe ID.' };
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const favoritesCollection = db.collection('favorites');

        const existingFavorite = await favoritesCollection.findOne({
            userId: user.uid,
            recipeId: new ObjectId(recipeId),
        });

        if (existingFavorite) {
            // Remove from favorites
            await favoritesCollection.deleteOne({ _id: existingFavorite._id });
            revalidatePath('/recipes');
            revalidatePath(`/recipes/${recipeId}`);
            revalidatePath('/favorites');
            return { success: true, isFavorited: false, message: 'Removed from favorites.' };
        } else {
            // Add to favorites
            await favoritesCollection.insertOne({
                userId: user.uid,
                recipeId: new ObjectId(recipeId),
                createdAt: new Date(),
            });
            revalidatePath('/recipes');
            revalidatePath(`/recipes/${recipeId}`);
            revalidatePath('/favorites');
            return { success: true, isFavorited: true, message: 'Added to favorites!' };
        }
    } catch (e) {
        console.error(e);
        return { success: false, message: 'Failed to update favorites.' };
    }
}

export async function getFavoriteRecipes(idToken: string | null) {
  let user;
  if (!idToken) {
    return [];
  }
  try {
      user = await verifySession(idToken);
  } catch (e) {
      if (e instanceof Error) {
          console.error(e.message);
      }
      return [];
  }

  try {
      const client = await clientPromise;
      const db = client.db();
      const favorites = await db.collection('favorites').aggregate([
          { $match: { userId: user.uid } },
          { $sort: { createdAt: -1 } },
          {
              $lookup: {
                  from: 'recipes',
                  localField: 'recipeId',
                  foreignField: '_id',
                  as: 'recipeDetails'
              }
          },
          { $unwind: '$recipeDetails' },
          {
              $replaceRoot: {
                  newRoot: {
                      $mergeObjects: [ "$recipeDetails", { isFavorited: true } ]
                  }
              }
          }
      ]).toArray();
      
      return JSON.parse(JSON.stringify(favorites)) as Recipe[];
  } catch (e) {
      console.error(e);
      return [];
  }
}
