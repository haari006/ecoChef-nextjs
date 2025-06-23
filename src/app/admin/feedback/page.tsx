'use client';

import { getAllFeedback } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

type Feedback = {
    _id: string;
    userName?: string;
    recipeId: string;
    rating: number;
    comment?: string;
    createdAt: string;
}

export default function AdminFeedbackPage() {
  const { user } = useAuth();
  const [idToken, setIdToken] = useState<string | null>(null);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    if (user) {
      user.getIdToken().then(token => {
        setIdToken(token);
        getAllFeedback(token).then(feedback => setAllFeedback(feedback as Feedback[]));
      });
    } else {
      setIdToken(null);
      setAllFeedback([]);
    }
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle>User Feedback</CardTitle>
          <CardDescription>All user-submitted feedback for all recipes.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Recipe ID</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {allFeedback.length > 0 ? allFeedback.map((feedback: any) => (
                        <TableRow key={feedback._id}>
                            <TableCell className="font-medium">{feedback.userName ?? 'Anonymous'}</TableCell>
                            <TableCell>
                                <Link href={`/recipes/${feedback.recipeId}`} className="underline hover:text-primary text-xs font-mono">
                                    {feedback.recipeId}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className="flex gap-1 items-center w-fit">
                                    {feedback.rating} <Star className="h-3 w-3 text-accent fill-accent" />
                                </Badge>
                            </TableCell>
                            <TableCell>{feedback.comment}</TableCell>
                            <TableCell>{new Date(feedback.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No feedback has been submitted yet.</TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
