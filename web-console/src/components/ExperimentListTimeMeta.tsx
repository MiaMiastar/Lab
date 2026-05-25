import { formatExperimentCompletedAt, formatExperimentSubmittedAt } from "../lib/experimentTime";
import type { WorkbenchExperimentStatus } from "../types";

interface ExperimentListTimeMetaProps {
  submittedAt?: string;
  completedAt?: string;
  status?: WorkbenchExperimentStatus;
}

export function ExperimentListTimeMeta({
  submittedAt,
  completedAt,
  status,
}: ExperimentListTimeMetaProps) {
  return (
    <span className="header-lab-queue-dropdown-times">
      <span className="header-lab-queue-dropdown-time">
        <span className="header-lab-queue-dropdown-time-label">提交</span>
        <span className="header-lab-queue-dropdown-time-value">
          {formatExperimentSubmittedAt(submittedAt)}
        </span>
      </span>
      <span className="header-lab-queue-dropdown-time">
        <span className="header-lab-queue-dropdown-time-label">完成</span>
        <span className="header-lab-queue-dropdown-time-value">
          {formatExperimentCompletedAt(completedAt, status)}
        </span>
      </span>
    </span>
  );
}
