"use client";

import { useAuthConetxt } from "@/componets/AuthProvider";
import Button from "@/componets/Button";
import { Popup } from "@/componets/Popup";
import { TextInput } from "@/componets/TextInput";
import { changePassword, changeUsername } from "@/lib/auth/actions";
import { useState } from "react";

export default function Page() {
  const { user } = useAuthConetxt();
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuthConetxt();

  if (!user) {
    return <main>Log in to change settings</main>;
  }

  const submitNewUsername = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      const newUsername = formData.get("newUsername");
      const result = await changeUsername(newUsername as string);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowUsernameDialog(false);
      refreshUser();
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      const currentPassword = formData.get("currentPassword") as string;
      const newPassword = formData.get("newPassword") as string;
      const confirmNewPassword = formData.get("confirmNewPassword") as string;

      if (newPassword !== confirmNewPassword) {
        setError("New passwords do not match");
        return;
      }

      const result = await changePassword(currentPassword, newPassword);
      if (!result.success) {
        setError(result.error);
        return;
      }

      setShowPasswordDialog(false);
    } catch (err) {
      console.log(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className=" max-w-lg mx-auto p-2">
      {showUsernameDialog && (
        <Popup className="p-8" onClose={() => setShowUsernameDialog(false)}>
          <h2 className="mb-8 text-3xl">Change Username</h2>
          <form className="flex flex-col" onSubmit={submitNewUsername}>
            <TextInput
              id="newUsername"
              name="newUsername"
              label="New Username"
              required
              disabled={loading}
            />
            {error && (
              <div className="mb-4 p-2 bg-red-500/20 text-red-500 rounded">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="mt-8">
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Popup>
      )}
      {showPasswordDialog && (
        <Popup className="p-8" onClose={() => setShowPasswordDialog(false)}>
          <h2 className="mb-8 text-3xl">Change Password</h2>
          <form className="flex flex-col gap-2" onSubmit={submitNewPassword}>
            <TextInput
              id="currentPassword"
              name="currentPassword"
              label="Current Password"
              type="password"
              required
              disabled={loading}
            />
            <TextInput
              id="newPassword"
              name="newPassword"
              label="New Password"
              type="password"
              required
              disabled={loading}
            />
            <TextInput
              id="confirmNewPassword"
              name="confirmNewPassword"
              label="Confirm New Password"
              type="password"
              required
              disabled={loading}
            />
            {error && (
              <div className="mb-4 p-2 bg-red-500/20 text-red-500 rounded">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="mt-8">
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Popup>
      )}

      <h1 className="text-3xl p-3 text-center">Settings</h1>
      <h2 className="text-xl px-2">Account</h2>
      <hr />
      <div className="flex flex-row justify-between items-center p-2 w-full">
        <p>Username: {user ? user.username : "None"}</p>
        <Button onClick={() => setShowUsernameDialog(true)}>Change</Button>
      </div>
      <div className="flex flex-row justify-between items-center p-2 w-full">
        <p>Password: ****</p>
        <Button onClick={() => setShowPasswordDialog(true)}>Change</Button>
      </div>
    </main>
  );
}
