$(document).ready(function(){

	//Header sidebar action
	$('.nav-trigger').click( function (e) {
		e.preventDefault();
		$(this).toggleClass('active');
		$(this).closest('body').toggleClass('aside-open')
		$(this).closest('body').find('.aside-holder').toggleClass('active');
		//$(this).closest('body').find('.content-holder').toggleClass('active');
	});

});


$(window).load(function(){
	
});


$(window).resize(function(){
	
});