import assert from "node:assert/strict";
import test from "node:test";
import { databaseSslConfig } from "../src/lib/database-ssl.ts";

test("database TLS is left to local PostgreSQL outside production", () => {
  assert.equal(databaseSslConfig("development", undefined), undefined);
});

test("production pooler connections remain encrypted without a custom CA", () => {
  assert.deepEqual(databaseSslConfig("production", undefined), {
    rejectUnauthorized: false,
  });
});

test("production verifies certificates when a Supabase CA is configured", () => {
  assert.deepEqual(
    databaseSslConfig(
      "production",
      "-----BEGIN CERTIFICATE-----\\ncertificate\\n-----END CERTIFICATE-----",
    ),
    {
      ca: "-----BEGIN CERTIFICATE-----\ncertificate\n-----END CERTIFICATE-----",
      rejectUnauthorized: true,
    },
  );
});
