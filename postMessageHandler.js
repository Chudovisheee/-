var BOOK_TOTAL_PAGES = 14;

window.addEventListener('message', function (event) {
  if (!event.data || event.data.newPageNumber === undefined) return;

  var pageNumber = parseInt(event.data.newPageNumber, 10);
  if (isNaN(pageNumber)) return;

  var page = (pageNumber <= 1 || pageNumber > BOOK_TOTAL_PAGES) ? 'index' : pageNumber;
  window.location.href = './' + page + '.html';
});
