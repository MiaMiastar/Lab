import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useMatch } from "react-router-dom";

interface WorkbenchQueueContextValue {
  /** 0 = 当前进行中；≥1 = 排队列表中的第 N 项 */
  viewIndex: number;
  setViewIndex: (index: number) => void;
  isQueuedView: boolean;
  labId: string | null;
}

const WorkbenchQueueContext = createContext<WorkbenchQueueContextValue | null>(null);

export function WorkbenchQueueProvider({ children }: { children: ReactNode }) {
  const workbenchMatch = useMatch("/workbench/:labId");
  const labId = workbenchMatch?.params.labId ?? null;
  const [viewIndex, setViewIndex] = useState(0);

  useEffect(() => {
    setViewIndex(0);
  }, [labId]);

  const value = useMemo(
    () => ({
      viewIndex,
      setViewIndex,
      isQueuedView: viewIndex > 0,
      labId,
    }),
    [viewIndex, labId]
  );

  return (
    <WorkbenchQueueContext.Provider value={value}>{children}</WorkbenchQueueContext.Provider>
  );
}

export function useWorkbenchQueue() {
  const ctx = useContext(WorkbenchQueueContext);
  if (!ctx) {
    throw new Error("useWorkbenchQueue must be used within WorkbenchQueueProvider");
  }
  return ctx;
}

/** 非 workbench 路由时安全读取（Header 等） */
export function useWorkbenchQueueOptional() {
  return useContext(WorkbenchQueueContext);
}
