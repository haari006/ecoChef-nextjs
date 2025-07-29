
"use client";

import {
  useActionState,
  useEffect,
  useState,
  useRef,
  useTransition,
} from "react";
import { generateRecipeAction, type GenerateRecipeState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ChefHat,
  Clock,
  UtensilsCrossed,
  Loader2,
  Salad,
  Tags,
  Info,
  AlertTriangle,
} from "lucide-react";
import type { GenerateRecipeFromIngredientsOutput } from "@/ai/flows/generate-recipe-from-ingredients";
import { FeedbackForm } from "@/components/feedback-form";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Checkbox } from "./ui/checkbox";

const initialState: GenerateRecipeState = {
  message: null,
  recipes: null,
  error: false,
};

const MAX_GUEST_ATTEMPTS = 3;

function SubmitButton({
  disabled,
  isPending,
}: {
  disabled?: boolean;
  isPending: boolean;
}) {
  return (
    <Button
      type="submit"
      disabled={isPending || disabled}
      className="w-full sm:w-auto"
      size="lg"
    >
      {isPending ? (
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

type Recipe = GenerateRecipeFromIngredientsOutput["recipes"][0] & {
  _id: string;
};

function RecipeDisplay({ recipes }: { recipes: Recipe[] }) {
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(recipes[0]);

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-50 duration-500">
      <Tabs
        defaultValue={recipes[0]._id}
        className="w-full"
        onValueChange={(id) =>
          setActiveRecipe(recipes.find((r) => r._id === id)!)
        }
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4 h-auto">
          {recipes.map((recipe) => (
            <TabsTrigger
              key={recipe._id}
              value={recipe._id}
              className="py-2.5 text-center truncate"
            >
              {recipe.recipeName}
            </TabsTrigger>
          ))}
        </TabsList>
        {recipes.map((recipe) => (
          <TabsContent key={recipe._id} value={recipe._id}>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-headline text-3xl">
                  {recipe.recipeName}
                </CardTitle>
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
                      <span>{recipe.tags.join(", ")}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h3 className="font-bold font-headline text-xl mb-4 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />{" "}
                    Ingredients
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-foreground/80">
                    {recipe.ingredients.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-bold font-headline text-xl mb-4 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" /> Instructions
                  </h3>
                  <ol className="space-y-4 list-decimal list-inside">
                    {recipe.instructions.map((step, index) => (
                      <li key={index} className="pl-2">
                        {step}
                      </li>
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
          <h3 className="font-bold font-headline text-xl text-center">
            Enjoyed this recipe?
          </h3>
        </CardHeader>
        <CardContent>
          <FeedbackForm recipeId={activeRecipe._id} />
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            Or view all feedback for this recipe:
          </p>
          <Button variant="link" asChild>
            <Link href={`/recipes/${activeRecipe._id}`}>
              View Full Recipe Page
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function MissingIngredientsDialog({
  recipes,
  onConfirm,
  onCancel,
}: {
  recipes: Recipe[];
  onConfirm: (selectedIngredients: string[]) => void;
  onCancel: () => void;
}) {
  const allMissingIngredients = [
    ...new Set(recipes.flatMap((r) => r.missingIngredients || [])),
  ];
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize state with all ingredients selected
    if (allMissingIngredients.length > 0) {
      setSelected(
        allMissingIngredients.reduce((acc, i) => ({ ...acc, [i]: true }), {})
      );
    }
  }, [recipes]); // Rerun when recipes change

  const handleCheckboxChange = (ingredient: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [ingredient]: checked }));
  };

  const handleConfirm = () => {
    const selectedIngredients = Object.entries(selected)
      .filter(([, isSelected]) => isSelected)
      .map(([ingredient]) => ingredient);
    onConfirm(selectedIngredients);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Info className="text-primary" />
            Just a heads up!
          </AlertDialogTitle>
          <AlertDialogDescription>
            The generated recipes suggest a few ingredients you didn't list.
            Uncheck any you don't want to use, then confirm to generate new recipes or click cancel to see the current ones.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
          <p className="font-semibold">Additional ingredients needed:</p>
          <div className="space-y-2 rounded-md bg-muted p-4 max-h-40 overflow-y-auto">
            {allMissingIngredients.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`missing-${index}`}
                  checked={selected[item] ?? true}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(item, checked as boolean)
                  }
                />
                <label
                  htmlFor={`missing-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item}
                </label>
              </div>
            ))}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Show Me These Recipes
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Generate New Recipes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function RecipeGenerator() {
  const { user } = useAuth();
  const [idToken, setIdToken] = useState<string | null>(null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [showMissingIngredientsDialog, setShowMissingIngredientsDialog] =
    useState(false);
  const [recipesForDialog, setRecipesForDialog] = useState<Recipe[] | null>(
    null
  );
  const [guestAttempts, setGuestAttempts] = useState(MAX_GUEST_ATTEMPTS);
  const [isPending, startTransition] = useTransition();

  const [state, formAction] = useActionState(generateRecipeAction, {
    ...initialState,
    isDialogFlow: true,
  });

  useEffect(() => {
    if (user) {
      user.getIdToken().then(setIdToken);
    } else {
      setIdToken(null);
      const attempts = localStorage.getItem("guestAttempts");
      setGuestAttempts(attempts ? parseInt(attempts, 10) : MAX_GUEST_ATTEMPTS);
    }
  }, [user]);

  useEffect(() => {
    if (state.message && state.error) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: state.message,
      });
    }

    if (state.recipes && state.recipes.length > 0) {
      if (!user) {
        setGuestAttempts((prev) => {
          const newAttemptCount = prev - 1;
          localStorage.setItem("guestAttempts", newAttemptCount.toString());
          return newAttemptCount;
        });
      }

      const allMissingIngredients = [
        ...new Set(state.recipes.flatMap((r) => r.missingIngredients || [])),
      ];

      if (allMissingIngredients.length > 0 && state.isDialogFlow) {
        setRecipesForDialog(state.recipes as Recipe[]);
        setShowMissingIngredientsDialog(true);
      } else {
        setShowMissingIngredientsDialog(false);
        setRecipesForDialog(null);
      }
    }
  }, [state, toast, user]);

  const handleFormSubmit = (formData: FormData) => {
    formData.set("idToken", idToken ?? "");
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleRecipeCancellation = () => {
    setShowMissingIngredientsDialog(false);
  };

  const handleRegenerateWithSelection = (selectedIngredients: string[]) => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const originalIngredients = (formData.get("ingredients") as string) || "";
      const newIngredients = [originalIngredients, ...selectedIngredients]
        .filter(Boolean)
        .join(", ");
      formData.set("ingredients", newIngredients);
      formData.set("isDialogFlow", "false");
      setShowMissingIngredientsDialog(false);
      handleFormSubmit(formData);
    }
  };

  const noMoreAttempts = !user && guestAttempts <= 0;

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
          Turn Leftovers into Delights
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Got some ingredients lying around? Don't let them go to waste! Tell us
          what you have, and we'll whip up delicious recipes for you.
        </p>
      </section>

      <Card className="max-w-4xl mx-auto shadow-lg">
        <form ref={formRef} action={handleFormSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Your Kitchen Pantry
            </CardTitle>
            <CardDescription>
              List your ingredients, separated by commas. Then, select your
              preferences.
            </CardDescription>
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
              {state?.message && state.error && !state.validationError && (
                <p className="text-sm font-medium text-destructive">
                  {state.message}
                </p>
              )}
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
            {state.validationError && (
              <div className="flex items-center gap-2 text-destructive-foreground bg-destructive p-3 rounded-md">
                <AlertTriangle className="h-5 w-5" />
                <p className="text-sm font-medium">{state.validationError}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-end items-center gap-4">
            {!user && (
              <div className="text-sm text-muted-foreground">
                {noMoreAttempts ? (
                  <p>
                    You're out of free generations.{" "}
                    <Link href="/signup" className="underline text-primary">
                      Sign up
                    </Link>{" "}
                    for unlimited recipes!
                  </p>
                ) : (
                  <p>
                    You have{" "}
                    <span className="font-bold text-foreground">
                      {guestAttempts}
                    </span>{" "}
                    free generation{guestAttempts === 1 ? "" : "s"} left.
                  </p>
                )}
              </div>
            )}
            <SubmitButton disabled={noMoreAttempts} isPending={isPending} />
          </CardFooter>
        </form>
      </Card>

      {showMissingIngredientsDialog && recipesForDialog && (
        <MissingIngredientsDialog
          recipes={recipesForDialog}
          onConfirm={handleRegenerateWithSelection}
          onCancel={handleRecipeCancellation}
        />
      )}

      {state.recipes && !isPending && !showMissingIngredientsDialog && (
        <RecipeDisplay recipes={state.recipes as Recipe[]} />
      )}
    </div>
  );
}

    