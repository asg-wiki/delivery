// 쿠팡이츠 데이터. 아래 배열 안 내용만 추가/수정하면 됩니다.
// 배열 안은 순수 JSON 형식(큰따옴표, trailing comma 금지)을 유지해주세요 - 검증 스크립트가 이 형식을 그대로 파싱합니다.
window.WIKI_DATA = window.WIKI_DATA || {};
window.WIKI_DATA.coupang = [
  {
    "id": "coupang-portal-status",
    "platform": "쿠팡이츠",
    "type": "용어·상태값",
    "category": "포털 상태값",
    "title": "쿠팡이츠 포털 상태값 설명",
    "effective_date": null,
    "favorite": true,
    "content": "| 상태값 | 의미 |\n|---|---|\n| 작성중 | 포털 4단계 미가입 |\n| 접수 | 포털 4단계 가입완료 |\n| 대기중 | B2B매장 작업 및 연동 확인 중 |\n| 앱 노출중 | 라이브 중 |\n| 폐업 | 폐업으로 인한 미노출 중 |\n| 거래취소 | 오픈 전 거래취소 |\n| 온보딩중 확인필요 | 접수 후 장기 리젝 반려 |\n| 라이브 중 확인필요 | 미운영, 해지 확인 필요 매장 |\n| 라이브 중 확인완료 | 정상 해지 매장 |",
    "links": [],
    "tags": [
      "상태값",
      "포털값",
      "포털",
      "작성중",
      "접수",
      "대기중",
      "앱노출",
      "라이브",
      "폐업",
      "거래취소",
      "온보딩"
    ],
    "updated": "2026-07-07",
    "last_verified": "2026-07-07",
    "pinned": true
  },
  {
    "id": "coupang-photo-consent",
    "platform": "쿠팡이츠",
    "type": "안내",
    "category": "이미지 촬영",
    "title": "쿠팡이츠 무료 이미지 촬영 동의서",
    "effective_date": null,
    "content": "쿠팡이츠에서 무료 이미지 촬영을 1회 제공. 촬영 희망 시 아래 동의서 작성 필요.",
    "links": [
      {
        "label": "이미지 촬영 동의서 작성 (구글폼)",
        "url": "https://docs.google.com/forms/d/e/1FAIpQLSdbeWkcfhxyG83TNWZk502wO1hs20jQoDxOsnZ1tjOrcPSHnw/viewform"
      }
    ],
    "tags": [
      "이미지촬영",
      "촬영",
      "동의서",
      "무료촬영",
      "사진"
    ],
    "updated": "2026-07-07",
    "last_verified": "2026-07-07",
    "pinned": true
  },
  {
    "id": "coupang-review-transfer",
    "platform": "쿠팡이츠",
    "type": "정책",
    "category": "리뷰이관",
    "title": "리뷰이관 후 신규 매장 노출 기준",
    "effective_date": "2025-07-22",
    "pinned": false,
    "content": "- 리뷰이관 진행 시 라이브 후 다음날 별점·리뷰가 적용됨\n- 단, 라이브된 신규 매장에서 **별점·리뷰 중 1개라도 새로 생성되어야** 양도매장의 리뷰가 노출됨\n- ⚠️ 라이브 후 리뷰이관이 되었어도 새로운 별점·리뷰가 생성되지 않으면, 시간이 경과해도 이관된 리뷰는 노출되지 않음",
    "links": [],
    "tags": [
      "리뷰이관",
      "양도양수",
      "별점",
      "리뷰",
      "노출기준",
      "신규매장"
    ],
    "updated": "2026-07-07",
    "last_verified": "2026-07-08",
    "favorite": true
  },
  {
    "id": "coupang-happycall-process",
    "platform": "쿠팡이츠",
    "type": "프로세스",
    "category": "해피콜",
    "title": "쿠팡이츠 해피콜 진행 절차",
    "effective_date": null,
    "content": "전체 흐름: 모든 공정 진행 → 해피콜 완료 → 테스트 주문 수락 → 라이브 → 인덱싱\n\n- **유선해피콜**: 실무자 직접 소통(외국인, 시니어 등 대상). 커뮤 통해 신청 가능하나 반려 가능성 있음\n- **오토해피콜**: ARS 진행(샵인샵, 양도양수, 신규스토어 등). 11시/14시/17시 하루 3회, 최대 6회 진행\n- **테스트 주문**: 운영 시간 5분 전 1회, 부재 시 오후 2회 추가. 오토/유선 구분되며 오토 진행 시 인덱싱 없음\n- **인덱싱 타임**: 라이브 전환 후 앱 검색 노출까지 소요 시간 (최소 6시간)\n- ⚠️ 오토해피콜 6회 부재 시 유선으로 전환되며, 유선해피콜 일정 재수취 진행됨",
    "links": [],
    "tags": [
      "해피콜",
      "오토해피콜",
      "유선해피콜",
      "테스트주문",
      "인덱싱",
      "ARS",
      "라이브"
    ],
    "updated": "2026-07-07",
    "last_verified": "2026-07-07"
  }
];
