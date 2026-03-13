type IconProps = {
  className?: string;
  size?: number;
};

export const HomeIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    height={size}
    width={size}
    className={className}
  >
    <g id="SVGRepo_bgCarrier" strokeWidth={0} />
    <g
      id="SVGRepo_tracerCarrier"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M1 6V15H6V11C6 9.89543 6.89543 9 8 9C9.10457 9 10 9.89543 10 11V15H15V6L8 0L1 6Z"
        fill="currentColor"
      />{" "}
    </g>
  </svg>
);
