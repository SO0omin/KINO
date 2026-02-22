import { Menu, Search, Calendar, User } from 'lucide-react';

export function Header() {
  return (
    <>
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6 py-2 flex justify-between items-center text-sm">
          <div className="flex gap-6">
            <span>VIP LOUNGE</span>
            <span>멤버십</span>
            <span>고객센터</span>
          </div>
          <div className="flex gap-6">
            <span>로그인</span>
            <span>빠른예매</span>
            <span>바로결제</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <header className="bg-white border-b-2 border-gray-300">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Menu size={24} />
              <Search size={24} />
            </div>
            <div className="text-2xl font-bold text-[#eb4d32]">KINO</div>
            <div className="flex items-center gap-4">
              <Calendar size={24} />
              <User size={24} />
            </div>
          </div>
          <nav className="flex justify-center gap-12 text-lg">
            <a href="#" className="hover:text-[#eb4d32]">영화</a>
            <a href="#" className="hover:text-[#eb4d32]">예매</a>
            <a href="#" className="hover:text-[#eb4d32]">극장</a>
            <a href="#" className="hover:text-[#eb4d32]">이벤트</a>
            <a href="#" className="hover:text-[#eb4d32]">스토어</a>
            <a href="#" className="hover:text-[#eb4d32]">혜택</a>
          </nav>
        </div>
      </header>
    </>
  );
}
