"use client";

import { useAuthConetxt } from "@/components/AuthProvider";
import { PlainLink } from "@/components/PlainLink";
import { usePathname } from "next/navigation";

export default function StatsNavigationTabs() {
  const { user } = useAuthConetxt();
  const pathname = usePathname();

  const personalStatsHref = user
    ? `/user-stats/${encodeURIComponent(user.username)}`
    : "/user-stats";

  const tabs = [
    { href: personalStatsHref, label: "Personal Stats" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/history", label: "Match History" },
  ];

  const isActiveTab = (href: string) => {
    if (href.startsWith("/user-stats")) {
      return pathname === "/user-stats" || pathname.startsWith("/user-stats/");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="bg-background-secondary/50 flex pt-2 flex-row justify-center gap-2">
      {tabs.map((tab) => {
        const isActive = isActiveTab(tab.href);

        return (
          <div
            className={`p-2 lg:px-8 ${isActive ? "bg-background-primary rounded-t-md" : ""}`}
            key={tab.href}
          >
            <PlainLink href={tab.href} label={tab.label} />
          </div>
        );
      })}
    </div>
  );
}
