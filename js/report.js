// 제보하기 기능. app.js와 독립적으로 동작하는 별도 모듈이며,
// 기존 검색/관리자 모드 등 다른 기능의 코드나 데이터 파일은 건드리지 않는다.
(function () {
  'use strict';

  var FORM_ENDPOINT = 'https://formspree.io/f/meebyapr';

  var els = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    createFloatingButton();
    createModal();
  }

  function createFloatingButton() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'report-fab';
    btn.textContent = '📢 제보하기';
    btn.addEventListener('click', openModal);
    document.body.appendChild(btn);
  }

  function createModal() {
    var overlay = document.createElement('div');
    overlay.className = 'report-overlay';

    overlay.innerHTML =
      '<div class="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">' +
      '  <h2 class="report-title" id="report-title">잘못된 정보 제보</h2>' +
      '  <p class="report-desc">내용 오류, 변경된 정책, 추가 요청 등을 남겨주세요. 관리자에게 전달됩니다.</p>' +
      '  <form class="report-form">' +
      '    <label class="report-label">관련 플랫폼' +
      '      <select class="report-select" name="platform">' +
      '        <option value="">선택안함</option>' +
      '        <option value="배달의민족">배달의민족</option>' +
      '        <option value="쿠팡이츠">쿠팡이츠</option>' +
      '        <option value="요기요">요기요</option>' +
      '        <option value="땡겨요">땡겨요</option>' +
      '        <option value="공통">공통</option>' +
      '      </select>' +
      '    </label>' +
      '    <label class="report-label">제보 내용 *' +
      '      <textarea class="report-textarea" name="message" rows="4" placeholder="예: 해피콜 프로세스가 변경되었습니다. 이제는..."></textarea>' +
      '    </label>' +
      '    <label class="report-label">이름 또는 소속' +
      '      <input type="text" class="report-input" name="name" placeholder="예: 홍길동 / 인천지사 (익명 가능)">' +
      '    </label>' +
      '    <div class="report-actions">' +
      '      <button type="button" class="report-btn report-btn-cancel">닫기</button>' +
      '      <button type="submit" class="report-btn report-btn-submit">보내기</button>' +
      '    </div>' +
      '  </form>' +
      '  <div class="report-error"></div>' +
      '  <div class="report-success"></div>' +
      '</div>';

    document.body.appendChild(overlay);

    els.overlay = overlay;
    els.form = overlay.querySelector('.report-form');
    els.platform = overlay.querySelector('.report-select');
    els.message = overlay.querySelector('.report-textarea');
    els.name = overlay.querySelector('.report-input');
    els.error = overlay.querySelector('.report-error');
    els.success = overlay.querySelector('.report-success');
    els.submitBtn = overlay.querySelector('.report-btn-submit');
    els.cancelBtn = overlay.querySelector('.report-btn-cancel');

    els.cancelBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeModal();
      }
    });

    els.form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitReport();
    });
  }

  function openModal() {
    resetForm();
    els.overlay.classList.add('open');
  }

  function closeModal() {
    els.overlay.classList.remove('open');
  }

  function resetForm() {
    els.error.textContent = '';
    els.success.textContent = '';
    els.form.style.display = '';
    els.submitBtn.disabled = false;
    els.submitBtn.textContent = '보내기';
  }

  // 다른 모듈(app.js)의 내부 상태에 의존하지 않도록, 현재 펼쳐진 카드 제목을 DOM에서 직접 읽는다.
  function getCurrentPageLabel() {
    var openTitle = document.querySelector('.card.open .card-title');
    return openTitle ? openTitle.textContent : '메인';
  }

  function submitReport() {
    var message = els.message.value.trim();
    els.error.textContent = '';

    if (!message) {
      els.error.textContent = '제보 내용을 입력해주세요';
      return;
    }

    els.submitBtn.disabled = true;
    els.submitBtn.textContent = '전송 중...';

    var payload = {
      platform: els.platform.value,
      message: message,
      name: els.name.value.trim(),
      page: getCurrentPageLabel()
    };

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) {
        throw new Error('전송 실패');
      }
      els.form.style.display = 'none';
      els.success.textContent = '✅ 제보가 접수되었습니다. 감사합니다!';
      setTimeout(closeModal, 2000);
    }).catch(function () {
      els.error.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
      els.submitBtn.disabled = false;
      els.submitBtn.textContent = '보내기';
    });
  }
})();
