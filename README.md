# 배달 플랫폼 업무 백과사전

배달 플랫폼(쿠팡이츠, 배달의민족, 요기요, 땡겨요) 관련 업무 정보를
검색할 수 있는 정적 웹 백과사전. 순수 HTML + CSS + Vanilla JS로 제작되어
빌드 과정 없이 바로 배포/수정할 수 있다.

## 1. 새 항목 추가 방법

`data/<플랫폼>.js` 파일을 열어 **배열([ ]) 안**에 아래 형태의 객체를 하나 추가한다.
(파일 맨 위 `window.WIKI_DATA...` 줄은 화면에 데이터를 전달하기 위한 코드이므로 건드리지 않는다.)

```js
// data/coupang.js
window.WIKI_DATA = window.WIKI_DATA || {};
window.WIKI_DATA.coupang = [
  {
    "id": "coupang-새로운-항목-id",
    "platform": "쿠팡이츠",
    "type": "프로세스",
    "category": "예: 해피콜",
    "title": "검색 결과에 표시될 제목",
    "effective_date": null,
    "content": "마크다운 형식 본문",
    "links": [
      { "label": "링크 설명", "url": "https://..." }
    ],
    "tags": ["검색용", "동의어", "태그"],
    "updated": "2026-07-08"
  }
  // 항목이 더 있다면 콤마(,)로 구분해서 계속 추가
];
```

배열 안의 객체 하나하나는 순수 JSON 형식을 따른다 (키·문자열은 항상 큰따옴표,
마지막 항목 뒤에 콤마 금지). `node scripts/validate.js`가 이 형식을 그대로 검증한다.

### 필드 설명

