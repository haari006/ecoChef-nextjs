'use client';

import { useFormState, useFormStatus } from "react-dom";
import { generateRecipeAction, type GenerateRecipeState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState, useRef } from "react";
import { useToast } from '@/hooks/use-toast';
import { ChefHat, Clock, UtensilsCrossed, Loader2, Salad, Tags } from 'lucide-react';
import type { GenerateRecipeFromIngredientsOutput } from '@/ai/flows/generate-recipe-from-ingredients';
import { FeedbackForm } from '@/components/feedback-form';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const initialState: GenerateRecipeState = {
  message: null,
  recipes: null,
  error: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto" size="lg">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <ChefHat className="mr-2 h-4 w-4" />
          Generate Recipes
        </>
      )}
    </Button>
  );
}

type Recipe = GenerateRecipeFromIngredientsOutput['recipes'][0] & { _id: string };

function RecipeDisplay({ recipes }: { recipes: Recipe[] }) {
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(recipes[0]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-50 duration-500">
      <Tabs defaultValue={recipes[0]._id} className="w-full" onValueChange={(id) => setActiveRecipe(recipes.find(r => r._id === id)!)}>
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4 h-auto">
          {recipes.map((recipe) => (
            <TabsTrigger key={recipe._id} value={recipe._id} className="py-2.5 text-center truncate">{recipe.recipeName}</TabsTrigger>
          ))}
        </TabsList>
        {recipes.map((recipe) => (
            <TabsContent key={recipe._id} value={recipe._id}>
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">{recipe.recipeName}</CardTitle>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground pt-2">
                            {recipe.cookingTime && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>{recipe.cookingTime}</span>
                                </div>
                            )}
                            {recipe.dietaryInformation && (
                                <div className="flex items-center gap-1.5">
                                    <Salad className="w-4 h-4" />
                                    <span>{recipe.dietaryInformation}</span>
                                </div>
                            )}
                            {recipe.tags && recipe.tags.length > 0 && (
                                <div className="flex items-center gap-1.5">
                                    <Tags className="w-4 h-4" />
                                    <span>{recipe.tags.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                        <h3 className="font-bold font-headline text-xl mb-4 flex items-center gap-2"><UtensilsCrossed className="w-5 h-5 text-primary"/> Ingredients</h3>
                        <ul className="space-y-2 list-disc list-inside text-foreground/80">
                            {recipe.ingredients.map((item, index) => (
                            <li key={index}>{item}</li>
                            ))}
                        </ul>
                        </div>
                        <div className="md:col-span-2">
                        <h3 className="font-bold font-headline text-xl mb-4 flex items-center gap-2"><ChefHat className="w-5 h-5 text-primary"/> Instructions</h3>
                        <ol className="space-y-4 list-decimal list-inside">
                            {recipe.instructions.map((step, index) => (
                            <li key={index} className="pl-2">{step}</li>
                            ))}
                        </ol>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        ))}
      </Tabs>
      <Card className="mt-8">
        <CardHeader>
            <h3 className="font-bold font-headline text-xl text-center">Enjoyed this recipe?</h3>
        </CardHeader>
        <CardContent>
            <FeedbackForm recipeId={activeRecipe._id} />
        </CardContent>
        <CardFooter className='flex-col gap-2'>
            <p className="text-sm text-muted-foreground">Or view all feedback for this recipe:</p>
            <Button variant="link" asChild>
                <Link href={`/recipes/${activeRecipe._id}`}>View Full Recipe Page</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function RecipeGenerator() {
  const { user } = useAuth();
  const [idToken, setIdToken] = useState<string | null>(null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    } else {
      setIdToken(null);
    }
  }, [user]);

  const actionWithToken = generateRecipeAction.bind(null, idToken);
  const [state, formAction] = useFormState(actionWithToken, initialState);

  useEffect(() => {
    if (state.message && state.error) {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: state.message,
      });
    }
    if (state.recipes && state.recipes.length > 0) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Turn Leftovers into Delights
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Got some ingredients lying around? Don't let them go to waste! Tell us what you have, and we'll whip up delicious recipes for you.
        </p>
      </section>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <form ref={formRef} action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Your Kitchen Pantry</CardTitle>
            <CardDescription>List your ingredients, separated by commas. Then, select your preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="ingredients">Available Ingredients</Label>
              <Textarea
                id="ingredients"
                name="ingredients"
                placeholder="e.g., chicken breast, broccoli, garlic, olive oil"
                required
                rows={4}
              />
               {state?.message && state.error && <p className="text-sm font-medium text-destructive">{state.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="dietaryRestrictions">Dietary Needs</Label>
                <Select name="dietaryRestrictions" defaultValue="none">
                  <SelectTrigger id="dietaryRestrictions">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                    <SelectItem value="halal">Halal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cookingTime">Cooking Time</Label>
                <Select name="cookingTime" defaultValue="any">
                  <SelectTrigger id="cookingTime">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="quick">Under 30 min</SelectItem>
                    <SelectItem value="medium">30-60 min</SelectItem>
                    <SelectItem value="long">Over 60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      {state.recipes && state.recipes.length > 0 && <RecipeDisplay recipes={state.recipes} />}
    </div>
  );
}
