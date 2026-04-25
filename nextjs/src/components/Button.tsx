import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps {
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  loadingNoDisabled?: boolean;
  loading?: boolean;
  className?: string;
  loadingText?: string;
  arialabel?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

export default function Button({
  onClick,
  children,
  loadingNoDisabled = false,
  loading = false,
  disabled = false,
  className = "",
  loadingText = "Loading...",
  arialabel,
  type = undefined,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      aria-label={arialabel}
      className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${isDisabled ? "bg-accent-primary/10 cursor-not-allowed" : "bg-accent-primary hover:bg-accent-primary/50"} ${className}`}
      type={type}
    >
      {loading || loadingNoDisabled ? loadingText : children}
    </button>
  );
}
