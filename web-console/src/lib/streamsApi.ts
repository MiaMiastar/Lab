import { getLabById } from "../data/mock";
import { getLabStreamPlayUrl } from "./streams";
import type { Discipline } from "../types";

/**
 * 实时推流 API（边缘 Agent 推流 → 中心转 HLS/WebRTC → 工作台拉流播放）
 * GET /api/v1/labs/{labId}/streams
 */
export interface LabStreamDto {
  id: string;
  playUrl: string;
  protocol: "hls" | "mp4" | "webrtc";
  label: string;
}

export interface LabStreamsResponse {
  labId: string;
  streams: LabStreamDto[];
  expiresAt: string;
}

/** 各学科机位：1 路全景 + 多路仪器（生产环境由平台下发完整列表） */
const ANGLE_CATALOG: Record<Discipline, { id: string; label: string }[]> = {
  electronics: [
    { id: "panorama", label: "全景 · 实验台" },
    { id: "oscilloscope", label: "仪器 · 示波器" },
    { id: "multimeter", label: "仪器 · 万用表" },
    { id: "power_supply", label: "仪器 · 直流电源" },
    { id: "signal_gen", label: "仪器 · 信号源" },
  ],
  chemistry: [
    { id: "panorama", label: "全景 · 实验台" },
    { id: "fume_hood", label: "仪器 · 通风橱" },
    { id: "titration", label: "仪器 · 滴定管" },
    { id: "balance", label: "仪器 · 电子天平" },
    { id: "reactor", label: "仪器 · 反应釜" },
  ],
  physics: [
    { id: "panorama", label: "全景 · 光学平台" },
    { id: "optical_path", label: "仪器 · 光路平台" },
    { id: "laser", label: "仪器 · 激光器" },
    { id: "interferometer", label: "仪器 · 干涉仪" },
  ],
  biology: [
    { id: "panorama", label: "全景 · 实验台" },
    { id: "microscope", label: "仪器 · 显微镜" },
    { id: "incubator", label: "仪器 · 培养箱" },
    { id: "stage", label: "仪器 · 载物台" },
  ],
  engineering: [
    { id: "panorama", label: "全景 · 产线" },
    { id: "robot_arm", label: "仪器 · 机械臂" },
    { id: "plc_screen", label: "仪器 · PLC 屏" },
    { id: "vision", label: "仪器 · 视觉相机" },
    { id: "conveyor", label: "仪器 · 传送带" },
    { id: "test_station", label: "仪器 · 检测工位" },
  ],
};

const FALLBACK_ANGLES = [
  { id: "panorama", label: "全景 · 实验台" },
  { id: "instrument_1", label: "仪器 · 1" },
  { id: "instrument_2", label: "仪器 · 2" },
  { id: "instrument_3", label: "仪器 · 3" },
];

function buildStreamsForLab(labId: string): LabStreamDto[] {
  const lab = getLabById(labId);
  const catalog = lab ? ANGLE_CATALOG[lab.discipline] : FALLBACK_ANGLES;
  const discipline = lab?.discipline;

  return catalog.map((angle) => ({
    id: angle.id,
    label: angle.label,
    protocol: "mp4" as const,
    playUrl: getLabStreamPlayUrl(angle.id, discipline),
  }));
}

export async function fetchLabStreams(labId: string): Promise<LabStreamsResponse> {
  await new Promise((r) => setTimeout(r, 400));

  return {
    labId,
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    streams: buildStreamsForLab(labId),
  };
}
