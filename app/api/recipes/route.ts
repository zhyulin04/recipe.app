import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });
  return Response.json({ recipes });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = validateRecipeInput(body);
  if ("error" in validation) {
    return Response.json(
      { error: validation.error, field: validation.field },
      { status: 400 },
    );
  }

  const recipe = await prisma.recipe.create({
    data: { ...validation.data, authorId: session.userId },
    include: { author: { select: { id: true, name: true } } },
  });

  return Response.json({ recipe }, { status: 201 });
}

type RecipeInput = {
  title: string;
  description: string;
  cookingTime: number;
  cuisineType: string;
  difficulty: string;
  ingredients: string;
};

export function validateRecipeInput(
  body: unknown,
): { data: RecipeInput } | { error: string; field: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  if (typeof b.title !== "string" || !b.title.trim()) {
    return { error: "Title is required.", field: "title" };
  }
  if (typeof b.description !== "string" || !b.description.trim()) {
    return { error: "Description is required.", field: "description" };
  }
  const cookingTimeRaw = b.cookingTime;
  const cookingTime =
    typeof cookingTimeRaw === "number"
      ? cookingTimeRaw
      : typeof cookingTimeRaw === "string"
        ? Number(cookingTimeRaw)
        : NaN;
  if (!Number.isFinite(cookingTime) || cookingTime <= 0 || !Number.isInteger(cookingTime)) {
    return { error: "Cooking time must be a positive integer.", field: "cookingTime" };
  }
  if (typeof b.cuisineType !== "string" || !b.cuisineType.trim()) {
    return { error: "Cuisine type is required.", field: "cuisineType" };
  }
  if (typeof b.difficulty !== "string" || !DIFFICULTIES.has(b.difficulty)) {
    return { error: "Difficulty must be Easy, Medium, or Hard.", field: "difficulty" };
  }
  if (typeof b.ingredients !== "string" || !b.ingredients.trim()) {
    return { error: "Ingredients are required.", field: "ingredients" };
  }

  return {
    data: {
      title: b.title.trim(),
      description: b.description.trim(),
      cookingTime,
      cuisineType: b.cuisineType.trim(),
      difficulty: b.difficulty,
      ingredients: b.ingredients.trim(),
    },
  };
}
