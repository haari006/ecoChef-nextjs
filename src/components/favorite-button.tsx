
'use client';

import { useState, useTransition, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { toggleFavoriteAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export function FavoriteButton({ recipeId, isFavorited }: { recipeId: string; isFavorited: boolean }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [optimisticFavorited, setOptimisticFavorited] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOptimisticFavorited(isFavorited);
  }, [isFavorited]);

  const handleClick = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'You need to be logged in to favorite a recipe.',
        variant: 'destructive',
      });
      return;
    }

    const idToken = await user.getIdToken();
    
    startTransition(() => {
      setOptimisticFavorited(prev => !prev);
      toggleFavoriteAction(idToken, recipeId).then(result => {
        if (!result.success) {
          // Revert optimistic update on failure
          setOptimisticFavorited(isFavorited);
          toast({
            title: 'Error',
            description: result.message,
            variant: 'destructive',
          });
        }
      });
    });
  };

  if (isPending) {
    return (
        <Button variant="ghost" size="icon" className="rounded-full" disabled>
            <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
    )
  }

  if (!user) {
    return (
        <Button variant="ghost" size="icon" className="rounded-full" onClick={handleClick}>
            <Heart className="h-5 w-5 text-muted-foreground/50" />
            <span className="sr-only">Login to favorite</span>
        </Button>
    )
  }

  return (
    <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full group"
        onClick={handleClick}
        disabled={isPending}
    >
      <Heart
        className={`h-5 w-5 transition-all duration-200 group-hover:scale-110 ${
            optimisticFavorited ? 'text-red-500 fill-red-500' : 'text-muted-foreground/80'
        }`}
      />
      <span className="sr-only">{optimisticFavorited ? 'Remove from favorites' : 'Add to favorites'}</span>
    </Button>
  );
}
