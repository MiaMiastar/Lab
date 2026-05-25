export type LabStatus = "idle" | "busy" | "maintenance" | "offline" | "awaiting";
export type Discipline = "electronics" | "chemistry" | "physics" | "biology" | "engineering";
export type StepStatus = "pending" | "active" | "done" | "error";

export type StreamProtocol = "hls" | "mp4" | "webrtc" | "auto";
export type StreamConnectionStatus = "idle" | "connecting" | "playing" | "error";

export interface LabStreamConfig {
  mainUrl: string;
  protocol: StreamProtocol;
}

export interface ExperimentScenario {
  id: string;
  /** 实验场景名称，如「ATA 反应条件优化」 */
  title: string;
}

export interface Lab {
  id: string;
  name: string;
  campus: string;
  discipline: Discipline;
  status: LabStatus;
  cameras: number;
  queueLength: number;
  /** 本实验室累计已完成实验数 */
  completedExperimentCount: number;
  maxConcurrent: number;
  currentUsers: number;
  tags: string[];
  lastHeartbeat: string;
  /** 关联实验场景 ID */
  experimentScenarioId: string;
  /** 卡片主标题（实验场景名称，与 ExperimentScenario.title 一致） */
  workflowTitle: string;
  /** 卡片简介 */
  cardDescription: string;
  /** 机构/平台 */
  institutionName: string;
  institutionSubtitle: string;
  /** 机构 Logo 图片路径（/images/institutions/...）或后备文字 */
  institutionLogo: string;
  /** 机构 Logo 样式：默认圆形、宽版横向（如 SICCAS） */
  institutionLogoVariant?: "default" | "red" | "wide";
  /** 卡片预览流是否已开启（未开启时显示占位，不拉流） */
  previewStreamEnabled?: boolean;
  /** 卡片预览流地址（MP4 / HLS），离线可为空 */
  previewStreamUrl?: string | null;
}

export interface DeviceLogEvent {
  timestamp: string;
  message: string;
  device: string;
  phaseId?: string;
  phaseTitle?: string;
}

export interface JiaxingObserveMeta {
  startedAt: string;
  finishedAt: string;
  queue: string[];
  totalEvents: number;
  logSource: string;
  experimentLabel?: string;
  results?: string[];
}

export interface JiaxingDeviceStreamData {
  meta: JiaxingObserveMeta;
  steps: ExperimentStep[];
  fullLog: DeviceLogEvent[];
}

export interface ExperimentStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  commandType: string;
  /** 观察模式：该步骤下的设备日志事件 */
  events?: DeviceLogEvent[];
}

export interface InstructionDraftLine {
  op: string;
  detail: string;
}

export interface ExperimentReagent {
  name: string;
  role: string;
  amount: string;
  calculation: string;
  equiv: string;
}

export interface ExperimentPlanBlock {
  title?: string;
  conditions: string;
  rationale: string;
  compliance: string;
  /** 方案关联试剂表 */
  reagents?: ExperimentReagent[];
}

export interface ExperimentResultItem {
  label: string;
  value: string;
  status?: "ready" | "pending" | "failed";
}

export interface ExperimentIntro {
  /** 工作台：原始目标 */
  originalGoal?: string;
  /** 工作台：已确认条件 */
  confirmedConditions?: string[];
  instructionDraft?: InstructionDraftLine[];
  plan?: ExperimentPlanBlock;
  /** 工作台：多候选实验方案 */
  plans?: ExperimentPlanBlock[];
  reagents?: ExperimentReagent[];
  safetyChecks?: string[];
  /** 工作台：实验结果 */
  results?: ExperimentResultItem[];
  resultsNote?: string;
  /** 通用摘要（旧版面板） */
  summary?: string;
  objectives?: string[];
  equipment?: string[];
  safetyNotes?: string[];
  estimatedDuration?: string;
}

export type WorkbenchExperimentStatus = "running" | "queued" | "completed";

export interface WorkbenchExperimentListItem {
  id: string;
  experimentName: string;
  status: WorkbenchExperimentStatus;
  subtitle?: string;
  /** 实验提交时间 */
  submittedAt?: string;
  /** 实验完成时间（进行中/排队中可为空） */
  completedAt?: string;
}

export interface JiaxingObserveQueueBundle {
  running: WorkbenchExperimentListItem;
  queued: WorkbenchExperimentListItem[];
  completed: WorkbenchExperimentListItem[];
}

export interface SessionInfo {
  labId: string;
  experimentName: string;
  intro: ExperimentIntro;
  steps: ExperimentStep[];
  /** 实验提交时间 */
  submittedAt?: string;
  /** 实验完成时间（进行中/排队中可为空） */
  completedAt?: string;
  /** 观察模式：完整设备流日志 */
  observeLog?: {
    meta: JiaxingObserveMeta;
    fullLog: DeviceLogEvent[];
  };
}

