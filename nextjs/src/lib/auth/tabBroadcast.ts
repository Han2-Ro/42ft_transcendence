const AUTH_BROADCAST_CHANNEL = "auth-events";
const AUTH_STORAGE_KEY = "auth-events";

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

  const event: AuthBroadcastEvent = {
    type: "logout",
    timestamp: Date.now(),
  };

  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
    channel.postMessage(event);
    channel.close();
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(event));
}

export function subscribeToLogoutEvent(onLogout: () => void) {
  if (typeof window === "undefined") return () => {};

  if (typeof BroadcastChannel !== "undefined") {
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

  const storageHandler = (event: StorageEvent) => {
    if (event.key !== AUTH_STORAGE_KEY || !event.newValue) return;
    try {
      const parsed = JSON.parse(event.newValue) as unknown;
      if (!isLogoutEvent(parsed)) return;
      onLogout();
    } catch {
      return;
    }
  };

  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("storage", storageHandler);
  };
}
