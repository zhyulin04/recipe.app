import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import DeleteRecipeButton from "./DeleteRecipeButton";

export const dynamic = "force-dynamic";

export default async function RecipeDetailPage(
  props: PageProps<"/recipes/[id]">,
) {
  const { id } = await props.params;
  const [recipe, session] = await Promise.all([
    prisma.recipe.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true } } },
    }),
    getSession(),
  ]);

  if (!recipe) notFound();

  const isOwner = session?.userId === recipe.author.id;
  const ingredients = recipe.ingredients
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/recipes" className="text-sm text-accent hover:underline">
        ← Back to Recipes
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <p className="mt-1 text-sm text-foreground/70">
            by {recipe.author.name}
          </p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Link
              href={`/recipes/${recipe.id}/edit`}
              className="rounded-md border border-accent px-3 py-1.5 text-sm text-accent hover:bg-muted"
            >
              Edit
            </Link>
            <DeleteRecipeButton id={recipe.id} />
          </div>
        )}
      </header>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <Pill>{recipe.cuisineType}</Pill>
        <Pill>{recipe.difficulty}</Pill>
        <Pill>{recipe.cookingTime} min</Pill>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Description</h2>
        <p className="whitespace-pre-line text-foreground/85">
          {recipe.description}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5">
          {ingredients.map((ing, i) => (
            <li key={i}>{ing}</li>
          ))}
        </ul>
      </section>
    </article>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2.5 py-1 text-foreground/80">
      {children}
    </span>
  );
}
