'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/app/(auth)/actions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const initialState = {
    message: '',
    errors: {},
};

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : 'Login'}
      </Button>
    );
}

export default function LoginPage() {
    const [state, formAction] = useFormState(login, initialState);
    const { toast } = useToast();

    useEffect(() => {
        if (state?.errors?._form) {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: state.errors._form.join(', '),
          });
        }
      }, [state, toast]);

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
                 {state?.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
                {state?.errors?.password && <p className="text-sm font-medium text-destructive">{state.errors.password[0]}</p>}
              </div>
              <SubmitButton />
              {state?.errors?._form && <p className="mt-2 text-sm font-medium text-destructive text-center">{state.errors._form.join(', ')}</p>}
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline hover:text-primary">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
