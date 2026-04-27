"use client";

import { useState } from "react";
import { useAuthConetxt } from "./AuthProvider";
import { login, login2FA, register } from "@/lib/auth/actions";
import {
  checkPasswordStrength,
  checkUsername,
  PASSWORD_REQUIREMENTS_MESSAGE,
  USERNAME_REQUIREMENTS_MESSAGE,
} from "@/lib/auth/validation";
import { Popup } from "./Popup";
import { TextInput } from "./TextInput";
import Button from "./Button";
import ErrorMessage from "./ErrorMessage";

type Props = {
  onClose: () => void;
};

export const AuthModal = ({ onClose }: Props) => {
  const [mode, setMode] = useState<"login" | "register" | "2FA">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId2FA, setuserId2FA] = useState<number | null>(null);
  const { refreshUser } = useAuthConetxt();

  const handleRegister = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!checkUsername(username)) {
      setError(USERNAME_REQUIREMENTS_MESSAGE);
      return;
    }
    if (!checkPasswordStrength(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await register(email, username, password);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onClose();
    await refreshUser();
  };

  const handleLogin = async (formData: FormData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    const result = await login(username as string, password as string);
    if (!result.success) {
      setError(result.error);
      return;
    }
    if ("requiresTwoFactor" in result.data && result.data.requiresTwoFactor) {
      setMode("2FA");
      setuserId2FA(result.data.userId);
      return;
    }
    onClose();
    await refreshUser();
  };

  const handle2faLogin = async (formData: FormData) => {
    const verificationCode = formData.get("verificationCode");
    if (!verificationCode) {
      setError("2FA Code required");
      return;
    }
    const result = await login2FA(verificationCode as string, userId2FA ?? -1);
    if (!result.success) {
      setError(result.error);
      return;
    }
    onClose();
    await refreshUser();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (mode === "register") handleRegister(formData);
      else if (mode === "login") handleLogin(formData);
      else if (mode === "2FA") handle2faLogin(formData);
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup className="p-4 w-64 lg:w-96" onClose={onClose}>
      <h2 className="mb-8 text-3xl">
        {mode === "login" ? "Login" : "Register"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextInput
          id="username"
          name="username"
          label={`Username${mode === "register" ? "" : " or Email"}`}
          required
          disabled={loading || mode === "2FA"}
        />
        {mode === "register" && (
          <TextInput
            id="email"
            name="email"
            label="Email"
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
          disabled={loading || mode === "2FA"}
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
        {mode === "2FA" && (
          <TextInput
            id="verificationCode"
            name="verificationCode"
            label="Enter 2FA Code"
            required
            autocomplete="off"
            disabled={loading}
            className="mt-4"
          />
        )}
        <ErrorMessage errorMsg={error} />
        <div className="flex flex-row gap-4">
          <Button
            className="flex-1 bg-background-primary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading
              ? mode === "login"
                ? "Logging in..."
                : "Registering..."
              : "Submit"}
          </Button>
        </div>
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
        {mode === "login" && (
          <Button
            type="button"
            className="mt-2 w-full bg-background-secondary"
            onClick={() => (window.location.href = "/api/auth/42")}
            disabled={loading}
          >
            Login with 42
          </Button>
        )}
      </form>
    </Popup>
  );
};
