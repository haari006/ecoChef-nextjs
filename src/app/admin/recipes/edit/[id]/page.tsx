import { getRecipe } from "@/app/actions";
import { RecipeForm } from "@/components/admin/recipe-form";
import { notFound } from "next/navigation";

export default async function EditRecipePage({ params }: { params: { id: string } }) {
    const recipe = await getRecipe(params.id);

    if (!recipe) {
        return notFound();
    }
    
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto">
                <RecipeForm recipe={recipe} />
            </div>
        </div>
    );
}
