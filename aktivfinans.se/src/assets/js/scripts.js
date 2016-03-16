/* Header Scroll To Action
------------------------------------------------ */
var scrollToAction = function() {
    $('[data-click=scroll-to-target]').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(this).attr('href');
        var headerHeight = 49;
        $('html, body').animate({
            scrollTop: $(target).offset().top - headerHeight
        }, 600);
    });
};

var App = function () {
    "use strict";
    
    return {
        //main function
        init: function () {
            scrollToAction();
        }
  };
}();



$(document).ready(function(){

    App.init();

    //Dropdown action
    if ($(window).width() >= 767) {
        $('.dropdown').hover(function() {
            $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeIn();
        }, function() {
            $(this).find('.dropdown-menu').stop(true, true).delay(200).fadeOut();
        });
    };

});


$(window).load(function(){
	
});


$(window).resize(function(){
	
});