function isAllowedStreamUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export interface OpenStreamTabParams {
  url: string;
  label: string;
  replay?: boolean;
}

export function openStreamInNewTab({ url, label, replay = false }: OpenStreamTabParams): boolean {
  const trimmedUrl = url.trim();
  if (!trimmedUrl || !isAllowedStreamUrl(trimmedUrl)) return false;

  const params = new URLSearchParams({
    url: trimmedUrl,
    label,
  });
  if (replay) params.set("replay", "1");

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const tab = window.open(
    `${basePath}/stream?${params.toString()}`,
    "_blank",
    "noopener,noreferrer"
  );
  return tab != null;
}

export function parseStreamViewerSearchParams(search: string): {
  url: string;
  label: string;
  replay: boolean;
} | null {
  const params = new URLSearchParams(search);
  const url = params.get("url")?.trim() ?? "";
  const label = params.get("label")?.trim() || "视频流";
  if (!url || !isAllowedStreamUrl(url)) return null;
  return {
    url,
    label,
    replay: params.get("replay") === "1",
  };
}
