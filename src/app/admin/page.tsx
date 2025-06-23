import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, MessageSquareQuote } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your EcoChef application.</p>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Utensils /> Manage Recipes</CardTitle>
                        <CardDescription>View, create, update, or delete recipes in the database.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/recipes">Go to Recipes</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquareQuote /> View Feedback</CardTitle>
                        <CardDescription>See what users are saying about the recipes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/admin/feedback">Go to Feedback</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
