const AUTH_BROADCAST_CHANNEL = "auth-events";

export type AuthBroadcastEvent = {
  type: "refreshSession";
  timestamp: number;
};

function isRefreshSessionEvent(value: unknown): value is AuthBroadcastEvent {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<AuthBroadcastEvent>;
  return (
    candidate.type === "refreshSession" &&
    typeof candidate.timestamp === "number"
  );
}

export function broadcastRefreshSessionEvent() {
  if (typeof window === "undefined") return;
  if (typeof BroadcastChannel === "undefined") return;

  const event: AuthBroadcastEvent = {
    type: "refreshSession",
    timestamp: Date.now(),
  };

  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  channel.postMessage(event);
  channel.close();
  return;
}

export function subscribeToRefreshSessionEvent(onRefreshSession: () => void) {
  if (typeof window === "undefined") return () => {};
  if (typeof BroadcastChannel === "undefined") return () => {};

  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  const messageHandler = (message: MessageEvent<unknown>) => {
    if (!isRefreshSessionEvent(message.data)) return;
    onRefreshSession();
  };
  channel.addEventListener("message", messageHandler);
  return () => {
    channel.removeEventListener("message", messageHandler);
    channel.close();
  };
}
