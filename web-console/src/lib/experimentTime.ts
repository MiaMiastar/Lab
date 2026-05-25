import type { WorkbenchExperimentStatus } from "../types";

export function formatExperimentCompletedAt(
  completedAt: string | undefined,
  status?: WorkbenchExperimentStatus
): string {
  if (completedAt) return completedAt;
  if (status === "running" || status === "queued") return "--";
  return "—";
}

export function formatExperimentSubmittedAt(submittedAt: string | undefined): string {
  return submittedAt ?? "—";
}
