const AUTH_BROADCAST_CHANNEL = "auth-events";

export type AuthBroadcastEvent = {
  type: "logout";
  timestamp: number;
};

function isLogoutEvent(value: unknown): value is AuthBroadcastEvent {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<AuthBroadcastEvent>;
  return candidate.type === "logout" && typeof candidate.timestamp === "number";
}

export function broadcastLogoutEvent() {
  if (typeof window === "undefined") return;
  if (typeof BroadcastChannel === "undefined") return;

  const event: AuthBroadcastEvent = {
    type: "logout",
    timestamp: Date.now(),
  };

  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  channel.postMessage(event);
  channel.close();
  return;
}

export function subscribeToLogoutEvent(onLogout: () => void) {
  if (typeof window === "undefined") return () => {};
  if (typeof BroadcastChannel === "undefined") return () => {};

  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  const messageHandler = (message: MessageEvent<unknown>) => {
    if (!isLogoutEvent(message.data)) return;
    onLogout();
  };
  channel.addEventListener("message", messageHandler);
  return () => {
    channel.removeEventListener("message", messageHandler);
    channel.close();
  };
}
