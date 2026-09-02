import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/features/auth/verify-email-form";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/signup");
  return <VerifyEmailForm email={email} />;
}
