import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in · Recipe Box" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <Suspense fallback={<p className="text-sm text-foreground/70">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
