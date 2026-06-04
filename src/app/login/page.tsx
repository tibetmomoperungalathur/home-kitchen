import LoginForm
from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center">

      <div className="w-full max-w-sm">

        <h1 className="mb-6 text-3xl font-bold">
          Kitchen Login
        </h1>

        <LoginForm />

      </div>

    </main>
  );
}