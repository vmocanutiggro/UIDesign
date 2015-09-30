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


});


$(window).load(function(){
	
});


$(window).resize(function(){
	
});