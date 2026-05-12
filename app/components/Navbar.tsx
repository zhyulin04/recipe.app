import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const session = await getSession();

  return (
    <header className="border-b border-border bg-muted/40 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-accent">
          Recipe Box
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <Link href="/recipes" className="hover:text-accent">
            Recipes
          </Link>

          {session ? (
            <div className="flex flex-wrap items-center gap-3 border-l border-border pl-4">
              <span className="text-sm text-foreground/80">
                Hi, <strong>{session.name}</strong>
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <Link href="/login" className="hover:text-accent">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent-hover"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
