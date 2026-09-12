import { ChevronRight } from "lucide-react";
import { MENU_CONFIG } from "../../types/mypage";
import type { PageKey } from "../../types/mypage";

type SidebarMenuProps = {
  currentPath: string;
  pageKey: PageKey;
  onMoveMenu: (path: string) => void;
};

export function SidebarMenu({ currentPath, pageKey, onMoveMenu }: SidebarMenuProps) {
  return (
    <aside className="sticky top-8 w-[240px] shrink-0 self-start overflow-hidden rounded-sm border border-black/5 bg-[#FDFDFD] shadow-xl">
      <button
        type="button"
        className="w-full bg-[#1A1A1A] px-6 py-8 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white transition-colors hover:bg-[#B91C1C]"
        onClick={() => onMoveMenu("/mypage")}
      >
        나의 키노
      </button>

      {MENU_CONFIG.map((item) => {
        const active =
          item.key === "vouchers"
            ? pageKey === "vouchers-movie"
            : item.key === pageKey;

        return (
          <div key={item.key} className="border-t border-black/5">
            <button
              className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold tracking-tight transition-colors ${
                active ? "text-[#B91C1C]" : "text-[#1A1A1A] hover:text-[#B91C1C]"
              }`}
              onClick={() => onMoveMenu(item.path)}
            >
              <span>{item.label}</span>
              {active ? <ChevronRight className="h-5 w-5" /> : null}
            </button>
            {item.children ? (
              <div className="space-y-1 px-6 pb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
                {item.children.map((child) => (
                  <button
                    key={child.label}
                    className={`block w-full text-left ${
                      currentPath === child.path ? "text-[#B91C1C]" : "text-black/35 hover:text-[#B91C1C]"
                    }`}
                    onClick={() => onMoveMenu(child.path)}
                  >
                    · {child.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}

      <div className="border-t border-black/5 bg-white/80 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black/35">회원정보</div>
      <div className="px-6 pb-5 pt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-black/35">
        <button
          className={`block w-full text-left ${pageKey === "profile" ? "text-[#B91C1C]" : "text-black/35 hover:text-[#B91C1C]"}`}
          onClick={() => onMoveMenu("/mypage/profile")}
        >
          · 개인정보 수정
        </button>
        <button
          className={`mt-1 block w-full text-left ${
            pageKey === "profile-preferences" ? "text-[#B91C1C]" : "text-black/35 hover:text-[#B91C1C]"
          }`}
          onClick={() => onMoveMenu("/mypage/profile/preferences")}
        >
          · 선호정보 수정
        </button>
      </div>
    </aside>
  );
}
