'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/server-auth';

async function verifyAdmin(idToken: string | null) {
    const user = await verifySession(idToken);
    if (!user || user.uid !== process.env.ADMIN_UID) {
        throw new Error('Not authorized');
    }
    return user;
}

const recipeSchema = z.object({
    id: z.string().optional(),
    recipeName: z.string().min(1, 'Recipe name is required.'),
    ingredients: z.string().min(1, 'Ingredients are required.'),
    instructions: z.string().min(1, 'Instructions are required.'),
    cookingTime: z.string().min(1, 'Cooking time is required.'),
    dietaryInformation: z.string().optional(),
    tags: z.string().optional(),
});

export type RecipeFormState = {
    message?: string;
    errors?: {
        [key: string]: string[] | undefined;
        _form?: string[] | undefined;
    };
    success?: boolean;
}

export async function upsertRecipe(idToken: string | null, prevState: RecipeFormState, formData: FormData): Promise<RecipeFormState> {
    let user;
    try {
        user = await verifyAdmin(idToken);
    } catch (e) {
        if (e instanceof Error) {
            return { errors: { _form: [e.message] } };
        }
        return { errors: { _form: ['An unknown authentication error occurred.'] } };
    }

    const validatedFields = recipeSchema.safeParse({
        id: formData.get('id'),
        recipeName: formData.get('recipeName'),
        ingredients: formData.get('ingredients'),
        instructions: formData.get('instructions'),
        cookingTime: formData.get('cookingTime'),
        dietaryInformation: formData.get('dietaryInformation'),
        tags: formData.get('tags'),
    });

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { id, ...data } = validatedFields.data;

    const recipeData = {
        ...data,
        ingredients: data.ingredients.split('\n').filter(line => line.trim() !== ''),
        instructions: data.instructions.split('\n').filter(line => line.trim() !== ''),
        tags: data.tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || [],
    };
    
    try {
        const client = await clientPromise;
        const db = client.db();
        
        if (id) {
            await db.collection('recipes').updateOne(
                { _id: new ObjectId(id) },
                { $set: recipeData }
            );
        } else {
            await db.collection('recipes').insertOne({
                ...recipeData,
                userId: user.uid,
                createdAt: new Date(),
            });
        }
    } catch (error) {
        console.error(error);
        return { errors: { _form: ['Database error. Failed to save recipe.'] } };
    }

    revalidatePath('/admin/recipes');
    revalidatePath('/recipes');
    if (id) revalidatePath(`/recipes/${id}`);
    redirect('/admin/recipes');
}

export async function deleteRecipe(idToken: string | null, id: string) {
    await verifyAdmin(idToken);
    try {
        const client = await clientPromise;
        const db = client.db();
        if (!ObjectId.isValid(id)) {
            throw new Error('Invalid recipe ID');
        }
        // Also delete associated feedback
        await db.collection('feedback').deleteMany({ recipeId: id });
        await db.collection('recipes').deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
        console.error(error);
        throw new Error('Failed to delete recipe.');
    }
    revalidatePath('/admin/recipes');
    revalidatePath('/recipes');
}

export async function getAllFeedback(idToken: string | null) {
    await verifyAdmin(idToken);
    try {
        const client = await clientPromise;
        const db = client.db();
        const feedback = await db.collection('feedback').find({}).sort({ createdAt: -1 }).toArray();
        return JSON.parse(JSON.stringify(feedback));
    } catch (e) {
        console.error(e);
        return [];
    }
}
