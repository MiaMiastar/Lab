import { useEffect, useId, useMemo, useRef, useState } from "react";
import { NavLink, useMatch, useSearchParams } from "react-router-dom";
import { useWorkbenchQueueOptional } from "../contexts/WorkbenchQueueContext";
import {
  CURRENT_USER,
  getLabById,
  getObserveQueueBundle,
  getObserveRunningSession,
  getObserveSessionByViewIndex,
  getQueuedExperimentsForLab,
  getQueuedExperimentView,
  getSessionForLab,
  isObserveMode,
} from "../data/mock";
import type { SessionInfo, WorkbenchExperimentStatus } from "../types";
import { InstitutionLogo } from "./InstitutionLogo";
import { ExperimentListTimeMeta } from "./ExperimentListTimeMeta";
import { PageContainer } from "./PageContainer";

const STYLE_STORAGE_KEY = "smart-lab-visual-style";
const VISUAL_STYLE_OPTIONS = [
  { id: "tech", label: "科技" },
  { id: "human", label: "人文" },
] as const;

type VisualStyle = (typeof VISUAL_STYLE_OPTIONS)[number]["id"];

const EXPERIMENT_STATUS_LABELS: Record<WorkbenchExperimentStatus, string> = {
  running: "进行中",
  queued: "排队中",
  completed: "已完成",
};

const EXPERIMENT_STATUS_CLASS: Record<WorkbenchExperimentStatus, string> = {
  running: "running",
  queued: "queued",
  completed: "completed",
};

function getExperimentGoal(session: SessionInfo | null | undefined, fallback?: string): string {
  return session?.intro.originalGoal ?? session?.intro.summary ?? fallback ?? "—";
}

interface ExperimentListItemButtonProps {
  status: WorkbenchExperimentStatus;
  goal: string;
  submittedAt?: string;
  completedAt?: string;
  active: boolean;
  onSelect: () => void;
}

function ExperimentListItemButton({
  status,
  goal,
  submittedAt,
  completedAt,
  active,
  onSelect,
}: ExperimentListItemButtonProps) {
  const statusClass = EXPERIMENT_STATUS_CLASS[status];

  return (
    <button
      type="button"
      className={`header-lab-queue-dropdown-item header-lab-queue-dropdown-item--${statusClass} ${active ? "is-active" : ""}`}
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
    >
      <span className={`header-lab-queue-dropdown-badge header-lab-queue-dropdown-badge--${statusClass}`}>
        {EXPERIMENT_STATUS_LABELS[status]}
      </span>
      <span className="header-lab-queue-dropdown-item-text">
        <span className="header-lab-queue-dropdown-goal">{goal}</span>
        <ExperimentListTimeMeta
          submittedAt={submittedAt}
          completedAt={completedAt}
          status={status}
        />
      </span>
    </button>
  );
}

function readInitialVisualStyle(): VisualStyle {
  if (typeof window === "undefined") return "tech";
  try {
    return window.localStorage.getItem(STYLE_STORAGE_KEY) === "human" ? "human" : "tech";
  } catch {
    return "tech";
  }
}

