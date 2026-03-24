import Link from "next/link";

type Props = {
  href: string;
  label: string;
  onClick?: () => void;
};

export const PlainLink = ({ href, label, onClick }: Props) => {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        className="text-gray-400 hover:text-white"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      className=" text-gray-400 hover:text-white"
      href={href}
      onClick={onClick}
    >
      {label}
    </Link>
  );
};
