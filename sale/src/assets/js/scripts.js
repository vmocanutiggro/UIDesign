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
		$(this).closest('.content-form').find('.upload-images-holder').fadeOut(1);
		$(this).closest('.content-form').find('.middle').removeClass('bottom');
		$(this).closest('form').find('textarea').fadeOut(1);
		$(this).closest('form').find('.form-add-list').fadeOut(1);
		$(this).fadeOut(1);
	});

	$( ".form-trigger-btn" ).click(function( event ) {
		event.preventDefault();
		$(this).closest('body').find('.content-form').find('textarea').fadeIn(1);
		$(this).closest('body').find('.content-form').find('.form-add-list').fadeIn(1);
		$(this).closest('body').find('.content-form').find('.close-form').fadeIn(1);
	});



	//Lightbox initial
	$(document).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
    	event.preventDefault();
    	$(this).ekkoLightbox();
	});
    
    //Input type file
    $('.file-inputs').bootstrapFileInput();

    //Upload images hidden holder
    $( ".upload-images-holder-trigger" ).click(function( event ) {
		event.preventDefault();
		$(this).closest('.content-form').find('.upload-images-holder').fadeIn(1);
	});

	$( ".like-btn" ).click(function( event ) {
		event.preventDefault();
		$(this).toggleClass('disabled');
	});


	$( ".comment-trigger" ).click(function( event ) {
		event.preventDefault();
		$(this).closest('body').find('.hidden-comment-holder').slideToggle('slow');
	});



});


$(window).load(function(){
	
});


$(window).resize(function(){
	
});