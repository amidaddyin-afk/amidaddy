import { AuthForm } from "@/features/auth/auth-form";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
