// 데이터 무결성 검증 스크립트
// 실행: node scripts/validate.js

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ALLOWED_PLATFORMS = ['쿠팡이츠', '배달의민족', '요기요', '땡겨요'];
const ALLOWED_TYPES = ['서류', '정책', '프로세스', '용어·상태값', '공지', '안내'];
const REQUIRED_FIELDS = ['id', 'platform', 'type', 'category', 'title', 'content', 'tags', 'updated'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

let errorCount = 0;

function reportError(file, index, message) {
  errorCount++;
  console.error(`[오류] ${file} - ${index}번째 항목: ${message}`);
}

function validateItem(file, index, item) {
  REQUIRED_FIELDS.forEach((field) => {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      reportError(file, index, `필수 필드 누락 - "${field}"`);
    }
  });

  if (item.platform && !ALLOWED_PLATFORMS.includes(item.platform)) {
    reportError(file, index, `허용되지 않은 platform 값 - "${item.platform}"`);
  }

  if (item.type && !ALLOWED_TYPES.includes(item.type)) {
    reportError(file, index, `허용되지 않은 type 값 - "${item.type}"`);
  }

  if (item.effective_date !== undefined && item.effective_date !== null && !DATE_RE.test(item.effective_date)) {
    reportError(file, index, `effective_date 형식 오류 - "${item.effective_date}" (YYYY-MM-DD 여야 함)`);
  }

  if (item.updated && !DATE_RE.test(item.updated)) {
    reportError(file, index, `updated 형식 오류 - "${item.updated}" (YYYY-MM-DD 여야 함)`);
  }

  if (item.last_verified !== undefined && item.last_verified !== null && !DATE_RE.test(item.last_verified)) {
    reportError(file, index, `last_verified 형식 오류 - "${item.last_verified}" (YYYY-MM-DD 여야 함)`);
  }

  if (item.tags && !Array.isArray(item.tags)) {
    reportError(file, index, 'tags는 배열이어야 함');
  }

  if (item.links && !Array.isArray(item.links)) {
    reportError(file, index, 'links는 배열이어야 함');
  }

  ['pinned', 'favorite'].forEach((field) => {
    if (item[field] !== undefined && typeof item[field] !== 'boolean') {
      reportError(file, index, `${field}는 boolean(true/false)이어야 함`);
    }
  });

  if (item.copy_text !== undefined && typeof item.copy_text !== 'string') {
    reportError(file, index, 'copy_text는 문자열이어야 함');
  }
}

// data/*.js는 `window.WIKI_DATA.<id> = [ ... ];` 형태의 스크립트 파일이다.
// 주석 줄(//으로 시작)은 제외하고, 남은 코드에서 가장 바깥쪽 대괄호 구간만 잘라내어 순수 JSON으로 파싱한다.
function extractArrayLiteral(raw) {
  const codeOnly = raw
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .join('\n');
  const start = codeOnly.indexOf('[');
  const end = codeOnly.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    return null;
  }
  return codeOnly.slice(start, end + 1);
}

function main() {
  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.js'));
  const idMap = new Map(); // id -> "file:index" (전체 파일 통합 기준 중복 검사)

  files.forEach((file) => {
    const fullPath = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf-8');
    const arrayText = extractArrayLiteral(raw);

    if (arrayText === null) {
      reportError(file, '-', '배열([ ... ]) 구간을 찾을 수 없음');
      return;
    }

    let json;
    try {
      json = JSON.parse(arrayText);
    } catch (e) {
      reportError(file, '-', `JSON 파싱 실패 - ${e.message}`);
      return;
    }

    if (!Array.isArray(json)) {
      reportError(file, '-', '최상위 구조는 배열이어야 함');
      return;
    }

    json.forEach((item, i) => {
      const index = i + 1;
      validateItem(file, index, item);

      if (item.id) {
        if (idMap.has(item.id)) {
          reportError(file, index, `id 중복 - "${item.id}" (이미 ${idMap.get(item.id)}에 존재)`);
        } else {
          idMap.set(item.id, `${file}:${index}`);
        }
      }
    });
  });

  if (errorCount > 0) {
    console.error(`\n검증 실패: 총 ${errorCount}건의 오류가 발견되었습니다.`);
    process.exit(1);
  } else {
    console.log(`검증 통과: 모든 데이터 파일(${files.length}개)이 정상입니다.`);
  }
}

main();
