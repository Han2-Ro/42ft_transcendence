"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type BaseProps = {
  icon?: ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
};

type LinkProps = BaseProps & {
  href: string;
};

type ButtonProps = BaseProps & {
  href?: never;
};

type MenuButtonProps = LinkProps | ButtonProps;

export function MenuButton({
  icon,
  label,
  className,
  ...props
}: MenuButtonProps) {
  const pathname = usePathname();
  const isActive = "href" in props && props.href === pathname;
  const baseClassName = `w-full px-7 p-4 flex items-center transition-colors hover:bg-background-primary/80 ${isActive ? "bg-background-primary/80" : ""} ${className || ""}`;

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={baseClassName} onClick={props.onClick}>
        {icon}
        <p className="pl-2 text-xl flex-auto text-start">{label}</p>
      </Link>
    );
  }

  return (
    <button onClick={props.onClick} className={baseClassName}>
      {icon}
      <p className="pl-2 text-xl flex-auto text-start">{label}</p>
    </button>
  );
}
