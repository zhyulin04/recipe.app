import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import RecipeForm from "../../RecipeForm";

export const dynamic = "force-dynamic";

export default async function EditRecipePage(
  props: PageProps<"/recipes/[id]/edit">,
) {
  const { id } = await props.params;
  const session = await getSession();
  if (!session) redirect(`/login?from=/recipes/${id}/edit`);

  const recipe = await prisma.recipe.findUnique({ where: { id } });
  if (!recipe) notFound();

  if (recipe.authorId !== session.userId) {
    redirect(`/recipes/${id}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Edit recipe</h1>
      <RecipeForm
        mode="edit"
        recipeId={recipe.id}
        initial={{
          title: recipe.title,
          description: recipe.description,
          cookingTime: String(recipe.cookingTime),
          cuisineType: recipe.cuisineType,
          difficulty: recipe.difficulty as "Easy" | "Medium" | "Hard",
          ingredients: recipe.ingredients,
        }}
      />
    </div>
  );
}