| 필드 | 필수 | 설명 |
|---|---|---|
| id | O | 영문 소문자-하이픈. 플랫폼 접두어 포함. 전체 데이터에서 유일해야 함 |
| platform | O | "쿠팡이츠" / "배달의민족" / "요기요" / "땡겨요" 중 하나 |
| type | O | `서류` / `정책` / `프로세스` / `용어·상태값` / `공지` / `안내` 중 하나 |
| category | O | 자유 텍스트 소분류 (예: "해피콜", "리뷰이관") |
| title | O | 검색 결과에 표시되는 제목 |
| effective_date | X | 정책 적용/변경일 (YYYY-MM-DD). 없으면 null |
| content | O | 마크다운 본문. 제목(#), 굵게(**), 리스트(-), 표(\|), 링크([]()) 지원 |
| links | X | 외부 링크 배열. 없으면 빈 배열 `[]` |
| tags | O | 검색에 걸리길 원하는 동의어를 넉넉하게 등록 |
| updated | O | 최종 수정일 (YYYY-MM-DD) |
| pinned | X | `true`면 검색 결과 위에 공지 배너로 고정 표시 (없으면 일반 카드) |
| favorite | X | `true`면 "⭐ 자주 찾음" 뱃지가 붙고 목록 최상단에 정렬 (없으면 일반 정렬) |
| last_verified | X | 마지막으로 사실 확인한 날짜 (YYYY-MM-DD). 오늘로부터 90일(`config.js`의 `staleAfterDays`)이 지나면 "⚠️ 확인 필요" 뱃지가 자동으로 붙는다 |
| copy_text | X | 있으면 상세보기 하단에 "📋 안내문 복사" 버튼이 생기고, 클릭 시 이 텍스트가 클립보드에 복사됨 (안내 문구를 사장님께 그대로 전달할 때 사용) |

검색창 아래 "인기 검색어" 태그 목록은 `js/config.js`의 `popularTags` 배열에서 관리한다.
이 배열만 수정하면 화면에 바로 반영된다.

content(마크다운 표) 작성 예시:

```
| 상태값 | 의미 |
|---|---|
| 작성중 | 포털 4단계 미가입 |
```

## 2. 기존 항목 수정 방법

해당 항목을 `data/*.js`에서 찾아 필요한 필드를 직접 수정하고,
**반드시 `updated` 필드를 오늘 날짜로 갱신**한다.

## 3. 데이터 검증 (`node scripts/validate.js`)

데이터 추가/수정 후 배포 전에 아래 명령으로 형식 오류를 확인한다.

```bash
node scripts/validate.js
```

검증 항목:
1. 모든 데이터 파일의 배열 부분이 파싱 가능한가
2. 필수 필드 누락 여부
3. id 중복 여부 (전체 파일 통합 기준)
4. platform / type 값이 허용 목록에 있는가
5. 날짜 형식(YYYY-MM-DD) 검사

오류가 있으면 어떤 파일의 몇 번째 항목이 문제인지 콘솔에 출력된다.
(Node.js가 설치되어 있지 않다면 [nodejs.org](https://nodejs.org)에서 LTS 버전을 설치한다.)

## 4. 로컬에서 미리보기

데이터를 `<script src="data/coupang.js">` 방식으로 불러오기 때문에,
**`index.html`을 그냥 더블클릭해서 열어도(`file://`) 정상적으로 데이터가 표시된다.**
별도의 로컬 서버 없이 바로 검색·필터·상세보기(카드 클릭)·모바일 화면
(개발자 도구 반응형 모드)을 확인하면 된다.

(참고: GitHub Pages 등 정식 웹 서버에 올렸을 때도 동일한 방식으로 동작한다.)

## 5. GitHub Pages 배포 방법

1. GitHub에 새 저장소 생성 (예: `delivery-wiki`)
2. 이 폴더 내용을 push
   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin <저장소 URL>
   git push -u origin main
   ```
3. GitHub 저장소 → Settings → Pages → Source에서
   **Branch: main, Folder: / (root)** 선택 후 저장
4. 몇 분 후 `https://<계정>.github.io/<저장소명>/` 주소로 접속 확인
5. 이후 데이터 수정 → `git add . && git commit -m "..." && git push` 만 하면
   GitHub Pages에 자동 반영됨

## 6. 플랫폼 추가 시 절차 (배민/요기요/땡겨요 데이터 입력 시)

1. `data/<플랫폼>.js`에 항목 배열 추가 (빈 배열 `[]`을 실제 데이터로 교체)
2. `js/config.js`의 `platforms` 배열은 이미 4개 플랫폼이 등록되어 있으므로
   **수정 불필요**. 데이터가 채워지면 화면에서 자동으로 "준비중" 표시가 사라지고
   탭이 활성화된다.
3. 완전히 새로운 플랫폼(5번째)을 추가하는 경우에만
   `js/config.js`의 `platforms` 배열에 1줄 추가 + `data/` 폴더에 `.js` 파일 추가
   (파일 안에서 `window.WIKI_DATA.<플랫폼id> = [...]` 형태로 등록. `<플랫폼id>`는
   `config.js`에 적은 `id` 값과 반드시 일치해야 한다). `index.html`이나 `app.js`는
   수정할 필요 없다 — 데이터 파일은 화면 코드가 자동으로 읽어온다.

## 7. 관리자 모드 (사이트에서 직접 데이터 수정)

사이트 URL 뒤에 `#admin`을 붙여 접속하면 (예: `https://asg-wiki.github.io/delivery/#admin`)
관리자 모드가 켜지고, 카드마다 아래 토글 버튼이 나타난다.

- **📌 공지 고정/해제** → `pinned` 값을 true/false로 전환
- **⭐ 자주 찾음 지정/해제** → `favorite` 값을 true/false로 전환
- **✅ 확인일 갱신** → `last_verified`를 오늘 날짜로 갱신

버튼을 누르면 GitHub Contents API로 `data/*.js` 파일을 직접 읽어와 해당 항목만 수정한 뒤
바로 커밋한다. 저장 성공/실패는 화면 하단 토스트 메시지로 표시되고, 화면은 새로고침 없이
즉시 갱신된다. 단, **GitHub Pages에 실제로 반영되기까지는 1~2분 정도 걸릴 수 있다**
(관리자 모드 상단 배너에도 안내됨).

### 최초 진입 시 GitHub 토큰 입력

관리자 모드 첫 진입 시(또는 로그아웃 후) 화면 상단에 GitHub Personal Access Token
입력창이 뜬다. 아래 권한으로 fine-grained PAT를 발급해 입력한다.

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
2. **Repository access**: `asg-wiki/delivery` 저장소만 선택
3. **Permissions**: Repository permissions → **Contents: Read and write**
4. 생성된 토큰을 입력창에 붙여넣고 "저장" 클릭

입력한 토큰은 **브라우저의 localStorage에만 저장**되며 코드/저장소 어디에도 기록되지
않는다. 다른 사람 PC나 공용 PC에서 사용했다면 반드시 상단의 **"로그아웃"** 버튼으로
토큰을 삭제한다. 토큰이 만료되었거나 잘못된 경우 API가 401/403을 반환하면 자동으로
토큰을 지우고 재입력을 요청한다.

### 주의사항

- `#admin` 없이 접속한 일반 사용자 화면에는 토글 버튼, 배너 등 관리자 요소가 전혀 보이지 않는다.
- 저장 중에는 다른 카드의 토글 버튼도 잠시 비활성화되어 동시 수정으로 인한 충돌을 막는다.
- 저장소/브랜치 정보는 `js/config.js`의 `github` 설정(`owner`, `repo`, `branch`)에서 관리한다.
- 관리자 모드 상태는 `localStorage`에 저장되어 새로고침하거나 플랫폼 탭(`#coupang` 등)을
  이동해도 유지된다. "로그아웃" 버튼을 눌러야만 토큰과 함께 완전히 해제되고 일반 모드로 돌아간다.
- 저장 시 매번 최신 파일을 다시 받아오지 않고, 직전 저장 응답에서 받은 sha를 재사용한다
  (연속 저장 시 GitHub API의 읽기 지연으로 오히려 오래된 sha를 받는 것을 피하기 위함).
  그래도 다른 경로로 파일이 바뀌어 409 충돌이 나면 자동으로 한 번 새로 받아와 재시도하고,
  그래도 실패하면 새로고침을 안내하는 토스트가 뜬다.

## 8. 폴더 구조

```
delivery-wiki/
├── index.html          # 단일 페이지 (검색 + 목록 + 상세)
├── css/style.css
├── js/
│   ├── app.js          # 검색·필터·렌더링 로직 (data/*.js를 <script>로 동적 로드)
│   └── config.js       # 플랫폼 목록, 유형 목록 설정
├── data/
│   ├── coupang.js       # window.WIKI_DATA.coupang = [ ... ]
│   ├── baemin.js
│   ├── yogiyo.js
│   └── ddangyo.js
├── scripts/validate.js
└── README.md
```
