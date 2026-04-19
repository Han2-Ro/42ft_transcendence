"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthConetxt } from "./AuthProvider";
import { login, register } from "@/lib/auth/actions";
import { Popup } from "./Popup";
import { TextInput } from "./TextInput";
import Button from "./Button";

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
      const result =
        mode === "login"
          ? await login(email as string, password as string)
          : await register(
              email as string,
              username as string,
              password as string,
            );

      if ("error" in result) {
        setError(result.error);
        return;
      }

      if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
        setError("2FA not yet implemented");
        return;
      }

      onClose();
      await refreshUser();
      await router.refresh();
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup className="p-8" onClose={onClose}>
      <h2 className="mb-8 text-3xl">
        {mode === "login" ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="mb-4 p-2 bg-red-500/20 text-red-500 rounded">
            {error}
          </div>
        )}
        <TextInput
          id="email"
          name="email"
          label="Email"
          type="email"
          required
          disabled={loading}
        />
        {mode === "register" && (
          <TextInput
            id="username"
            name="username"
            label="Username"
            required
            disabled={loading}
          />
        )}
        <TextInput
          id="password"
          name="password"
          label="Password"
          type="password"
          required
          disabled={loading}
        />
        {mode === "register" && (
          <TextInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            required
            disabled={loading}
          />
        )}
        <Button type="submit" disabled={loading} className="mt-8">
          {loading
            ? mode === "login"
              ? "Logging in..."
              : "Registering..."
            : "Submit"}
        </Button>
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
    </Popup>
  );
};
