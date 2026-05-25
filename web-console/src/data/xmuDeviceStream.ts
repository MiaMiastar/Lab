import type { DeviceLogEvent, ExperimentStep, JiaxingDeviceStreamData, JiaxingObserveMeta } from "../types";
import streamJson from "./xmuDeviceStream.json";

const data = streamJson as JiaxingDeviceStreamData & {
  meta: JiaxingObserveMeta & { requestId?: string };
};

/** 厦门大学高分子平台 · 完整实验日志（由 厦大.docx 解析） */
export const xmuObserveMeta = data.meta;
export const xmuObserveSteps: ExperimentStep[] = data.steps;
export const xmuObserveFullLog: DeviceLogEvent[] = data.fullLog;
