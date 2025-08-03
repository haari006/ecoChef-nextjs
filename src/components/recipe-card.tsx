
import Link from 'next/link';
import type { Recipe } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Salad } from 'lucide-react';
import Image from 'next/image';
import { FavoriteButton } from './favorite-button';

type RecipeCardProps = {
  recipe: Recipe & { _id: string };
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      <CardHeader>
        <div className="aspect-video relative w-full overflow-hidden rounded-t-lg mb-4">
            <Link href={`/recipes/${recipe._id}`} className="block h-full w-full">
                <Image 
                    src="https://storage.googleapis.com/aai-web-samples/ecochef/recipe_placeholder.jpg"
                    alt={recipe.recipeName} 
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </Link>
            <div className="absolute top-2 right-2 z-10">
                <FavoriteButton recipeId={recipe._id} isFavorited={!!recipe.isFavorited} />
            </div>
        </div>
        <Link href={`/recipes/${recipe._id}`}>
            <CardTitle className="font-headline text-xl leading-tight group-hover:text-primary">{recipe.recipeName}</CardTitle>
        </Link>
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
  );
}
