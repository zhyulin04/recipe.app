import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Cook, share, and save your favorite recipes
      </h1>
      <p className="max-w-2xl text-lg text-foreground/75">
        Browse recipes from the community or create your own. Manage your
        ingredients, cooking times, and difficulty in one place.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/recipes"
          className="rounded-md bg-accent px-5 py-2.5 text-white hover:bg-accent-hover"
        >
          Browse Recipes
        </Link>
        {session ? (
          <Link
            href="/recipes/create"
            className="rounded-md border border-accent px-5 py-2.5 text-accent hover:bg-muted"
          >
            Add a Recipe
          </Link>
        ) : (
          <Link
            href="/register"
            className="rounded-md border border-accent px-5 py-2.5 text-accent hover:bg-muted"
          >
            Create an Account
          </Link>
        )}
      </div>
    </section>
  );
}
