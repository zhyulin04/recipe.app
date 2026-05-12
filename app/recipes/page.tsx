import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const metadata = { title: "Recipes · Recipe Box" };
export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const [recipes, session] = await Promise.all([
    prisma.recipe.findMany({
      orderBy: { createdAt: "desc" },
      include: { author: { select: { id: true, name: true } } },
    }),
    getSession(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">All recipes</h1>
        {session && (
          <Link
            href="/recipes/create"
            className="rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover"
          >
            + New recipe
          </Link>
        )}
      </div>

      {recipes.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-white p-8 text-center text-foreground/70">
          No recipes yet.{" "}
          {session ? (
            <Link href="/recipes/create" className="text-accent underline">
              Create the first one
            </Link>
          ) : (
            <Link href="/register" className="text-accent underline">
              Sign up to add one
            </Link>
          )}
          .
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => (
            <li
              key={r.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <Link href={`/recipes/${r.id}`} className="text-lg font-semibold hover:text-accent">
                {r.title}
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Pill>{r.cuisineType}</Pill>
                <Pill>{r.difficulty}</Pill>
                <Pill>{r.cookingTime} min</Pill>
              </div>
              <p className="line-clamp-3 text-sm text-foreground/75">
                {r.description}
              </p>
              <p className="mt-auto text-xs text-foreground/60">
                by {r.author.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-muted px-2 py-0.5 text-foreground/80">
      {children}
    </span>
  );
}
