import type { Discipline } from "../types";

/**
 * 演示素材：自动化实验近景（demo 用途）
 */
const localVideo = (file: string) => `/videos/${file}`;
const AUTOMATED_EXPERIMENT_CLOSEUP_STREAM = localVideo("high-throughput-lab.mp4");

export const HIGH_THROUGHPUT_LAB_VIDEOS = {
  /** 自动化实验设备近景 */
  automatedExperimentCloseup: AUTOMATED_EXPERIMENT_CLOSEUP_STREAM,
  /** @deprecated 使用 automatedExperimentCloseup */
  automatedAnalyzers: AUTOMATED_EXPERIMENT_CLOSEUP_STREAM,
  /** @deprecated 使用 automatedExperimentCloseup */
  modernLab: AUTOMATED_EXPERIMENT_CLOSEUP_STREAM,
  /** @deprecated 使用 automatedExperimentCloseup */
  labTeam: AUTOMATED_EXPERIMENT_CLOSEUP_STREAM,
  /** @deprecated 使用 automatedExperimentCloseup */
  labInstrument: AUTOMATED_EXPERIMENT_CLOSEUP_STREAM,
} as const;

/** @deprecated 使用 HIGH_THROUGHPUT_LAB_VIDEOS */
export const ROBOT_LAB_VIDEOS = HIGH_THROUGHPUT_LAB_VIDEOS;

/** @deprecated 使用 HIGH_THROUGHPUT_LAB_VIDEOS */
export const LAB_EXPERIMENT_VIDEOS = HIGH_THROUGHPUT_LAB_VIDEOS;

/** 默认演示流：自动化实验设备近景 */
export const DEFAULT_LAB_STREAM = HIGH_THROUGHPUT_LAB_VIDEOS.automatedExperimentCloseup;

/** @deprecated 使用 DEFAULT_LAB_STREAM */
export const DEFAULT_HLS_STREAM = DEFAULT_LAB_STREAM;

export const DEFAULT_MP4_STREAM = DEFAULT_LAB_STREAM;

export function getLabStreamPlayUrl(_angleId: string, _discipline?: Discipline): string {
  return DEFAULT_LAB_STREAM;
}

export function getLabPreviewStreamUrl(explicit?: string | null): string | null {
  if (explicit === null) return null;
  if (explicit) return explicit;
  return DEFAULT_LAB_STREAM;
}
