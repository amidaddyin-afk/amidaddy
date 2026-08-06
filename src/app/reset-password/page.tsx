import { AuthForm } from "@/features/auth/auth-form";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return <Suspense><AuthForm mode="reset-password" /></Suspense>;
}
