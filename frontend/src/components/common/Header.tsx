import { Menu, Search, Calendar, User } from 'lucide-react';

export function Header() {
  return (
    <>
      <div className="bg-[#ffffff] border-b border-[#000000]">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex h-10 items-center justify-between text-sm">
            <div className="flex items-center gap-6 text-[#000000]">
              <span>VIP LOUNGE</span>
              <span>멤버십</span>
              <span>고객센터</span>
            </div>
            <div className="flex items-center gap-6 text-[#000000]">
              <span>로그아웃</span>
              <span>입점</span>
              <span>빠른예매</span>
            </div>
          </div>
        </div>
      </div>

      <header className="bg-[#ffffff] border-b border-[#000000]">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Menu className="h-6 w-6 text-[#000000]" />
              <Search className="h-6 w-6 text-[#000000]" />
              <nav className="ml-8 flex items-center gap-8">
                <a href="#" className="font-medium text-[#000000]">영화</a>
                <a href="#" className="font-medium text-[#000000]">예매</a>
                <a href="#" className="font-medium text-[#000000]">극장</a>
              </nav>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 transform">
              <div className="bg-[#000000] px-6 py-2 font-bold text-[#ffffff]">
                <div className="text-xl tracking-wider">KINO</div>
                <div className="text-center text-[10px]">KINO PROJECT</div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <a href="#" className="font-medium text-[#000000]">이벤트</a>
              <a href="#" className="font-medium text-[#000000]">스토어</a>
              <a href="#" className="font-medium text-[#000000]">혜택</a>
              <div className="flex items-center gap-4">
                <Calendar className="h-6 w-6 text-[#000000]" />
                <User className="h-6 w-6 text-[#000000]" />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}