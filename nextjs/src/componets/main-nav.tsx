import Link from "next/link";
import { PlayIcon } from "./icons/PlayIcon";

export default function MainNavigation() {
  return (
    <nav className=" h-full p-6 flex flex-col justify-center items-center">
      <Link href="/game" className=" p-4 bg-background-primary rounded-2xl flex items-center gap-4">
        <PlayIcon size={50} className=" text-accent-primary"/>
        <p className=" text-4xl">Play</p>
      </Link>
    </nav>
  );
}
