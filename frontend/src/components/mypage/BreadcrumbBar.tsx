import { ChevronRight, Home } from "lucide-react";

type BreadcrumbBarProps = {
  crumbs: string[];
};

export function BreadcrumbBar({ crumbs }: BreadcrumbBarProps) {
  return (
    <div className="border-y border-[#000000] bg-[#ffffff]">
      <div className="mx-auto flex h-12 max-w-[1200px] items-center gap-2 px-4 text-sm text-gray-500">
        <Home className="h-4 w-4" />
        {crumbs.map((crumb, index) => (
          <div key={`${crumb}-${index}`} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            <span className={index === crumbs.length - 1 ? "text-gray-700" : ""}>{crumb}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
