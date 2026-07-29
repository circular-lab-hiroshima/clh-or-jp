/* 本番ドメイン以外（テスト環境・プレビュー）で「TEST」バッジを表示する。 */
(function () {
  'use strict';

  var PRODUCTION_HOSTS = ['clh.or.jp', 'www.clh.or.jp'];
  if (PRODUCTION_HOSTS.indexOf(location.hostname) !== -1) return;

  document.addEventListener('DOMContentLoaded', function () {
    var badge = document.createElement('div');
    badge.textContent = 'TEST環境（公開前の確認用）';
    badge.setAttribute('role', 'status');
    badge.style.cssText = [
      'position:fixed',
      'right:12px',
      'bottom:12px',
      'z-index:9999',
      'padding:8px 16px',
      'border-radius:999px',
      'background:#380C0C',
      'color:#fff',
      'font-family:inherit',
      'font-size:11px',
      'font-weight:700',
      'letter-spacing:0.08em',
      'line-height:1',
      'box-shadow:0 6px 20px rgba(0,0,0,0.25)',
      'pointer-events:none'
    ].join(';');
    document.body.appendChild(badge);
  });
})();
