"use client";

import { PlayIcon } from "./icons/PlayIcon";
import { LoginIcon } from "./icons/LoginIcon";
import { AuthModal } from "./LoginModal";
import { MenuButton } from "./MenuButton";
import { useState } from "react";
import { LogoutIcon } from "./icons/LogoutIcon";
import { useAuthConetxt } from "./AuthProvider";
import { logout } from "@/lib/auth/actions";

export default function MainMenu() {
  const [showLogin, setShowLogin] = useState(false);
  const toggleLogin = () => setShowLogin(!showLogin);
  const { user, refreshUser } = useAuthConetxt();

  const onLogoutClicked = async () => {
    await logout();
    await refreshUser();
  };

  return (
    <>
      {showLogin && <AuthModal onClose={toggleLogin} />}
      <nav className=" bg-black/70 lg:bg-inherit h-full w-full p-6 flex flex-col justify-center gap-4 items-center">
        <MenuButton
          href="/game"
          icon={<PlayIcon size={50} className=" text-accent-primary" />}
          label="Play"
        />
        {user ? (
          <MenuButton
            onClick={onLogoutClicked} // TODO: actually logout (server function)
            icon={<LogoutIcon size={50} className=" text-accent-primary" />}
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
