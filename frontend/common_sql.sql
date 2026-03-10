SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE 
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO movies (title, age_rating, release_date, status, duration_min, poster_url, description, director, actor, trailer_url)
VALUES 
-- ==========================================
-- [1] SCREENING: 상영 중 (개봉일 2026-03-01 ~ 2026-03-08) - 42개
-- ==========================================
(
  '왕과 사는 남자', '12', '2026-03-01', 'SCREENING', 139, 
  'https://img.megabox.co.kr/SharedImg/2026/02/11/nhlUT5bgNmPnf0Yg0FH2wvX89gUBQ9iI_420.jpg', 
  '“나는 이제 어디로 갑니까…”\n\n계유정난이 조선을 뒤흔들고\n어린 왕 이홍위는 왕위에서 쫓겨나 유배길에 오른다.\n\n“무슨 수를 쓰더라도 그 대감을 우리 광천골로 오게 해야지”\n\n한편, 강원도 영월 산골 마을 광천골의 촌장 엄흥도는\n먹고 살기 힘든 마을 사람들을 위해 청령포를 유배지로 만들기 위해 노력한다.\n그러나 촌장이 부푼 꿈으로 맞이한 이는 왕위에서 쫓겨난 이홍위였다.\n유배지를 지키는 보수주인으로서 그의 모든 일상을 감시해야만 하는 촌장은\n삶의 의지를 잃어버린 이홍위가 점점 신경 쓰이는데…\n\n1457년 청령포, 역사가 지우려 했던 이야기\n<왕과 사는 남자>', 
  '장항준', '유해진, 박지훈, 유지태, 전미도, 김민, 박지환', 
  'https://youtu.be/9sxEZuJskvM'
),
(
  '호퍼스', 'ALL', '2026-03-04', 'SCREENING', 104, 
  'https://img.megabox.co.kr/SharedImg/2026/01/28/l0PrJRzpwBhjCWExmfazv7yzsI5Hem4k_420.jpg', 
  '“좋아, 자연스러웠어!”\n\n동물과 자연을 사랑하는 19살 소녀 ‘메이블’은 할머니와의 소중한 추억이 깃든 연못이\n무분별한 고속도로 개발로 사라질 위기에 놓이자, 이를 지키기 위해 고군분투한다.\n\n어느 날, 사람의 의식을 동물 로봇으로 옮기는 혁신적인 ‘호핑’ 기술을 체험하게 된 메이블!\n비버 로봇으로 호핑한 그녀는 동물 세계에 잠입하게 되고,\n포유류의 왕 ‘조지’를 비롯해 개성 넘치는 동물 친구들을 만나게 되는데…\n\n인간과 동물의 유쾌한 반격!\n디즈니·픽사의 가장 사랑스러운 모험!', 
  '다니엘 총', '파이퍼 쿠르다, 바비 모니한, 존 햄', 
  'https://youtu.be/1I3Z5cQf2A4?si=pkoU5FbsbWyDHnFY'
),
(
  '휴민트', '15', '2026-03-02', 'SCREENING', 119, 
  'https://img.megabox.co.kr/SharedImg/2026/02/13/mP17jsCdYFTCOE9Sne04oLzkUN5RoajE_420.jpg', 
  '“누구도 완전히 믿어선 안 된다”\n\n동남아에서 벌어진 국제 범죄를 추적하던 국정원 블랙 요원, 조 과장(조인성)은\n자신의 휴민트 작전에서 희생된 정보원이 남긴 단서를 쫓아 블라디보스토크로 향한다.\n그곳에서 북한 식당 종업원 채선화(신세경)를 새로운 작전의 정보원으로 선택한다.\n\n한편, 국경 지역의 실종 사건을 조사하기 위해 파견된 보위성 조장 박건(박정민)은\n배후에 북한 총영사 황치성(박해준)이 연루되어 있음을 알게 되는데...\n\n블라디보스토크의 차가운 안개 속,\n돌이킬 수 없는 첩보 액션이 폭발한다!', 
  '류승완', '조인성, 박정민, 박해준, 신세경', 
  'https://youtu.be/uKOYQ1e4lv4?si=3mSnMLBDn4bMQ8Hd'
),
(
  '매드 댄스 오피스', 'ALL', '2026-03-04', 'SCREENING', 106, 
  'https://img.megabox.co.kr/SharedImg/2026/02/11/9uxTemjbZfeuDGBsoqZJusQa5Zs0OO63_420.jpg', 
  '“내 인생의 스텝이 꼬이기 시작했다!”\n\n24시간 빈틈없이 살아온 구청의 갓생 과장 ‘국희’ (염혜란).\n승진은 코앞이고, 딸의 취업까지! 모든 것이 완벽하게 진행될 줄 알았다.\n하지만 도둑맞은 승진, 연락 두절된 딸, 텅 빈 마음까지 엉망진창이 된 인생 박자!\n\n이를 수습하기 위해 그녀가 찾아간 곳은 다름 아닌 플라멩코 연습실?\n그곳에서 만난 미스터리한 강사 연경(최성은)과 함께\n발바닥이 찢어지도록 정열의 스텝을 밟기 시작하는데...\n\n갓생에 지친 영혼들을 위한 위로!\n완벽하지 않아도 괜찮은 인생 리듬 되찾기 프로젝트!', 
  '조현진', '염혜란, 최성은, 우미화, 박호산', 
  'https://youtu.be/CwWauWt6hVo?si=BAjVvZO3yH0RPhBr'
),
(
  '진격의 거인 완결편 더 라스트 어택', '15', '2026-03-06', 'SCREENING', 145, 
  'https://img.megabox.co.kr/SharedImg/2026/02/20/R7fpNGDQTA32Ad5untTlg4IQOnyhrWO8_420.jpg', 
  '“구축해주겠어! 이 세상에서 단 한 마리도 남김없이!”\n\n에렌 예거가 시조의 거인의 힘을 발동시키며 전 세계를 향한 무차별적인 ‘땅울림’을 시작한다.\n인류 멸망의 카운트다운이 시작된 가운데, 한때 동료였던 미카사와 아르민,\n그리고 살아남은 조사병단 멤버들은 에렌을 막기 위해 목숨을 건 최후의 전투에 나선다.\n\n10년을 이어온 거대한 서사의 진짜 결말.\n벽 밖의 진실과 마주한 인류의 마지막 저항이 압도적인 작화와 장엄한 연출로 스크린에 펼쳐진다.\n거인들과의 기나긴 전쟁, 그 처절하고 슬픈 마침표.', 
  '하야시 유이치로', '카지 유우키, 이시카와 유이, 이노우에 마리나', 
  'https://youtu.be/yRzEradAxws?si=m3MBgEChNyG8_Gxi'
),
(
  '브라이드!', '15', '2026-03-05', 'SCREENING', 121, 
  'https://img.megabox.co.kr/SharedImg/2026/02/06/OEulh4m7nGkaj3MFEMt3jMkZ3A9ZjaXT_420.jpg', 
  '“새로운 생명, 걷잡을 수 없는 본능”\n\n1930년대 시카고, 외로운 프랑켄슈타인은 자신과 함께할 동반자를 찾기 위해\n유펜니우스 박사를 찾아가고, 두 사람은 살해당한 젊은 여성의 시체를 되살려내어\n새로운 생명인 ‘신부(Bride)’를 창조해 낸다.\n\n하지만 새롭게 깨어난 그녀는 두 남자가 예상했던 통제 가능한 존재가 아니었다.\n걷잡을 수 없는 욕망과 거침없는 본능을 지닌 그녀는\n급기야 시카고 경찰과 대중의 이목을 끌며 사회를 발칵 뒤집어 놓는다.\n\n매기 질렌할 감독이 새롭게 재해석한 기괴하고 매혹적인 스릴러!', 
  '매기 질렌할', '크리스천 베일, 제시 버클리, 아네트 베닝', 
  'https://youtu.be/0sWZn2NlNzk?si=IXBrVRTdsxKRt8Hw'
),
(
  '미키 17', '15', '2026-03-02', 'SCREENING', 139, 
  'https://i.namu.wiki/i/pk_CZuJwMNcCmcdCemHIwIqW5wMA1dEvz7eRodLgGMxYdxLy0tzSVCA1wsFtZ9rGiniEbaMGXvYIxLtUyqgxAhOwhaIe88QyNUllU_QnBZJcBZj3JrSTvHGvifzwFlFQgKSyAf55Fb9L2Ssy0-_Jaw.webp', 
  '“내 차례는 끝났어. 이제 네가 죽을 차례야”\n\n얼음 행성 니플하임을 개척하기 위해 투입된 소모품 복제 인간 ‘미키 17’의 험난한 생존기.\n죽음과 부활을 끝없이 반복하며 위험천만한 우주 개척 임무를 수행하던 중,\n예기치 않은 사고로 인해 자신을 대체할 또 다른 복제 인간 ‘미키 18’과 마주치게 된다.\n\n하나의 존재, 두 개의 자아!\n생존을 위한 그들의 기상천외한 반란이 시작된다!\n\n인류의 끝없는 탐욕과 생명의 가치에 대한 날카로운 통찰을\n봉준호 감독 특유의 기발한 블랙 코미디와 압도적인 스케일로 담아낸 걸작.', 
  '봉준호', '로버트 패틴슨, 스티븐 연', 
  'https://youtu.be/MFXWhpcuIg4?si=DW5escpWnTz88kz_'
),
(
  '초속 5센티미터', 'ALL', '2026-03-01', 'SCREENING', 63, 
  'https://i.namu.wiki/i/Xoju0ctB2BS6V-Yn4lyiv2gi74Nd42TuITnJKcnuoqzCgNa2jNA5RAj0v9Q662nYVVwoU7PvSpJw9MrJ_OomCGFB4T0pi6pykNDDiu1zciu53w9L79ppqCcdxyDRRDSbdpTfSeIX5fSg5hRxDSOXVA.webp', 
  '“어느 정도의 속도로 살아가야, 너를 다시 만날 수 있을까.”\n\n초등학교 졸업과 동시에 떨어져 있게 된 타카키와 아카리.\n둘만의 특별한 추억을 가슴에 품은 채 시간은 무심하게 흘러간다.\n폭설이 내리던 어느 밤, 타카키는 아카리를 만나기 위해 기차에 오르지만\n예상치 못한 눈보라로 기차는 지연되고 시간만 야속하게 흐르는데...\n\n벚꽃이 떨어지는 속도 초속 5센티미터.\n누구나 마음속에 간직한 첫사랑의 아련한 기억과 엇갈림,\n그리고 시간의 흐름을 눈부시게 아름다운 작화로 그려낸 감성 명작.', 
  '신카이 마코토', '미즈하시 켄지, 콘도 요시미', 
  'https://youtu.be/eA7nDGE_E00?si=QzjDZKPICdbKHmtj'
),
(
  '캡틴 아메리카: 브레이브 뉴 월드', '12', '2026-03-03', 'SCREENING', 125, 
  'https://i.namu.wiki/i/Ob6TGeFVXvAT-4GwROtMzKSOfyuoiKVHxXEUpTNn4J8PtSvCduPpcLBqKuF5p0zTbb_KVtCv-oEnpvmpB2geWuQBBSMZmK2JwOBWVJynpNK6lipVbT07uSZ61r2PS8DxokYj2wj1kTogg5ztJOFTDQ.webp', 
  '새로운 캡틴, 새로운 시대!\n\n초대 캡틴 아메리카 스티브 로저스에게 무거운 방패와 책임을 물려받은\n샘 윌슨이 진정한 히어로로 거듭나는 과정을 그린 액션 블록버스터.\n\n새롭게 미국 대통령 자리에 오른 테디어스 로스 장군과의 팽팽하고 복잡한 관계 속에서,\n전 세계를 파멸로 몰아넣으려는 거대한 국제적 음모와 숨겨진 적들의 실체가 서서히 드러난다.\n\n팔콘 시절부터 다져온 날개를 활용한 화려하고 스피디한 공중 액션과\n한층 더 깊어진 리더로서의 고뇌를 스크린에서 확인하라!', 
  '줄리어스 오나', '안소니 마키, 해리슨 포드', 
  'https://youtu.be/EPdzdAK3YJ8?si=8BKqzaEWIR-xzQvT'
),
(
  '우리는 매일매일', '12', '2026-03-03', 'SCREENING', 85, 
  'https://i.namu.wiki/i/JWpkc0SG__03ltniEGVghHNO75wVdUR6U2ullWQMJ29Du-NvuX-5GB9HBv9e3Hsi--KPOAoweiFCaQVG95i4y9Mkfzjlm4pqohHlXTpnJYGIwiFPEmtrQVKY5X3vdMAONfBwsTyGezNm6l_rdaubSg.webp', 
  '“매일매일 우리는 무너지지만, 또 다시 세워진다.”\n\n평범한 일상 속에서 문득 마주하게 되는 깊은 상실감과 치유의 여정.\n오랜 연인과 이별한 뒤 혼자만의 시간을 보내며 서서히 자신을 되찾아가는\n주인공의 담담하고 따뜻한 일상을 관찰하는 다큐멘터리형 독립 영화.\n\n화려한 사건이나 극적인 반전 없이도,\n밥을 짓고 길을 걷고 사람들을 만나는 소소한 행위 속에 담긴 삶의 온기가\n관객들의 마음에 묵직한 위로를 전한다.\n지친 현대인들에게 건네는 고요하고 뭉클한 시선.', 
  '강유가람', '키라라, 어지진', 
  'https://youtu.be/dyQeolmEa3s?si=7TIZSxiHUo70BGXW'
),
(
  '좀비 랜드 사가: 유메긴가 파라다이스', '12', '2026-03-04', 'SCREENING', 105, 
  'https://i.namu.wiki/i/txv5FAoYXcgxVPcgaCFdJmE-TJ4aXN23QKD1qvmKUgmDf3ZQgo8RqyVpm0IpdWfXCQjGAhd5IgaI9Fkl1YOFva2QZDQFpEbxJ-cI--Ow1vv9M5XlJUHIwfiasHJkhTJCsT2mHL6Xnkda8B4y29n3yw.webp', 
  '“죽어서도 아이돌! 사가 현을 구하라!”\n\n비운의 사고로 생을 마감했던 7명의 소녀들이\n프로듀서 타츠미 코타로의 기상천외한 프로젝트 아래 ‘좀비 아이돌’로 부활했다!\n지역의 부흥을 위해 피 땀 눈물(그리고 가끔 신체 부위)을 흘리며 무대에 오르는 그녀들.\n\n하지만 이번엔 평범한 라이브가 아니다!\n우주적 스케일의 재앙이 사가 현을 덮치며\n최강의 좀비 아이돌 그룹 ‘프랑슈슈’의 역사상 가장 스펙터클한 공연이 시작된다.\n상상을 초월하는 개그와 감동의 좀비 코미디 애니메이션.', 
  '사카이 무네히사', '혼도 카에데, 타노 아사미, 타네다 리사', 
  'https://youtu.be/1ICQCmmYhcM?si=2XEkr5VPQlcC3LGD'
),
(
  '다이 마이 러브', '18', '2026-03-08', 'SCREENING', 115, 
  'https://i.namu.wiki/i/3CFgkPdj3amWHqWa8vuRpZ8B6F_gPJwfM7sEU5Su6kWSyy-C04Qc5SzGnF3op6tdJd2HChMlumS3PU0tA-RG72ye875QIGQ7zfbVJhK5_bRO2npb638nWLkC3lOwUVfwXbutabGkPh0bGuAIutEjMA.jpg', 
  '광기와 이성의 아슬아슬한 줄타기\n\n한적하고 고립된 시골 마을, 심각한 산후우울증과 신경쇠약에 시달리며\n서서히 미쳐가는 한 여인의 내면을 파고드는 서늘한 심리 스릴러.\n\n아내이자 어머니라는 압박에 짓눌려 자신을 잃어버린 주인공은\n남편과의 관계마저 파탄에 이르자 내면에 숨겨져 있던 파괴적인 본능을 드러내기 시작한다.\n현대 사회의 어두운 이면을 찌르는 날카로운 통찰.\n\n제니퍼 로렌스의 소름 끼치는 메소드 연기와\n린 램지 감독의 집요한 연출이 만나 완성된 압도적인 서스펜스.', 
  '린 램지', '제니퍼 로렌스, 로버트 패틴슨', 
  'https://youtu.be/jpWkwEuQh8Y?si=AdasFkMTHJIAxb9S'
),
(
  '검은 수녀들', '15', '2026-03-04', 'SCREENING', 114, 
  'https://i.namu.wiki/i/V-Y6ZLiObJV3LP0SY5wrWfAHcyg7M_mTEWh4z-AJkmIJalT-fPi6UbGe1D2RAX3ZLgol1ca96xAJVykCkRYuWZl6CFYBN2LPI7Jj7miKUsI94vol1FjhyRGAyEa6DGvZFP8CUdVbTJp8erstT-LSOA.webp', 
  '“이 아이를 구할 수 있는 건 우리뿐입니다”\n\n강력한 악령에 사로잡힌 소년을 구하기 위해\n교단의 만류에도 불구하고 금지된 의식에 나서는 두 수녀의 이야기.\n\n과거의 깊은 상처를 안고 있는 수녀 유니아와,\n그녀를 돕기 위해 파견된 수녀 미카엘라는\n소년의 몸을 차지한 악령과 목숨을 건 위험한 구마 의식을 시작한다.\n\n한국형 오컬트의 새로운 장을 열 압도적인 공포와 서스펜스.', 
  '권혁재', '송혜교, 전여빈, 이진욱, 허준호', 
  'https://youtu.be/Lr0J6XGxnPA?si=puacgiD9AM9FZhsx'
),
(
  '삼악도', '15', '2026-03-07', 'SCREENING', 110, 
  'https://i.namu.wiki/i/wSqW-Blx2DfE48n6Ad7CMaalAOb3WqasNv1pdwzd7qptewVNOjfxjVDetLKLb_uDwjrOUlWVGitzF5oSl-88cGL_CBYCegmfwHCVO4QaFyLriRxf9hfF9V-qZZnbKS_Q5wHodUJXjo7CQVEvEMnRKA.webp', 
  '“이 섬에는 산 자가 있을 자리가 없다”\n\n일제강점기 시절 사라졌다고 알려진 사이비 종교의 실체를 파헤치기 위해,\n탐사보도팀 피디 ‘채연’과 미스터리한 과거를 지닌 무당 ‘진호’가 지도에도 없는 기이한 섬 ‘삼악도’로 향한다.\n\n섬에 발을 들인 순간부터 기이한 현상들이 일행의 숨통을 조여오고,\n주민들의 기괴한 의식과 마주하며 일행은 서서히 미쳐간다.\n절대 사람이 들어가선 안 될 금기의 땅에서 깨어난 끔찍한 악령.\n\n탈출구 없는 외딴 섬에서 벌어지는 극한의 K-오컬트 공포 스릴러.', 
  '채기준', '조윤서, 곽시양, 양주호', 
  'https://youtu.be/8NguDQ_zZHE?si=dyPE0j2rs4dINEQ1'
),
(
  '우리에게는 아직 내일이 있다', '15', '2026-03-05', 'SCREENING', 130, 
  'https://an2-img.amz.wtchn.net/image/v2/5e0rhmg6wzzwj-8aqsJpLQ.webp?jwt=ZXlKaGJHY2lPaUpJVXpJMU5pSjkuZXlKdmNIUnpJanBiSW1SZk5Ea3dlRGN3TUhFNE1DSmRMQ0p3SWpvaUwzWXlMM04wYjNKbEwybHRZV2RsTHpFek1UUXhOVFUyTkRJek1EYzVOaUo5LjNIeTFxTUdkNGs2eVh5dXpmeHVwRlNXX0FCQTVrWlc4eEFPSDhiLXd0djA=', 
  '나라의 운명이 걸린 국민투표로 소란한 1946년 이탈리아\n\n과거에 없던 투표권이 생겼지만\n여전히 발언권은 없는 산투치 가문의 며느리 델리아는\n오늘도 딸 마르첼라의 결혼식 준비에 한창이다\n\n\n그러던 어느 날 델리아 앞으로 의문의 편지가 도착하고\n델리아는 난생처음 비밀스러운 계획을 세우는데…',
  '파올라 코텔레시', '파올라 코텔레시, 발레리오 마스딴드리아, 로마나 마조라 베르가노', 
  'https://youtu.be/PGgMQU5wJLQ?si=io51uyFdT_L3NAoq'
),
(
  '아바타: 불과 재', '12', '2026-03-06', 'SCREENING', 192, 
  'https://i.namu.wiki/i/EjIxR1MUmEGs-xHvVCwVatrebFIVDXysqL-RkUUAEwemq9SMLAba1FR8vmldFGqnAHvMTGlXWS5CpqUkiISYkNdOdl-oLd6F8tm0AH64jNWgbRS7pHG2lvcwEXzxb_W_SCJmaA-bSCrdOKXHVPZgeg.webp', 
  '아름다운 바다를 넘어, 재앙의 불길이 타오른다!\n\n판도라 행성의 척박한 화산 지대에 서식하는 호전적이고 파괴적인\n‘재의 부족’이 등장하며 제이크 설리와 네이티리 가족은 또 다른 거대한 위협에 직면한다.\n\n인류의 끝없는 자원 약탈과 갈등 속에서 나비족 내부의 분열과 배신까지 겹치며,\n판도라의 진정한 평화와 운명을 건 역대급 스케일의 처절한 전투가 불을 뿜는다.\n\n제임스 카메론 감독이 빚어낸 경이로운 시각적 혁명과 세계관의 확장.', 
  '제임스 카메론', '샘 워싱턴, 조 샐다나', 
  'https://youtu.be/11jbQ6FMI4c?si=VzJLg8HQ1cJz2B0H'
),
(
  '넘버원', '15', '2026-03-05', 'SCREENING', 123, 
  'https://i.namu.wiki/i/hwZCeOemLAaVskw1i6Cc_VvnWw4YFtAd9xVkpEKRw8FqNEeyMPUaFGR1C8reyVXaEmLGLtsEKpVKkkdhEyzte694IhE3m7-5KuYRCa53fmZQuAJKrGegIod38wlqqJtJD2kdQ89QX2gmcvWr5DUNBg.webp', 
  '“내가 경찰인지 깡패인지, 나도 헷갈리기 시작했어”\n\n아시아 최고의 범죄 조직을 소탕하기 위해 신분을 위장하고 조직의 심장부로 잠입한 형사.\n매 순간 정체가 탄로 날 수 있는 극도의 긴장감 속에서,\n그는 조직의 1인자 ‘넘버원’의 신임을 얻기 위해 점차 잔혹하게 변해간다.\n\n경찰로서의 정의와 조직원으로서의 의리 사이에서 겪는 정체성의 혼란,\n그리고 배신과 음모가 난무하는 잔혹한 뒷골목의 생태계.\n\n피도 눈물도 없는 리얼 액션과 반전을 거듭하는 탄탄한 느와르의 정수.', 
  '김재훈', '이무생, 박서준', 
  'https://youtu.be/DSTM8WVMTUw?si=7-8bD8I7lFnvlwIM'
),
(
  '전지적 독자 시점', '15', '2026-03-07', 'SCREENING', 142, 
  'https://i.namu.wiki/i/aqqVjBh13iCrEkHeDZlC_CTj5YwXPxl4fJH8qB8W0v2XTKpFJyWyRhIy9AuyyEV97qfEubGlEAC6s3TbPVB1O_l_oREAJcu-QYru_Sc8T-8jHwRXRxQbSaZbaJLa4--k1_AK4oaLRCK6AUc5ny9YFw.webp', 
  '내가 읽던 소설이 현실이 되었다.\n\n멸망해버린 현실 속에서, 오직 자신만이 결말을 알고 있는\n소설의 내용대로 세상이 변해가기 시작한다.\n\n평범한 직장인이었던 김독자는 소설 속 주인공 유중혁과 함께\n세상의 멸망을 막기 위해 험난한 여정에 나선다.\n\n웹소설의 신화, 스크린으로 완벽하게 부활하다!\n상상을 초월하는 스케일의 판타지 블록버스터.', 
  '김병우', '안효섭, 이민호, 채수빈, 신승호', 
  'https://youtu.be/Xb96_61kMS8?si=v9rt24m4lwfG_ZHj'
),
(
  '백설공주', 'ALL', '2026-03-08', 'SCREENING', 110, 
  'https://i.namu.wiki/i/Ax5qM9_Q_aqVQZ6XYtBJq464n1NT5W8DfeB9dRp4QiK125mzV3IclhbNDsFfangnIzNy8OXjI6wZSGKtudLcs0-m-MleWGhknfbLjU8CzZeryP1eNoYPhOnaWApVN_cLbQz6JkmDnhhccXpg_N7EvQ.webp', 
  '세상에서 가장 아름다운 마법이 시작된다!\n\n시대를 초월해 사랑받아 온 디즈니 애니메이션의 전설적인 명작이\n압도적인 영상미의 실사 영화로 재탄생했다.\n\n자신의 아름다움을 질투하는 폭군 여왕의 마수를 피하기 위해 마법의 숲으로 달아난 공주.\n그곳에서 성격도 생김새도 제각각인 일곱 난쟁이들과 만나며 겪는 환상적인 모험!\n\n스스로 운명을 개척하려는 공주의 당찬 모습과\n귀를 사로잡는 아름다운 OST가 스크린 위에 마법처럼 펼쳐진다.', 
  '마크 웹', '레이첼 지글러, 갤 가돗', 
  'https://youtu.be/9aAUvdtBg1w?si=4F5R-yJRHXigQpUa'
),
(
  '쥬라기 월드: 리버스', '12', '2026-03-01', 'SCREENING', 124, 
  'https://i.namu.wiki/i/oGbOGvV3VVrpe176NyQC4lXKCs5M6rtEnSpxslPE29jHUnbz5DvzEabuP4-nq61SqKYGFxVvJzVdZGFeYxG5LoUZSY_VpD9K4wNHOUXg9sUB4qkb9VDZ3dV_hMVjZlH3gpV1nU5X0_YRwLbJs4oGWA.webp', 
  '인류와 공룡, 공존은 가능한가!\n\n공룡들이 전 세계로 퍼져나간 후 수년이 지난 세계.\n새로운 기후 환경에 적응하며 진화해가는 공룡들과\n그들을 통제하려는 인간들 사이의 아슬아슬한 공존이 이어진다.\n\n하지만 심해에서 깨어난 거대한 고대 생명체의 등장으로\n지구의 생태계는 다시 한번 피할 수 없는 멸망의 위기를 맞이하는데...\n\n쥬라기 시리즈의 새로운 챕터를 여는 압도적인 맹수들의 귀환.', 
  '가렛 에드워즈', '스칼렛 요한슨, 마허샬라 알리', 
  'https://youtu.be/s8FkMUhu62Q?si=UhVlR-LpxdUrah3n'
),
(
  'F1 더 무비', '18', '2026-03-02', 'SCREENING', 118, 
  'https://img.megabox.co.kr/SharedImg/2025/06/12/hWiZN7PP9G18jB18bS2BfyOTRDPpJH0m_420.jpg', 
  '최고가 되지 못한 전설 VS 최고가 되고 싶은 루키\n\n한때 주목받는 유망주였지만 끔찍한 사고로 F1®에서 우승하지 못하고\n한순간에 추락한 드라이버 "소니 헤이스"(브래드 피트).\n그의 오랜 동료인 "루벤 세르반테스"(하비에르 바르뎀)에게\n레이싱 복귀를 제안받으며 최하위 팀인 APXGP에 합류한다.\n\n\n그러나 팀 내 떠오르는 천재 드라이버 "조슈아 피어스"(댐슨 이드리스)와\n"소니 헤이스"의 갈등은 날이 갈수록 심해지고.\n설상가상 우승을 향한 APXGP 팀의 전략 또한 번번이 실패하며\n최하위권을 벗어나지 못하고 고전하는데···\n\n\n빨간 불이 꺼지고\n운명을 건 레이스가 시작된다!',
  '조셉 코신스키', '브래드 피트, 댐슨 이드리스, 케리 콘돈, 하비에르 바르뎀', 
  'https://youtu.be/6a_X77HO4Vk?si=HZVIxkSqfj8zRahU'
),
(
  'Weapons', '18', '2026-03-03', 'SCREENING', 125, 
  'https://upload.wikimedia.org/wikipedia/en/6/6d/Weapons_film_2025.jpeg', 
  '조용한 마을에 숨겨진 끔찍한 진실.\n\n미국의 한 한적한 마을,\n고등학생들이 하나둘 기괴한 방식으로 연쇄 실종되는 사건이 발생한다.\n사건의 실마리를 쫓던 보안관과 가족들은\n평범해 보이던 이웃들이 감추고 있던 소름 끼치는 비밀을 마주하게 된다.\n\n<바바리안> 감독이 선사하는,\n인간 내면의 심연을 파고드는 예측 불가의 공포 스릴러.', 
  '잭 크레거', '조슈 브롤린, 줄리아 가너', 
  'https://youtu.be/0hQBYzzP-cQ?si=78KD8RCZSOz7bt6I'
),
(
  '드래곤 길들이기', 'ALL', '2026-03-04', 'SCREENING', 112, 
  'https://i.namu.wiki/i/xQpJRL_vmC5fTpHDXD_JjN_RrxhOA2TvwkLyUK6kyHgaD8HEoBpi7VRzLhjoIL0GWj54KzWyaT6QZ3lpYBkN4Zc_fY1w1pLxw60EclWhEKphjQBXAzRDlNMkAPjQ6sQW2FUGM6PAk4kncIBhSo2_Gg.webp', 
  '하늘을 나는 가장 위대한 우정!\n\n드래곤과 끝없는 전쟁을 벌이는 바이킹 섬 버크.\n족장의 아들이지만 드래곤 사냥에 소질이 없는 소년 ‘히컵’은\n우연히 부상당한 나이트 퓨어리 드래곤 ‘투슬리스’를 만나게 된다.\n\n서로의 상처를 보듬으며 금지된 우정을 쌓아가는 두 친구.\n과연 그들은 오랜 증오를 끊고 새로운 평화를 가져올 수 있을까?\n\n실사로 완벽하게 재탄생한 기적 같은 비행 어드벤처.', 
  '딘 데블로이스', '메이슨 테임즈, 니코 파커', 
  'https://youtu.be/eyeXAgO7rp8?si=kGSmvbINrXbJCp-9'
),
(
  '범죄도시4', '15', '2026-03-05', 'SCREENING', 109, 
  'https://i.namu.wiki/i/UogAq0peZvBLy5dtzxLQRy50Uyf0hlhDLG6sJidd55txUWpkrKdBu4ICUycCixpTfkLcXkbBSxWxqVFp627jAzjcMN0I8iwt8wTl2OOX2zv6nwBvOZpJ21gs6jvt5o4SNFCPpEIQcOSkvoeW1fb8aQ.webp', 
  '신종 마약 사건 해결 뒤 3년,\n대체불가 괴물형사 마석도와 서울 광수대는 배달앱을 이용한 마약 판매 사건을 수사하던 중\n대규모 온라인 불법 도박 조직과 깊게 연관되어 있음을 알아낸다.\n\n특수부대 용병 출신의 극악무도하고 피도 눈물도 없는 악당 백창기와\n천재 IT CEO 장동철을 단죄하기 위해 장이수까지 다시 합류하며,\n국경을 넘나드는 통쾌하고 거침없는 핵사이다 범죄 소탕 작전이 화려하게 펼쳐진다.', 
  '허명행', '마동석, 김무열, 박지환', 
  'https://youtu.be/Ninhkg7Jh48?si=2Uv-uVu0I0iHBMv3'
),
(
  '파묘', '15', '2026-03-06', 'SCREENING', 134, 
  'https://i.namu.wiki/i/s7pvpg2OTlOKtn7DH_RQz6zH-_xu1zLhdWRrUyCRlR5rPveek5E7roiuK7Ee3tR91VrjjLcnN3SdMiRFBO9cjdsYGnxMhb3zYC-QCh-EJvWLBkvfEkL_RwQ9ocsczOiiU0qRF2oq4wykjnjD6DFHeg.webp', 
  '미국 LA, 거액의 돈을 받고 수상한 의뢰를 수락한 무당 화림과 봉길은\n기이한 병이 대물림되는 집안의 장손을 만난다.\n조상의 묫자리가 화근임을 직감한 화림은 이장을 권유하고, 풍수사 상덕과 장의사 영근이 합류한다.\n\n절대 사람이 묻힐 수 없는 흉악한 악지에 자리한 기이한 묘.\n마침내 파묘를 시작하자 나와서는 안 될 불길한 것들이 깨어나는데...\n\n한국형 오컬트 미스터리의 정수를 보여주는 압도적 몰입감!', 
  '장재현', '최민식, 김고은, 유해진, 이도현', 
  'https://youtu.be/rjW9E1BR_30?si=CcHMF2l3UkNsive2'
),
(
  '듄: 파트 2', '12', '2026-03-07', 'SCREENING', 166, 
  'https://i.namu.wiki/i/8aM3jWsB4s49B9-Nc9b2jeHiPYI5xgDCuHj6T4rPYbnQHq_bEqRnw8rDxQhYViEKuUTb7HsU0gqBZj94TKIXp6F66VrYAznW5l2QNjhDDk6Izve-NVtRaczYMxD5DAVSCEw0s2uCpn3B-WSHqBkk5g.webp', 
  '황제의 모략으로 멸문당한 아트레이데스 가문의 후계자 폴.\n사막 행성의 거친 부족 프레멘들과 은신하며 복수의 칼날을 날카롭게 간다.\n\n마침내 스스로의 능력을 깨닫고 각성한 폴은 프레멘의 구원자이자 전사로서\n황제와 하코넨 가문을 향한 거대한 반격의 서막을 올린다.\n\n거대한 모래벌레를 타는 웅장한 액션과 아라키스의 경이로운 비주얼!\n스크린에서 반드시 경험해야 할 SF 마스터피스.', 
  '드니 빌뇌브', '티모시 샬라메, 젠데이아', 
  'https://youtu.be/81JOj5-xNGc?si=GFDBTfH70f-4P1Jr'
),
(
  '서울의 봄', '12', '2026-03-08', 'SCREENING', 141, 
  'https://i.namu.wiki/i/V8AGSQjVdPVWtahA7GV5cg5o-ti0TDxy6md_e_9bN2_HcQCg4skEu4cqzLTg0MPBC64UBQyUbgQGiemmmyceqAGy9Za3HQvyRF2jtyx3LU3nq837_mCmOVGRNVvK3qAgZY4CyuTgI7htubGBMEHrPw.webp', 
  '1979년 12월 12일, 짙은 어둠이 깔린 수도 서울.\n신군부 세력의 반란을 막기 위한 일촉즉발의 9시간을 생생하게 그린 영화.\n\n권력에 눈이 먼 보안사령관 전두광을 주축으로 한 반란군과,\n국가의 명운을 지키기 위해 고군분투하는 수도경비사령관 이태신을 비롯한 진압군!\n팽팽하고 숨 막히는 대립이 대한민국 현대사의 가장 긴박했던 하룻밤을 재현한다.\n\n연기파 배우들의 폭발적인 시너지가 압권인 명작.', 
  '김성수', '황정민, 정우성, 이성민', 
  'https://youtu.be/-AZ7cnwn2YI?si=bJeVzDxBNoAM7StX'
),
(
  '탑건: 매버릭', '12', '2026-03-01', 'SCREENING', 130, 
  'https://i.namu.wiki/i/dkrQaqSD0CfNHbbmyUOO5CpxnVL4x-3-x3s9DS0-32vslJxIWK22nbupFreSFXpR9vTHwd9iLhHhad8829eF_NT1I0ifRbm3AOvMZ4szMOv-6aFvtyj_aQuSvoJ6Obk91J_8lRnwrnzNXpRTWZXs-w.webp', 
  '최고의 조종사로 꼽히는 ‘매버릭’(톰 크루즈)은\n자신이 졸업한 훈련학교 교관으로 발탁된다.\n\n그의 명성을 모르던 팀원들은 매버릭의 지시를 무시하지만\n실전을 방불케 하는 상공 훈련에서 눈으로 보지 않고는 믿을 수 없는 전설적인 조종 실력에 압도된다.\n\n국경을 뛰어넘는 위험한 임무가 주어지고,\n매버릭은 자신이 가르친 동료들과 함께 마지막이 될지 모를 비행에 나선다!\n\n관객을 압도하는 극한의 고공 액션 블록버스터!', 
  '조셉 코신스키', '톰 크루즈, 마일즈 텔러', 
  'https://youtu.be/Mrj9XACVJ8U?si=E4BVwjFQ4NEWt1bW'
),
(
  '엘리멘탈', 'ALL', '2026-03-02', 'SCREENING', 109, 
  'https://i.namu.wiki/i/sXoaeMABOsHuJkjF6fn5uTkxB0afWAyiNFBvhVUVcgsy_C3D0XTsAUMmch384bcH6xDYd_HQEsl4f--2j6o1cAn1rxOefy7Ig8Dq_-9E9JW7-9PEoIGSl6N6z950Eeqj9iqOTjzmzlP3k7rpuYsKKA.webp', 
  '불, 물, 공기, 흙 4개의 원소가 각자의 구역을 나누어 살고 있는 신비롭고 눈부신 ‘엘리멘트 시티’.\n불처럼 뜨겁고 열정 넘치는 성격을 가진 앰버는 어느 날 우연히 유쾌하고 물 흐르듯 사는 웨이드를 만난다.\n\n절대 섞일 수 없는 정반대의 성향을 가진 두 원소는\n함께 도시 곳곳을 누비며 특별하고 아름다운 우정을 쌓아가고,\n앰버는 부모님의 기대와 자신의 진짜 꿈 사이에서 새로운 가능성을 발견하게 된다.\n\n가슴 따뜻해지는 픽사의 상상력과 시각적 경이로움!', 
  '피터 손', '레아 루이스, 마무두 아티', 
  'https://youtu.be/BOqFRHCrN-k?si=EBNrSLbZycxywxag'
),
(
  '글래디에이터 II', '18', '2026-03-03', 'SCREENING', 148, 
  'https://i.namu.wiki/i/7x7J92kINb2AG_CyR6yIhyspYkIGu8YRbdBIEzA-YmFsoxJ9w2ULsJDZ__O7Pzdee3SH9wvtiAq_QcVxPvf-DDEvFN71f74lK2WyFZTOKPdQ6gFaRzEY-kxtCC721hYH1w5RxKN3NwqvXQmazr6kxQ.webp', 
  '위대한 영웅 막시무스의 숭고한 죽음으로부터 20여 년이 흐른 로마 제국.\n잔혹한 폭군 황제들의 억압 아래 평화로운 삶을 잃고 노예로 전락한 루시우스가\n피비린내 나는 콜로세움의 거친 모래바닥 위에서 검투사로 새롭게 거듭난다.\n\n위대한 로마의 꿈을 재건하기 위해, 그리고 무자비한 권력에 맞서\n자신의 진정한 운명을 되찾기 위해 목숨을 건 처절한 복수와 검투 액션!\n\n명장 리들리 스콧 감독의 압도적인 연출과 웅장한 스케일이 스크린에 부활한다.', 
  '리들리 스콧', '폴 메스칼, 페드로 파스칼', 
  'https://youtu.be/yYc9tYC1DoU?si=Ci_UEHKzOMIgIP-o'
),
(
  '헤어질 결심', '15', '2026-03-04', 'SCREENING', 138, 
  'https://i.namu.wiki/i/jYE6lSEYsw4Z1MWQmMniXcaGa_-E2PIGD_MyXjIhAXCP9bORvnw9fc78yEY6ia98ETb5Y9nyh-5E_ksuzLz43PzMJtD5ai_rAFbEODcVBNlD5phNGvAusaS8DjFMXoCYR-d6JwI7xROWLo4wz-riKA.webp', 
  '산에서 벌어진 변사 사건을 수사하게 된 형사 해준.\n그는 유력한 용의자로 지목된 사망자의 아내 서래를 만나게 되고,\n탐문과 신문을 이어가며 그녀를 향한 의심과 동시에 묘한 관심과 이끌림을 느끼게 된다.\n\n수사가 진전될수록 짙어지는 미스터리 속에서 두 사람의 복잡 미묘한 감정이\n얽히고설키며 만들어내는 매혹적이고 짙은 여운의 로맨스.\n\n박찬욱 감독이 선사하는 가장 우아하고 아름다운 서스펜스 멜로.', 
  '박찬욱', '박해일, 탕웨이', 
  'https://youtu.be/i50tT8n9fp8?si=v1AniPnlk_dOwvSX'
),
(
  '인터스텔라', '12', '2026-03-05', 'SCREENING', 169, 
  'https://i.namu.wiki/i/3mjhNGLLkZDVpos2EwWv0TjVIrOzeHpQHhbgLHThe9Ecyyg5rjBjK6tByNH1KeG9pzqubAZGQMsvFBGfAjrYEDkZz1zMnTUzJOz5_08o_BHzXy2QefAG75OvjJuRRQSep_6hPQQteWvcVG2dSCxizQ.webp', 
  '식량 부족과 잦은 모래 폭풍으로 세계 경제가 완전히 붕괴된 근미래.\n멸망을 앞둔 인류를 구원할 유일한 희망을 찾기 위해 시공간의 거대한 틈인\n웜홀을 통해 신비로운 우주로 떠나는 탐험가들의 숭고하고 처절한 여정.\n\n닿을 수 없는 거리를 넘어 가족을 다시 만나겠다는 사랑의 힘과,\n우주의 경이로운 물리 법칙이 완벽하게 결합된 크리스토퍼 놀란의 걸작.\n\n스크린으로 다시 만나는 압도적인 우주 대서사시!', 
  '크리스토퍼 놀란', '매튜 맥커너히, 앤 해서웨이', 
  'https://youtu.be/d2VN6NNa9BE?si=LkpquCsbFNhfE_tY'
),
(
  '스즈메의 문단속', '12', '2026-03-06', 'SCREENING', 122, 
  'https://i.namu.wiki/i/5gmnJeBcT5Je5dmPJu1KshJkTzLcRsDI_PN3Q4uIsnPgDtIYQasjzJMJQajAm_6yPZVBHkC0wFi4pzR3UNofL_z7AMkfSRjnNLQZyPcUJk33-rVBLNyTvVdcTuD4yD0Yq8cp1qBlBvDoQRaAi3MLRA.webp', 
  '“이 근처에 폐허 없니? 문을 찾고 있어”\n\n규슈의 한적한 마을에 살고 있는 소녀 스즈메는 우연히 문을 찾아 여행 중인 청년 소타를 만난다.\n그의 뒤를 쫓아 산속 폐허에서 발견한 낡은 문.\n문을 열자 재난을 부르는 거대한 미미즈가 튀어나오려 하고, 스즈메는 문을 닫기 위한 여정에 오른다.\n\n과거, 현재, 미래를 잇는 문 너머의 세계.\n상처를 딛고 나아가는 모든 이들을 위한 신카이 마코토 감독의 따뜻한 위로와 경이로운 비주얼!', 
  '신카이 마코토', '하라 나노카, 마츠무라 호쿠토', 
  'https://youtu.be/hpaHfRUXisY?si=J9TBgRbrC1O0dBtL'
),
(
  '더 퍼스트 슬램덩크', '12', '2026-03-07', 'SCREENING', 124, 
  'https://i.namu.wiki/i/09GgSONokXgDK0rK74u1HIc-Xruy2jyzk4AbHS7warPh4QA-jRN-nFwhY1EnJGybWj173ZnIKpcbKKpxa2ldECQdOCiww9wqA4SM3KV2GFMG6knh1185MEVHnRmHdzMI89CvxHRLpdLOBvwrHBym4g.webp', 
  '전국 제패를 꿈꾸는 북산고 농구부 5인방의 꿈과 열정, 멈추지 않는 도전이 시작된다!\n\n어릴 적 형의 몫까지 다해 농구 코트를 누비는 포인트 가드 송태섭.\n그리고 그와 함께하는 강백호, 서태웅, 정대만, 채치수.\n절대 이길 수 없을 것 같았던 산왕공고와의 역사적인 경기가 스크린에 펼쳐진다.\n\n원작자 이노우에 다케히코가 직접 연출하여 탄생한 압도적인 작화와 박진감.\n다시 한번 심장을 뜨겁게 만들 농구 코트의 열기 속으로!', 
  '이노우에 다케히코', '나카무라 슈고, 카사마 쥰', 
  'https://youtu.be/cGNUpsevAk4?si=Fm05yspKEL6Ak599'
),
(
  '위대한 쇼맨', '12', '2026-03-08', 'SCREENING', 104, 
  'https://i.namu.wiki/i/E01i6di5W6vIqhrwCsGN6IWD5LcJA33Jf1bW0K_rc9_7A-m3A5k6fuH5N4P0yuuE3FahGliCGfocUA5EXGBCJjea80ZJPWZuwPF5hWPSyqDPX_A1YXzB-hQn9kCb66NztEpEGIeMFLrSXvU3rnr0eA.webp', 
  '불가능한 꿈, 그 이상의 쇼가 펼쳐진다!\n\n가난 속에서도 희망을 잃지 않던 P.T. 바넘은\n세상의 소외된 사람들을 모아 전무후무한 화려한 무대를 기획한다.\n\n세상의 편견과 비난에 맞서며 각자의 특별함을 당당하게 드러내는 단원들.\n우리는 누구나 특별하다는 메시지와 함께 눈과 귀를 사로잡는 오리지널 사운드트랙!\n\n휴 잭맨, 잭 에프론, 젠데이아의 완벽한 앙상블이 빛나는 위대한 뮤지컬 영화.', 
  '마이클 그레이시', '휴 잭맨, 미셸 윌리엄스', 
  'https://youtu.be/cnIOq6P8PUU?si=KZ_5C5AcU4njkgNJ'
),
(
  '밀수', '15', '2026-03-01', 'SCREENING', 129, 
  'https://i.namu.wiki/i/nSCyUOxUuVRjT7ejR9gwjdbUN-vxc1KLTfnBbvtij07KpbiQiTROyrJjn4OKpJ2sjuF-z0VKB5vXo8xoofC3cuzmE0TlkwqU80YGf_0SkUi8HP9eLgPpFljyH9V8ds8EzVsgdotzdXGN5nldtQgH4w.webp', 
  '평화롭던 바닷가 마을 군천에 화학 공장이 들어서면서 일자리를 잃은 해녀들.\n먹고 살기 위한 바다의 생존을 위해 바다에 던져진 밀수품을 건져 올리는 일에 뛰어든다.\n\n전국구 밀수왕 권 상사와 손을 잡고 점차 판이 커지는 가운데,\n바다를 둘러싸고 각자의 욕망을 숨긴 채 속고 속이는 거대한 쟁탈전이 벌어진다.\n\n류승완 감독 특유의 타격감 넘치는 수중 액션과 통쾌한 해양 범죄 활극!', 
  '류승완', '김혜수, 염정아, 조인성, 박정민', 
  'https://youtu.be/NaAw1lWSbMY?si=qHN9TalxWw8fUgZ8'
),
(
  '너의 이름은.', '12', '2026-03-02', 'SCREENING', 106, 
  'https://i.namu.wiki/i/2CTj1OwJxS7BQiiMPwqqj31t9BBaAKqvd4Cc6Aciu0FcawvdI9iTBREFJujjg0NT_67tccn0550tlkB72x0GFyUuW9KQCKUC8s4Fvwt0NdTPI_RQ9zV-du8QgWGxx0A9b0xabGBIuWSudYJ57Cw8Aw.webp', 
  '아직 만난 적 없는 너를, 찾고 있어.\n\n도쿄에 사는 소년 타키와 시골에 사는 소녀 미츠하.\n어느 날, 알 수 없는 이유로 서로의 몸이 바뀌는 기이한 꿈을 꾸게 된다.\n\n낯선 환경 속에서 엇갈리는 일상을 살아가며 점차 서로에게 특별한 감정을 느끼게 된 두 사람.\n하지만 혜성이 지구에 접근하던 날, 운명의 시간이 다가오고\n그들의 애틋한 기억과 시간을 뛰어넘는 기적이 펼쳐진다.\n\n가슴을 울리는 신카이 마코토의 절대적인 감성 명작.', 
  '신카이 마코토', '카미키 류노스케, 카미시라이시 모네', 
  'https://youtu.be/0GtEGZv1_Os?si=pcMoE9lquJLbFr3lI'
),
(
  '오펜하이머', '15', '2026-03-03', 'SCREENING', 180, 
  'https://i.namu.wiki/i/vPBHFCv6bE42Ddq8VUOt1wB5lrxh83ORojHzTgtK8NIwGlGXF4Wq14kcId7oXP_NXEtS6JaH6x9y-3ppQRB89FdWgZNVVXd622Q-YJgVaRrJzuZD14GRETEA0oj54QI--ie2EtfW-DKFLJGn0IdU0g.webp', 
  '“나는 이제 죽음이요, 세상의 파괴자가 되었다.”\n\n제2차 세계대전, 세상을 구하기 위해 세상을 파괴할 수도 있는 선택을 해야만 했던\n천재 과학자 J. 로버트 오펜하이머의 파란만장한 삶과 맨해튼 프로젝트.\n\n핵무기 개발이라는 인류 역사상 가장 거대한 실험 뒤에 숨겨진 정치적 알력과 고뇌,\n그리고 천재 과학자가 짊어져야 했던 영혼의 무게를 집요하게 파고든다.\n\n크리스토퍼 놀란이 선사하는 강렬한 영화적 체험과 압도적인 마스터피스.', 
  '크리스토퍼 놀란', '킬리언 머피, 로버트 다우니 주니어', 
  'https://youtu.be/oSqK_v6zPoM?si=mjQYuru8bezEUhHj'
),
(
  '노량: 죽음의 바다', '12', '2026-03-04', 'SCREENING', 153, 
  'https://i.namu.wiki/i/nHwnlTz8ILnR_BzrajGMCbgoMrte6mBlifTIBS_muKuB8NGQEC3WM_AQCzMuwPoIpsZcH89qgZTkFZByyFg6Ve8zhpJcD1haX0LQiZ9K8L2KF78U69ZRB1He_waCuQnEaxQdT9t6ECSzADJSS9bcSg.webp', 
  '“이 원수를 갚을 수만 있다면 죽어도 여한이 없겠나이다!”\n\n임진왜란 발발 후 7년, 조선에서 퇴각하려는 왜군을 완벽하게 섬멸하기 위해\n이순신 장군이 조명연합함대와 함께 노량해협으로 나선다.\n\n자국의 이익을 꾀하는 명나라와 끝까지 발악하는 왜군 사이에서,\n이순신 장군은 조선의 명운을 건 최후의 전투를 결심한다.\n\n대한민국을 뜨겁게 울린 영웅 이순신 장군의 마지막 대서사시이자, 압도적인 해전 스펙터클!', 
  '김한민', '김윤석, 백윤식, 정재영, 허준호', 
  'https://youtu.be/gXEpZpnImY8?si=_1iAxu19XbRsCNFM'
),
(
  '라라랜드', '12', '2026-03-05', 'SCREENING', 127, 
  'https://i.namu.wiki/i/fdt5GIWqrEcUgmUqZDmMU7xxEiNKCAscOF1g0GgezHcaCTQ-ZU6LVESKlVv7GtnRCPncQtHmI2qrJAllrLo2zdT1wtuPzxBmGwuURMSCNbNjbX8koZq0QC_qJjGMA4shO4Z1gpQBhMXDjTRAfkNmaw.webp', 
  '꿈을 꾸는 사람들을 위한 별들의 도시 ‘라라랜드’.\n\n재즈 피아니스트 ‘세바스찬’(라이언 고슬링)과 배우 지망생 ‘미아’(엠마 스톤),\n인생에서 가장 빛나는 순간 만난 두 사람은 미완성인 서로의 무대를 만들어가기 시작한다.\n\n환상적인 로스앤젤레스를 배경으로 꿈과 사랑의 달콤함과 씁쓸함을 섬세하게 담아낸 이야기.\n마법처럼 스크린을 수놓는 음악과 춤, 눈을 뗄 수 없는 색채의 향연!\n\n전 세계를 매혹시킨 아름다운 뮤지컬 로맨스.', 
  '데이미언 셔젤', '라이언 고슬링, 엠마 스톤', 
  'https://youtu.be/Dt5hFexM5BI?si=JeABySIKalOu5bvm'
),
(
  '극한직업', '15', '2026-03-06', 'SCREENING', 111, 
  'https://i.namu.wiki/i/h5jSZQQwTbUgOjRJW9D-PkqoYE2KaHzztOtmYKhQjLy8MAYBYC9WhQp4yr857NSWaw-lKW52RziyPU8r9Tut71mXX4b_qLUaTyu_G1lGllSfw_XjwZM-d04GHrjnvwldVTKXjHO6whpUfjeU3W176A.webp', 
  '“지금까지 이런 맛은 없었다. 이것은 갈비인가 통닭인가!”\n\n해체 위기의 마약반 5인방, 범죄조직 소탕을 위해 위장 창업을 결심한다.\n그들이 잠복근무로 인수한 허름한 치킨집이 뜻밖의 절대미각을 발휘하며\n일약 맛집으로 입소문이 나면서 대박을 터뜨린다.\n\n수사는 뒷전, 치킨 튀기기에 바빠진 마약반 형사들의 기상천외한 이중생활!\n과연 이들은 치킨집 사장님에서 형사 본연의 임무로 돌아와 범인을 잡을 수 있을까?\n\n쉴 틈 없이 터지는 코미디의 정석!', 
  '이병헌', '류승룡, 이하늬, 진선규, 이동휘, 공명', 
  'https://youtu.be/BaIRaKXrLPk?si=2Qy37I5ssP7jZOpZ'
),
(
  '어벤져스: 엔드게임', '12', '2026-03-07', 'SCREENING', 181, 
  'https://i.namu.wiki/i/_WG0CQk2BwHmjVg49-sLvMziZ0rMnuYUaYMdt1GeLWsPDQp4VyXgFsTu1KWJ31bdxYyeFFfL8Oy3za3RUiNArrC4yPKTazGTnGrIi_43vouKT8AINiC0YIP8fsMpSZEIoFwEG4bJQbIWkMyLBKXOzA.webp', 
  '타노스의 핑거 스냅으로 우주 생명체의 반이 사라진 충격적인 패배 이후.\n살아남은 어벤져스 멤버들은 절망을 딛고 마지막 희망을 찾아 나선다.\n\n양자 영역을 통해 시간을 되돌려 인피니티 스톤을 되찾으려는 일생일대의 작전!\n모든 것을 걸고 다시 뭉친 마블 히어로들의 숭고한 희생과 장엄한 최후의 전투가 시작된다.\n\n“어벤져스, 어셈블!”\n마블 시네마틱 유니버스의 10년을 집대성한 가장 위대한 피날레.', 
  '앤서니 루소, 조 루소', '로버트 다우니 주니어, 크리스 에반스', 
  'https://youtu.be/Ko2NWhXI9e8?si=p0YozGBKwTV69nra'
),

