export function Footer() {
  return (
    <footer className="border-t border-[#e7d9c5] bg-white text-[#1f2937]">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <p className="text-xs uppercase tracking-[0.32em] text-[#eb4d32]">Team Project</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-[#eb4d32]">KINO</h2>
        <p className="mt-4 max-w-none text-sm leading-6 text-[#4b5563] md:whitespace-nowrap">
          KINO는 영화 예매 흐름을 직접 설계하고 구현한 팀 프로젝트입니다.
          실제 서비스처럼 자연스럽게 동작하는 경험을 목표로, 프론트엔드와 백엔드를 함께 완성했습니다.
        </p>
        <div className="mt-8 h-px w-full bg-[#e7d9c5]" />
        <p className="mt-6 text-xs tracking-wide text-[#6b7280]">
          Crafted by Team KINO. For learning, collaboration, and better movie-booking UX.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
