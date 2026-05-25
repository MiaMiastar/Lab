import type { ExperimentIntro, ExperimentReagent, ExperimentStep } from "../types";
import { formatExperimentCompletedAt, formatExperimentSubmittedAt } from "../lib/experimentTime";

interface ExperimentIntroPanelProps {
  experimentName: string;
  intro: ExperimentIntro;
  /** 工作台侧栏：摘要 + 详情始终展开 */
  variant?: "default" | "workbench";
  /** 工作台：用于实验名称下方进度条 */
  steps?: ExperimentStep[];
  /** 工作台：排队视图 */
  isQueued?: boolean;
  /** 工作台：已完成历史实验 */
  isCompleted?: boolean;
  /** 实验提交时间 */
  submittedAt?: string;
  /** 实验完成时间 */
  completedAt?: string;
  /** @deprecated 使用 variant="workbench" */
  compact?: boolean;
}

function computeStepProgress(steps: ExperimentStep[]): number {
  if (steps.length === 0) return 0;
  if (steps.every((s) => s.status === "done")) return 100;
  const activeIndex = steps.findIndex((s) => s.status === "active");
  if (activeIndex >= 0) {
    return Math.round(((activeIndex + 1) / steps.length) * 100);
  }
  const doneCount = steps.filter((s) => s.status === "done").length;
  return Math.round((doneCount / steps.length) * 100);
}

