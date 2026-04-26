"use client";

import { PlayIcon } from "../icons/PlayIcon";
import { LoginIcon } from "../icons/LoginIcon";
import { AuthModal } from "../LoginModal";
import { MenuButton } from "../MenuButton";
import { useState } from "react";
import { LogoutIcon } from "../icons/LogoutIcon";
import { useAuthConetxt } from "../AuthProvider";
import { logout } from "@/lib/auth/actions";
import { GearIcon } from "../icons/GearIcon";
import { HomeIcon } from "../icons/HomeIcon";
import { useSidebarActions } from "./SidebarActionsProvider";

type Props = {
  onClose?: () => void;
};

export default function MainMenu({ onClose }: Props) {
  const [showLogin, setShowLogin] = useState(false);
  const { user, refreshUser } = useAuthConetxt();
  const { actions } = useSidebarActions();

  const onLogoutClicked = async () => {
    await logout();
    await refreshUser();
  };

  if (actions.length > 0) {
    return (
      <nav className="h-full w-full py-6 flex flex-col justify-center gap-4 items-start">
        {actions.map((action) => (
          <MenuButton
            key={action.label}
            onClick={() => {
              action.onClick();
              onClose?.();
            }}
            label={action.label}
            icon={action.icon}
          />
        ))}
      </nav>
    );
  }

  return (
    <>
      {showLogin && <AuthModal onClose={() => setShowLogin(false)} />}
      <nav className="h-full w-full py-6 flex flex-col justify-center gap-4 items-start">
        <MenuButton
          href="/"
          label="Home"
          icon={<HomeIcon size={20} />}
          onClick={onClose}
        />
        <MenuButton
          href="/game"
          icon={<PlayIcon size={20} className=" text-accent-primary" />}
          label="Play"
          onClick={onClose}
        />
        {user ? (
          <MenuButton
            onClick={() => {
              onLogoutClicked();
              onClose?.();
            }}
            icon={<LogoutIcon size={20} />}
            label="Log Out"
          />
        ) : (
          <MenuButton
            onClick={() => setShowLogin(true)}
            icon={<LoginIcon size={20} />}
            label="Log In"
          />
        )}
        <MenuButton
          label="Settings"
          icon={<GearIcon size={20} />}
          href="/settings"
        />
      </nav>
    </>
  );
}
