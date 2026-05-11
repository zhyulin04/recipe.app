import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { validateRecipeInput } from "../route";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/recipes/[id]">,
) {
  const { id } = await ctx.params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });
  if (!recipe) {
    return Response.json({ error: "Recipe not found." }, { status: 404 });
  }
  return Response.json({ recipe });
}

export async function PUT(
  request: Request,
  ctx: RouteContext<"/api/recipes/[id]">,
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Recipe not found." }, { status: 404 });
  }
  if (existing.authorId !== session.userId) {
    return Response.json({ error: "You do not own this recipe." }, { status: 403 });
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

  const recipe = await prisma.recipe.update({
    where: { id },
    data: validation.data,
    include: { author: { select: { id: true, name: true } } },
  });

  return Response.json({ recipe });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/recipes/[id]">,
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    return Response.json({ error: "Recipe not found." }, { status: 404 });
  }
  if (existing.authorId !== session.userId) {
    return Response.json({ error: "You do not own this recipe." }, { status: 403 });
  }

  await prisma.recipe.delete({ where: { id } });
  return Response.json({ ok: true });
}
