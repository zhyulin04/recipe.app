"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type RecipeFormValues = {
  title: string;
  description: string;
  cookingTime: string;
  cuisineType: string;
  difficulty: "Easy" | "Medium" | "Hard" | "";
  ingredients: string;
};

const EMPTY: RecipeFormValues = {
  title: "",
  description: "",
  cookingTime: "",
  cuisineType: "",
  difficulty: "",
  ingredients: "",
};

type FieldErrors = Partial<Record<keyof RecipeFormValues | "form", string>>;

export default function RecipeForm({
  initial,
  mode,
  recipeId,
}: {
  initial?: Partial<RecipeFormValues>;
  mode: "create" | "edit";
  recipeId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<RecipeFormValues>({
    ...EMPTY,
    ...initial,
  });
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function update<K extends keyof RecipeFormValues>(
    key: K,
    value: RecipeFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    if (!values.title.trim()) next.title = "Title is required.";
    if (!values.description.trim()) next.description = "Description is required.";
    const ct = Number(values.cookingTime);
    if (
      !values.cookingTime ||
      !Number.isFinite(ct) ||
      ct <= 0 ||
      !Number.isInteger(ct)
    ) {
      next.cookingTime = "Cooking time must be a positive whole number.";
    }
    if (!values.cuisineType.trim()) next.cuisineType = "Cuisine is required.";
    if (!values.difficulty) next.difficulty = "Pick a difficulty.";
    if (!values.ingredients.trim()) next.ingredients = "Ingredients are required.";
    return next;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }
    setErrors({});
    setPending(true);

    const url =
      mode === "create" ? "/api/recipes" : `/api/recipes/${recipeId}`;
    const method = mode === "create" ? "POST" : "PUT";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          cookingTime: Number(values.cookingTime),
          cuisineType: values.cuisineType,
          difficulty: values.difficulty,
          ingredients: values.ingredients,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data?.field) {
          setErrors({ [data.field]: data.error });
        } else {
          setErrors({ form: data?.error ?? "Something went wrong." });
        }
        return;
      }
      const newId = data?.recipe?.id ?? recipeId;
      router.replace(`/recipes/${newId}`);
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

      <Field label="Title" error={errors.title}>
        <input
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Cooking time (min)" error={errors.cookingTime}>
          <input
            type="number"
            min={1}
            value={values.cookingTime}
            onChange={(e) => update("cookingTime", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Cuisine" error={errors.cuisineType}>
          <input
            type="text"
            value={values.cuisineType}
            onChange={(e) => update("cuisineType", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Difficulty" error={errors.difficulty}>
          <select
            value={values.difficulty}
            onChange={(e) =>
              update("difficulty", e.target.value as RecipeFormValues["difficulty"])
            }
            className={inputCls}
          >
            <option value="">Choose…</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </Field>
      </div>

      <Field
        label="Ingredients"
        error={errors.ingredients}
        hint="Separate with commas or new lines."
      >
        <textarea
          rows={5}
          value={values.ingredients}
          onChange={(e) => update("ingredients", e.target.value)}
          className={inputCls}
        />
      </Field>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-5 py-2 text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {pending
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create recipe"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border border-border px-5 py-2 hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-white px-3 py-2 outline-none focus:border-accent";

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
      {hint && !error && (
        <span className="text-xs text-foreground/60">{hint}</span>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}
