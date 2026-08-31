import { AuthForm } from "@/features/auth/auth-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm
        mode="login"
        turnstileSiteKey={process.env.NEXT_TURNSTILE_SITE_KEY}
      />
    </Suspense>
  );
}
