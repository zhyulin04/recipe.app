"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!EMAIL_RE.test(email)) next.email = "Enter a valid email.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.field) {
          setErrors({ [data.field]: data.error });
        } else {
          setErrors({ form: data?.error ?? "Registration failed." });
        }
        return;
      }
      router.replace("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {errors.form && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errors.form}
        </p>
      )}

      <Field
        label="Name"
        name="name"
        type="text"
        value={name}
        onChange={setName}
        error={errors.name}
        autoComplete="name"
      />
      <Field
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={setEmail}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={setPassword}
        error={errors.password}
        autoComplete="new-password"
      />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <p className="text-sm text-foreground/70">
        Already have an account?{" "}
        <a href="/login" className="text-accent underline">
          Log in
        </a>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="rounded-md border border-border bg-white px-3 py-2 outline-none focus:border-accent"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
