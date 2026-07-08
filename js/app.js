(function () {
  'use strict';

  var ADMIN_TOKEN_KEY = 'wiki_admin_token';

  var state = {
    platform: null,
    query: '',
    type: '전체',
    data: {}, // platformId -> array of items
    openIds: {}, // item id -> true if expanded
    isAdmin: false,
    token: null,
    saving: false
  };

  var els = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    els.tabs = document.getElementById('tabs');
    els.search = document.getElementById('search');
    els.popularTags = document.getElementById('popular-tags');
    els.chips = document.getElementById('chips');
    els.results = document.getElementById('results');
    els.resultCount = document.getElementById('result-count');
    els.adminBar = document.getElementById('admin-bar');
    els.toastContainer = document.getElementById('toast-container');

    // 관리자 모드 진입: URL이 #admin이면 활성화하고, 해시는 정상 플랫폼 라우팅을 위해 비워둔다.
    if (location.hash === '#admin') {
      state.isAdmin = true;
      state.token = localStorage.getItem(ADMIN_TOKEN_KEY);
      history.replaceState(null, '', location.pathname + location.search);
    }

    els.search.addEventListener('input', function (e) {
      state.query = e.target.value;
      renderResults();
    });

    window.addEventListener('hashchange', function () {
      applyHashPlatform();
      renderTabs();
      renderResults();
    });

    loadAllData().then(function () {
      applyHashPlatform();
      renderTabs();
      renderChips();
      renderPopularTags();
      renderAdminBar();
      renderResults();
    });
  }

  // data/*.js는 <script> 태그로 로드되어 window.WIKI_DATA[플랫폼id]에 배열을 등록한다.
  // fetch가 아닌 <script src> 방식이므로 GitHub Pages는 물론 file://로 직접 열어도 동작한다.
  function loadAllData() {
    window.WIKI_DATA = window.WIKI_DATA || {};
    var jobs = CONFIG.platforms.map(function (p) {
      return new Promise(function (resolve) {
        var script = document.createElement('script');
        script.src = p.file;
        script.onload = function () {
          state.data[p.id] = window.WIKI_DATA[p.id] || [];
          resolve();
        };
        script.onerror = function () {
          state.data[p.id] = [];
          resolve();
        };
        document.body.appendChild(script);
      });
    });
    return Promise.all(jobs);
  }

  function applyHashPlatform() {
    var hashId = location.hash.replace('#', '');
    var match = CONFIG.platforms.find(function (p) { return p.id === hashId; });
    if (match && (state.data[match.id] || []).length > 0) {
      state.platform = match.id;
    } else if (!state.platform) {
      var firstReady = CONFIG.platforms.find(function (p) { return (state.data[p.id] || []).length > 0; });
      state.platform = firstReady ? firstReady.id : CONFIG.platforms[0].id;
    }

    // 주소창 해시가 실제 표시 중인 플랫폼과 다르면 맞춰준다 (링크 공유 시 정확한 상태 보장)
    if (location.hash.replace('#', '') !== state.platform) {
      location.hash = state.platform;
    }
  }

  function renderTabs() {
    els.tabs.innerHTML = '';
    CONFIG.platforms.forEach(function (p) {
      var isEmpty = (state.data[p.id] || []).length === 0;
      var btn = document.createElement('button');
      btn.className = 'tab' + (p.id === state.platform ? ' active' : '') + (isEmpty ? ' empty' : '');
      btn.textContent = p.name + (isEmpty ? ' (준비중)' : '');
      if (p.id === state.platform) {
        btn.style.setProperty('--tab-color', p.color);
      }
      btn.addEventListener('click', function () {
        if (isEmpty) {
          alert('준비중입니다.');
          return;
        }
        location.hash = p.id;
      });
      els.tabs.appendChild(btn);
    });
  }

  function renderAdminBar() {
    if (!els.adminBar) return;
    els.adminBar.innerHTML = '';
    if (!state.isAdmin) return;

    var bar = document.createElement('div');
    bar.className = 'admin-bar';

    if (!state.token) {
      var label = document.createElement('span');
      label.className = 'admin-bar-label';
      label.textContent = '🔧 관리자 모드 — GitHub Personal Access Token을 입력하세요:';

      var input = document.createElement('input');
      input.type = 'password';
      input.className = 'admin-token-input';
      input.placeholder = 'ghp_... 또는 github_pat_...';

      var saveBtn = document.createElement('button');
      saveBtn.className = 'admin-btn';
      saveBtn.textContent = '저장';
      saveBtn.addEventListener('click', function () {
        var value = input.value.trim();
        if (!value) return;
        localStorage.setItem(ADMIN_TOKEN_KEY, value);
        state.token = value;
        renderAdminBar();
        toast('토큰이 저장되었습니다.', 'success');
      });

      bar.appendChild(label);
      bar.appendChild(input);
      bar.appendChild(saveBtn);
    } else {
      var notice = document.createElement('span');
      notice.className = 'admin-bar-label';
      notice.textContent = '🔧 관리자 모드 — 저장 후 GitHub Pages에 반영되기까지 1~2분 정도 걸릴 수 있습니다.';

      var logoutBtn = document.createElement('button');
      logoutBtn.className = 'admin-btn admin-btn-logout';
      logoutBtn.textContent = '로그아웃';
      logoutBtn.addEventListener('click', function () {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        state.token = null;
        renderAdminBar();
        toast('로그아웃되었습니다.', 'success');
      });

      bar.appendChild(notice);
      bar.appendChild(logoutBtn);
    }

    els.adminBar.appendChild(bar);
  }

  function toast(message, type) {
    if (!els.toastContainer) return;
    var el = document.createElement('div');
    el.className = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success');
    el.textContent = message;
    els.toastContainer.appendChild(el);
    setTimeout(function () {
      el.classList.add('toast-hide');
      setTimeout(function () { el.remove(); }, 300);
    }, 3000);
  }

  function setAdminButtonsDisabled(disabled) {
    document.querySelectorAll('.admin-toggle').forEach(function (btn) {
      btn.disabled = disabled;
    });
  }

  function renderPopularTags() {
    els.popularTags.innerHTML = '';
    (CONFIG.popularTags || []).forEach(function (tag) {
      var btn = document.createElement('button');
      btn.className = 'popular-tag';
      btn.textContent = '#' + tag;
      btn.addEventListener('click', function () {
        els.search.value = tag;
        state.query = tag;
        renderResults();
      });
      els.popularTags.appendChild(btn);
    });
  }

  function renderChips() {
    els.chips.innerHTML = '';
    var allTypes = ['전체'].concat(CONFIG.types);
    allTypes.forEach(function (t) {
      var chip = document.createElement('button');
      chip.className = 'chip' + (t === state.type ? ' active' : '');
      chip.textContent = t;
      chip.addEventListener('click', function () {
        state.type = t;
        renderChips();
        renderResults();
      });
      els.chips.appendChild(chip);
    });
  }

  function getFilteredItems() {
    var items = (state.data[state.platform] || []).slice();

    if (state.type !== '전체') {
      items = items.filter(function (item) { return item.type === state.type; });
    }

    var terms = state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length > 0) {
      items = items.filter(function (item) {
        var haystack = [
          item.title,
          item.category,
          (item.tags || []).join(' '),
          item.content
        ].join(' ').toLowerCase();
        return terms.every(function (term) { return haystack.indexOf(term) !== -1; });
      });
    }

    items.sort(function (a, b) {
      var favA = a.favorite ? 0 : 1;
      var favB = b.favorite ? 0 : 1;
      if (favA !== favB) return favA - favB;
      return (a.updated < b.updated) ? 1 : (a.updated > b.updated ? -1 : 0);
    });
    return items;
  }

  function renderResults() {
    var items = getFilteredItems();
    var platformConf = CONFIG.platforms.find(function (p) { return p.id === state.platform; });

    els.resultCount.textContent = '검색 결과 ' + items.length + '건';
    els.results.innerHTML = '';

    if (items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '검색 결과가 없습니다.<br>새로운 항목 등록이 필요하면 담당자에게 요청해주세요.';
      els.results.appendChild(empty);
      return;
    }

    var pinnedItems = items.filter(function (item) { return item.pinned; });
    var normalItems = items.filter(function (item) { return !item.pinned; });

    pinnedItems.forEach(function (item) {
      els.results.appendChild(renderCard(item, platformConf));
    });
    normalItems.forEach(function (item) {
      els.results.appendChild(renderCard(item, platformConf));
    });
  }

  function renderCard(item, platformConf) {
    var card = document.createElement('div');
    card.className = 'card' +
      (state.openIds[item.id] ? ' open' : '') +
      (item.pinned ? ' pinned' : '');
    card.style.setProperty('--card-accent', platformConf ? platformConf.color : '#ccc');

    var head = document.createElement('div');
    head.className = 'card-head';

    var topRow = document.createElement('div');
    topRow.className = 'card-top-row';

    if (item.pinned) {
      var pinBadge = document.createElement('span');
      pinBadge.className = 'pin-badge';
      pinBadge.textContent = '📌 공지';
      topRow.appendChild(pinBadge);
    }

    var badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.style.background = CONFIG.typeColors[item.type] || '#6b7280';
    badge.textContent = item.type;
    topRow.appendChild(badge);

    if (item.favorite) {
      var favBadge = document.createElement('span');
      favBadge.className = 'favorite-badge';
      favBadge.textContent = '⭐ 자주 찾음';
      topRow.appendChild(favBadge);
    }

    var title = document.createElement('p');
    title.className = 'card-title';
    title.textContent = item.title;
    topRow.appendChild(title);

    head.appendChild(topRow);

    var meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML =
      '<span>' + escapeHtml(item.category) + '</span>' +
      '<span>수정일: ' + escapeHtml(item.updated) + '</span>' +
      (item.effective_date ? '<span class="effective-date">적용일: ' + escapeHtml(item.effective_date) + '</span>' : '') +
      (isStale(item) ? '<span class="stale-badge">⚠️ 확인 필요 (마지막 확인: ' + escapeHtml(item.last_verified) + ')</span>' : '');
    head.appendChild(meta);

    var preview = document.createElement('p');
    preview.className = 'card-preview' + (item.pinned ? ' one-line' : '');
    preview.textContent = toPlainPreview(item.content);
    head.appendChild(preview);

    head.addEventListener('click', function () {
      state.openIds[item.id] = !state.openIds[item.id];
      card.classList.toggle('open');
    });

    if (state.isAdmin) {
      head.appendChild(renderAdminActions(item, platformConf));
    }

    card.appendChild(head);

    var body = document.createElement('div');
    body.className = 'card-body';

    var content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = markdownToHtml(item.content);
    body.appendChild(content);

    if (item.links && item.links.length > 0) {
      var linksRow = document.createElement('div');
      linksRow.className = 'links-row';
      item.links.forEach(function (link) {
        var a = document.createElement('a');
        a.className = 'link-btn';
        a.href = link.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = link.label;
        linksRow.appendChild(a);
      });
      body.appendChild(linksRow);
    }

    var footer = document.createElement('div');
    footer.className = 'updated-footer';
    footer.textContent = '최종 수정일: ' + item.updated;
    body.appendChild(footer);

    card.appendChild(body);
    return card;
  }

  function isStale(item) {
    if (!item.last_verified) return false;
    var lastMs = new Date(item.last_verified + 'T00:00:00').getTime();
    if (isNaN(lastMs)) return false;
    var diffDays = (Date.now() - lastMs) / (24 * 60 * 60 * 1000);
    return diffDays > (CONFIG.staleAfterDays || 90);
  }

  // ---- 관리자 모드: 카드별 토글 버튼 + GitHub Contents API 저장 ----

  function renderAdminActions(item, platformConf) {
    var row = document.createElement('div');
    row.className = 'admin-actions';
    row.addEventListener('click', function (e) { e.stopPropagation(); });

    var pinBtn = document.createElement('button');
    pinBtn.className = 'admin-toggle';
    pinBtn.textContent = item.pinned ? '📌 공지 해제' : '📌 공지 고정';
    pinBtn.addEventListener('click', function () {
      saveFieldChange(item, platformConf, 'pinned', !item.pinned, function (value) {
        return '관리자: ' + item.title + (value ? ' 공지 고정' : ' 공지 고정 해제');
      });
    });
    row.appendChild(pinBtn);

    var favBtn = document.createElement('button');
    favBtn.className = 'admin-toggle';
    favBtn.textContent = item.favorite ? '⭐ 자주 찾음 해제' : '⭐ 자주 찾음 지정';
    favBtn.addEventListener('click', function () {
      saveFieldChange(item, platformConf, 'favorite', !item.favorite, function (value) {
        return '관리자: ' + item.title + (value ? ' 자주 찾음 지정' : ' 자주 찾음 해제');
      });
    });
    row.appendChild(favBtn);

    var verifyBtn = document.createElement('button');
    verifyBtn.className = 'admin-toggle';
    verifyBtn.textContent = '✅ 확인일 갱신';
    verifyBtn.addEventListener('click', function () {
      var today = todayStr();
      saveFieldChange(item, platformConf, 'last_verified', today, function () {
        return '관리자: ' + item.title + ' 확인일 갱신 (' + today + ')';
      });
    });
    row.appendChild(verifyBtn);

    if (state.saving) {
      pinBtn.disabled = true;
      favBtn.disabled = true;
      verifyBtn.disabled = true;
    }

    return row;
  }

  function saveFieldChange(item, platformConf, field, value, buildMessage) {
    if (state.saving) return;

    if (!state.token) {
      toast('먼저 GitHub 토큰을 입력해주세요.', 'error');
      return;
    }

    state.saving = true;
    setAdminButtonsDisabled(true);

    githubGetFile(platformConf.file)
      .then(function (file) {
        var items = parseDataArray(file.text);
        var target = items.find(function (i) { return i.id === item.id; });
        if (!target) {
          throw new Error('원격 데이터에서 항목(' + item.id + ')을 찾을 수 없습니다.');
        }
        target[field] = value;
        var newText = replaceDataArray(file.text, items);
        return githubPutFile(platformConf.file, newText, file.sha, buildMessage(value));
      })
      .then(function () {
        item[field] = value;
        toast('저장되었습니다.', 'success');
        renderResults();
      })
      .catch(function (err) {
        if (err && (err.status === 401 || err.status === 403)) {
          localStorage.removeItem(ADMIN_TOKEN_KEY);
          state.token = null;
          renderAdminBar();
          toast('토큰이 유효하지 않습니다. 다시 입력해주세요.', 'error');
        } else {
          toast('저장 실패: ' + (err && err.message ? err.message : '알 수 없는 오류'), 'error');
        }
      })
      .finally(function () {
        state.saving = false;
        setAdminButtonsDisabled(false);
      });
  }

  function todayStr() {
    var d = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  // data/*.js는 `window.WIKI_DATA.<id> = [ ... ];` 형태다. 주석에는 대괄호를 쓰지 않는다는
  // 규칙을 전제로, 첫 '['부터 마지막 ']'까지를 배열 영역으로 보고 그 부분만 치환한다.
  function parseDataArray(raw) {
    var start = raw.indexOf('[');
    var end = raw.lastIndexOf(']');
    return JSON.parse(raw.slice(start, end + 1));
  }

  function replaceDataArray(raw, items) {
    var start = raw.indexOf('[');
    var end = raw.lastIndexOf(']');
    return raw.slice(0, start) + JSON.stringify(items, null, 2) + raw.slice(end + 1);
  }

  function githubGetFile(path) {
    var url = 'https://api.github.com/repos/' + CONFIG.github.owner + '/' + CONFIG.github.repo +
      '/contents/' + path + '?ref=' + CONFIG.github.branch;
    return fetch(url, {
      headers: {
        'Authorization': 'Bearer ' + state.token,
        'Accept': 'application/vnd.github+json'
      }
    }).then(function (res) {
      if (!res.ok) {
        return Promise.reject(makeHttpError(res));
      }
      return res.json();
    }).then(function (data) {
      return { text: b64DecodeUnicode(data.content), sha: data.sha };
    });
  }

  function githubPutFile(path, content, sha, message) {
    var url = 'https://api.github.com/repos/' + CONFIG.github.owner + '/' + CONFIG.github.repo + '/contents/' + path;
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + state.token,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        content: b64EncodeUnicode(content),
        sha: sha,
        branch: CONFIG.github.branch
      })
    }).then(function (res) {
      if (!res.ok) {
        return Promise.reject(makeHttpError(res));
      }
      return res.json();
    });
  }

  function makeHttpError(res) {
    var err = new Error('GitHub API 오류 (HTTP ' + res.status + ')');
    err.status = res.status;
    return err;
  }

  function b64DecodeUnicode(base64) {
    var binary = atob(base64.replace(/\n/g, ''));
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  }

  function b64EncodeUnicode(str) {
    var bytes = new TextEncoder().encode(str);
    var binary = '';
    bytes.forEach(function (b) { binary += String.fromCharCode(b); });
    return btoa(binary);
  }

  // 카드 미리보기용: 마크다운 기호를 제거하고 한 문단짜리 순수 텍스트로 변환
  function toPlainPreview(md) {
    if (!md) return '';
    return md
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/^[-*]\s+/gm, '')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
      .replace(/\|/g, ' ')
      .replace(/-{2,}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ---- 경량 마크다운 렌더러 (제목/굵게/리스트/표/줄바꿈/링크) ----

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inlineMd(text) {
    var escaped = escapeHtml(text);
    escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, label, url) {
      return '<a href="' + url + '" target="_blank" rel="noopener">' + label + '</a>';
    });
    return escaped;
  }

  function splitTableRow(line) {
    var trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
    return trimmed.split('|').map(function (c) { return c.trim(); });
  }

  function markdownToHtml(md) {
    if (!md) return '';
    var blocks = md.split(/\n\s*\n/);

    return blocks.map(function (block) {
      var lines = block.split('\n').filter(function (l) { return l.trim().length > 0; });
      if (lines.length === 0) return '';

      var isTable = lines.length >= 2 && lines.every(function (l) { return l.trim().indexOf('|') === 0; });
      if (isTable) {
        var header = splitTableRow(lines[0]);
        var rows = lines.slice(2).map(splitTableRow);
        var thead = '<thead><tr>' + header.map(function (h) { return '<th>' + inlineMd(h) + '</th>'; }).join('') + '</tr></thead>';
        var tbody = '<tbody>' + rows.map(function (r) {
          return '<tr>' + r.map(function (c) { return '<td>' + inlineMd(c) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody>';
        return '<table>' + thead + tbody + '</table>';
      }

      var isList = lines.every(function (l) { return /^[-*]\s+/.test(l.trim()); });
      if (isList) {
        var items = lines.map(function (l) {
          return '<li>' + inlineMd(l.trim().replace(/^[-*]\s+/, '')) + '</li>';
        });
        return '<ul>' + items.join('') + '</ul>';
      }

      var headingMatch = lines.length === 1 && lines[0].match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        var level = headingMatch[1].length;
        return '<h' + level + '>' + inlineMd(headingMatch[2]) + '</h' + level + '>';
      }

      return '<p>' + lines.map(inlineMd).join('<br>') + '</p>';
    }).join('');
  }
})();
