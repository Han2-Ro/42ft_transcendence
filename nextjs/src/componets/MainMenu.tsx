"use client";

import { PlayIcon } from "./icons/PlayIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { AuthModal } from "./LoginModal";
import { MenuButton } from "./MenuButton";
import { useState } from "react";

export default function MainMenu() {
  const [showLogin, setShowLogin] = useState(false);
  const toggleLogin = () => setShowLogin(!showLogin);
  const logged_in = false; // TODO: placeholder (don't know yet how to check for logged in state)

  return (
    <>
      {showLogin && <AuthModal onClose={toggleLogin} />}
      <nav className=" bg-black/70 lg:bg-inherit h-full w-full p-6 flex flex-col justify-center gap-4 items-center">
        <MenuButton
          href="/game"
          icon={<PlayIcon size={50} className=" text-accent-primary" />}
          label="Play"
        />
        {logged_in ? (
          <MenuButton
            onClick={() => {}} // TODO: actually logout (does this need an api root?)
            icon={<LoginIcon size={50} className=" text-accent-primary" />}
            label="Log Out"
          />
        ) : (
          <MenuButton
            onClick={toggleLogin}
            icon={<LoginIcon size={50} className=" text-accent-primary" />}
            label="Log In"
          />
        )}
        <MenuButton href="/test" label="Test" />
      </nav>
    </>
  );
}
