"use client";

import Link from "next/link";
import { PlayIcon } from "./icons/PlayIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { LoginModal } from "./LoginModal";
import { useState } from "react";

export default function MainMenu() {
  const [showLogin, setShowLogin] = useState(false);
  const toggleLogin = () => setShowLogin(!showLogin);

  return (
    <>
      {showLogin && <LoginModal onClose={toggleLogin} />}
      <nav className=" bg-black/70 lg:bg-inherit h-full w-full p-6 flex flex-col justify-center gap-4 items-center">
        <Link
          href="/game"
          className=" w-full p-4 bg-background-primary rounded-2xl flex items-center justify-center gap-4"
        >
          <PlayIcon size={50} className=" text-accent-primary" />
          <p className=" text-4xl">Play</p>
        </Link>
        <button
          onClick={toggleLogin}
          className=" w-full p-4 bg-background-primary rounded-2xl flex items-center justify-center gap-4"
        >
          <LoginIcon size={50} className=" text-accent-primary" />
          <p className=" text-4xl">Log In</p>
        </button>
      </nav>
    </>
  );
}
