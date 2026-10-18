import { test } from "node:test";
import assert from "node:assert/strict";
import { signUpSchema } from "../src/features/auth/schemas.ts";
import { signUpErrorMessage } from "../src/features/auth/errors.ts";

const base = {
  fullName: "Test User",
  email: "Test@Example.com",
  password: "abcd1234",
  confirmPassword: "abcd1234",
};

test("signup accepts an 8-character password and normalises email", () => {
  const parsed = signUpSchema.parse(base);
  assert.equal(parsed.email, "test@example.com");
  assert.equal(parsed.marketingOptIn, false);
});

test("signup rejects short or mismatched passwords", () => {
  const short = signUpSchema.safeParse({
    ...base,
    password: "abc1234",
    confirmPassword: "abc1234",
  });
  assert.equal(short.success, false);
  const mismatch = signUpSchema.safeParse({
    ...base,
    confirmPassword: "abcd12345",
  });
  assert.equal(mismatch.success, false);
  assert.equal(mismatch.error?.issues[0]?.message, "Passwords do not match.");
});

test("signup errors tell the customer what went wrong", () => {
  assert.match(
    signUpErrorMessage({
      status: 500,
      code: "unexpected_failure",
      message: "Error sending confirmation email",
    }),
    /couldn't send the verification email/,
  );
  assert.match(
    signUpErrorMessage({
      code: "user_already_exists",
      message: "User already registered",
    }),
    /already exists/,
  );
  assert.match(
    signUpErrorMessage({ status: 429, code: "over_email_send_rate_limit" }),
    /Too many attempts/,
  );
  assert.match(
    signUpErrorMessage({
      code: "weak_password",
      message: "Password should be at least 8",
    }),
    /stronger password/,
  );
  assert.match(
    signUpErrorMessage({ message: "something odd" }),
    /Unable to create/,
  );
});
