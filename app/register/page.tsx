import RegisterForm from "./RegisterForm";

export const metadata = { title: "Register · Recipe Box" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <RegisterForm />
    </div>
  );
}
