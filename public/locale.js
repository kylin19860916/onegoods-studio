// Explicit language choices persist. First-time visitors always see Traditional Chinese.
(() => {
  const locales = {'zh-Hant': '', 'zh-Hans': 'zh-cn/', en: 'en/'};
  const current = document.documentElement.lang;
  const page = location.pathname.split('/').pop() || 'index.html';
  const inFolder = /\/(zh-cn|en)\//.test(location.pathname);
  const base = new URL(inFolder ? '../' : './', location.href);
  document.querySelectorAll('[data-language]').forEach(link => {
    const url = new URL(locales[link.dataset.language] + page, base);
    url.search = location.search;
    url.hash = location.hash;
    link.href = url.href;
    link.addEventListener('click', () => {
      try { localStorage.setItem('ogs-language', link.dataset.language); } catch (_) {}
    });
  });
  const menu = document.querySelector('.language-menu');
  document.addEventListener('click', event => {
    if (menu && !menu.contains(event.target)) menu.open = false;
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  // Direct links to a translated page take priority over remembered preferences.
  if (!inFolder) {
    try {
      const preferred = localStorage.getItem('ogs-language');
      if (preferred && preferred !== current && preferred in locales) {
        const url = new URL(locales[preferred] + page, base);
        url.search = location.search;
        url.hash = location.hash;
        location.replace(url.href);
      }
    } catch (_) {}
  }
})();
