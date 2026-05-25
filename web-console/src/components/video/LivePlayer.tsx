import { useEffect, useRef, useState } from "react";
import type { StreamConnectionStatus } from "../../types";

interface LivePlayerProps {
  streamUrl: string;
  active: boolean;
  onStatusChange?: (status: StreamConnectionStatus, message?: string) => void;
  /** 卡片预览等小窗不显示控制条 */
  showControls?: boolean;
  muted?: boolean;
}

function detectProtocol(url: string): "hls" | "mp4" | "other" {
  const u = url.toLowerCase();
  if (u.includes(".m3u8")) return "hls";
  if (u.match(/\.(mp4|webm|ogg)(\?|$)/)) return "mp4";
  return "other";
}

export function LivePlayer({
  streamUrl,
  active,
  onStatusChange,
  showControls = true,
  muted = true,
}: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const [status, setStatus] = useState<StreamConnectionStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const setStatusWrap = (s: StreamConnectionStatus, msg?: string) => {
    setStatus(s);
    setErrorMsg(msg ?? null);
    onStatusChange?.(s, msg);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const teardown = () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.removeAttribute("src");
      video.load();
    };

    if (!active || !streamUrl.trim()) {
      teardown();
      setStatusWrap("idle");
      return;
    }

    const url = streamUrl.trim();
    const protocol = detectProtocol(url);
    setStatusWrap("connecting");

    let cancelled = false;

    const tryPlay = () => {
      if (!cancelled) void video.play().catch(() => {});
    };

    (async () => {
      teardown();

      if (protocol === "hls") {
        try {
          const Hls = (await import("hls.js")).default;
          if (cancelled) return;

          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              maxBufferLength: showControls ? 30 : 10,
            });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (cancelled) return;
              const liveEdge = hls.liveSyncPosition;
              if (liveEdge != null && Number.isFinite(liveEdge)) {
                video.currentTime = Math.max(0, liveEdge);
              }
              tryPlay();
              setStatusWrap("playing");
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (cancelled || !data.fatal) return;
              setStatusWrap("error", `HLS: ${data.type}`);
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            video.addEventListener(
              "loadedmetadata",
              () => {
                tryPlay();
                setStatusWrap("playing");
              },
              { once: true }
            );
          } else {
            setStatusWrap("error", "浏览器不支持 HLS");
          }
        } catch (e) {
          if (!cancelled) setStatusWrap("error", e instanceof Error ? e.message : "HLS 加载失败");
        }
        return;
      }

      video.src = url;
      const onOk = () => {
        if (!cancelled) {
          tryPlay();
          setStatusWrap("playing");
        }
      };
      const onErr = () => {
        if (!cancelled) setStatusWrap("error", "无法加载视频流");
      };
      video.addEventListener("loadeddata", onOk, { once: true });
      video.addEventListener("error", onErr, { once: true });
      tryPlay();
    })();

    return () => {
      cancelled = true;
      teardown();
    };
  }, [streamUrl, active, showControls]);

  const showOverlay = status !== "playing";

  return (
    <div className="live-player">
      <video
        ref={videoRef}
        className="live-player-video"
        playsInline
        muted={muted}
        autoPlay
        controls={showControls}
        controlsList={showControls ? "noplaybackrate" : undefined}
      />
      {showOverlay && status === "idle" && showControls && (
        <div className="live-player-overlay">
          <span className="live-player-hint">开启预览以连接直播画面</span>
        </div>
      )}
      {showOverlay && status === "connecting" && (
        <div className="live-player-overlay">
          <span className="live-player-hint">正在连接实时推流…</span>
        </div>
      )}
      {showOverlay && status === "error" && errorMsg && (
        <div className="live-player-overlay live-player-overlay--error">
          <span className="live-player-hint">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