function PlanReagentList({ reagents }: { reagents: ExperimentReagent[] }) {
  if (reagents.length === 0) return null;

  return (
    <div className="intro-plan-reagents">
      <h5 className="intro-plan-reagents-heading">试剂表</h5>
      <div className="intro-reagent-table">
        <div className="intro-reagent-table-head" aria-hidden="true">
          <span>试剂</span>
          <span>用量</span>
        </div>
        <ul className="intro-reagent-list intro-reagent-list--table">
          {reagents.map((r) => (
            <li key={r.name} className="intro-reagent--row">
              <div className="intro-reagent-main">
                <span className="intro-reagent-name">{r.name}</span>
                <span className="intro-reagent-role">{r.role}</span>
              </div>
              <span className="intro-reagent-amount">{r.amount}</span>
              {(r.calculation || r.equiv) && (
                <p className="intro-reagent-detail" title={`${r.equiv} · ${r.calculation}`}>
                  <span className="intro-reagent-equiv">{r.equiv}</span>
                  {r.calculation ? (
                    <>
                      <span className="intro-reagent-detail-sep" aria-hidden="true">
                        ·
                      </span>
                      <span className="intro-reagent-calc">{r.calculation}</span>
                    </>
                  ) : null}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LegacyIntroSections({ intro }: { intro: ExperimentIntro }) {
  return (
    <>
      <section className="intro-section">
        <h4 className="intro-heading">实验目的</h4>
        <ul className="intro-list">
          {(intro.objectives ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="intro-section">
        <h4 className="intro-heading">仪器与材料</h4>
        <ul className="intro-list">
          {(intro.equipment ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      <section className="intro-section">
        <h4 className="intro-heading">安全须知</h4>
        <ul className="intro-list intro-list--safety">
          {(intro.safetyNotes ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

function WorkbenchGoalSection({
  experimentName,
  intro,
}: {
  experimentName: string;
  intro: ExperimentIntro;
}) {
  const goalText = intro.originalGoal ?? intro.summary ?? experimentName;
  const confirmedConditions = intro.confirmedConditions ?? [];

  return (
    <section className="intro-section intro-section--goal">
      <h4 className="intro-heading">实验目标</h4>
      <p className="intro-panel-goal-text">{goalText}</p>
      {confirmedConditions.length > 0 && (
        <div className="intro-confirmed">
          <span className="intro-confirmed-label">已确认条件</span>
          <ul className="intro-list">
            {confirmedConditions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function WorkbenchProgressSection({
  progress,
  showProgress,
  submittedAt,
  completedAt,
  experimentStatus,
  estimatedDuration,
}: {
  progress: number;
  showProgress: boolean;
  submittedAt?: string;
  completedAt?: string;
  experimentStatus: "queued" | "completed" | "running";
  estimatedDuration?: string;
}) {
  return (
    <section className="intro-section intro-section--progress">
      <h4 className="intro-heading">实验进度</h4>
      {showProgress && (
        <div className="intro-panel-progress-block">
          <span className="intro-panel-meta-label">进度</span>
          <div
            className="intro-panel-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`实验进度 ${progress}%`}
          >
            <div className="intro-panel-progress-track">
              <span className="intro-panel-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="intro-panel-progress-label">{progress}%</span>
          </div>
        </div>
      )}
      <div className="intro-panel-times">
        <div className="intro-panel-time">
          <span className="intro-panel-time-label">提交</span>
          <span className="intro-panel-time-value">{formatExperimentSubmittedAt(submittedAt)}</span>
        </div>
        <div className="intro-panel-time">
          <span className="intro-panel-time-label">完成</span>
          <span
            className={`intro-panel-time-value${
              !completedAt ? " intro-panel-time-value--placeholder" : ""
            }`}
          >
            {formatExperimentCompletedAt(completedAt, experimentStatus)}
          </span>
        </div>
        {estimatedDuration && (
          <div className="intro-panel-time">
            <span className="intro-panel-time-label">预计</span>
            <span className="intro-panel-time-value">{estimatedDuration}</span>
          </div>
        )}
      </div>
    </section>
  );
}

function WorkbenchPlanSection({ intro }: { intro: ExperimentIntro }) {
  const { plan, plans = plan ? [plan] : [], reagents = [] } = intro;

  return (
    <section className="intro-section intro-section--plan">
      <h4 className="intro-heading">实验方案</h4>
      {plans.length > 0 ? (
        <div className="intro-plan-list">
          {plans.map((candidate, index) => {
            const planReagents =
              candidate.reagents ??
              (plans.length === 1 && index === 0 ? reagents : []);

            return (
              <div key={candidate.title || candidate.conditions} className="intro-plan">
                {candidate.title ? (
                  <p className="intro-plan-title">{candidate.title}</p>
                ) : null}
                <p className="intro-plan-conditions">{candidate.conditions}</p>
                {candidate.rationale ? (
                  <p className="intro-plan-rationale">{candidate.rationale}</p>
                ) : null}
                {candidate.compliance ? (
                  <p className="intro-plan-compliance">
                    <span className="intro-plan-compliance-label">合规检查：</span>
                    {candidate.compliance}
                  </p>
                ) : null}
                <PlanReagentList reagents={planReagents} />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="intro-results-pending" aria-label="实验方案待生成">
          待生成
        </p>
      )}
    </section>
  );
}

function WorkbenchResultSection({
  intro,
  isQueued = false,
  isCompleted = false,
}: {
  intro: ExperimentIntro;
  isQueued?: boolean;
  isCompleted?: boolean;
}) {
  const { results = [] } = intro;
  const isRunning = !isQueued && !isCompleted;
  const showResultsPending =
    isQueued || (isRunning && results.length === 0 && !intro.resultsNote);

  return (
    <section className="intro-section intro-section--result">
      <h4 className="intro-heading">实验结果</h4>
      {isQueued ? (
        <p className="intro-results-pending" aria-label="实验结果待回传">
          待回传
        </p>
      ) : (
        <>
          {intro.resultsNote && (
            <p className="intro-text intro-text--workbench">{intro.resultsNote}</p>
          )}
          {results.length > 0 ? (
            <ul className="intro-results-list">
              {results.map((item) => (
                <li
                  key={`${item.label}-${item.value}`}
                  className={`intro-result intro-result--${item.status ?? "ready"}`}
                >
                  <span className="intro-result-label">{item.label}</span>
                  <span className="intro-result-value">{item.value}</span>
                </li>
              ))}
            </ul>
          ) : showResultsPending ? (
            <p className="intro-results-pending" aria-label="实验结果待回传">
              待回传
            </p>
          ) : (
            <p className="intro-results-pending" aria-label="实验结果待回传">
              待回传
            </p>
          )}
        </>
      )}
    </section>
  );
}

export function ExperimentIntroPanel({
  experimentName,
  intro,
  variant = "default",
  steps = [],
  isQueued = false,
  isCompleted = false,
  submittedAt,
  completedAt,
  compact = false,
}: ExperimentIntroPanelProps) {
  const isWorkbench = variant === "workbench" || compact;
  const progress = isWorkbench ? computeStepProgress(steps) : 0;
  const experimentStatus = isQueued ? "queued" : isCompleted ? "completed" : "running";

  const showProgress = isWorkbench && steps.length > 0;
  const panelClassName = isWorkbench
    ? "intro-panel intro-panel--workbench"
    : "surface intro-panel";

  return (
    <aside className={panelClassName}>
      {isWorkbench ? (
        <div className="intro-panel-body intro-panel-body--sections">
          <WorkbenchGoalSection experimentName={experimentName} intro={intro} />
          <WorkbenchProgressSection
            progress={progress}
            showProgress={showProgress}
            submittedAt={submittedAt}
            completedAt={completedAt}
            experimentStatus={experimentStatus}
            estimatedDuration={intro.estimatedDuration}
          />
          <WorkbenchPlanSection intro={intro} />
          <WorkbenchResultSection
            intro={intro}
            isQueued={isQueued}
            isCompleted={isCompleted}
          />
        </div>
      ) : (
        <>
          <div className="intro-panel-head">
            <div className="panel-title">实验信息</div>
          </div>
          <h3 className="intro-experiment-name">{experimentName}</h3>
          {intro.summary && (
            <section className="intro-section intro-section--summary">
              <p className="intro-text">{intro.summary}</p>
            </section>
          )}
          <LegacyIntroSections intro={intro} />
          {intro.estimatedDuration && (
            <div className="intro-meta">
              <span className="intro-meta-label">预计时长</span>
              <span className="intro-meta-value">{intro.estimatedDuration}</span>
            </div>
          )}
        </>
      )}
    </aside>
  );
}
