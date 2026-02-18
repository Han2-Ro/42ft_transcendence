"use client";

import MainMenu from "../componets/MainMenu";
import { HamburgerMenuIcon } from "../componets/icons/HamburgerMenuIcon";
import { CloseIcon } from "../componets/icons/CloseIcon";
import { useState } from "react";

export default function NavigationBar() {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="bg-background-secondary">
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
    </div>
  );
}
