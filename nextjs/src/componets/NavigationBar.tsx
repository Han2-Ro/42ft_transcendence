"use client";

import MainMenu from "../componets/MainMenu";
import { HamburgerMenuIcon } from "../componets/icons/HamburgerMenuIcon";
import { CloseIcon } from "../componets/icons/CloseIcon";
import { useState } from "react";
import { useAuthConetxt } from "./AuthProvider";

export default function NavigationBar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuthConetxt();
  return (
    <div className="bg-background-secondary flex flex-row lg:flex-col justify-between items-center">
      <button className="lg:hidden" onClick={() => setShowMenu(!showMenu)}>
        {showMenu ? <CloseIcon size={64} /> : <HamburgerMenuIcon size={64} />}
      </button>
      <div
        className={
          (showMenu ? "" : "hidden") +
          " lg:block h-full w-full absolute lg:static"
        }
      >
        <MainMenu />
      </div>
      <div className=" p-4 lg:py-10">{user ? user.username : "Guest"}</div>
    </div>
  );
}
