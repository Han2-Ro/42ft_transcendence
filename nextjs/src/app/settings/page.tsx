"use client";

import { useAuthConetxt } from "@/componets/AuthProvider";
import Button from "@/componets/Button";

export default function Page() {
  const { user } = useAuthConetxt();
  if (!user) {
    return <main>Log in to change settings</main>;
  }

  return (
    <main>
      <h1>Settings</h1>
      <h2>Account</h2>
      <hr />
      <div className="flex flex-row">
        <p>Username: {user ? user.username : "None"}</p>
        <Button onClick={() => console.log("abc")}>Change</Button>
      </div>
      <div className="flex flex-row">
        <p>Password: ****</p>
        <Button onClick={() => console.log("abc")}>Change</Button>
      </div>
    </main>
  );
}
