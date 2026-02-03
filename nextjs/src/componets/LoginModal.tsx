"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  onClose: () => void;
};

export const LoginModal = ({ onClose }: Props) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.requiresTwoFactor) {
        setError("2FA not yet implemented");
        return;
      }

      onClose();
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
        <h1 className=" mb-8 text-3xl">Login</h1>
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
          <button type="submit" disabled={loading} className="mt-8">
              {loading ? "Logging in..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};
