(function () {
  'use strict';

  var state = {
    platform: null,
    query: '',
    type: '전체',
    data: {}, // platformId -> array of items
    openIds: {} // item id -> true if expanded
  };

  var els = {};

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    els.tabs = document.getElementById('tabs');
    els.search = document.getElementById('search');
    els.chips = document.getElementById('chips');
    els.results = document.getElementById('results');
    els.resultCount = document.getElementById('result-count');

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

    items.sort(function (a, b) { return (a.updated < b.updated) ? 1 : (a.updated > b.updated ? -1 : 0); });
    return items;
  }

  function renderResults() {
    var items = getFilteredItems();
    var platformConf = CONFIG.platforms.find(function (p) { return p.id === state.platform; });

    els.resultCount.textContent = items.length + '건';
    els.results.innerHTML = '';

    if (items.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '검색 결과가 없습니다.<br>새로운 항목 등록이 필요하면 담당자에게 요청해주세요.';
      els.results.appendChild(empty);
      return;
    }

    items.forEach(function (item) {
      els.results.appendChild(renderCard(item, platformConf));
    });
  }

  function renderCard(item, platformConf) {
    var card = document.createElement('div');
    card.className = 'card' + (state.openIds[item.id] ? ' open' : '');
    card.style.setProperty('--card-accent', platformConf ? platformConf.color : '#ccc');

    var head = document.createElement('div');
    head.className = 'card-head';

    var topRow = document.createElement('div');
    topRow.className = 'card-top-row';

    var badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.style.background = CONFIG.typeColors[item.type] || '#6b7280';
    badge.textContent = item.type;
    topRow.appendChild(badge);

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
      (item.effective_date ? '<span class="effective-date">적용일: ' + escapeHtml(item.effective_date) + '</span>' : '');
    head.appendChild(meta);

    head.addEventListener('click', function () {
      state.openIds[item.id] = !state.openIds[item.id];
      card.classList.toggle('open');
    });

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
