import Link from "next/link";

export default function Header() {
  return (
    <footer className="p-4 flex flex-row justify-center gap-4">
      <Link href="/">Home</Link>
      <Link href="/game">Play</Link>
    </footer>
  );
}
