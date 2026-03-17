"use client";

import MainMenu from "../componets/MainMenu";
import { HamburgerMenuIcon } from "../componets/icons/HamburgerMenuIcon";
import { CloseIcon } from "../componets/icons/CloseIcon";
import { useState } from "react";
import { useAuthConetxt } from "./AuthProvider";
import { useSidebarActions } from "./SidebarActionsProvider";
import { MenuButton } from "./MenuButton";

export default function NavigationBar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuthConetxt();
  const { actions } = useSidebarActions();
  const hasCustomActions = actions.length > 0;
  return (
    <div className=" lg:w-80 bg-background-secondary flex flex-row lg:flex-col justify-between items-center">
      <button
        className=" z-10 lg:hidden"
        onClick={() => setShowMenu(!showMenu)}
      >
        {showMenu ? <CloseIcon size={64} /> : <HamburgerMenuIcon size={64} />}
      </button>
      <div
        className={
          (showMenu ? "" : "hidden") +
          " lg:block h-full w-full absolute top-0 bottom-0 lg:static"
        }
      >
        {hasCustomActions ? (
          <nav className=" bg-black/70 lg:bg-inherit h-full w-full p-6 flex flex-col justify-center gap-4 items-center">
            {actions.map((action) => (
              <MenuButton
                key={action.label}
                onClick={action.onClick}
                label={action.label}
                icon={action.icon}
              />
            ))}
          </nav>
        ) : (
          <MainMenu />
        )}
      </div>
      <div className=" p-4 lg:py-10">{user ? user.username : "Guest"}</div>
    </div>
  );
}
