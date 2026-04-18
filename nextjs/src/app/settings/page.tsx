"use client";

import { useAuthConetxt } from "@/componets/AuthProvider";
import Button from "@/componets/Button";

export default function Page() {
  const { user } = useAuthConetxt();
  if (!user) {
    return <main>Log in to change settings</main>;
  }

  return (
    <main className=" max-w-lg mx-auto p-2">
      <h1 className="text-3xl p-3 text-center">Settings</h1>
      <h2 className="text-xl px-2">Account</h2>
      <hr />
      <div className="flex flex-row justify-between items-center p-2 w-full">
        <p>Username: {user ? user.username : "None"}</p>
        <Button onClick={() => console.log("abc")}>Change</Button>
      </div>
      <div className="flex flex-row justify-between items-center p-2 w-full">
        <p>Password: ****</p>
        <Button onClick={() => console.log("abc")}>Change</Button>
      </div>
    </main>
  );
}