-- ==========================================
-- [2] UPCOMING: 개봉 예정 (개봉일 2026-03-26 ~ 2026-03-31) - 23개
-- ==========================================
(
  '어벤져스: 둠스데이', '12', '2026-03-26', 'UPCOMING', 160, 
  'https://i.namu.wiki/i/JH8nbLGXbOvSQ92NwvULPeV35pR8rtKbcRfhhbD7noCtM4gkFO7Uv693UM8CXfexuVnvQoI275U5iAw_Gl0eLSU5RmjmOcfYOid4inlCjk0IW18QDaL8TCscOlsrbo1_DeIlTiop9MpxR4XYVGJT8A.webp', 
  '멀티버스의 붕괴, 최악의 적이 온다!\n\n거듭된 변수로 차원의 붕괴가 걷잡을 수 없이 가속화되는 가운데,\n우주적 스케일의 재앙을 몰고 올 최악의 빌런 ‘닥터 둠’이 마침내 압도적인 위용을 드러낸다.\n\n각기 다른 차원에 뿔뿔이 흩어져 있던 새로운 어벤져스 멤버들은\n전 우주의 멸망을 막기 위해 시공간을 초월한 절망적이고 처절한 최후의 전투에 뛰어든다.\n\n모두를 충격에 빠뜨릴 엄청난 반전이 기다리는 마블의 새로운 서사시.', 
  '앤서니 루소, 조 루소', '로버트 다우니 주니어, 페드로 파스칼', 
  'https://youtu.be/TcMBFSGVi1c'
),
(
  '슈퍼 마리오 갤럭시', 'ALL', '2026-03-27', 'UPCOMING', 95, 
  'https://i.namu.wiki/i/wU67VBSzLZBlwDbeMm2PlJvXFRlmDAXH5pJma0PbHII6uftnEJgh3urTFUwd6gUvcltBwezMZUxxnHBma7OH0a8C1U4x6vbH0AlKAkDZTfbwUAt1Ohv37yXWoroBmthXW-pGm4AaQV8fFl7_H1Xw9Q.webp', 
  '더 커진 스케일, 멈출 수 없는 레벨 업!\n\n쿠파의 위협으로부터 버섯 왕국을 구하고 평화를 되찾은 마리오와 루이지 형제.\n하지만 우주 너머 미지의 악당이 요시들의 아름다운 섬을 침공하면서,\n피치 공주, 키노피오와 함께 또 다른 거대한 우주적 모험을 떠나게 된다.\n\n전편보다 훨씬 넓어진 방대한 세계관과 다채로운 파워업 액션!\n남녀노소 누구나 사랑하는 닌텐도 세계관의 유쾌한 패밀리 어드벤처.', 
  '아론 호바스', '크리스 프랫, 안야 테일러 조이', 
  'https://youtu.be/pMAPj6WVsT4'
),
(
  '토이 스토리 5', 'ALL', '2026-03-28', 'UPCOMING', 102, 
  'https://i.namu.wiki/i/P1iMjTaOI7bEP0bEJgl5q8JLR_MYjiUC7CFi8INxqX5rmJRUbRnJyn3pAbKtLWlamBrUp4wQ6YE058HOn1djR3tir-1abgAWkdvryZSE9X7QkfxE-7viRgsrL3ooT4dEVxkhUwtwRfWug0Ye57rUiQ.webp', 
  '“우리가 다시 아이들의 웃음을 되찾을 수 있을까?”\n\n우디와 버즈, 그리고 정든 장난감 친구들이\n스마트폰과 태블릿 등 화려한 전자 기기에 푹 빠져버린 현대의 아이들과 마주한다.\n\n아이들의 순수한 관심과 사랑을 되찾기 위해\n아날로그 장난감들이 온 힘을 모아 기상천외한 작전을 펼치며,\n그 속에서 변치 않는 우정과 진정한 가치에 대한 감동을 전한다.\n\n전 세계를 울고 웃긴 픽사의 상징적인 시리즈, 새로운 안녕.', 
  '앤드류 스탠튼', '톰 행크스, 팀 알렌', 
  'https://youtu.be/giXcoVnwOJA'
),
(
  '스파이더맨: 비욘드 더 스파이더버스', 'ALL', '2026-03-29', 'UPCOMING', 140, 
  'https://i.namu.wiki/i/fIG0-Ou9I73QeldPq-oKUZ0BatP9_SCXu6mEAQAWR-ZxswYMH4wdGi2iOAEII76Cz_jZZAjd8WGswHCyACTZ6w.webp', 
  '운명을 거스른 스파이더맨의 마지막 여정!\n\n자신의 세계를 구하기 위해 정해진 비극을 단호히 거부한 마일즈 모랄레스.\n스파이더 소사이어티의 맹렬한 추격을 받던 중 낯선 평행우주에 고립된 그는\n프라울러가 되어버린 또 다른 자신과 마주하게 된다.\n\n모든 스파이더맨의 운명이 걸린 거대한 멀티버스 전쟁의 한가운데서,\n가족과 사랑하는 이들을 지키기 위한 마일즈의 스펙터클한 피날레!', 
  '조아킴 도스 산토스', '샤메익 무어, 헤일리 스테인펠드', 
  'https://youtu.be/zSWdZVtXT7E'
),
(
  '만달로리안 & 그로구', '12', '2026-03-30', 'UPCOMING', 120, 
  'https://i.namu.wiki/i/BNkYi3DhoKyYC5qHtQg2eeTDNR6lk7reRmB2HvTaniEENDkxNc1vbCDqqHKmuWIUxiF8Z2Qgai0s2RbO6chtGeC7SbN0D0F3FFA29VO_kJDh_d307mqpMMww-1YFzlnHSehEtP9ZR--1H2ABDRubIA.webp', 
  '은하계 최고의 듀오, 스크린으로의 귀환!\n\n제국의 잔당들이 은하계 변방에서 새로운 어둠의 세력을 구축하며 평화를 위협한다.\n만달로어인의 긍지를 지키려는 현상금 사냥꾼 딘 자린은\n강력한 포스를 지닌 그로구를 보호하기 위해 목숨을 건 위험한 임무에 뛰어든다.\n\n전 세계를 열광시킨 마스터피스의 감동과 압도적 몰입감을\n스크린 스케일로 극대화한 스페이스 서부 액션 어드벤처.', 
  '존 파브로', '페드로 파스칼', 
  'https://youtu.be/0pdqf4P9MB8'
),
(
  '더 배트맨 파트 II', '15', '2026-03-31', 'UPCOMING', 155, 
  'https://preview.redd.it/what-do-you-not-want-in-the-batman-part-ii-v0-629dfkkjqwob1.png?auto=webp&s=f658291fcba32ad48d56894122ac60b640e6fb87', 
  '어둠이 짙어질수록, 진정한 복수가 깨어난다.\n\n리들러가 몰고 온 거대한 홍수 사태 이후, 폐허가 된 고담시.\n남겨진 부패의 파편들과 새롭게 세력을 뻗치는 범죄 조직들 속에서\n브루스 웨인은 배트맨으로서의 막중한 책임과 고독한 싸움을 이어간다.\n\n하지만 얼어붙은 고담에 미치광이의 새로운 살인 예고가 떨어지고,\n배트맨은 자신의 과거와 맞닿은 충격적인 진실을 마주하게 되는데...', 
  '맷 리브스', '로버트 패틴슨, 콜린 파렐', 
  'https://youtu.be/rF1Qh97Xf_M'
),
(
  '크루엘라 2', '12', '2026-03-26', 'UPCOMING', 128, 
  'https://i.namu.wiki/i/cDPE0U9dKI-YeG6GHNY1TTrHbjbiQ7DHJUW3M7fnypgE0zNUcQLpp5HyMLv7ckgZEs3aYUKAGCZwdc01W2_jGucDrUMQVZec8aBBdwDQlLAmfO8nGb61se8CZtodmDi0W6apBD-uKNIU5dMqC_a0Uw.webp', 
  '패션계의 여왕, 더 발칙하게 돌아왔다!\n\n남작 부인을 몰아내고 런던 패션계를 완벽하게 장악한 크루엘라 드 빌.\n화려하고 무자비한 그녀의 제국 앞에, 상상을 초월하는 재능과\n악랄함을 갖춘 새로운 젊은 라이벌이 등장하며 위기가 찾아온다.\n\n자신의 자리를 지키기 위해 모든 것을 건 크루엘라의\n더욱 파격적이고 스타일리시한 런던 스트릿 패션 전쟁이 시작된다!', 
  '크레이그 길레스피', '엠마 스톤, 엠마 톰슨', 
  'https://youtu.be/Zz3VKfd01Ks'
),
(
  '모아나 실사판', 'ALL', '2026-03-27', 'UPCOMING', 110, 
  'https://i.namu.wiki/i/xnfYUhtdhy8oiipLEV5eWy349YbwUWqV-bEDnSdCoVVA9kIngI4RUwvi_9_dbFrdPIkMzVFo65RZ3O9xhDGre-b5U-ztK80nE0UA1hSamGtpXnvwytemv5LyvpnQVikx1hjuEh4WuHQ7yLdqa3oajQ.webp', 
  '바다가 부르는 거대한 모험!\n\n광활하고 푸른 태평양의 섬 모투누이. 당찬 소녀 모아나가\n저주받은 섬을 구하기 위해 전설 속 영웅인 반인반신 마우이와 함께 끝없는 항해를 떠난다.\n\n바람과 바다를 다루는 마법 같은 시각 효과와\n실사로 완벽하게 부활한 테 피티의 심장을 찾는 경이로운 여정.\n\n전 세계 관객들의 귀를 사로잡을 환상적인 OST와 압도적 영상미의 뮤지컬 어드벤처.', 
  '토마스 카일', '드웨인 존슨, 캐서린 라가아이아', 
  'https://youtu.be/be_F2vP-C7I'
),
(
  '프로젝트 헤일메리', '12', '2026-03-28', 'UPCOMING', 142, 
  'https://i.namu.wiki/i/lUTNS5cM6mGp72b5mYQ2OhMGvtJZTuWWssXS6mcgsIGMLQMUkN-Ty5Bwj-oL1KbhEdI04udTNPUMy77nq0d3f7BbkzbVXSmwbqAdRWX0_uMUTbTTlu7raKlaQy4z2B875MATBHsVraZyBqFypikEjw.webp', 
  '“내 이름은 뭐지? 왜 우주 한복판에 있는 거야?”\n\n멸망의 위기에 처한 지구를 구하기 위해 항성 간 우주선 ‘헤일메리 호’에 탑승한\n중학교 과학 교사 출신 우주비행사 라일랜드 그레이스.\n\n하지만 오랜 동면에서 깨어난 그는 자신의 이름조차 기억하지 못한 채\n동료들의 시체와 함께 우주 한복판에 홀로 남겨져 있음을 깨닫는다.\n기억의 파편을 맞춰가며 인류 생존의 열쇠인 ‘아스트로파지’의 비밀을 풀어야만 하는 극한 상황!\n\n<마션> 앤디 위어 원작, 라이언 고슬링 주연의 2026년 최고 기대작 SF 블록버스터!', 
  '필 로드, 크리스토퍼 밀러', '라이언 고슬링, 잔드라 휠러', 
  'https://youtu.be/7V-tH9dK_8k'
),
(
  '메소드연기', '15', '2026-03-29', 'UPCOMING', 112, 
  'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/AA1VTMvk.img?w=768&h=1024&m=6&x=181&y=312&s=94&d=94', 
  '미친 연기가 진짜 미친 짓이 되었다!\n\n단역을 전전하던 무명 배우 ‘이동휘’가\n우연한 기회에 연쇄살인마 역을 맡게 되면서 벌어지는 예측 불허 블랙 코미디.\n\n완벽한 연기를 위해 캐릭터에 과도하게 몰입한 나머지,\n현실과 연기의 경계를 구분하지 못하고 점점 걷잡을 수 없는 기행을 일삼기 시작한다.\n주변 사람들을 경악하게 만드는 그의 소름 돋는 ‘메소드 연기’는\n뜻밖의 나비효과를 일으켜 실제 흉악 범죄 사건과 얽히게 되는데...\n\n웃음과 서늘한 스릴이 절묘하게 교차하는 독창적인 코미디 스릴러.', 
  '이기혁', '이동휘, 강찬희', 
  'https://youtu.be/wX_T3e-rY8A'
),
(
  '28년 후: 뼈의 사원', '18', '2026-03-30', 'UPCOMING', 128, 
  'https://i.namu.wiki/i/QGqyunurjpMLLJ2Es81a4CG8y494tFIFKc6tKjXKgHn_EYNodyljSchU7pFj1fNMCeupxuoJYQ9mrEd0Lw9gdg.webp', 
  '분노 바이러스, 진화는 끝나지 않았다.\n\n바이러스가 영국 전역을 초토화시킨 지 28년 후.\n문명은 흔적도 없이 사라졌고, 생존자들은 진화한 변종 감염자들과\n잔혹한 자연환경 속에서 짐승처럼 살아남기 위해 발버둥 친다.\n\n절망만이 남은 땅에서, 치료제의 단서가 숨겨져 있다는 전설 속 성지\n‘뼈의 사원’을 찾기 위해 마지막 희망을 품고 길을 나서는 소수의 생존자들.\n\n대니 보일 감독과 킬리언 머피가 20년 만에 다시 뭉친 충격적인 서스펜스.', 
  '대니 보일', '킬리언 머피, 조디 코머, 애런 테일러존슨', 
  'https://youtu.be/QjM2Z9K0N4s'
),
(
  '스페셜즈', '12', '2026-03-31', 'UPCOMING', 114, 
  'https://i.namu.wiki/i/4hatFLii5igYr9CI2EsVOUedh1UFutvJ3Qgn2m0MmDj11haYESbXrOA7irrp7E-5vsP3q9yYYdebYhJeHXTiJg.webp', 
  '“우리가 아니면 누가 이 아이들을 돌보겠습니까?”\n\n세상의 시선에서 소외된 중증 자폐 스펙트럼 장애인들과\n그들을 포기하지 않고 돕는 두 헌신적인 활동가 ‘브루노’와 ‘말리크’의 감동 실화.\n\n정부의 무관심과 재정적 어려움 속에서도,\n20년 넘게 무허가 시설을 운영하며 갈 곳 없는 아이들을 거두어들인\n이들의 무조건적인 연대와 사랑을 유쾌하고 가슴 따뜻하게 그려낸다.\n\n<언터처블: 1%의 우정> 감독이 선사하는 또 하나의 기적 같은 힐링 무비.', 
  '올리비에 나카체, 에릭 토레다노', '뱅상 카셀, 레다 카텝', 
  'https://youtu.be/A2eM9jQkZGw'
),
(
  '신의악단', '15', '2026-03-26', 'UPCOMING', 120, 
  'https://i.namu.wiki/i/A6c5x_x1h5mdwf6iGKIUEYyJ6O0kb8s0GSFyp90zVzr6Mc8eMhazCYffOObUPp-IAgiLzmcWhxnl49Ym1Dkbpw.webp', 
  '시대의 억압을 뚫고 나온 폭발하는 청춘의 선율!\n\n1970년대, 억압과 통제가 극에 달했던 암울한 시기.\n음악에 대한 순수한 열정 하나로 뭉친 젊은 청춘들이\n낡은 지하실에 모여 금지된 록 음악을 연주하며 자유를 갈망한다.\n\n핍박과 감시 속에서도 자신들만의 밴드 ‘신의악단’을 결성한 그들은,\n음악을 통해 세상을 향한 거침없는 저항의 목소리를 내기 시작한다.\n\n찬란했던 청춘들의 피 끓는 꿈과 좌절, 진한 우정을 담은 뜨거운 음악 드라마.', 
  '김형협', '박시후, 정진운', 
  'https://youtu.be/mH1m4xO9oXg'
),
(
  '차임', '18', '2026-03-27', 'UPCOMING', 110, 
  'https://i.namu.wiki/i/divWeUmyQwt4ZeQYK7f6cdYUxPO9Eh4wCCfLNyUxxXybT5Uui6n5PMO8RHQPCVSu9rGm6daKYvb2mLFJpoE8HQ.webp', 
  '귓가를 파고드는 죽음의 멜로디\n\n평범한 일상을 살아가던 사람들 사이에서 어느 날 갑자기 들려오는 불길한 종소리 ‘차임’.\n이 소리를 들은 사람들은 이성을 잃고 잔혹한 살인마로 돌변하여\n주변 사람들을 무참히 공격하기 시작한다.\n\n평화롭던 도시는 순식간에 아비규환의 지옥으로 변하고,\n소리의 근원을 추적하던 형사는 이 끔찍한 현상 뒤에 숨겨진\n초자연적인 악의 실체를 마주하게 되는데...\n\n일본 스릴러 거장 구로사와 기요시 감독의 소름 끼치고 기괴한 심리 공포.', 
  '구로사와 기요시', '요시오카 무츠오, 코미야마 루이나', 
  'https://youtu.be/6aZ6-X-J1Uo'
),
(
  '아기 티라노 디보', 'ALL', '2026-03-28', 'UPCOMING', 88, 
  'https://cdn.abcn.kr/news/photo/202602/86597_42707_2950.jpg', 
  '“고기보다 맛있는 건 예쁜 나뭇잎이야!”\n\n육식 공룡의 왕 티라노사우루스 가문에서 태어났지만,\n매일 고기 대신 싱싱한 나뭇잎과 달콤한 열매만 찾아다니는 별종 아기 티라노 ‘디보’.\n\n무시무시한 사냥꾼이 되라는 아빠의 기대를 저버리고 초식 공룡 친구들과 어울려 놀던 디보는,\n우연히 육식 공룡들의 거대한 사냥 계획을 알게 된다.\n위험에 처한 친구들을 구하기 위해 자신의 날카로운 이빨을 ‘평화’를 위해 사용하기로 결심한\n디보의 기상천외한 쥬라기 대모험!\n\n온 가족이 함께 즐기는 유쾌 발랄 가족 애니메이션.', 
  '최경선', '박지윤, 엄상현', 
  'https://youtu.be/pG8C9vX4bFk'
),
(
  '투어스 브이알 콘서트 : 러쉬로드', 'ALL', '2026-03-29', 'UPCOMING', 105, 
  'https://images.khan.co.kr/article/2026/03/04/news-p.v1.20260304.310629c5235c492ab45b62a9cc72495b_P1.jpg', 
  '글로벌 K-POP 대세 보이그룹 TWS(투어스)의\n첫 번째 단독 콘서트 현장을 스크린에서 만나다!\n\n압도적인 퍼포먼스와 팬들을 열광시킨 히트곡 무대들은 물론,\n무대 뒤에서 땀 흘리는 멤버들의 진솔한 백스테이지 비하인드 스토리까지 생생하게 담아냈다.\n\n마치 콘서트장 VIP석 한가운데 있는 듯한 짜릿한 현장감과 몰입감!\n신유, 도훈, 영재, 한진, 지훈, 경민.\n여섯 멤버가 팬들과 함께 만들어낸 감동적이고 환상적인 축제의 순간으로 당신을 초대합니다.', 
  '김동연', 'TWS (신유, 도훈, 영재, 한진, 지훈, 경민)', 
  'https://youtu.be/TcMBFSGVi1c'
),
(
  '인크레더블 2', 'ALL', '2026-03-30', 'UPCOMING', 115, 
  'https://i.namu.wiki/i/I8_5h-rkjFvYzLT_DlJEspobbbKM8tQNxzMTrtTBNkrkGZTJn7SeH616-QzSsCvdNoKk3lTlFokU_4gRt7sTUuBxEYANJZLa8zq30B_5wSRk8ZNKEcGYReda_Hs7FDobNKRTxn--RBgEMFUKRq31XA.webp', 
  '최강 슈퍼 히어로 가족이 더 강력해져서 돌아왔다!\n\n도시의 평화를 지키는 일상 속에서 점차 강력한 능력을 각성하는 막내 잭잭.\n하지만 히어로들을 멸종시키려는 새로운 지능형 악당이 등장하며,\n가족은 또다시 거대한 위기에 직면하게 된다.\n\n각자의 초능력을 조합해 기상천외한 팀워크를 선보이는 파 가족!\n화려한 액션과 유쾌한 웃음, 그리고 가족애까지 모두 담은 픽사 최고의 애니메이션.\n\n더 빠르고 강렬한 슈퍼히어로 액션을 스크린에서 즐겨라!', 
  '브래드 버드', '크레이그 T. 넬슨, 홀리 헌터', 
  'https://youtu.be/0pdqf4P9MB8'
),
(
  '조커: 폴리 아 되', '15', '2026-03-31', 'UPCOMING', 138, 
  'https://i.namu.wiki/i/Q0_-4XkkSn6PZEYcIotS-vxsLdYBghDIkJH7loPrVtnNYR9TQGmO0H0yem7zjLQ8UiRNYhaF-IIh4e3CkOPwYWSM2TvmlOQLc21PTm_gUVeOidfqbmbX8EJTyCH9hM9NyITnC6LuJFF_goElB-LJoA.webp', 
  '“내 삶이 비극인 줄 알았는데, 개 같은 코미디였어”\n\n아캄 수용소에 갇힌 채 자신만의 망상 속에서 살아가던 아서 플렉.\n그는 우연히 수용소에서 자신과 같은 광기를 공유하는 할리 퀸젤을 만나게 되고,\n두 사람은 음악과 춤을 통해 뒤틀린 사랑에 빠져든다.\n\n광기의 전염은 걷잡을 수 없이 퍼져나가 고담시 전체를 불태우기 시작하는데...\n호아킨 피닉스의 소름 돋는 연기와 레이디 가가의 강렬한 보컬이 만난\n잔혹하고 매혹적인 심리 뮤지컬 스릴러.', 
  '토드 필립스', '호아킨 피닉스, 레이디 가가', 
  'https://youtu.be/rF1Qh97Xf_M'
),
(
  '겨울왕국 2', 'ALL', '2026-03-26', 'UPCOMING', 108, 
  'https://i.namu.wiki/i/eA2rGgmntzVZbgOvYwE6pB8EvjjOqRuB02uXNWgGFneZTVSt3xnQSWsISgwDL-8S98mswQumfFwC4hOv7cbLgRHC5DxY7Cs5qKdwhLko6Wwkv_YyQ98hJ4IeD8QHDZxZwKs_hth_Mt2ebXZwdbGo4w.webp', 
  '다시 얼어붙은 세상, 새로운 비밀이 깨어난다!\n\n평화를 되찾은 아렌델 왕국과 마법의 숲. 하지만 북쪽 깊은 곳에 잠들어 있던\n고대의 어둠이 깨어나며 엘사와 안나 자매는 또 한 번 운명의 부름을 받게 된다.\n\n과거 부모님의 숨겨진 진실과 마법의 진짜 기원을 찾아 나서는 모험.\n올라프, 크리스토프, 스벤과 함께하는 가슴 벅찬 여정과\n귓가를 맴도는 새로운 OST의 감동!\n\n디즈니가 선사하는 또 한 번의 눈부신 마법이 스크린에 펼쳐진다.', 
  '제니퍼 리, 크리스 벅', '크리스틴 벨, 이디나 멘젤', 
  'https://youtu.be/zSWdZVtXT7E'
),
(
  '하얼빈', '15', '2026-03-27', 'UPCOMING', 130, 
  'https://i.namu.wiki/i/ZA9fSBUbZ8PkaV4cLAddDrURJ2l-hYZXewqnyrwKNjoA0kQQd_elEMAGcVTHVCokaOYhI4_i3aPIapRDfg9_A8c-y_Hity0sNOb2e1bfdv5luI8W2boi81kkYfkclGxdy81reG6pel1uMAHbzoLG0Q.webp', 
  '“대한의 독립을 위해 내 목숨을 기꺼이 바치리라.”\n\n1909년, 조국과 떨어진 만주벌판에서 독립군 참모중장 안중근은\n조국의 원수 이토 히로부미를 처단하기 위해 동지들과 함께 하얼빈으로 향한다.\n\n매서운 추위와 일본군의 집요한 추격 속에서도 굴하지 않는 신념!\n단 하나의 목표를 위해 목숨을 건 저격 작전과 쫓고 쫓기는 첩보전이 펼쳐진다.\n\n대한민국 역사상 가장 뜨거웠던 거사, 현빈의 압도적 열연으로 스크린에 부활한다.', 
  '우민호', '현빈, 박정민, 조우진, 전여빈', 
  'https://youtu.be/Zz3VKfd01Ks'
),
(
  '스마일 2', '18', '2026-03-28', 'UPCOMING', 120, 
  'https://i.namu.wiki/i/tISJvEGIjQsu4wuBsoRyTuXNyk1E7DUYtdQ_ys2shVzM0I7d39tHQdjByABEm2GVmtiTrFRHrRe96Ouqi27bnOsGsxZmtiaPX7HhvdOmf5lb10pmpeLsCad_wk2lp0S1QRFa-sAs4SZd9uvTEuA7mg.webp', 
  '웃음이 번지는 순간, 죽음이 다가온다.\n\n끔찍한 저주의 트라우마에서 간신히 벗어난 생존자들.\n하지만 기괴한 웃음을 띠며 자해하는 현상은 끝나지 않고,\n오히려 새로운 숙주를 찾아 전 세계로 더욱 잔혹하게 확산되기 시작한다.\n\n저주의 진정한 기원과 마주한 주인공은 살아남기 위해\n가장 소중한 사람을 희생해야만 하는 끔찍한 선택의 기로에 놓이는데...\n\n시각과 청각을 극한으로 조여오는 2026년 최강의 공포 영화.', 
  '파커 핀', '카일 갤너, 나오미 스콧', 
  'https://youtu.be/be_F2vP-C7I'
),
(
  '나이브스 아웃: 웨이크 업 데드 맨', '15', '2026-03-29', 'UPCOMING', 140, 
  'https://i.namu.wiki/i/-x7iHvWwd73pQKzcvLt-s3Uu0B5J1KLR__kUKE-cGSgy_OFLlmBeM2FhbSeLue7CWoyCQ76DvPMLqhQ7aMiYj40FT7-qvNPYlwJcfLmIV6kKN09W9Rwxj6EvQtDJxaurIQNzxCKY-1SJrKSqIEoB9Q.webp', 
  '다시 돌아온 천재 탐정 브누아 블랑의 완벽한 추리 게임!\n\n이번에는 영국 런던의 유서 깊은 대저택에서 벌어진 기괴한 밀실 살인 사건이다.\n용의자는 저택에 모인 8명의 명문가 상속자들.\n모두가 완벽한 알리바이를 주장하지만, 거짓말과 숨겨진 원한이 하나둘 수면 위로 떠오른다.\n\n화려한 미장센과 치밀하게 얽힌 단서들 속에서\n브누아 블랑은 허를 찌르는 반전으로 진범을 찾아낸다.\n\n한시도 눈을 뗄 수 없는 세련된 모던 추리 스릴러.', 
  '라이언 존슨', '다니엘 크레이그, 톰 하디, 조쉬 오코너', 
  'https://youtu.be/pMAPj6WVsT4'
),
(
  '드림스', '15', '2026-03-30', 'UPCOMING', 115, 
  'https://img.megabox.co.kr/SharedImg/2026/03/05/RlNU5Dq6zVfOhUbT0EQVFIgbyVYUrvak_420.jpg', 
  '멕시코 출신의 젊고 매력적인 무용수 ‘페르난도’는\n\n성공한 자선사업가이자 연인인 미국인 ‘제니퍼’와 함께할\n아메리칸 드림을 꿈꾸며 불법 입국을 감행한다.\n\n그러나, 제니퍼는 미국 상류사회에서 자신의 자리를 지키기 위해\n페르난도와 연인임을 숨기게 되고,\n두 사람 사이에 서서히 균열이 생기기 시작하는데…',
  '미셸 프랑코', '제시카 차스테인, 루퍼트 프렌드, 마샬 벨', 
  'https://youtu.be/TcMBFSGVi1c'
);



INSERT INTO 