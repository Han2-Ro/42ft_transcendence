"use client";

import { Popup } from "../../componets/Popup";
import { PromotablePieceType } from "shared";

const PROMOTION_OPTIONS: PromotablePieceType[] = [
  "queen",
  "rook",
  "bishop",
  "knight",
];

type PromotionDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (piece: PromotablePieceType) => void;
  title?: string;
};

export function PromotionDialog({
  open,
  onClose,
  onSelect,
  title = "Choose promotion piece",
}: PromotionDialogProps) {
  if (!open) return null;

  return (
    <Popup onClose={onClose} className="p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex flex-col gap-4 rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-zinc-100 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
              Promotion
            </p>
            <h2 className="text-base font-semibold">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            aria-label="Close promotion dialog"
          >
            Cancel
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PROMOTION_OPTIONS.map((piece) => (
            <button
              key={piece}
              type="button"
              onClick={() => onSelect(piece)}
              className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-3 text-sm font-medium capitalize text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-700"
              aria-label={`Promote to ${piece}`}
            >
              {piece}
            </button>
          ))}
        </div>
      </div>
    </Popup>
  );
}