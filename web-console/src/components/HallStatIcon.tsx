import type { HallStats } from "../data/mock";

type HallStatKey = keyof HallStats;

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function HallStatIcon({ stat }: { stat: HallStatKey }) {
  switch (stat) {
    case "total":
      return (
        <svg {...ICON_PROPS}>
          <path d="M3 9.5 12 4l9 5.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <path d="M9 22V12h6v10" />
        </svg>
      );
    case "scenarios":
      return (
        <svg {...ICON_PROPS}>
          <path d="M10 2v7.5" />
          <path d="M14 2v7.5" />
          <path d="M8.5 2h7" />
          <path d="M7 22h10" />
          <path d="M12 22v-4" />
          <path d="M8 10a4 4 0 0 0 8 0" />
        </svg>
      );
    case "awaiting":
      return (
        <svg {...ICON_PROPS}>
          <path d="M12 22v-5" />
          <path d="M9 17h6" />
          <path d="M8 11V7a4 4 0 1 1 8 0v4" />
        </svg>
      );
    case "idle":
      return (
        <svg {...ICON_PROPS}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "maintenance":
      return (
        <svg {...ICON_PROPS}>
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-2.8 2.1-2.1z" />
        </svg>
      );
    case "offline":
      return (
        <svg {...ICON_PROPS}>
          <path d="M12 20h.01" />
          <path d="M8.5 16.429a5 5 0 0 1 7 0" />
          <path d="M5 12.858a10 10 0 0 1 14 0" />
          <path d="M2 8.82a15 15 0 0 1 20 0" />
          <path d="m2 2 20 20" />
        </svg>
      );
    case "queued":
      return (
        <svg {...ICON_PROPS}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h10" />
          <circle cx="19" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "completed":
      return (
        <svg {...ICON_PROPS}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="M22 4 12 14.01l-3-3" />
        </svg>
      );
    case "busy":
      return (
        <svg {...ICON_PROPS}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    default:
      return null;
  }
}
