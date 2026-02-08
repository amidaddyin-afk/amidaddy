"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="font-display text-2xl">Create account</h1>
        <p className="text-sm text-black/50">Start your scent journey today.</p>
        <form className="mt-6 space-y-4">
          <input className="w-full rounded-xl border border-black/10 px-4 py-3" placeholder="Name" />
          <input className="w-full rounded-xl border border-black/10 px-4 py-3" placeholder="Email" />
          <input
            className="w-full rounded-xl border border-black/10 px-4 py-3"
            placeholder="Password"
            type="password"
          />
          <button className="w-full rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white">
            Create account
          </button>
        </form>
        <p className="mt-4 text-sm text-black/50">
          Already have an account? <Link className="text-clay" href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
