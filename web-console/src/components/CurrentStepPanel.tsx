import type { DeviceLogEvent, ExperimentStep } from "../types";
import { DeviceLogStream } from "./DeviceLogStream";

interface CurrentStepPanelProps {
  steps: ExperimentStep[];
  variant?: "rail" | "sidebar";
  queued?: boolean;
  deviceStream?: boolean;
  observeLog?: {
    fullLog: DeviceLogEvent[];
  };
  /** 观察模式排队：执行日志空状态 */
  observeLogEmpty?: boolean;
  /** 工作台：将「日志写入中」渲染到卡片头部标题右侧 */
  cardHeaderEl?: HTMLElement | null;
}

function stepNodeLabel(
  status: ExperimentStep["status"],
  index: number,
  queued: boolean
): string {
  if (queued) return "待";
  if (status === "done") return "✓";
  return String(index + 1);
}

export function CurrentStepPanel({
  steps,
  variant = "rail",
  queued = false,
  deviceStream = false,
  observeLog,
  observeLogEmpty = false,
  cardHeaderEl,
}: CurrentStepPanelProps) {
  const activeIndex = steps.findIndex((s) => s.status === "active");
  const activeStep = activeIndex >= 0 ? steps[activeIndex] : null;
  const allDone = steps.length > 0 && steps.every((s) => s.status === "done");
  const isSidebar = variant === "sidebar";
  const hasObserveLog = Boolean(deviceStream && observeLog && observeLog.fullLog.length > 0);

  if (deviceStream && (observeLogEmpty || (hasObserveLog && !queued))) {
    return (
      <section className="surface current-step-panel current-step-panel--observe">
        <DeviceLogStream
          fullLog={observeLogEmpty ? [] : observeLog!.fullLog}
          cardHeaderEl={cardHeaderEl}
          emptyMessage={observeLogEmpty ? "暂无执行日志" : undefined}
          idle={observeLogEmpty}
        />
      </section>
    );
  }

  return (
    <section
      className={`surface current-step-panel ${isSidebar ? "current-step-panel--sidebar" : "current-step-panel--horizontal"} ${queued ? "current-step-panel--queued" : ""} ${deviceStream ? "current-step-panel--device-stream" : ""}`}
    >
      <div className="current-step-header">
        <div className="current-step-header-main">
          <div className="panel-title">实验步骤</div>
          {deviceStream && !queued && (
            <p className="current-step-active-desc current-step-active-desc--inline current-step-active-desc--stream">
              设备流 · 日志实录
            </p>
          )}
          {!deviceStream && !isSidebar && !queued && activeStep && (
            <p className="current-step-active-desc current-step-active-desc--inline">
              {activeStep.description}
            </p>
          )}
        </div>
        {queued ? (
          <span className="current-step-counter current-step-counter--queued">待开始</span>
        ) : (
          steps.length > 0 && (
            <span className="current-step-counter">
              {allDone ? "已完成" : `第 ${activeIndex >= 0 ? activeIndex + 1 : steps.length} / ${steps.length} 步`}
            </span>
          )
        )}
      </div>

      {steps.length === 0 ? (
        <p className="current-step-empty">{queued ? "排队中，步骤待开始。" : "暂无实验步骤。"}</p>
      ) : isSidebar ? (
        <ol className="step-list" aria-label="实验步骤">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={`step-list-item step-list-item--${step.status}`}
              aria-current={step.status === "active" ? "step" : undefined}
            >
              <span className="step-list-marker">{stepNodeLabel(step.status, index, queued)}</span>
              <div className="step-list-body">
                <span className="step-list-title">{step.title}</span>
                {queued && <span className="step-list-state">待开始</span>}
                {!queued && step.status === "active" && (
                  <span className="step-list-desc">{step.description}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <ol className="step-rail" aria-label="实验步骤">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const connectorDone = step.status === "done";
            return (
              <li
                key={step.id}
                className={`step-rail-item step-rail-item--${step.status}`}
                aria-current={step.status === "active" ? "step" : undefined}
              >
                <div className="step-rail-cell">
                  <span className="step-rail-node">{stepNodeLabel(step.status, index, queued)}</span>
                  <span className="step-rail-title">{step.title}</span>
                  {queued && <span className="step-rail-state">待开始</span>}
                </div>
                {!isLast && (
                  <span
                    className={`step-rail-connector ${connectorDone ? "step-rail-connector--done" : ""}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      )}

      {allDone && !deviceStream && (
        <p className="current-step-complete">全部步骤已完成。</p>
      )}
    </section>
  );
}
