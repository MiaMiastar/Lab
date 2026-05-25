import type { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}

export function PageContainer({ children, wide, className = "" }: PageContainerProps) {
  return (
    <div className={`page-container ${wide ? "page-container--wide" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}
