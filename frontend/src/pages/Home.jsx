import React from 'react';
// 이후 수정

const Home = () => {
  return (
    <main style={styles.container}>
      <section style={styles.hero}>
        <h1>KINO 프로젝트에 오신 것을 환영합니다! 🎬</h1>
        <p>팀원들과 함께 멋진 영화 커뮤니티를 만들어봐요.</p>
        <button style={styles.button}>영화 보러가기</button>
      </section>

      <section style={styles.content}>
        <h2>인기 영화 목록</h2>
        <div style={styles.grid}>
          {/* 나중에 이 부분은 API로 데이터를 가져와서 map으로 돌릴 거예요 */}
          <div style={styles.card}>영화 카드 1</div>
          <div style={styles.card}>영화 카드 2</div>
          <div style={styles.card}>영화 카드 3</div>
        </div>
      </section>
    </main>
  );
};

// 간단한 스타일 (나중에 CSS 파일로 분리하세요!)
const styles = {
  container: { padding: '20px', textAlign: 'center' },
  hero: { backgroundColor: '#f0f2f5', padding: '50px', borderRadius: '10px', marginBottom: '30px' },
  button: { padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }
};

export default Home;