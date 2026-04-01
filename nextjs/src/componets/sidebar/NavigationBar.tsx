"use client";

import MainMenu from "./MainMenu";
import { HamburgerMenuIcon } from "../icons/HamburgerMenuIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { useState } from "react";
import { useAuthConetxt } from "../AuthProvider";
import { useSidebarActions } from "./SidebarActionsProvider";
import { MenuButton } from "../MenuButton";
import { Popup } from "../Popup";

export default function NavigationBar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuthConetxt();
  const { actions } = useSidebarActions();
  const hasCustomActions = actions.length > 0;
  return (
    <div className=" lg:w-40 bg-background-secondary flex flex-row lg:flex-col justify-between items-center">
      <button
        className="lg:hidden"
        onClick={() => setShowMenu(!showMenu)}
      >
        {showMenu ? <CloseIcon size={64} /> : <HamburgerMenuIcon size={64} />}
      </button>
      {showMenu && (
        <Popup onClose={() => setShowMenu(false)}>
          <nav className="flex flex-col gap-4 items-start">
            {hasCustomActions ? (
              actions.map((action) => (
                <MenuButton
                  key={action.label}
                  onClick={action.onClick}
                  label={action.label}
                  icon={action.icon}
                />
              ))
            ) : (
              <MainMenu />
            )}
          </nav>
        </Popup>
      )}
      <div className="hidden lg:block h-full w-full">
        {hasCustomActions ? (
          <nav className="h-full w-full py-6 flex flex-col justify-center gap-4 items-center">
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
