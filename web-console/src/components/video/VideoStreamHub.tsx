import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { fetchLabStreams, type LabStreamDto } from "../../lib/streamsApi";
import type { StreamConnectionStatus } from "../../types";
import { LivePlayer } from "./LivePlayer";

interface VideoStreamHubProps {
  labId: string;
  cameraCount: number;
  /** workbench：主画面在上，全部机位横向排列在下方 */
  layout?: "default" | "workbench";
  /** 排队视图：不拉流，控件不可用 */
  disabled?: boolean;
  /** 排队视图：卡片头部显示「待接收」 */
  queued?: boolean;
  /** 已完成实验：播放录像并展示回放标签 */
  replay?: boolean;
  /** 工作台：将接收中 / 机位数 / 开关渲染到卡片头部容器 */
  cardHeaderEl?: HTMLElement | null;
}

function sortPanoramaFirst(streams: LabStreamDto[]): LabStreamDto[] {
  const idx = streams.findIndex(
    (s) => s.id === "panorama" || s.label.includes("全景")
  );
  if (idx <= 0) return streams;
  const ordered = [...streams];
  const [panorama] = ordered.splice(idx, 1);
  return [panorama, ...ordered];
}

function gridLayoutClass(count: number): string {
  if (count <= 1) return "video-hub-grid--angles-1";
  return "video-hub-grid--angles-multi";
}

function isPanoramaStream(stream: LabStreamDto): boolean {
  return stream.id === "panorama" || stream.label.includes("全景");
}

type WebkitFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type WebkitFullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

