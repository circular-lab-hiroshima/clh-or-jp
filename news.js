/* お知らせ共通処理（news.md のパースと簡易Markdown描画）。外部ライブラリ不使用。 */
(function (global) {
  'use strict';

  function esc(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // news.md を1件ずつのオブジェクト配列に変換
  // 形式: 「===」区切り → 先頭に key: value（id / date / title / until / project）→ 空行 → 本文markdown
  function parseNews(text) {
    text = String(text).replace(/<!--[\s\S]*?-->/g, ''); // コメント除去
    var blocks = text.split(/^\s*===\s*$/m);
    var items = [];
    blocks.forEach(function (block) {
      var lines = block.split('\n');
      var meta = { id: '', date: '', title: '', until: '', project: '' };
      var i = 0;
      while (i < lines.length && lines[i].trim() === '') i++; // 先頭の空行を飛ばす
      for (; i < lines.length; i++) {
        if (lines[i].trim() === '') { i++; break; } // 空行で本文へ
        var m = lines[i].match(/^\s*([A-Za-z_]+)\s*:\s*(.*)$/);
        if (m && m[1].toLowerCase() in meta) {
          meta[m[1].toLowerCase()] = m[2].trim();
        } else {
          break; // メタ行でなければそこから本文
        }
      }
      var body = lines.slice(i).join('\n').trim();
      if (meta.title) {
        items.push({
          id: meta.id,
          date: meta.date,
          title: meta.title,
          until: meta.until,
          project: meta.project.toLowerCase(),
          body: body
        });
      }
    });
    return items;
  }

  // 画像・リンク・太字だけを対象にした軽量なインライン変換
  function inline(s) {
    // 画像 ![alt](url) （リンクより先に処理）
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, url) {
      return '<img src="' + url.replace(/"/g, '&quot;') + '" alt="' + alt + '" loading="lazy">';
    });
    // リンク [text](url)
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, txt, url) {
      var external = /^https?:/i.test(url);
      return '<a href="' + url.replace(/"/g, '&quot;') + '"'
        + (external ? ' target="_blank" rel="noopener noreferrer"' : '')
        + '>' + txt + '</a>';
    });
    // 太字 **text**
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return s;
  }

  // 本文markdown → HTML（段落・改行・見出し###・画像・リンク・太字）
  function renderMarkdown(md) {
    return esc(md).split(/\n{2,}/).map(function (block) {
      var b = block.trim();
      if (!b) return '';
      var h = b.match(/^(#{1,3})\s+([\s\S]*)$/);
      if (h) {
        var level = Math.min(h[1].length + 1, 3); // # → h2, ### → h3
        return '<h' + level + '>' + inline(h[2]) + '</h' + level + '>';
      }
      return '<p>' + b.split('\n').map(inline).join('<br>') + '</p>';
    }).join('\n');
  }

  // 2026-08-01 → 2026.08.01（解釈できない書式はそのまま返す）
  function formatDate(d) {
    var m = String(d).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return String(d);
    return m[1] + '.' + ('0' + m[2]).slice(-2) + '.' + ('0' + m[3]).slice(-2);
  }

  // until が今日以降なら「これから開催されるもの」とみなす（当日はまだ開催予定）
  function isUpcoming(until) {
    var m = String(until || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (!m) return false;
    var end = new Date(+m[1], +m[2] - 1, +m[3]);
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return end >= today;
  }

  // 記事に付けるバッジ（開催予定 → プロジェクト名 の順）
  function badgesHtml(item, content) {
    var html = '';
    if (isUpcoming(item.until)) {
      html += '<span class="badge badge-upcoming">'
        + esc((content && content.badge_upcoming) || '開催予定') + '</span>';
    }
    var labels = (content && content.project_labels) || {};
    if (item.project && labels[item.project]) {
      html += '<span class="badge badge-project">' + esc(labels[item.project]) + '</span>';
    }
    return html;
  }

  global.CLHNews = {
    parseNews: parseNews,
    renderMarkdown: renderMarkdown,
    formatDate: formatDate,
    escapeHtml: esc,
    isUpcoming: isUpcoming,
    badgesHtml: badgesHtml
  };
})(window);
