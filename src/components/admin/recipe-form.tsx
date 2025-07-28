'use client';

import { useFormState, useFormStatus } from "react-dom";
import { upsertRecipe, type RecipeFormState } from "@/app/admin/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import type { GenerateRecipeFromIngredientsOutput } from "@/ai/flows/generate-recipe-from-ingredients";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type RecipeWithId = GenerateRecipeFromIngredientsOutput['recipes'][0] & { _id: string };

const initialState: RecipeFormState = {};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Recipe' : 'Create Recipe'}
        </Button>
    )
}

export function RecipeForm({ recipe }: { recipe?: RecipeWithId }) {
    const { user } = useAuth();
    const [idToken, setIdToken] = useState<string | null>(null);
    const { toast } = useToast();
    const isEditing = !!recipe;

    useEffect(() => {
        if (user) {
            user.getIdToken().then(setIdToken);
        } else {
            setIdToken(null);
        }
    }, [user]);

    const actionWithToken = upsertRecipe.bind(null, idToken);
    const [state, formAction] = useFormState(actionWithToken, initialState);

    useEffect(() => {
        if (state.errors?._form) {
            toast({
                title: 'Error',
                description: state.errors._form.join(', '),
                variant: 'destructive',
            })
        }
    }, [state, toast]);

    return (
        <form action={formAction}>
            {recipe && <input type="hidden" name="id" value={recipe._id} />}
            <Card>
                <CardHeader>
                    <CardTitle>{isEditing ? 'Edit Recipe' : 'Create a New Recipe'}</CardTitle>
                    <CardDescription>Fill out the details below.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipeName">Recipe Name</Label>
                        <Input id="recipeName" name="recipeName" defaultValue={recipe?.recipeName} />
                        {state.errors?.recipeName && <p className="text-sm font-medium text-destructive">{state.errors.recipeName[0]}</p>}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="cookingTime">Cooking Time</Label>
                            <Input id="cookingTime" name="cookingTime" defaultValue={recipe?.cookingTime} />
                            {state.errors?.cookingTime && <p className="text-sm font-medium text-destructive">{state.errors.cookingTime[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dietaryInformation">Dietary Information</Label>
                            <Input id="dietaryInformation" name="dietaryInformation" defaultValue={recipe?.dietaryInformation} />
                            {state.errors?.dietaryInformation && <p className="text-sm font-medium text-destructive">{state.errors.dietaryInformation[0]}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input id="tags" name="tags" defaultValue={recipe?.tags?.join(', ')} />
                        {state.errors?.tags && <p className="text-sm font-medium text-destructive">{state.errors.tags[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                        <Textarea id="ingredients" name="ingredients" rows={8} defaultValue={recipe?.ingredients.join('\n')} />
                        {state.errors?.ingredients && <p className="text-sm font-medium text-destructive">{state.errors.ingredients[0]}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instructions">Instructions (one per line)</Label>
                        <Textarea id="instructions" name="instructions" rows={12} defaultValue={recipe?.instructions.join('\n')} />
                        {state.errors?.instructions && <p className="text-sm font-medium text-destructive">{state.errors.instructions[0]}</p>}
                    </div>
                    {state.errors?._form && <p className="text-sm font-medium text-destructive">{state.errors._form.join(', ')}</p>}
                </CardContent>
                <CardFooter>
                    <SubmitButton isEditing={isEditing} />
                </CardFooter>
            </Card>
        </form>
    );
}
