
"use client";

import {
  useActionState,
  useEffect,
  useState,
  useRef,
  useTransition,
} from "react";
import { generateRecipeAction, type GenerateRecipeState, saveRecipe } from "@/app/actions";
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
  Heart,
} from "lucide-react";
import type { Recipe } from "@/app/actions";
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
import { useLanguage } from "@/hooks/use-language";
import { useTranslation } from "@/hooks/use-translation";

const initialState: GenerateRecipeState = {
  message: null,
  recipes: null,
  error: false,
};

const MAX_GUEST_ATTEMPTS = 3;

function RecipeDisplay({ recipes: initialRecipes }: { recipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initialRecipes);
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(recipes[0]);
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    setActiveRecipe(recipes[0]);
  }, [recipes]);


  const handleFavorite = (recipeToSave: Recipe) => {
    if (!user) {
      toast({
        title: t('recipeDisplay.loginRequiredTitle'),
        description: t('recipeDisplay.loginRequiredDesc'),
        variant: 'destructive'
      });
      return;
    }
    startTransition(async () => {
        const idToken = await user.getIdToken();
        const result = await saveRecipe(idToken, recipeToSave);
        if (result.success && result.recipeId) {
            toast({
                title: t('recipeDisplay.favoriteSuccessTitle'),
                description: result.message,
                variant: 'success'
            });
            // Update the recipe in the local state with its new ID and favorited status
            setRecipes(currentRecipes => currentRecipes.map(r => 
                r.recipeName === recipeToSave.recipeName 
                ? { ...r, _id: result.recipeId, isFavorited: true }
                : r
            ));
        } else {
            toast({
                title: t('common.error'),
                description: result.message,
                variant: 'destructive'
            });
        }
    });
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-50 duration-500">
      <Tabs
        defaultValue={recipes[0].recipeName}
        className="w-full"
        onValueChange={(name) =>
          setActiveRecipe(recipes.find((r) => r.recipeName === name)!)
        }
      >
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-4 h-auto">
          {recipes.map((recipe) => (
            <TabsTrigger
              key={recipe.recipeName}
              value={recipe.recipeName}
              className="py-2.5 text-center truncate"
            >
              {recipe.recipeName}
            </TabsTrigger>
          ))}
        </TabsList>
        {recipes.map((recipe) => (
          <TabsContent key={recipe.recipeName} value={recipe.recipeName}>
            <Card className="shadow-lg">
              <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
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
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full group"
                        onClick={() => handleFavorite(recipe)}
                        disabled={isPending || !!recipe.isFavorited}
                    >
                        {isPending && !recipe.isFavorited ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Heart
                                className={`h-5 w-5 transition-all duration-200 group-hover:scale-110 ${
                                    recipe.isFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground/80'
                                }`}
                            />
                        )}
                        <span className="sr-only">{recipe.isFavorited ? t('recipeDisplay.favorited') : t('recipeDisplay.addToFavorites')}</span>
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                  <h3 className="font-bold font-headline text-xl mb-4 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-primary" />{" "}
                    {t('recipeDisplay.ingredients')}
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-foreground/80">
                    {recipe.ingredients.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-2">
                  <h3 className="font-bold font-headline text-xl mb-4 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-primary" /> {t('recipeDisplay.instructions')}
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
              {activeRecipe._id && (
                <>
                <CardFooter>
                  {t('recipeDisplay.feedbackPrompt')}
                </CardFooter>
                 <CardContent>
                    <FeedbackForm recipeId={activeRecipe._id} />
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        {t('recipeDisplay.feedbackLinkPrompt')}
                    </p>
                    <Button variant="link" asChild>
                        <Link href={`/recipes/${activeRecipe._id}`}>
                        {t('recipeDisplay.viewFullPage')}
                        </Link>
                    </Button>
                </CardFooter>
                </>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
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
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();
  
  const allMissingIngredients = [
    ...new Set(recipes.flatMap((r) => r.missingIngredients || [])),
  ];

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
            {t('missingIngredients.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('missingIngredients.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4 space-y-4">
          <p className="font-semibold">{t('missingIngredients.needed')}</p>
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
            {t('missingIngredients.showCurrent')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {t('missingIngredients.generateNew')}
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
  const resultsRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { t } = useTranslation();
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
        title: t('common.toastErrorTitle'),
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
        setRecipesForDialog(state.recipes);
        setShowMissingIngredientsDialog(true);
      } else {
        toast({
            variant: "success",
            title: t('common.toastSuccessTitle'),
            description: t('common.toastSuccessDesc'),
        });
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        setShowMissingIngredientsDialog(false);
        setRecipesForDialog(null);
      }
    }
  }, [state, toast, user, t]);
  
  const handleFormSubmit = (formData: FormData) => {
    formData.set("idToken", idToken ?? "");
    formData.set("language", language);
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
      <Card className="max-w-4xl mx-auto shadow-lg bg-card/90 backdrop-blur-sm">
        <form ref={formRef} action={handleFormSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {t('generator.cardTitle')}
            </CardTitle>
            <CardDescription>
              {t('generator.cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="ingredients">{t('generator.ingredientsLabel')}</Label>
              <Textarea
                id="ingredients"
                name="ingredients"
                placeholder={t('generator.ingredientsPlaceholder')}
                required
                rows={4}
                disabled={isPending}
              />
              {state?.message && state.error && !state.validationError && (
                <p className="text-sm font-medium text-destructive">
                  {state.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="dietaryRestrictions">{t('generator.dietaryNeedsLabel')}</Label>
                <Select name="dietaryRestrictions" defaultValue="none" disabled={isPending}>
                  <SelectTrigger id="dietaryRestrictions">
                    <SelectValue placeholder={t('generator.dietaryNeeds.none')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('generator.dietaryNeeds.none')}</SelectItem>
                    <SelectItem value="vegan">{t('generator.dietaryNeeds.vegan')}</SelectItem>
                    <SelectItem value="vegetarian">{t('generator.dietaryNeeds.vegetarian')}</SelectItem>
                    <SelectItem value="gluten-free">{t('generator.dietaryNeeds.glutenFree')}</SelectItem>
                    <SelectItem value="halal">{t('generator.dietaryNeeds.halal')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cookingTime">{t('generator.cookingTimeLabel')}</Label>
                <Select name="cookingTime" defaultValue="any" disabled={isPending}>
                  <SelectTrigger id="cookingTime">
                    <SelectValue placeholder={t('generator.cookingTime.any')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('generator.cookingTime.any')}</SelectItem>
                    <SelectItem value="quick">{t('generator.cookingTime.quick')}</SelectItem>
                    <SelectItem value="medium">{t('generator.cookingTime.medium')}</SelectItem>
                    <SelectItem value="long">{t('generator.cookingTime.long')}</SelectItem>
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
                    {t('generator.guest.noAttempts')}{" "}
                    <Link href="/signup" className="underline text-primary">
                      {t('generator.guest.signUp')}
                    </Link>{" "}
                    {t('generator.guest.forUnlimited')}
                  </p>
                ) : (
                  <p>
                    {t('generator.guest.youHave')}{" "}
                    <span className="font-bold text-foreground">
                      {guestAttempts}
                    </span>{" "}
                    {t('generator.guest.generationsLeft', { count: guestAttempts })}
                  </p>
                )}
              </div>
            )}
            <Button
                type="submit"
                disabled={isPending || noMoreAttempts}
                className="w-full sm:w-auto"
                size="lg"
            >
                {isPending ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('generator.button.generating')}
                    </>
                ) : (
                    <>
                    <ChefHat className="mr-2 h-4 w-4" />
                    {t('generator.button.generate')}
                    </>
                )}
            </Button>
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
      
      <div ref={resultsRef}>
        {state.recipes && !isPending && !showMissingIngredientsDialog && (
            <RecipeDisplay recipes={state.recipes} />
        )}
      </div>
    </div>
  );
}