function getFullscreenElement(): Element | null {
  const doc = document as WebkitFullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function requestFullscreen(target: HTMLElement): Promise<void> {
  const fullscreenTarget = target as WebkitFullscreenElement;
  const request = target.requestFullscreen ?? fullscreenTarget.webkitRequestFullscreen;
  if (!request) return;
  await request.call(target);
}

async function exitFullscreen(): Promise<void> {
  const doc = document as WebkitFullscreenDocument;
  const exit = document.exitFullscreen ?? doc.webkitExitFullscreen;
  if (!exit) return;
  await exit.call(document);
}

function splitStreams(
  streams: LabStreamDto[],
  primaryStreamId: string | null
): {
  primary: LabStreamDto | null;
  details: LabStreamDto[];
} {
  if (!streams.length) return { primary: null, details: [] };

  const selected =
    primaryStreamId != null
      ? streams.find((s) => s.id === primaryStreamId) ?? null
      : null;

  if (selected) {
    return {
      primary: selected,
      details: streams.filter((s) => s.id !== selected.id),
    };
  }

  const primaryIdx = streams.findIndex(isPanoramaStream);
  if (primaryIdx < 0) {
    return { primary: streams[0] ?? null, details: streams.slice(1) };
  }
  return {
    primary: streams[primaryIdx],
    details: streams.filter((_, i) => i !== primaryIdx),
  };
}

interface VideoHubSlotProps {
  stream: LabStreamDto;
  variant: "primary" | "detail";
  receiving: boolean;
  replay?: boolean;
  status: StreamConnectionStatus;
  statusLabel: Record<StreamConnectionStatus, string>;
  onStatusChange: (status: StreamConnectionStatus) => void;
  onPromoteToPrimary?: () => void;
  showPromote?: boolean;
  isActivePrimary?: boolean;
  fullscreenRootSelector?: string;
  onFullscreenStreamRequest?: (streamId: string) => void;
}

function VideoHubSlot({
  stream,
  variant,
  receiving,
  replay = false,
  status,
  statusLabel,
  onStatusChange,
  onPromoteToPrimary,
  showPromote,
  isActivePrimary = false,
  fullscreenRootSelector,
  onFullscreenStreamRequest,
}: VideoHubSlotProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [fullscreenActive, setFullscreenActive] = useState(false);

  const getFullscreenTarget = () => {
    const frame = frameRef.current;
    if (!frame) return null;
    return fullscreenRootSelector
      ? frame.closest<HTMLElement>(fullscreenRootSelector) ?? frame
      : frame;
  };

  useEffect(() => {
    const updateFullscreenState = () => {
      const target = getFullscreenTarget();
      const fullscreenElement = getFullscreenElement();
      setFullscreenActive(Boolean(target && fullscreenElement === target));
    };

    updateFullscreenState();
    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);
    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener("webkitfullscreenchange", updateFullscreenState);
    };
  }, [fullscreenRootSelector]);

  const handleToggleFullscreen = (event: MouseEvent) => {
    event.stopPropagation();
    onFullscreenStreamRequest?.(stream.id);

    const target = getFullscreenTarget();
    if (!target) return;

    void (async () => {
      const fullscreenElement = getFullscreenElement();
      if (fullscreenElement && fullscreenElement === target) {
        await exitFullscreen();
        return;
      }
      await requestFullscreen(target);
    })().catch(() => setFullscreenActive(false));
  };

  return (
    <div
      className={`video-hub-slot video-hub-slot--${variant}${isActivePrimary ? " video-hub-slot--active-primary" : ""}${variant === "detail" && !isActivePrimary && onPromoteToPrimary ? " video-hub-slot--selectable" : ""}`}
      onClick={
        variant === "detail" && !isActivePrimary && onPromoteToPrimary
          ? onPromoteToPrimary
          : undefined
      }
      role={variant === "detail" ? "option" : undefined}
      aria-selected={variant === "detail" ? isActivePrimary : undefined}
    >
      <div ref={frameRef} className="video-frame">
        <LivePlayer
          streamUrl={stream.playUrl}
          active={receiving && !!stream.playUrl.trim()}
          showControls={false}
          onStatusChange={onStatusChange}
        />
        <div className="video-frame-overlay">
          <div className="video-frame-overlay-start">
            {replay && receiving && (
              <span className="video-frame-replay-badge" aria-label="录像回放">
                回放
              </span>
            )}
            <span className="video-frame-angle">{stream.label}</span>
            {!replay && status !== "playing" && (
              <span className={`video-frame-status status-${status}`}>
                {statusLabel[status]}
              </span>
            )}
          </div>
          <div className="video-frame-actions">
            {showPromote && onPromoteToPrimary && (
              <button
                type="button"
                className="video-frame-action-btn"
                title="切换到主屏"
                aria-label="切换到主屏"
                onClick={onPromoteToPrimary}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M4 5h12v2H6v10H4V5zm14 0h2v14h-8v-2h6V5z"
                  />
                </svg>
                <span className="video-frame-action-label">主屏</span>
              </button>
            )}
            <button
              type="button"
              className="video-frame-action-btn video-frame-action-btn--fullscreen"
              title={fullscreenActive ? "退出全屏" : "全屏"}
              aria-label={fullscreenActive ? "退出全屏" : "全屏"}
              onClick={handleToggleFullscreen}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                {fullscreenActive ? (
                  <path
                    fill="currentColor"
                    d="M9 9H5V7h2V5h2v4zm10 0h-4V5h2v2h2v2zM7 19v-2H5v-2h4v4H7zm10 0h-2v-4h4v2h-2v2z"
                  />
                ) : (
                  <path
                    fill="currentColor"
                    d="M7 7h4V5H5v6h2V7zm10 0v4h2V5h-6v2h4zM7 17H5v-6h2v4h4v2zm10 0h-4v-2h4v-4h2v6h-2z"
                  />
                )}
              </svg>
              <span className="video-frame-action-label">
                {fullscreenActive ? "退出" : "全屏"}
              </span>
            </button>
          </div>
        </div>
        {!receiving && (
          <div className="video-frame-idle">
            <span>
              {replay
                ? `正在加载${stream.label}回放…`
                : `开启右上角开关连接${stream.label}直播`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function initStatuses(streams: LabStreamDto[], receiving: boolean): Record<string, StreamConnectionStatus> {
  return Object.fromEntries(
    streams.map((s) => [s.id, receiving ? "connecting" : "idle"])
  );
}

const WORKBENCH_DETAIL_PAGE_SIZE = 3;

function DetailNavChevron({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d={direction === "prev" ? "M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" : "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"}
      />
    </svg>
  );
}

interface WorkbenchDetailStripProps {
  details: LabStreamDto[];
  detailPage: number;
  onDetailPageChange: (page: number) => void;
  renderSlot: (stream: LabStreamDto, variant: "detail") => ReactNode;
}

function WorkbenchDetailStrip({
  details,
  detailPage,
  onDetailPageChange,
  renderSlot,
}: WorkbenchDetailStripProps) {
  const usePagination = details.length > WORKBENCH_DETAIL_PAGE_SIZE;
  const maxPage = Math.max(0, Math.ceil(details.length / WORKBENCH_DETAIL_PAGE_SIZE) - 1);
  const page = Math.min(detailPage, maxPage);
  const visibleDetails = usePagination
    ? details.slice(
        page * WORKBENCH_DETAIL_PAGE_SIZE,
        page * WORKBENCH_DETAIL_PAGE_SIZE + WORKBENCH_DETAIL_PAGE_SIZE
      )
    : details;

  const strip = (
    <div
      className={`video-hub-detail-strip${usePagination ? " video-hub-detail-strip--paginated" : ""}`}
    >
      {visibleDetails.map((stream) => renderSlot(stream, "detail"))}
    </div>
  );

  if (!usePagination) {
    return strip;
  }

  return (
    <div className="video-hub-detail-carousel">
      <button
        type="button"
        className="video-hub-detail-nav video-hub-detail-nav--prev"
        disabled={page <= 0}
        aria-label="上一组机位"
        onClick={() => onDetailPageChange(page - 1)}
      >
        <DetailNavChevron direction="prev" />
      </button>
      {strip}
      <button
        type="button"
        className="video-hub-detail-nav video-hub-detail-nav--next"
        disabled={page >= maxPage}
        aria-label="下一组机位"
        onClick={() => onDetailPageChange(page + 1)}
      >
        <DetailNavChevron direction="next" />
      </button>
    </div>
  );
}

export function VideoStreamHub({
  labId,
  cameraCount,
  layout = "default",
  disabled = false,
  replay = false,
  queued = false,
  cardHeaderEl = null,
}: VideoStreamHubProps) {
  const isWorkbenchLayout = layout === "workbench";
  const showStreamSwitch = !queued && !replay;
  const [streams, setStreams] = useState<LabStreamDto[]>([]);
  const [receiving, setReceiving] = useState(!disabled);
  const [slotStatus, setSlotStatus] = useState<Record<string, StreamConnectionStatus>>({});
  const [primaryStreamId, setPrimaryStreamId] = useState<string | null>(null);
  const [detailPage, setDetailPage] = useState(0);

  const hasStreams = streams.length > 0;

  useEffect(() => {
    if (disabled) {
      setStreams([]);
      setReceiving(false);
      setSlotStatus({});
      setPrimaryStreamId(null);
      return;
    }

    let cancelled = false;
    setReceiving(true);
    void (async () => {
      try {
        const res = await fetchLabStreams(labId);
        if (cancelled) return;
        const ordered = sortPanoramaFirst(res.streams);
        const defaultPrimary = ordered.find(isPanoramaStream);
        setStreams(ordered);
        setSlotStatus(initStatuses(ordered, true));
        setPrimaryStreamId(defaultPrimary?.id ?? null);
      } catch {
        if (!cancelled) setStreams([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [labId, disabled]);

  const handleStartReceive = () => {
    if (disabled || !hasStreams) return;
    setReceiving(true);
    setSlotStatus(initStatuses(streams, true));
  };

  const handleStopReceive = () => {
    setReceiving(false);
    setSlotStatus(initStatuses(streams, false));
  };

  const statuses = streams.map((s) => slotStatus[s.id] ?? "idle");
  const overallStatus: StreamConnectionStatus = !receiving
    ? "idle"
    : statuses.some((s) => s === "playing")
      ? "playing"
      : statuses.some((s) => s === "error")
        ? "error"
        : "connecting";

  const streamStatusLabel = !receiving
    ? "未连接"
    : replay
      ? null
      : overallStatus === "error"
        ? "推流异常"
        : overallStatus === "playing"
          ? null
          : "连接推流";

  const statusLabel: Record<StreamConnectionStatus, string> = {
    idle: "未连接",
    connecting: "连接中",
    playing: "直播中",
    error: "推流异常",
  };

  const angleCount = streams.length || cameraCount;
  const { primary, details } = splitStreams(streams, primaryStreamId);
  const hasMultiAngles = streams.length > 1;
  const stripStreams = isWorkbenchLayout ? streams : details;
  const stripIdsKey = stripStreams.map((s) => s.id).join(",");

  useEffect(() => {
    setDetailPage(0);
  }, [stripIdsKey]);

  useEffect(() => {
    const maxPage = Math.max(
      0,
      Math.ceil(stripStreams.length / WORKBENCH_DETAIL_PAGE_SIZE) - 1
    );
    setDetailPage((p) => Math.min(p, maxPage));
  }, [stripStreams.length]);

  const renderSlot = (stream: LabStreamDto, variant: "primary" | "detail") => (
    <VideoHubSlot
      key={`${variant}-${stream.id}`}
      stream={stream}
      variant={variant}
      receiving={receiving}
      replay={replay}
      status={slotStatus[stream.id] ?? "idle"}
      statusLabel={statusLabel}
      onStatusChange={(s) =>
        setSlotStatus((prev) => ({ ...prev, [stream.id]: s }))
      }
      showPromote={
        !isWorkbenchLayout &&
        hasMultiAngles &&
        variant === "detail" &&
        stream.id !== primary?.id
      }
      isActivePrimary={variant === "detail" && stream.id === primary?.id}
      onPromoteToPrimary={() => setPrimaryStreamId(stream.id)}
      fullscreenRootSelector={isWorkbenchLayout ? ".workbench-grid" : undefined}
      onFullscreenStreamRequest={
        isWorkbenchLayout ? (streamId) => setPrimaryStreamId(streamId) : undefined
      }
    />
  );

  const streamSwitch = (
    <label
      className={`video-stream-switch video-stream-switch--image ${receiving ? "is-on" : ""} ${disabled && !queued ? "video-stream-switch--disabled" : ""}`}
    >
      <input
        type="checkbox"
        role="switch"
        className="video-stream-switch-input"
        checked={receiving}
        disabled={disabled && !queued ? true : !hasStreams && !receiving}
        aria-label="实时推流开关"
        onChange={(e) => (e.target.checked ? handleStartReceive() : handleStopReceive())}
      />
      <span className="video-stream-switch-visual" aria-hidden="true" />
    </label>
  );

  const controlsInCardHeader = isWorkbenchLayout && cardHeaderEl != null;

  const cardHeaderToolbar: ReactNode = disabled && queued ? null : (
    <div className="video-hub-card-toolbar">
      {replay && receiving ? (
        <span className="video-hub-replay-badge" aria-label="录像回放">
          回放
        </span>
      ) : (
        receiving && (
          <span className="video-hub-receiving-badge">
            <span className="video-hub-receiving-dot" aria-hidden="true" />
            接收中
          </span>
        )
      )}
      {!replay && streamStatusLabel && (
        <span className={`video-hub-status video-hub-status--${overallStatus}`}>
          {streamStatusLabel}
        </span>
      )}
      {angleCount > 0 && (
        <span className="video-hub-angle-badge">
          {replay ? `${angleCount} 路回放机位` : `${angleCount} 路推流机位`}
        </span>
      )}
      {showStreamSwitch && streamSwitch}
    </div>
  );

  const internalHeader = !controlsInCardHeader && (
    <header className="video-hub-header video-hub-header--toolbar-only">
      <div className="video-hub-card-toolbar">
        {replay && receiving ? (
          <span className="video-hub-replay-badge" aria-label="录像回放">
            回放
          </span>
        ) : (
          receiving && (
            <span className="video-hub-receiving-badge">
              <span className="video-hub-receiving-dot" aria-hidden="true" />
              接收中
            </span>
          )
        )}
        {!replay && streamStatusLabel && (
          <span className={`video-hub-status video-hub-status--${overallStatus}`}>
            {streamStatusLabel}
          </span>
        )}
        {angleCount > 0 && (
          <span className="video-hub-angle-badge">
            {replay ? `${angleCount} 路回放机位` : `${angleCount} 路推流机位`}
          </span>
        )}
        {showStreamSwitch && streamSwitch}
      </div>
    </header>
  );

  return (
    <section
      className={`video-stream-hub ${receiving && !replay ? "video-stream-hub--live" : ""} ${replay ? "video-stream-hub--replay" : ""} ${isWorkbenchLayout ? "video-stream-hub--workbench" : ""} ${controlsInCardHeader ? "video-stream-hub--header-in-card" : ""} ${disabled ? "video-stream-hub--disabled" : ""}`}
      aria-label="视频流"
    >
      {controlsInCardHeader && createPortal(cardHeaderToolbar, cardHeaderEl)}
      {internalHeader}

      <div
        className={`video-hub-grid ${disabled ? "video-hub-grid--empty" : gridLayoutClass(streams.length || 1)}`}
        data-angle-count={streams.length || undefined}
      >
        {disabled ? (
          <div className="video-hub-empty">
            <span>排队中，暂无视频流</span>
          </div>
        ) : hasMultiAngles && primary ? (
          <>
            {renderSlot(primary, "primary")}
            {isWorkbenchLayout ? (
              <div className="video-hub-angle-bar" aria-label="全部机位" role="listbox">
                <div className="video-hub-angle-bar-head">
                  <span className="video-hub-angle-bar-title">全部机位</span>
                  <span className="video-hub-angle-bar-count">{streams.length} 路</span>
                </div>
                <WorkbenchDetailStrip
                  details={streams}
                  detailPage={detailPage}
                  onDetailPageChange={setDetailPage}
                  renderSlot={renderSlot}
                />
              </div>
            ) : (
              details.length > 0 && (
                <div className="video-hub-detail-strip" aria-label="仪器机位">
                  {details.map((stream) => renderSlot(stream, "detail"))}
                </div>
              )
            )}
          </>
        ) : (
          streams.map((stream) => renderSlot(stream, "primary"))
        )}
      </div>
    </section>
  );
}
