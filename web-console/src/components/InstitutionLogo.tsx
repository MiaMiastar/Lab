interface InstitutionLogoProps {
  /** 图片路径（/images/...）或后备文字 */
  logo: string;
  variant?: "default" | "red" | "wide";
  /** 承载 --wide / --img 等变体的基础类名 */
  modifierClass: string;
  /** 额外类名（如 brand-lab-logo） */
  className?: string;
}

export function InstitutionLogo({
  logo,
  variant = "default",
  modifierClass,
  className,
}: InstitutionLogoProps) {
  const isImage = logo.startsWith("/");
  const imageSrc = isImage
    ? `${import.meta.env.BASE_URL}${logo.replace(/^\/+/, "")}`
    : logo;
  const classes = [
    className,
    modifierClass,
    variant !== "default" && `${modifierClass}--${variant}`,
    isImage && `${modifierClass}--img`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {isImage ? <img src={imageSrc} alt="" /> : logo}
    </span>
  );
}
