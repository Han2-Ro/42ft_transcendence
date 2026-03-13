import Link from "next/link";

export default function Page() {
  return (
    <div className="w-full p-4 flex flex-col items-center gap-10 min-h-screen justify-center">
      <h1 className="text-7xl font-bold text-accent-primary">404</h1>
      <p className="text-2xl">Page not found</p>
      <Link href="/" className="mt-4 px-6 py-2 bg-accent-primary rounded hover:opacity-80">Go back home</Link>
    </div>
  );
}
