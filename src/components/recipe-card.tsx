import Link from 'next/link';
import type { GenerateRecipeFromIngredientsOutput } from '@/ai/flows/generate-recipe-from-ingredients';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Salad } from 'lucide-react';
import Image from 'next/image';

type RecipeCardProps = {
  recipe: GenerateRecipeFromIngredientsOutput & { _id: string };
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link href={`/recipes/${recipe._id}`} className="group block">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader>
          <div className="aspect-video relative w-full overflow-hidden rounded-t-lg mb-4">
              <Image 
                src={`https://placehold.co/600x400.png`}
                alt={recipe.recipeName} 
                data-ai-hint="recipe food"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
          </div>
          <CardTitle className="font-headline text-xl leading-tight group-hover:text-primary">{recipe.recipeName}</CardTitle>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground text-sm pt-1">
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
        </div>
        </CardHeader>
        <CardContent className="flex-grow">
        </CardContent>
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {recipe.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="capitalize">{tag}</Badge>
            ))}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
