"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthConetxt } from "./AuthProvider";

type Props = {
  onClose: () => void;
};

export const AuthModal = ({ onClose }: Props) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuthConetxt();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const username = formData.get("username");
    const confirmPassword = formData.get("confirmPassword");

    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login" ? { email, password } : { email, username, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || `${mode === "login" ? "Login" : "Registration"} failed`,
        );
        return;
      }

      if (mode === "login" && data.requiresTwoFactor) {
        setError("2FA not yet implemented");
        return;
      }

      onClose();
      refreshUser();
      router.refresh();
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-background-secondary rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className=" mb-8 text-3xl">
          {mode === "login" ? "Login" : "Register"}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          {error && (
            <div className="mb-4 p-2 bg-red-500/20 text-red-500 rounded">
              {error}
            </div>
          )}
          <label htmlFor="email" className=" font-bold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="px-2 py-1 border-2 rounded-sm border-gray-500"
            required
            disabled={loading}
          />
          {mode === "register" && (
            <>
              <label htmlFor="username" className=" mt-4 font-bold">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                className="px-2 py-1 border-2 rounded-sm border-gray-500"
                required
                disabled={loading}
              />
            </>
          )}
          <label htmlFor="password" className=" mt-4 font-bold">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="px-2 py-1 border border-gray-500 rounded-sm"
            required
            disabled={loading}
          />
          {mode === "register" && (
            <>
              <label htmlFor="confirmPassword" className=" mt-4 font-bold">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="px-2 py-1 border border-gray-500 rounded-sm"
                required
                disabled={loading}
              />
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 p-1 bg-accent-primary rounded-lg"
          >
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            disabled={loading}
            className="mt-4 text-sm text-gray-400 hover:text-gray-200"
          >
            {mode === "login"
              ? "Don't have an account yet? Register here!"
              : "Already have an account? Login here!"}
          </button>
        </form>
      </div>
    </div>
  );
};
