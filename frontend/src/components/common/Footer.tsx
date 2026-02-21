export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-300 mt-16">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex justify-between mb-6">
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">회사소개</a>
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">인재채용</a>
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">사회공헌</a>
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">제휴/광고/부대사업문의</a>
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">이용약관</a>
            <a href="#" className="font-bold hover:text-[#eb4d32]">개인정보처리방침</a>
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">법적고지</a>
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">이메일주소무단수집거부</a>
            <a href="#" className="text-gray-700 hover:text-[#eb4d32]">윤리경영</a>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mb-4">
          <p className="mb-1">서울특별시 강남구 도산대로 156 2층 드림센터(역삼동 737-17) ARS 1544-0070</p>
          <p className="mb-1">대표이메일 m.dreamcenter@partner.megabox.co.kr 대표자명 홍미리 · 개인정보보호책임자 211-86-59478 · 사업자등록번호 2019-서울강남-00722 · 통신판매업신고번호 no.722</p>
          <p>COPYRIGHT © MegaboxJoongAng, Inc. All rights reserved</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-gray-400">MEGABOX</div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
