import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CurrentStepPanel } from "../components/CurrentStepPanel";
import { ExperimentIntroPanel } from "../components/ExperimentIntroPanel";
import { PageContainer } from "../components/PageContainer";
import { VideoStreamHub } from "../components/video/VideoStreamHub";
import { useWorkbenchQueue } from "../contexts/WorkbenchQueueContext";
import {
  getLabById,
  hasExecutionLogForLab,
  getObserveQueueBundle,
  getObserveSessionByViewIndex,
  getQueuedExperimentView,
  getSessionForLab,
  isObserveMode,
} from "../data/mock";

export function Workbench() {
  const { labId } = useParams<{ labId: string }>();
  const [searchParams] = useSearchParams();
  const { viewIndex, isQueuedView, setViewIndex } = useWorkbenchQueue();
  const isObserve = isObserveMode(labId, searchParams);
  const observeQueue = useMemo(
    () => (isObserve && labId ? getObserveQueueBundle(labId) : null),
    [isObserve, labId]
  );
  const isObserveQueued =
    observeQueue != null && viewIndex > 0 && viewIndex <= observeQueue.queued.length;
  const isObserveCompleted =
    observeQueue != null && viewIndex > observeQueue.queued.length && viewIndex > 0;
  const supportsExecutionLog = hasExecutionLogForLab(labId);
  const showStepsCard = !isObserve || supportsExecutionLog;
  const showObserveLogEmpty = isObserve && supportsExecutionLog && isObserveQueued;
  const showLogPanel = isObserve && supportsExecutionLog;
  const stepPanelTitle = showLogPanel ? "执行日志" : "实验步骤";

  const [videoCardHeaderEl, setVideoCardHeaderEl] = useState<HTMLDivElement | null>(null);
  const [logCardHeaderEl, setLogCardHeaderEl] = useState<HTMLDivElement | null>(null);
  const lab = labId ? getLabById(labId) : undefined;

  useEffect(() => {
    setViewIndex(0);
  }, [isObserve, setViewIndex]);

  const session = useMemo(() => {
    if (!labId) return null;
    if (isObserve) {
      return getObserveSessionByViewIndex(labId, viewIndex);
    }
    if (isQueuedView) {
      return getQueuedExperimentView(labId, viewIndex - 1);
    }
    return getSessionForLab(labId);
  }, [labId, isQueuedView, viewIndex, isObserve]);

  if (!lab || !session) {
    return (
      <PageContainer className="page-section empty-page">
        <div className="empty-state">
          <p>未找到该实验室</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <div
      className={[
        "workbench",
        isObserve ? "workbench--observe" : "",
        !showStepsCard ? "workbench--no-steps" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <PageContainer wide className="workbench-layout page-container--workbench">
        <div className="workbench-body">
          <div className="workbench-grid">
            <aside className="workbench-card workbench-card--intro">
              <div className="workbench-card-header">
                <span className="workbench-card-label">实验信息</span>
                <span
                  className={`intro-panel-status-badge ${
                    isObserve
                      ? isObserveQueued
                        ? "intro-panel-status-badge--queued"
                        : isObserveCompleted
                          ? "intro-panel-status-badge--done"
                          : "intro-panel-status-badge--running"
                      : isQueuedView
                        ? "intro-panel-status-badge--queued"
                        : "intro-panel-status-badge--running"
                  }`}
                >
                  {isObserve
                    ? isObserveQueued
                      ? "排队中"
                      : isObserveCompleted
                        ? "已完成"
                        : "进行中"
                    : isQueuedView
                      ? "排队中"
                      : "进行中"}
                </span>
              </div>
              <div className="workbench-card-body">
                <ExperimentIntroPanel
                  experimentName={session.experimentName}
                  intro={session.intro}
                  steps={session.steps}
                  variant="workbench"
                  isQueued={isObserve ? isObserveQueued : isQueuedView}
                  isCompleted={isObserveCompleted}
                  submittedAt={session.submittedAt}
                  completedAt={session.completedAt}
                />
              </div>
            </aside>

            <section className="workbench-card workbench-card--video" aria-label="视频流">
              <div className="workbench-card-header workbench-card-header--video">
                <span className="workbench-card-label">视频流</span>
                <div
                  ref={setVideoCardHeaderEl}
                  className="workbench-card-header-tools"
                  aria-label="视频流控制"
                />
              </div>
              <div className="workbench-card-body">
                <VideoStreamHub
                  labId={lab.id}
                  cameraCount={lab.cameras}
                  layout="workbench"
                  disabled={isObserve ? isObserveQueued : isQueuedView}
                  queued={isObserve ? isObserveQueued : isQueuedView}
                  replay={isObserveCompleted}
                  cardHeaderEl={videoCardHeaderEl}
                />
              </div>
            </section>

            {showStepsCard && (
              <section
                className="workbench-card workbench-card--steps"
                aria-label={stepPanelTitle}
              >
                <div
                  className={`workbench-card-header${showLogPanel ? " workbench-card-header--log" : ""}`}
                >
                  <span className="workbench-card-label">{stepPanelTitle}</span>
                  {showLogPanel && (
                    <div
                      ref={setLogCardHeaderEl}
                      className="workbench-card-header-tools"
                      aria-label="执行日志状态"
                    />
                  )}
                </div>
                <div className="workbench-card-body">
                  <CurrentStepPanel
                    steps={session.steps}
                    variant="sidebar"
                    queued={isObserve ? isObserveQueued : isQueuedView}
                    deviceStream={showLogPanel}
                    observeLog={showLogPanel && !showObserveLogEmpty ? session.observeLog : undefined}
                    observeLogEmpty={showObserveLogEmpty}
                    cardHeaderEl={showLogPanel ? logCardHeaderEl : undefined}
                  />
                </div>
              </section>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
