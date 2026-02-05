"use client";

type Props = {
  onClose: () => void;
};

export const LoginModal = ({ onClose }: Props) => (
  <div className="fixed inset-0 bg-black/50" onClick={onClose}>
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 bg-background-secondary rounded-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h1 className="text-3xl">Placeholder</h1>
      <form action="">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" />
      </form>
    </div>
  </div>
);
