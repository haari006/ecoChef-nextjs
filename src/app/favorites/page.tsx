
'use client';

import { useEffect, useState } from 'react';
import { getFavoriteRecipes } from '@/app/actions';
import type { Recipe } from '@/app/actions';
import { RecipeCard } from '@/components/recipe-card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, HeartCrack } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
    const { user, loading: authLoading } = useAuth();
    const [recipes, setRecipes] = useState<(Recipe & { _id: string })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            user.getIdToken().then(token => {
                getFavoriteRecipes(token).then(data => {
                    setRecipes(data);
                    setLoading(false);
                });
            });
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    if (loading || authLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading your favorite recipes...</p>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <HeartCrack className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
                <p className="text-muted-foreground">You need to be logged in to see your favorite recipes.</p>
                <Link href="/login" className="mt-4 text-primary underline">
                    Go to Login
                </Link>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <section className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight">
                My Favorite Recipes
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Here are all the delicious recipes you've saved for later.
                </p>
            </section>

            {recipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipes.map((recipe) => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <HeartCrack className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Favorites Yet</h2>
                    <p className="text-muted-foreground">You haven't saved any recipes yet. <Link href="/recipes" className="text-primary underline">Browse some recipes</Link> to find your next favorite!</p>
                </div>
            )}
        </div>
    );
}
