// 플랫폼/유형 설정. 플랫폼 추가 시 platforms 배열에 1줄 + data/*.js 파일 추가만 하면 됨.
const CONFIG = {
  platforms: [
    { id: 'coupang', name: '쿠팡이츠', color: '#0f6fff', file: 'data/coupang.js' },
    { id: 'baemin', name: '배달의민족', color: '#00c9a7', file: 'data/baemin.js' },
    { id: 'yogiyo', name: '요기요', color: '#e6392f', file: 'data/yogiyo.js' },
    { id: 'ddangyo', name: '땡겨요', color: '#ff8a00', file: 'data/ddangyo.js' }
  ],

  // 유형 추가 시 이 배열에 1줄 추가하면 화면에 자동 반영됨.
  types: ['서류', '정책', '프로세스', '용어·상태값', '공지', '안내'],

  typeColors: {
    '서류': '#6b7280',
    '정책': '#b91c1c',
    '프로세스': '#1d4ed8',
    '용어·상태값': '#7c3aed',
    '공지': '#c2410c',
    '안내': '#0f766e'
  }
};
