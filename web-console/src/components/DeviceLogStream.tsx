import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DeviceLogEvent } from "../types";

/** 设备名称 → 样式类（每种设备独立配色） */
const DEVICE_CLASS: Record<string, string> = {
  下料电机: "dm-feed-down",
  推料电机: "dm-feed-push",
  升降电机: "dm-lift",
  平移电机: "dm-translate",
  振动电机: "dm-vibrate",
  电动阀: "dm-valve",
  电爪: "dm-gripper",
  蠕动泵组: "dm-pump",
  液路系统: "dm-fluid",
  电化学工作站: "dm-electrochem",
  自动化平台: "dm-platform",
  /* 厦门大学高分子干实验 */
  API网关: "dm-api",
  指令解析: "dm-parser",
  反应器1: "dm-reactor",
  工艺流程: "dm-process",
  状态服务: "dm-status",
  实验平台: "dm-platform",
  液体处理工作站: "dm-fluid",
  培养箱: "dm-process",
  酶标仪: "dm-electrochem",
};

function deviceClass(device: string): string {
  return DEVICE_CLASS[device] ?? "dm-platform";
}

/** 相对真实时间的回放倍率（约 16 分钟实验在 ~25 秒内播完） */
const PLAYBACK_SPEED = 42;
const MIN_LINE_DELAY_MS = 35;
const MAX_LINE_DELAY_MS = 1200;
const FIRST_LINE_DELAY_MS = 280;

function parseTimestampMs(ts: string): number {
  const normalized = ts.replace(" ", "T");
  const ms = Date.parse(normalized);
  return Number.isNaN(ms) ? 0 : ms;
}

/** 展示用：拆分为时间（上）、日期（下），数据源为 `YYYY-MM-DD HH:mm:ss` */
function splitLogTimestamp(ts: string): { time: string; date: string } {
  const trimmed = ts.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (match) return { date: match[1], time: match[2] };
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx > 0) {
    return { date: trimmed.slice(0, spaceIdx), time: trimmed.slice(spaceIdx + 1).trim() };
  }
  return { date: "", time: trimmed };
}

interface DeviceLogStreamProps {
  fullLog: DeviceLogEvent[];
  /** 工作台：将状态标签渲染到卡片头部标题右侧 */
  cardHeaderEl?: HTMLElement | null;
  /** 无日志时的占位文案 */
  emptyMessage?: string;
  /** 静态空状态：不播放、不显示「日志写入中」 */
  idle?: boolean;
}

export function DeviceLogStream({
  fullLog,
  cardHeaderEl = null,
  emptyMessage = "等待执行日志…",
  idle = false,
}: DeviceLogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const playbackTokenRef = useRef(0);

  const lineDelays = useMemo(() => {
    if (fullLog.length === 0) return [];
    let prevMs = parseTimestampMs(fullLog[0].timestamp);
    return fullLog.map((event, index) => {
      const ms = parseTimestampMs(event.timestamp);
      if (index === 0) return FIRST_LINE_DELAY_MS;
      const delta = Math.max(0, ms - prevMs);
      prevMs = ms;
      const scaled = delta / PLAYBACK_SPEED;
      return Math.min(MAX_LINE_DELAY_MS, Math.max(MIN_LINE_DELAY_MS, scaled));
    });
  }, [fullLog]);

  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(!idle && fullLog.length > 0);

  const startPlayback = useCallback(() => {
    playbackTokenRef.current += 1;
    const token = playbackTokenRef.current;
    setVisibleCount(0);
    setPlaying(true);

    let index = 0;
    const schedule = () => {
      if (playbackTokenRef.current !== token) return;
      if (index >= fullLog.length) {
        setPlaying(false);
        return;
      }
      const delay = lineDelays[index] ?? MIN_LINE_DELAY_MS;
      window.setTimeout(() => {
        if (playbackTokenRef.current !== token) return;
        setVisibleCount(index + 1);
        index += 1;
        schedule();
      }, delay);
    };
    schedule();
  }, [fullLog.length, lineDelays]);

  useEffect(() => {
    if (idle || fullLog.length === 0) {
      playbackTokenRef.current += 1;
      setVisibleCount(0);
      setPlaying(false);
      return;
    }
    startPlayback();
    return () => {
      playbackTokenRef.current += 1;
    };
  }, [startPlayback, fullLog, idle]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: playing ? "smooth" : "auto" });
  }, [visibleCount, playing]);

  const visibleEvents = fullLog.slice(0, visibleCount);
  const statusInCardHeader = cardHeaderEl != null;

  const liveStatusBadge = playing ? (
    <span className="device-log-stream-label device-log-stream-label--live">
      <span className="device-log-stream-label-dot" aria-hidden="true" />
      日志写入中
    </span>
  ) : null;

  return (
    <div className={`device-log-stream${statusInCardHeader ? " device-log-stream--header-in-card" : ""}`}>
      {statusInCardHeader && liveStatusBadge && createPortal(liveStatusBadge, cardHeaderEl)}
      {!statusInCardHeader && playing && (
        <div className="device-log-stream-toolbar">
          {liveStatusBadge}
        </div>
      )}

      <div
        ref={scrollRef}
        className="device-log-stream-viewport"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {visibleEvents.length === 0 && (
          <p className="device-log-stream-placeholder">{emptyMessage}</p>
        )}
        {visibleEvents.map((event, i) => {
          const dm = deviceClass(event.device);
          const { time, date } = splitLogTimestamp(event.timestamp);
          return (
            <div
              key={`${event.timestamp}-${i}`}
              className={`device-log-line device-log-line--${dm} ${i === visibleCount - 1 && playing ? "device-log-line--new" : ""}`}
            >
              <span className="device-log-ts" title={event.timestamp}>
                <span className="device-log-ts-time">{time}</span>
                {date ? <span className="device-log-ts-date">{date}</span> : null}
              </span>
              <span className={`device-log-tag device-log-tag--${dm}`}>{event.device}</span>
              <span className="device-log-msg">{event.message}</span>
            </div>
          );
        })}
        {playing && visibleCount > 0 && (
          <div className="device-log-cursor" aria-hidden="true">
            <span className="device-log-cursor-blink">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}
