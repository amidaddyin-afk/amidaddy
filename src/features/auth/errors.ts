/** Turn a Supabase signUp/resend error into something a customer can act on.
 * The raw message is logged server-side; this is what the form shows. */
export function signUpErrorMessage(error: {
  code?: string;
  status?: number;
  message?: string;
}) {
  const message = error.message?.toLowerCase() ?? "";
  if (error.code === "user_already_exists" || message.includes("already"))
    return "An account with this email already exists. Sign in instead.";
  if (error.code === "weak_password" || message.includes("password"))
    return "Choose a stronger password (at least 8 characters).";
  if (
    error.status === 429 ||
    error.code === "over_email_send_rate_limit" ||
    message.includes("rate limit")
  )
    return "Too many attempts. Wait a minute and try again.";
  if (message.includes("sending") && message.includes("email"))
    return "We couldn't send the verification email. Please try again shortly or write to support@amidaddy.in.";
  return "Unable to create the account. Please try again.";
}
