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
    '서류': '#c2410c',
    '정책': '#1d4ed8',
    '프로세스': '#7c3aed',
    '용어·상태값': '#15803d',
    '공지': '#dc2626',
    '안내': '#6b7280'
  },

  // 검색창 아래 인기 검색어 태그. 이 배열만 수정하면 화면에 바로 반영됨.
  popularTags: ['해피콜', '상태값', '리뷰이관', '서류', '반려', '촬영'],

  // 관리자 모드(#admin)에서 GitHub Contents API로 data/*.js를 직접 수정할 때 사용하는 저장소 정보.
  github: {
    owner: 'asg-wiki',
    repo: 'delivery',
    branch: 'main'
  },

  // 일반 사용자 화면에서 "확인 필요" 뱃지를 띄우는 기준 (일)
  staleAfterDays: 90
};
