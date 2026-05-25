import { useEffect, useId, useMemo, useRef, useState } from "react";
import { NavLink, useMatch, useSearchParams } from "react-router-dom";
import { useWorkbenchQueueOptional } from "../contexts/WorkbenchQueueContext";
import {
  CURRENT_USER,
  getLabById,
  getObserveQueueBundle,
  getObserveRunningSession,
  getQueuedExperimentsForLab,
  getSessionForLab,
  isObserveMode,
} from "../data/mock";
import { InstitutionLogo } from "./InstitutionLogo";
import { ExperimentListTimeMeta } from "./ExperimentListTimeMeta";
import { PageContainer } from "./PageContainer";

const STYLE_STORAGE_KEY = "smart-lab-visual-style";
const VISUAL_STYLE_OPTIONS = [
  { id: "tech", label: "科技" },
  { id: "human", label: "人文" },
] as const;

type VisualStyle = (typeof VISUAL_STYLE_OPTIONS)[number]["id"];

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
                              <span className="header-lab-queue-dropdown-meta">
                                <span className="header-lab-queue-dropdown-meta-queued">
                                  排队 {observeQueue.queued.length}
                                </span>
                                <span className="header-lab-queue-dropdown-meta-sep" aria-hidden>
                                  ·
                                </span>
                                <span className="header-lab-queue-dropdown-meta-completed">
                                  已完成 {observeQueue.completed.length}
                                </span>
                              </span>
                            </div>
                            <ul className="header-lab-queue-dropdown-list">
                              <li>
                                <button
                                  type="button"
                                  className={`header-lab-queue-dropdown-item header-lab-queue-dropdown-item--running ${viewIndex === 0 ? "is-active" : ""}`}
                                  onClick={() => selectQueueView(0)}
                                  aria-current={viewIndex === 0 ? "true" : undefined}
                                >
                                  <span className="header-lab-queue-dropdown-badge header-lab-queue-dropdown-badge--running">
                                    进行中
                                  </span>
                                  <span className="header-lab-queue-dropdown-item-text">
                                    <span className="header-lab-queue-dropdown-name">
                                      {runningSession?.experimentName}
                                    </span>
                                    {observeQueue.running.subtitle && (
                                      <span className="header-lab-queue-dropdown-sub">
                                        {observeQueue.running.subtitle}
                                      </span>
                                    )}
                                    <ExperimentListTimeMeta
                                      submittedAt={observeQueue.running.submittedAt}
                                      completedAt={observeQueue.running.completedAt}
                                      status={observeQueue.running.status}
                                    />
                                  </span>
                                </button>
                              </li>
                            </ul>
                            <div className="header-lab-queue-dropdown-section header-lab-queue-dropdown-section--queued">
                              <span className="header-lab-queue-dropdown-section-label">
                                排队中 · {observeQueue.queued.length}
                              </span>
                              <ul className="header-lab-queue-dropdown-list">
                                {observeQueue.queued.map((item, index) => {
                                  const listIndex = index + 1;
                                  return (
                                    <li key={item.id}>
                                      <button
                                        type="button"
                                        className={`header-lab-queue-dropdown-item header-lab-queue-dropdown-item--queued ${viewIndex === listIndex ? "is-active" : ""}`}
                                        onClick={() => selectQueueView(listIndex)}
                                        aria-current={viewIndex === listIndex ? "true" : undefined}
                                      >
                                        <span className="header-lab-queue-dropdown-badge header-lab-queue-dropdown-badge--queued">
                                          排队 {index + 1}
                                        </span>
                                        <span className="header-lab-queue-dropdown-item-text">
                                          <span className="header-lab-queue-dropdown-name">
                                            {item.experimentName}
                                          </span>
                                          {item.subtitle && (
                                            <span className="header-lab-queue-dropdown-sub">{item.subtitle}</span>
                                          )}
                                          <ExperimentListTimeMeta
                                            submittedAt={item.submittedAt}
                                            completedAt={item.completedAt}
                                            status={item.status}
                                          />
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                            <div className="header-lab-queue-dropdown-section header-lab-queue-dropdown-section--completed">
                              <span className="header-lab-queue-dropdown-section-label">
                                已完成 · {observeQueue.completed.length}
                              </span>
                              <ul className="header-lab-queue-dropdown-list">
                                {observeQueue.completed.length === 0 ? (
                                  <li className="header-lab-queue-dropdown-empty">暂无已完成实验</li>
                                ) : (
                                  observeQueue.completed.map((item, index) => {
                                    const listIndex = observeQueue.queued.length + index + 1;
                                    return (
                                      <li key={item.id}>
                                        <button
                                          type="button"
                                          className={`header-lab-queue-dropdown-item header-lab-queue-dropdown-item--completed ${viewIndex === listIndex ? "is-active" : ""}`}
                                          onClick={() => selectQueueView(listIndex)}
                                          aria-current={viewIndex === listIndex ? "true" : undefined}
                                        >
                                          <span className="header-lab-queue-dropdown-badge header-lab-queue-dropdown-badge--done">
                                            已完成
                                          </span>
                                          <span className="header-lab-queue-dropdown-item-text">
                                            <span className="header-lab-queue-dropdown-name">
                                              {item.experimentName}
                                            </span>
                                            {item.subtitle && (
                                              <span className="header-lab-queue-dropdown-sub">{item.subtitle}</span>
                                            )}
                                            <ExperimentListTimeMeta
                                              submittedAt={item.submittedAt}
                                              completedAt={item.completedAt}
                                              status={item.status}
                                            />
                                          </span>
                                        </button>
                                      </li>
                                    );
                                  })
                                )}
                              </ul>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="header-lab-queue-dropdown-head">
                              <span className="header-lab-queue-dropdown-title">实验列表</span>
                              <span className="header-lab-queue-dropdown-meta">{queueCount} 项</span>
                            </div>
                            <ul className="header-lab-queue-dropdown-list">
                              {runningSession && (
                                <li>
                                  <button
                                    type="button"
                                    className={`header-lab-queue-dropdown-item header-lab-queue-dropdown-item--running ${viewIndex === 0 ? "is-active" : ""}`}
                                    onClick={() => selectQueueView(0)}
                                    aria-current={viewIndex === 0 ? "true" : undefined}
                                  >
                                    <span className="header-lab-queue-dropdown-badge header-lab-queue-dropdown-badge--running">
                                      进行中
                                    </span>
                                    <span className="header-lab-queue-dropdown-item-text">
                                      <span className="header-lab-queue-dropdown-name">
                                        {runningSession.experimentName}
                                      </span>
                                      <ExperimentListTimeMeta
                                        submittedAt={runningSession.submittedAt}
                                        completedAt={runningSession.completedAt}
                                        status="running"
                                      />
                                    </span>
                                  </button>
                                </li>
                              )}
                            </ul>
                            {queuedExperiments.length > 0 && (
                              <div className="header-lab-queue-dropdown-section header-lab-queue-dropdown-section--queued">
                                <span className="header-lab-queue-dropdown-section-label">
                                  排队中 · {queuedExperiments.length}
                                </span>
                                <ul className="header-lab-queue-dropdown-list">
                                  {queuedExperiments.map((item, index) => (
                                    <li key={item.id}>
                                      <button
                                        type="button"
                                        className={`header-lab-queue-dropdown-item header-lab-queue-dropdown-item--queued ${viewIndex === index + 1 ? "is-active" : ""}`}
                                        onClick={() => selectQueueView(index + 1)}
                                        aria-current={viewIndex === index + 1 ? "true" : undefined}
                                      >
                                        <span className="header-lab-queue-dropdown-badge header-lab-queue-dropdown-badge--queued">
                                          排队 {index + 1}
                                        </span>
                                        <span className="header-lab-queue-dropdown-item-text">
                                          <span className="header-lab-queue-dropdown-name">
                                            {item.experimentName}
                                          </span>
                                          <ExperimentListTimeMeta
                                            submittedAt={item.submittedAt}
                                            completedAt={item.completedAt}
                                            status="queued"
                                          />
                                        </span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
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
