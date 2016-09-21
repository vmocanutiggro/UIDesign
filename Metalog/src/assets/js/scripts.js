$(document).ready(function(){

	/* ======== SCROLL TO ELEMENT ======== */
	$('.nav-trigger').click( function (e) {
		e.preventDefault();
		$(this).toggleClass('active');
		$(this).closest('body').toggleClass('aside-open')
		$(this).closest('body').find('.aside-holder').toggleClass('active');
		//$(this).closest('body').find('.content-holder').toggleClass('active');
	});

	/* ======== SCROLL TO ELEMENT ======== */
	$('[data-click=scroll-to-target]').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('href');
        var headerHeight = 0;
        $('html, body').animate({
            scrollTop: $(target).offset().top - headerHeight
        }, 500);
    });

});


$(window).load(function(){
	
});


$(window).resize(function(){
	
});