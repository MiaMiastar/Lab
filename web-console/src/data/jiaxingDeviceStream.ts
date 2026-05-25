import type { DeviceLogEvent, ExperimentStep, JiaxingDeviceStreamData, JiaxingObserveMeta } from "../types";
import streamJson from "./jiaxingDeviceStream.json";

const data = streamJson as JiaxingDeviceStreamData;

/** 嘉兴电化学 · 完整实验日志（由 日志.log 解析） */
export const jiaxingObserveMeta: JiaxingObserveMeta = data.meta;
export const jiaxingObserveSteps: ExperimentStep[] = data.steps;
export const jiaxingObserveFullLog: DeviceLogEvent[] = data.fullLog;
