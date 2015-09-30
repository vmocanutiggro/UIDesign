$(document).ready(function(){

	//Dropdown close button
	$( ".close-dropdown" ).click(function( event ) {
		event.preventDefault();
	});

	//Bootstrap datepicker
	$('.datepicker-input').datepicker({
		autoclose: true,
	    todayHighlight: true,
	    toggleActive: true
    });

    $('.input-daterange').datepicker({
        autoclose: true,
        todayHighlight: true
    });

    //Bootstrap timepicker
   	$('.input-timepicker').timepicker();

   	//Form action
   	$(".input-trigger").on("focus", function( e ) {
        $(this).closest('.content-form').find('.form-hidden-item').fadeIn(1);
        $(this).closest('.content-form').find('.middle').addClass('bottom');
    });
    $( ".close-form" ).click(function( event ) {
		event.preventDefault();
		$(this).closest('.content-form').find('.form-hidden-item').fadeOut(1);
		$(this).closest('.content-form').find('.middle').removeClass('bottom');
	});
    


});


$(window).load(function(){
	
});


$(window).resize(function(){
	
});