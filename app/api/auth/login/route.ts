import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { buildAuthCookie, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || !email.trim()) {
    return Response.json({ error: "Email is required.", field: "email" }, { status: 400 });
  }
  if (typeof password !== "string" || !password) {
    return Response.json(
      { error: "Password is required.", field: "password" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const token = await signToken({ userId: user.id, email: user.email, name: user.name });
  const { name: cookieName, value, options } = buildAuthCookie(token);
  (await cookies()).set(cookieName, value, options);

  return Response.json({
    user: { id: user.id, name: user.name, email: user.email },
  });
}
