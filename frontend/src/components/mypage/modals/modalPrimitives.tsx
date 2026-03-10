import type { ButtonHTMLAttributes, ReactNode } from "react";

type ModalFrameProps = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg" | "xl";
};

const modalSizeClass = {
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

export function ModalFrame({ title, subtitle, onClose, children, footer, size = "lg" }: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/78 px-4 py-6 backdrop-blur-sm">
      <div
        className={`max-h-[90vh] w-full overflow-auto rounded-sm border border-black/5 bg-[#FDFDFD] shadow-2xl ${modalSizeClass[size]}`}
      >
        <div className="flex items-start justify-between gap-6 border-b border-white/10 bg-[#1A1A1A] px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#B91C1C]">Kino Mypage</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm text-white/55">{subtitle}</p> : null}
          </div>
          <button
            className="text-4xl leading-none text-white/70 transition-colors hover:text-white"
            onClick={onClose}
            aria-label="닫기"
          >
            ×
          </button>
        </div>
        <div className="space-y-5 p-6">{children}</div>
        {footer ? <div className="border-t border-black/5 px-6 py-5">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ModalField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">{label}</label>
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
      className={`rounded-sm bg-[#B91C1C] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#8F1616] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
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
      className={`rounded-sm border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A] transition-colors hover:border-[#B91C1C] hover:text-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
