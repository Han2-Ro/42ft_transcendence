"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/componets/Button";
import StatsNavigationTabs from "@/componets/StatsNavigationTabs";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/user-stats/${encodeURIComponent(username)}`);
  };

  return (
    <>
      <StatsNavigationTabs />
      <main className="flex flex-col gap-4 items-center h-full justify-center">
        <h1 className="text-4xl">Search for a user</h1>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            className="px-2 py-1 border-2 rounded-sm border-gray-500"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
          />
          <Button type="submit">Submit</Button>
        </form>
      </main>
    </>
  );
}
