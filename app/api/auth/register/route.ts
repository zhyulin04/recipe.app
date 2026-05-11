import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { buildAuthCookie, signToken } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, email, password } = (body ?? {}) as {
    name?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "Name is required.", field: "name" }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return Response.json({ error: "A valid email is required.", field: "email" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters.", field: "password" },
      { status: 400 },
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return Response.json(
      { error: "An account with that email already exists.", field: "email" },
      { status: 400 },
    );
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      password: hash,
    },
    select: { id: true, name: true, email: true },
  });

  const token = await signToken({ userId: user.id, email: user.email, name: user.name });
  const { name: cookieName, value, options } = buildAuthCookie(token);
  (await cookies()).set(cookieName, value, options);

  return Response.json({ user }, { status: 201 });
}
