import { PlainLink } from "@/componets/PlainLink";

export default function Footer() {
  return (
    <footer className="p-4 flex flex-row justify-center gap-6 bg-background-secondary/50">
      <PlainLink href="/" label="Home" />
      <PlainLink href="/privacy-policy" label="Privacy Policy" />
      <PlainLink href="/terms-of-service" label="Terms of Service" />
      <PlainLink href="/credits" label="Credits" />
      <PlainLink
        href="https://github.com/Han2-Ro/42ft_transcendence"
        label="Source Code"
      />
    </footer>
  );
}
