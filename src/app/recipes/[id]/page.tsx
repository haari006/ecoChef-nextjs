import { getRecipe, getFeedbackForRecipe } from '@/app/actions';
import { notFound } from 'next/navigation';
import { Clock, Salad, UtensilsCrossed, ChefHat, Tags, Star, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { FeedbackForm } from '@/components/feedback-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function RecipePage({ params }: { params: { id: string } }) {
  const recipe = await getRecipe(params.id);
  const feedbackList = await getFeedbackForRecipe(params.id);

  if (!recipe) {
    notFound();
  }

  const averageRating = feedbackList.length > 0 
    ? feedbackList.reduce((acc: number, f: any) => acc + f.rating, 0) / feedbackList.length
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <article className="max-w-4xl mx-auto">
        <div className="aspect-video relative w-full overflow-hidden rounded-lg mb-8 shadow-lg">
            <Image 
              src={`https://placehold.co/1200x600.png`} 
              alt={recipe.recipeName}
              data-ai-hint="recipe food"
              fill
              className="object-cover"
            />
        </div>
        
        <header className="mb-8">
          <h1 className="font-headline text-4xl md:text-5xl font-bold mb-4">{recipe.recipeName}</h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground">
            {recipe.cookingTime && (
                <div className="flex items-center gap-1.5">
                    <Clock className="w-5 h-5" />
                    <span>{recipe.cookingTime}</span>
                </div>
            )}
            {recipe.dietaryInformation && (
                 <div className="flex items-center gap-1.5">
                    <Salad className="w-5 h-5" />
                    <span>{recipe.dietaryInformation}</span>
                </div>
            )}
            {recipe.tags && recipe.tags.length > 0 && (
                 <div className="flex items-center gap-1.5">
                    <Tags className="w-5 h-5" />
                    <span>{recipe.tags.join(', ')}</span>
                </div>
            )}
            {averageRating > 0 && (
                <div className="flex items-center gap-1.5">
                    <Star className="w-5 h-5 text-accent" />
                    <span>{averageRating.toFixed(1)} ({feedbackList.length} reviews)</span>
                </div>
            )}
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
            <aside className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-headline"><UtensilsCrossed className="w-5 h-5 text-primary"/> Ingredients</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 list-disc list-inside text-foreground/80">
                            {recipe.ingredients.map((item, index) => (
                            <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </aside>
            <main className="md:col-span-2">
                <h2 className="font-bold font-headline text-2xl mb-4 flex items-center gap-2"><ChefHat className="w-6 h-6 text-primary"/> Instructions</h2>
                <ol className="space-y-6 list-decimal list-inside prose prose-stone max-w-none">
                    {recipe.instructions.map((step, index) => (
                    <li key={index} className="pl-2">{step}</li>
                    ))}
                </ol>
            </main>
        </div>
        
        <Separator className="my-12" />

        <section className="space-y-8">
            <div>
                <h2 className="font-bold font-headline text-2xl mb-4 text-center">Share Your Thoughts</h2>
                <FeedbackForm recipeId={recipe._id} />
            </div>

            {feedbackList.length > 0 && (
                 <div>
                    <h2 className="font-bold font-headline text-2xl mb-4 text-center">Community Feedback</h2>
                    <div className="space-y-6">
                        {feedbackList.map((feedback: any) => (
                            <Card key={feedback._id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar>
                                            <AvatarFallback>{feedback.userName?.[0] ?? 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <p className="font-semibold">{feedback.userName ?? 'Anonymous'}</p>
                                                <div className="flex items-center gap-1 text-sm text-amber-500">
                                                    {feedback.rating} <Star className="w-4 h-4 fill-current" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                                            <p className="text-foreground/90">{feedback.comment}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </section>

      </article>
    </div>
  );
}
