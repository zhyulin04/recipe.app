import RecipeForm from "../RecipeForm";

export const metadata = { title: "New recipe · Recipe Box" };

export default function CreateRecipePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Create a new recipe</h1>
      <RecipeForm mode="create" />
    </div>
  );
}