export function Header() {
  const workbenchMatch = useMatch("/workbench/:labId");
  const [searchParams] = useSearchParams();
  const labId = workbenchMatch?.params.labId;
  const lab = labId ? getLabById(labId) : undefined;
  const logoVariant = lab?.institutionLogoVariant ?? "default";
  const isObserve = isObserveMode(labId, searchParams);
  const observeQueue = useMemo(
    () => (isObserve && labId ? getObserveQueueBundle(labId) : null),
    [isObserve, labId]
  );
  const queueCtx = useWorkbenchQueueOptional();
  const viewIndex = queueCtx?.viewIndex ?? 0;
  const setViewIndex = queueCtx?.setViewIndex;
  const runningSession = useMemo(() => {
    if (!labId) return null;
    if (isObserve) return getObserveRunningSession(labId);
    return getSessionForLab(labId);
  }, [labId, isObserve]);
  const queuedExperiments = useMemo(
    () => (labId ? getQueuedExperimentsForLab(labId) : []),
    [labId]
  );
  const [queueOpen, setQueueOpen] = useState(false);
  const queueRef = useRef<HTMLDivElement>(null);
  const queueListId = useId();
  const queueCount = observeQueue ? observeQueue.queued.length : (lab?.queueLength ?? 0);
  const completedCount = observeQueue?.completed.length ?? 0;
  const [visualStyle, setVisualStyle] = useState<VisualStyle>(readInitialVisualStyle);
  const hasQueueDropdown = observeQueue
    ? observeQueue.queued.length > 0 || observeQueue.completed.length > 0
    : queueCount > 0;

  useEffect(() => {
    document.documentElement.dataset.visualStyle = visualStyle;
    try {
      window.localStorage.setItem(STYLE_STORAGE_KEY, visualStyle);
    } catch {
      // Keep the in-memory selection even if storage is unavailable.
    }
  }, [visualStyle]);

  useEffect(() => {
    setQueueOpen(false);
  }, [labId, isObserve]);

  useEffect(() => {
    if (!queueOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (queueRef.current?.contains(event.target as Node)) return;
      setQueueOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQueueOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [queueOpen]);

  const selectQueueView = (index: number) => {
    setViewIndex?.(index);
    setQueueOpen(false);
  };

  return (
    <header className="app-header">
      <PageContainer wide className="app-header-inner">
        <div className="brand">
          <div className="brand-logo" aria-hidden>
            智
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <NavLink to="/" className="brand-home-link" end aria-label="智慧实验室首页">
                智慧实验室
              </NavLink>
              {lab ? (
                <span className="brand-lab-context" aria-label={`当前实验室：${lab.name}`}>
                  <span className="brand-context-sep" aria-hidden>
                    /
                  </span>
                  <InstitutionLogo
                    logo={lab.institutionLogo}
                    variant={logoVariant}
                    modifierClass="workbench-org-logo"
                    className="brand-lab-logo"
                  />
                  <span className="brand-lab-name">{lab.name}</span>
                  <div className="header-lab-queue-wrap" ref={queueRef}>
                    {hasQueueDropdown ? (
                      <button
                        type="button"
                        className="header-lab-queue header-lab-queue--has header-lab-queue--btn"
                        aria-expanded={queueOpen}
                        aria-controls={queueListId}
                        aria-label={
                          observeQueue
                            ? `排队 ${queueCount} 个、完成 ${completedCount} 个，点击查看实验列表`
                            : `排队中 ${queueCount} 个，点击查看实验列表`
                        }
                        onClick={() => setQueueOpen((open) => !open)}
                      >
                        {observeQueue ? (
                          <span className="header-lab-queue-label">
                            排队{" "}
                            <span className="header-lab-queue-value header-lab-queue-value--queued">
                              {queueCount}
                            </span>
                            <span className="header-lab-queue-sep" aria-hidden>
                              ·
                            </span>
                            完成{" "}
                            <span className="header-lab-queue-value header-lab-queue-value--completed">
                              {completedCount}
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="header-lab-queue-label">排队中</span>
                            <span className="header-lab-queue-value">{queueCount}</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="header-lab-queue" aria-label="排队中 0 个">
                        <span className="header-lab-queue-label">排队中</span>
                        <span className="header-lab-queue-value">0</span>
                      </span>
                    )}
                    {queueOpen && hasQueueDropdown && (
                      <div
                        id={queueListId}
                        className={`header-lab-queue-dropdown ${observeQueue ? "header-lab-queue-dropdown--observe" : ""}`}
                        role="dialog"
                        aria-label="实验列表"
                      >
                        {observeQueue ? (
                          <>
                            <div className="header-lab-queue-dropdown-head">
                              <span className="header-lab-queue-dropdown-title">实验列表</span>
                            </div>
                            <ul className="header-lab-queue-dropdown-list">
                              <li>
                                <ExperimentListItemButton
                                  status={observeQueue.running.status}
                                  goal={getExperimentGoal(runningSession, observeQueue.running.experimentName)}
                                  submittedAt={observeQueue.running.submittedAt}
                                  completedAt={observeQueue.running.completedAt}
                                  active={viewIndex === 0}
                                  onSelect={() => selectQueueView(0)}
                                />
                              </li>
                              {observeQueue.queued.map((item, index) => {
                                const listIndex = index + 1;
                                const queuedSession = labId
                                  ? getObserveSessionByViewIndex(labId, listIndex)
                                  : null;
                                return (
                                  <li key={item.id}>
                                    <ExperimentListItemButton
                                      status={item.status}
                                      goal={getExperimentGoal(queuedSession, item.experimentName)}
                                      submittedAt={item.submittedAt}
                                      completedAt={item.completedAt}
                                      active={viewIndex === listIndex}
                                      onSelect={() => selectQueueView(listIndex)}
                                    />
                                  </li>
                                );
                              })}
                              {observeQueue.completed.map((item, index) => {
                                const listIndex = observeQueue.queued.length + index + 1;
                                const completedSession = labId
                                  ? getObserveSessionByViewIndex(labId, listIndex)
                                  : null;
                                return (
                                  <li key={item.id}>
                                    <ExperimentListItemButton
                                      status={item.status}
                                      goal={getExperimentGoal(completedSession, item.experimentName)}
                                      submittedAt={item.submittedAt}
                                      completedAt={item.completedAt}
                                      active={viewIndex === listIndex}
                                      onSelect={() => selectQueueView(listIndex)}
                                    />
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        ) : (
                          <>
                            <div className="header-lab-queue-dropdown-head">
                              <span className="header-lab-queue-dropdown-title">实验列表</span>
                            </div>
                            <ul className="header-lab-queue-dropdown-list">
                              {runningSession && (
                                <li>
                                  <ExperimentListItemButton
                                    status="running"
                                    goal={getExperimentGoal(runningSession, runningSession.experimentName)}
                                    submittedAt={runningSession.submittedAt}
                                    completedAt={runningSession.completedAt}
                                    active={viewIndex === 0}
                                    onSelect={() => selectQueueView(0)}
                                  />
                                </li>
                              )}
                              {queuedExperiments.map((item, index) => {
                                const queuedSession = labId
                                  ? getQueuedExperimentView(labId, index)
                                  : null;
                                return (
                                  <li key={item.id}>
                                    <ExperimentListItemButton
                                      status="queued"
                                      goal={getExperimentGoal(queuedSession, item.experimentName)}
                                      submittedAt={item.submittedAt}
                                      completedAt={item.completedAt}
                                      active={viewIndex === index + 1}
                                      onSelect={() => selectQueueView(index + 1)}
                                    />
                                  </li>
                                );
                              })}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="style-switcher" role="group" aria-label="风格选项">
            {VISUAL_STYLE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`style-switcher-option ${visualStyle === option.id ? "is-active" : ""}`}
                aria-pressed={visualStyle === option.id}
                onClick={() => setVisualStyle(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="user-chip" title={CURRENT_USER}>
            <span className="user-avatar" aria-hidden>
              {CURRENT_USER[0]}
            </span>
            <span className="user-name">{CURRENT_USER}</span>
          </div>
        </div>
      </PageContainer>
    </header>
  );
}
