import { getRecipes } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { deleteRecipe } from '../actions';
import { Badge } from '@/components/ui/badge';

function DeleteButton({ id }: { id: string }) {
    const deleteAction = deleteRecipe.bind(null, id);
    return (
        <form action={deleteAction}>
            <Button variant="ghost" size="icon" type="submit">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
            </Button>
        </form>
    );
}

export default async function AdminRecipesPage() {
  const recipes = await getRecipes();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Manage Recipes</CardTitle>
              <CardDescription>Here you can add, edit, and delete recipes.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/recipes/new">
                <PlusCircle className="mr-2" />
                Add Recipe
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Cooking Time</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {recipes.length > 0 ? recipes.map(recipe => (
                        <TableRow key={recipe._id}>
                            <TableCell className="font-medium">{recipe.recipeName}</TableCell>
                            <TableCell>{recipe.cookingTime}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {recipe.tags?.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end items-center">
                                    <Button asChild variant="ghost" size="icon">
                                        <Link href={`/admin/recipes/edit/${recipe._id}`}>
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Link>
                                    </Button>
                                    <DeleteButton id={recipe._id} />
                                </div>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No recipes found.</TableCell>
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
