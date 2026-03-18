interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  loadingText?: string;
}

export default function Button({
  onClick,
  children,
  loading = false,
  disabled = false,
  className = "",
  loadingText = "Loading...",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${isDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"} ${className}`}
    >
      {loading ? loadingText : children}
    </button>
  );
}
