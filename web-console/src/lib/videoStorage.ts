import type { LabStreamConfig } from "../types";

const PREFIX = "smart-lab-streams:";

export function loadStreamConfig(labId: string): LabStreamConfig {
  try {
    const raw = localStorage.getItem(PREFIX + labId);
    if (raw) return JSON.parse(raw) as LabStreamConfig;
  } catch {
    /* ignore */
  }
  return { mainUrl: "", protocol: "auto" };
}

export function saveStreamConfig(labId: string, config: LabStreamConfig): void {
  localStorage.setItem(PREFIX + labId, JSON.stringify(config));
}
