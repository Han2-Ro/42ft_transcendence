"use client";

import { PlainLink } from "./PlainLink";

type Props = {
  onClose: () => void;
};

export const MoreModal = ({ onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black/50" onClick={onClose}>
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-background-secondary rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className=" mb-8 text-3xl">More</h1>
        <ul>
          <li>
            <PlainLink
              href="/privacy-policy"
              label="Privacy Policy"
              onClick={onClose}
            />
          </li>
          <li>
            <PlainLink href="/credits" label="Credits" onClick={onClose} />
          </li>
          <li>
            <PlainLink
              href="https://github.com/Han2-Ro/42ft_transcendence"
              label="Source Code"
            />
          </li>
        </ul>
      </div>
    </div>
  );
};
