$(document).ready(function(){

	/* ======== SCROLL TO ELEMENT ======== */
	$('.nav-trigger').click( function (e) {
		e.preventDefault();
		$(this).toggleClass('active');
		$('body').toggleClass('aside-open');
		$('.aside-holder').toggleClass('active');
		$('#aside-mask').toggleClass('active');
	});

	$("#aside-mask").on('click', function() {
	    $(this).removeClass('active');
		$('.nav-trigger').removeClass('aside-open, active');
		$('.aside-holder').removeClass('active');
		$('body').removeClass('aside-open');
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