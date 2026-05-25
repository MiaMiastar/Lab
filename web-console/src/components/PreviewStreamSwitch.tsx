interface PreviewStreamSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  onPointerClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
}

export function PreviewStreamSwitch({
  checked,
  onChange,
  ariaLabel,
  label,
  size = "md",
  disabled = false,
  onPointerClick,
}: PreviewStreamSwitchProps) {
  return (
    <label
      className={`video-stream-switch video-stream-switch--image video-stream-switch--${size} lab-card-preview-switch ${checked ? "is-on" : ""} ${disabled ? "is-disabled" : ""}`}
      onClick={onPointerClick}
      onKeyDown={onPointerClick}
    >
      <input
        type="checkbox"
        role="switch"
        className="video-stream-switch-input"
        checked={checked}
        disabled={disabled}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.checked)}
        onClick={onPointerClick}
      />
      <span className="video-stream-switch-visual" aria-hidden="true" />
      {label ? <span className="video-stream-switch-label">{label}</span> : null}
    </label>
  );
}
