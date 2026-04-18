"use client";

import { useAuthConetxt } from "@/componets/AuthProvider";
import Button from "@/componets/Button";
import { Popup } from "@/componets/Popup";
import { useState } from "react";

export default function Page() {
  const { user } = useAuthConetxt();
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  if (!user) {
    return <main>Log in to change settings</main>;
  }

  return (
    <main className=" max-w-lg mx-auto p-2">
      {showUsernameDialog && (
        <Popup onClose={() => setShowUsernameDialog(false)}>
          <div className="p-2">change username</div>
        </Popup>
      )}
      {showPasswordDialog && (
        <Popup onClose={() => setShowPasswordDialog(false)}>
          <div className="p-2">change password</div>
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
