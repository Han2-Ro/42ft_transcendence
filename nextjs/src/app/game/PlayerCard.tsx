import { PlayerColor } from "shared";

type PlayerCardProps = {
  name: string;
  color: PlayerColor;
  isTurn: boolean;
  isYou?: boolean;
  time?: number;
  isTimed?: boolean;
  testId?: string;
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.round(time % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const colorClass: Record<PlayerColor, string> = {
  red: "bg-red-950 border-red-500",
  blue: "bg-blue-950 border-blue-500",
  green: "bg-emerald-950 border-emerald-500",
  yellow: "bg-amber-950 border-amber-500",
  white: "bg-slate-900 border-slate-400",
  black: "bg-slate-950 border-slate-600",
};

const ringClass: Record<PlayerColor, string> = {
  red: "ring-red-400",
  blue: "ring-blue-400",
  green: "ring-emerald-400",
  yellow: "ring-amber-400",
  white: "ring-slate-400",
  black: "ring-slate-600",
};

const shadowClass: Record<PlayerColor, string> = {
  red: "shadow-[0_0_32px_rgba(239,68,68,0.40)]",
  blue: "shadow-[0_0_32px_rgba(59,130,246,0.40)]",
  green: "shadow-[0_0_32px_rgba(16,185,129,0.40)]",
  yellow: "shadow-[0_0_32px_rgba(245,158,11,0.40)]",
  white: "shadow-[0_0_32px_rgba(148,163,184,0.40)]",
  black: "shadow-[0_0_32px_rgba(71,85,105,0.40)]",
};

export function PlayerCard({
  name,
  color,
  isTurn,
  isYou,
  time,
  isTimed,
  testId,
}: PlayerCardProps) {
  return (
    <div
      data-testid={testId}
      data-player-color={color}
      data-is-turn={isTurn ? "true" : "false"}
      className={`w-full h-full rounded-[0.2rem] p-3 text-white shadow-xl transition-all ${colorClass[color]} ${isTurn ? `ring-4 ${ringClass[color]} ${shadowClass[color]}` : "shadow-slate-950/30"} border`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">
          {color}
        </div>
        <div
          className={`text-sm font-semibold leading-tight ${isYou ? "font-bold" : ""}`}
        >
          {name}
        </div>
        {isTimed ? (
          <div className="text-base font-mono text-white">
            {time != null ? formatTime(time) : "--:--"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
