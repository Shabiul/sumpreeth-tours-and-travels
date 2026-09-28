"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import PasswordInput from "@/components/admin/PasswordInput";
import { loginAction, type LoginState } from "./actions";

export default function LoginForm() {
  const from = useSearchParams().get("from") ?? "/admin";

  const [loginState, loginSubmit, loginPending] = useActionState<
    LoginState,
    FormData
  >(loginAction, {});

  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="inline-flex rounded-xl bg-white p-2 shadow-sm ring-1 ring-black/5">
          <Image
            src="/logo.png"
            alt=""
            width={512}
            height={512}
            priority
            className="h-12 w-auto"
          />
        </span>
        <h1 className="mt-4 text-h3 font-bold text-ink">Admin portal</h1>
        <p className="mt-1 text-sm text-muted">Sumpreeth Tours and Travels</p>
      </div>

      <div className="card p-6 sm:p-8">
        <form action={loginSubmit} className="space-y-4">
          <input type="hidden" name="from" value={from} />
          <div>
            <label htmlFor="id" className="field-label">
              ID
            </label>
            <input
              id="id"
              name="id"
              autoComplete="username"
              autoFocus
              required
              className="field-input"
            />
          </div>
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            autoComplete="current-password"
            required
          />
          <label className="flex items-center gap-2 text-sm text-bodytext">
            <input
              type="checkbox"
              name="remember"
              value="1"
              className="h-4 w-4 accent-forest-600"
            />
            Remember me on this device
          </label>

          {loginState.error && (
            <p className="field-error" role="alert">
              {loginState.error}
            </p>
          )}

          <button
            type="submit"
            disabled={loginPending}
            className="btn-primary w-full"
          >
            {loginPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {loginPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
