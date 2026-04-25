"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Page() {
  const pathname = usePathname();
  const username = pathname.split("/").pop();
  return (
    <div className="w-full p-4 flex flex-col items-center gap-10 min-h-screen justify-center">
      <h1 className="text-7xl font-bold text-accent-primary">404</h1>
      <p className="text-2xl">
        User <span className="text-accent-primary">{username}</span> not found
      </p>
      <Link
        href="/user-stats"
        className="mt-4 px-6 py-2 bg-accent-primary rounded hover:opacity-80"
      >
        Enter a different user
      </Link>
    </div>
  );
}
