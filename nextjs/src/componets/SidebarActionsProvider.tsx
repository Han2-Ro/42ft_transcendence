"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type SidebarAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
};

type SidebarActionsContextType = {
  actions: SidebarAction[];
  setActions: (actions: SidebarAction[]) => void;
  clearActions: () => void;
};

const SidebarActionsContext = createContext<SidebarActionsContextType | null>(
  null,
);

export default function SidebarActionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [actions, setActionsState] = useState<SidebarAction[]>([]);

  const setActions = useCallback((nextActions: SidebarAction[]) => {
    setActionsState(nextActions);
  }, []);

  const clearActions = useCallback(() => {
    setActionsState((currentActions) =>
      currentActions.length === 0 ? currentActions : [],
    );
  }, []);

  const value = useMemo(
    () => ({ actions, setActions, clearActions }),
    [actions, clearActions, setActions],
  );

  return (
    <SidebarActionsContext.Provider value={value}>
      {children}
    </SidebarActionsContext.Provider>
  );
}

export function useSidebarActions(): SidebarActionsContextType {
  const context = useContext(SidebarActionsContext);
  if (!context) {
    throw new Error(
      "useSidebarActions must be used within a SidebarActionsProvider",
    );
  }
  return context;
}
