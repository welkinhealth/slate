//= require ./lib/_energize
//= require ./app/_toc
//= require ./app/_lang

$(function() {
  loadToc($('#toc'), '.toc-link, toc-list-h2', '.toc-list-h3', 10);
  setupLanguages($('body').data('languages'));
  $('.content').imagesLoaded( function() {
    window.recacheHeights();
    window.refreshToc();
  });

  $('a').on('click', function() {
    if ($(this).attr('href').startsWith('#')) {
      gtag('config', gtagcode, { 'page_path': location.pathname + $(this).attr('href') });
    }
  });
});

window.onpopstate = function() {
  activateLanguage(getLanguageFromQueryString());
};
