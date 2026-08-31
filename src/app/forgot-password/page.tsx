import { AuthForm } from "@/features/auth/auth-form";
import { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <AuthForm
        mode="forgot-password"
        turnstileSiteKey={process.env.NEXT_TURNSTILE_SITE_KEY}
      />
    </Suspense>
  );
}
