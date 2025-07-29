
'use client';

import { useState, useEffect, useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Star, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { submitFeedbackAction, type FeedbackState } from '@/app/actions';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useAuth } from '@/hooks/use-auth';

const initialState: FeedbackState = {};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Feedback
      </Button>
    );
  }

export function FeedbackForm({ recipeId }: { recipeId: string }) {
  const [rating, setRating] = useState(0);
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

  const [state, formAction] = useActionState(submitFeedbackAction, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        title: state.error ? 'Error' : 'Success',
        description: state.message,
        variant: state.error ? 'destructive' : 'default',
      });
      if(state.success) {
        formRef.current?.reset();
        setRating(0);
      }
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <input type="hidden" name="idToken" value={idToken ?? ''} />
      <input type="hidden" name="recipeId" value={recipeId} />
      <input type="hidden" name="rating" value={rating} />
      
      <div className="flex flex-col gap-2 items-center">
        <h4 className="font-semibold">Rate this recipe</h4>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => setRating(star)} aria-label={`Rate ${star} star`}>
              <Star
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  rating >= star ? 'text-accent fill-accent' : 'text-muted-foreground/50 hover:text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid w-full gap-1.5">
        <Label htmlFor="comment">Leave a comment</Label>
        <Textarea placeholder="Tell us what you think..." id="comment" name="comment" />
      </div>

      <div className="flex justify-center">
        <SubmitButton />
      </div>
    </form>
  );
}
