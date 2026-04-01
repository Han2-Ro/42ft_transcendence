"use client";

import MainMenu from "./MainMenu";
import { HamburgerMenuIcon } from "../icons/HamburgerMenuIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { useState } from "react";
import { useAuthConetxt } from "../AuthProvider";
import { Popup } from "../Popup";

export default function NavigationBar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuthConetxt();

  return (
    <div className="lg:w-40 bg-background-secondary flex flex-row lg:flex-col justify-between items-center">
      <button
        className="lg:hidden"
        onClick={() => setShowMenu(!showMenu)}
      >
        {showMenu ? <CloseIcon size={64} /> : <HamburgerMenuIcon size={64} />}
      </button>
      {showMenu && (
        <Popup onClose={() => setShowMenu(false)}>
          <MainMenu />
        </Popup>
      )}
      <div className="hidden lg:block h-full w-full">
        <MainMenu />
      </div>
      <div className="p-4 lg:py-10">{user ? user.username : "Guest"}</div>
    </div>
  );
}
