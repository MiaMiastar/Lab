import { useEffect, useRef, useState } from "react";
import { getLabPreviewStreamUrl } from "../lib/streams";
import type { Lab } from "../types";
import { PreviewStreamSwitch } from "./PreviewStreamSwitch";
import { LivePlayer } from "./video/LivePlayer";

interface LabCardPreviewProps {
  lab: Lab;
}

/** 可切换预览流开关（空闲 / 实验中） */
function canTogglePreviewStream(lab: Lab): boolean {
  return lab.status === "idle" || lab.status === "busy";
}

/** 展示视频区占位（含待接入：未开启且不可打开） */
function showPreviewPanel(lab: Lab): boolean {
  return canTogglePreviewStream(lab) || lab.status === "awaiting";
}

function initialReceiving(lab: Lab): boolean {
  if (!canTogglePreviewStream(lab)) return false;
  return lab.previewStreamEnabled !== false;
}

export function LabCardPreview({ lab }: LabCardPreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const streamToggleEnabled = canTogglePreviewStream(lab);
  const [receiving, setReceiving] = useState(() => initialReceiving(lab));

  const previewPanel = showPreviewPanel(lab);
  const streamOff = previewPanel && !receiving;
  const streamLocked = lab.status === "awaiting";

  const streamUrl =
    streamToggleEnabled && receiving ? getLabPreviewStreamUrl(lab.previewStreamUrl) : null;

  const showLive = !!streamUrl;

  useEffect(() => {
    if (!streamToggleEnabled) {
      setReceiving(false);
      return;
    }
    setReceiving(initialReceiving(lab));
  }, [lab.id, lab.previewStreamEnabled, lab.status, streamToggleEnabled]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "120px", threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const overlayLabel =
    lab.status === "offline"
      ? "离线 · 无视频"
      : lab.status === "maintenance"
        ? "维护中"
        : null;

  const streamOffHint = streamLocked ? "待接入，暂不可开启" : "打开开关即可查看";

  const previewClass = [
    "lab-card-preview",
    !showLive && "lab-card-preview--off",
    streamOff && "lab-card-preview--stream-off",
    streamLocked && "lab-card-preview--stream-locked",
    receiving && "lab-card-preview--live",
  ]
    .filter(Boolean)
    .join(" ");

  const stopBubble = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div ref={wrapRef} className={previewClass}>
      {streamUrl ? (
        <LivePlayer
          streamUrl={streamUrl}
          active={inView}
          showControls={false}
          muted
        />
      ) : (
        <div className="lab-card-preview-placeholder">
          <span className="lab-card-preview-icon" aria-hidden="true">
            {streamOff ? "▣" : "◎"}
          </span>
        </div>
      )}

      {streamOff && (
        <>
          <span className="lab-card-preview-off-badge">未开启</span>
          <div
            className="lab-card-preview-overlay lab-card-preview-overlay--stream-off"
            aria-hidden="true"
          />
          <div className="lab-card-preview-topbar lab-card-preview-topbar--center">
            <div className="lab-card-preview-center">
              <PreviewStreamSwitch
                checked={receiving}
                onChange={setReceiving}
                ariaLabel={streamLocked ? "视频流暂不可开启" : "开启视频流预览"}
                disabled={streamLocked}
                onPointerClick={stopBubble}
              />
              <span className="lab-card-preview-overlay-hint">{streamOffHint}</span>
            </div>
          </div>
        </>
      )}

      {overlayLabel && (
        <div className="lab-card-preview-overlay">
          <span className="lab-card-preview-overlay-title">{overlayLabel}</span>
        </div>
      )}

      {streamToggleEnabled && receiving && (
        <span
          className="lab-card-preview-receiving-badge"
          onClick={stopBubble}
          onKeyDown={stopBubble}
        >
          <span className="lab-card-preview-receiving-dot" aria-hidden="true" />
          <span className="lab-card-preview-receiving-text">接收中</span>
          <span className="lab-card-preview-switch-in-badge">
            <PreviewStreamSwitch
              checked={receiving}
              onChange={setReceiving}
              ariaLabel="关闭视频流预览"
              size="sm"
              onPointerClick={stopBubble}
            />
          </span>
        </span>
      )}

      {previewPanel && lab.cameras > 0 && (
        <span className="lab-card-preview-cams">{lab.cameras} 机位</span>
      )}
    </div>
  );
}
