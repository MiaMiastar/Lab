import { Link } from "react-router-dom";
import { InstitutionLogo } from "./InstitutionLogo";
import { LabCardPreview } from "./LabCardPreview";
import { CARD_STATUS_LABELS, MAX_COMPLETED_EXPERIMENTS } from "../data/mock";
import type { Lab } from "../types";

interface LabCardProps {
  lab: Lab;
}

export function LabCard({ lab }: LabCardProps) {
  const disabled =
    lab.status === "maintenance" || lab.status === "offline" || lab.status === "awaiting";
  const canObserve = lab.status === "busy";
  const workbenchTo = canObserve ? `/workbench/${lab.id}?observe=1` : `/workbench/${lab.id}`;
  const logoVariant = lab.institutionLogoVariant ?? "default";
  const completedExperimentCount = Math.min(
    MAX_COMPLETED_EXPERIMENTS,
    Math.max(0, lab.completedExperimentCount)
  );

  return (
    <article
      className={`lab-card lab-card--${lab.status} ${disabled ? "lab-card--disabled" : "lab-card--actionable"}`}
    >
      {lab.status === "awaiting" && (
        <span className="lab-card-awaiting-tag" aria-label="待接入">
          待接入
        </span>
      )}

      <header className="lab-card-org">
        <InstitutionLogo
          logo={lab.institutionLogo}
          variant={logoVariant}
          modifierClass="lab-card-org-logo"
        />
        <div className="lab-card-org-text">
          <span className="lab-card-org-name">{lab.institutionName}</span>
          <p className="lab-card-org-sub">{lab.institutionSubtitle}</p>
        </div>
      </header>

      <LabCardPreview lab={lab} />

      <div className="lab-card-inner">
        <div className="lab-card-decor" aria-hidden="true" />

        <section className="lab-card-experiment" aria-label="实验场景">
          <div className="lab-card-head">
            <h3 className="lab-card-title">{lab.workflowTitle}</h3>
            {lab.status !== "awaiting" && (
              <div className="lab-card-status-badge" aria-label={`状态：${CARD_STATUS_LABELS[lab.status]}`}>
                <span className={`lab-card-status-dot lab-card-status-dot--${lab.status}`} />
                <span className="lab-card-status-text">{CARD_STATUS_LABELS[lab.status]}</span>
              </div>
            )}
          </div>

          <div className="lab-card-meta">
            <span
              className={`lab-card-queue ${lab.queueLength > 0 ? "lab-card-queue--has" : ""}`}
              aria-label={`排队中 ${lab.queueLength} 个`}
            >
              <span className="lab-card-queue-label">排队中</span>
              <span className="lab-card-queue-value">{lab.queueLength}</span>
            </span>
            <span
              className="lab-card-completed"
              aria-label={`已完成实验 ${completedExperimentCount} 个`}
            >
              <span className="lab-card-completed-label">已完成</span>
              <span className="lab-card-completed-value">{completedExperimentCount}</span>
            </span>
          </div>

          <p className="lab-card-desc">{lab.cardDescription}</p>

          <div className="lab-card-actions">
            {disabled ? (
              <button type="button" className="btn btn-primary lab-card-view-btn" disabled>
                查看实验
              </button>
            ) : (
              <Link to={workbenchTo} className="btn btn-primary lab-card-view-btn">
                查看实验
              </Link>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
