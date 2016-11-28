$(document).ready(function(){

	/* ======== Offcanvas manu action ======== */
    var $btnOffcanvasOpen = $('.offcanvas-toggle');
    var $sideNav = $('#offcanvas');
    var $sideNavMask = $('#offcanvas-mask');
    var $btnOffcanvasClose = $('.btn-offcanvas-close');
    var $bodyOverflow = $('body');
      
    $btnOffcanvasOpen.on('click', function(event) {
        event.preventDefault();
        $sideNav.addClass('open');
        $sideNavMask.addClass('open');
        $bodyOverflow.addClass('offcanvas-open');
    });

    $sideNavMask.on('click', function() {
        $sideNav.removeClass('open');
        $sideNavMask.removeClass('open');
        $bodyOverflow.removeClass('offcanvas-open');
    });

    $btnOffcanvasClose.on('click', function(event) {
        event.preventDefault();
        $sideNav.removeClass('open');
        $sideNavMask.removeClass('open');
        $bodyOverflow.removeClass('offcanvas-open');
    });

    $(".aritcle__text-box-truncate").dotdotdot({
        ellipsis    : '... ',
        wrap        : 'word',
        fallbackToLetter: true,
        height      : 130
    });

});
