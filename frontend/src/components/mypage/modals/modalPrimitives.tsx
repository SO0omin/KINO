import React, { type ButtonHTMLAttributes, type ReactNode } from "react";

type ModalFrameProps = {
  title: string;
  category?: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
};

const modalSizeClass = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function ModalFrame({ 
  title, 
  category = "KINO MYPAGE", 
  subtitle, 
  onClose, 
  children, 
  footer, 
  size = "md" 
}: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className={`relative w-full ${modalSizeClass[size]} rounded-sm border border-black/5 bg-white p-12 shadow-2xl overflow-y-auto max-h-[95vh] custom-scrollbar`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-black/60 hover:text-[#B91C1C] transition-colors text-2xl font-light"
        >
          ×
        </button>

        {/* Header decoration */}
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px w-12 bg-[#B91C1C]"></div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-[#B91C1C]">{category}</p>
        </div>

        {/* Title */}
        <h3 className="mb-4 font-display text-5xl uppercase tracking-tighter text-[#1A1A1A] leading-none">
          {title}
        </h3>

        {/* Subtitle */}
        {subtitle && (
          <p className="mb-10 font-mono text-[11px] uppercase tracking-widest leading-relaxed text-black/60">
            {subtitle}
          </p>
        )}

        {/* Content 영역 */}
        <div className="mb-10">{children}</div>

        {/* Footer */}
        {footer && <div className="mt-12 flex gap-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      {/* AI 스튜디오 스타일: 아주 작은 폰트 + 넓은 자간 */}
      <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-black/50">
        {label}
      </label>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`flex-1 py-5 bg-[#B91C1C] text-white font-display text-xl uppercase tracking-tight shadow-xl hover:bg-[#1A1A1A] transition-all rounded-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`flex-1 py-5 border border-black/10 font-mono text-xl font-bold uppercase tracking-widest text-black hover:bg-black/5 hover:border-[#B91C1C] hover:text-[#B91C1C] transition-all rounded-sm disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}