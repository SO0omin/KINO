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
    <aside className="w-[220px] shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-white">
      <button
        type="button"
        className="w-full bg-[#000000] px-6 py-8 text-center text-xl font-semibold text-white"
        onClick={() => onMoveMenu("/my-page")}
      >
        나의 메가박스
      </button>

      {MENU_CONFIG.map((item) => {
        const active =
          item.key === "vouchers"
            ? pageKey === "vouchers-movie" || pageKey === "vouchers-store"
            : item.key === pageKey;

        return (
          <div key={item.key} className="border-t border-gray-200">
            <button
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-base ${
                active ? "font-semibold text-[#eb4d32]" : "text-gray-700"
              }`}
              onClick={() => onMoveMenu(item.path)}
            >
              <span>{item.label}</span>
              {active ? <ChevronRight className="h-5 w-5" /> : null}
            </button>
            {item.children ? (
              <div className="space-y-1 px-5 pb-3 text-sm text-gray-500">
                {item.children.map((child) => (
                  <button
                    key={child.label}
                    className={`block w-full text-left ${
                      currentPath === child.path ? "font-semibold text-[#eb4d32]" : "text-gray-500"
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

      <div className="border-t border-gray-200 bg-[#ffffff] px-4 py-3 text-base text-gray-700">회원정보</div>
      <div className="px-5 pb-4 pt-2 text-sm text-gray-500">
        <button
          className={`block w-full text-left ${pageKey === "profile" ? "font-semibold text-[#eb4d32]" : "text-gray-500"}`}
          onClick={() => onMoveMenu("/my-page/profile")}
        >
          · 개인정보 수정
        </button>
        <button
          className={`mt-1 block w-full text-left ${
            pageKey === "profile-preferences" ? "font-semibold text-[#eb4d32]" : "text-gray-500"
          }`}
          onClick={() => onMoveMenu("/my-page/profile/preferences")}
        >
          · 선호정보 수정
        </button>
      </div>
    </aside>
  );
}
