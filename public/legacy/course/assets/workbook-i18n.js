/* Syncs workbook PDF pages with course language (localStorage gfm_lang). */
(function () {
  var KEY = 'gfm_lang';

  function applyLang() {
    var lang = 'es';
    try {
      lang = localStorage.getItem(KEY) || 'es';
    } catch (e) {}
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    document.documentElement.classList.remove('lang-es', 'lang-en');
    document.documentElement.classList.add('lang-' + lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      var l = btn.getAttribute('data-set-lang');
      btn.setAttribute('aria-pressed', l === lang ? 'true' : 'false');
    });
  }

  function bindButtons() {
    document.querySelectorAll('[data-set-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var l = btn.getAttribute('data-set-lang');
        if (l !== 'es' && l !== 'en') return;
        try {
          localStorage.setItem(KEY, l);
        } catch (e) {}
        applyLang();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyLang();
      bindButtons();
    });
  } else {
    applyLang();
    bindButtons();
  }

  window.addEventListener('storage', function (e) {
    if (e.key === KEY) applyLang();
  });
})();
