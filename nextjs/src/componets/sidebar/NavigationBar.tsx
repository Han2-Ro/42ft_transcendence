"use client";

import MainMenu from "./MainMenu";
import { HamburgerMenuIcon } from "../icons/HamburgerMenuIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { useState, useEffect } from "react";
import { useAuthConetxt } from "../AuthProvider";
import { Popup } from "../Popup";
import { getLevel } from "@/lib/auth/actions";
import Link from "next/link";

export default function NavigationBar() {
  const [showMenu, setShowMenu] = useState(false);
  const { user } = useAuthConetxt();
  const [level, setLevel] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getLevel().then(setLevel);
  }, [user]);

  return (
    <div className="lg:w-40 bg-background-secondary flex flex-row lg:flex-col justify-between items-center">
      <button className="lg:hidden" onClick={() => setShowMenu(!showMenu)}>
        {showMenu ? <CloseIcon size={64} /> : <HamburgerMenuIcon size={64} />}
      </button>
      {showMenu && (
        <Popup onClose={() => setShowMenu(false)}>
          <MainMenu onClose={() => setShowMenu(false)} />
        </Popup>
      )}
      <div className="hidden lg:block h-full w-full">
        <MainMenu />
      </div>
      <div className="p-4 lg:py-10 flex flex-col items-center">
        {
          //TODO: make it appear more clickable
          user ? (
            <Link
              className="hover:text-gray-400"
              href={`/user-stats/${user.username}`}
            >
              {user.username}
            </Link>
          ) : (
            <span>Guest</span>
          )
        }
        {user && level !== null && (
          <span className="text-sm text-slate-500">Level {level}</span>
        )}
      </div>
    </div>
  );
}
