import { PlayerColor } from "shared";

type PlayerCardProps = {
  name: string;
  color: PlayerColor;
  isTurn: boolean;
  isYou?: boolean;
  time?: number;
  isTimed?: boolean;
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

export function PlayerCard({ name, color, isTurn, isYou, time, isTimed }: PlayerCardProps) {
  return (
    <div
      className={`w-full h-full rounded-[1.5rem] p-3 text-white shadow-xl transition-all ${colorClass[color]} ${isTurn ? `ring-2 ${ringClass[color]}/70 shadow-[0_0_28px_rgba(59,130,246,0.30)]` : "shadow-slate-950/30"} border`}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="text-[10px] uppercase tracking-[0.18em] text-slate-300">{color}</div>
        <div className={`text-sm font-semibold leading-tight ${isYou ? 'font-bold' : ''}`}>{name}</div>
        {isTimed ? (
          <div className="text-base font-mono text-white">{time != null ? formatTime(time) : "--:--"}</div>
        ) : (
          <div className="text-[11px] text-slate-400">Untimed</div>
        )}
      </div>
    </div>
  );
}