import Link from "next/link";

export default function Footer() {
  return (
    <footer className="p-4 flex flex-row justify-center gap-4">
      <Link href="/">Home</Link>
      <Link href="/privacy-policy">Privacy Policy</Link>
      <Link href="https://github.com/Han2-Ro/42ft_transcendence">
        Github Repo
      </Link>
    </footer>
  );
}
