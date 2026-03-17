import Link from "next/link";
import { ReactNode } from "react";

type BaseProps = {
  icon?: ReactNode;
  label: string;
  className?: string;
};

type LinkProps = BaseProps & {
  href: string;
  onClick?: never;
};

type ButtonProps = BaseProps & {
  onClick: () => void;
  href?: never;
};

type MenuButtonProps = LinkProps | ButtonProps;

export function MenuButton({
  icon,
  label,
  className,
  ...props
}: MenuButtonProps) {
  const baseClassName = `w-full p-4 bg-background-primary rounded-2xl flex items-center gap-2 transition-colors hover:bg-background-primary/80 ${className || ""}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={baseClassName}>
        {icon}
        <p className="text-4xl flex-auto text-center">{label}</p>
      </Link>
    );
  }

  return (
    <button onClick={props.onClick} className={baseClassName}>
      {icon}
      <p className="text-4xl flex-auto text-center">{label}</p>
    </button>
  );
}
