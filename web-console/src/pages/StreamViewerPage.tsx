import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LivePlayer } from "../components/video/LivePlayer";
import { parseStreamViewerSearchParams } from "../lib/openStreamTab";

export function StreamViewerPage() {
  const [searchParams] = useSearchParams();
  const stream = useMemo(
    () => parseStreamViewerSearchParams(searchParams.toString()),
    [searchParams]
  );

  useEffect(() => {
    document.title = stream ? `${stream.label} · 智慧实验室` : "视频流 · 智慧实验室";
    return () => {
      document.title = "智慧实验室";
    };
  }, [stream]);

  if (!stream) {
    return (
      <div className="stream-viewer stream-viewer--empty">
        <p>无效或缺失的视频流地址</p>
      </div>
    );
  }

  return (
    <div className="stream-viewer">
      <header className="stream-viewer-header">
        <h1 className="stream-viewer-title">{stream.label}</h1>
        {stream.replay && (
          <span className="stream-viewer-replay-badge" aria-label="录像回放">
            回放
          </span>
        )}
      </header>
      <div className="stream-viewer-stage">
        <LivePlayer
          streamUrl={stream.url}
          active
          showControls
          muted={false}
        />
      </div>
    </div>
  );
}
