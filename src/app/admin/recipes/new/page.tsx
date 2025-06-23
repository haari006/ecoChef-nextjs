import { RecipeForm } from "@/components/admin/recipe-form";

export default function NewRecipePage() {
    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-2xl mx-auto">
                <RecipeForm />
            </div>
        </div>
    );
}
