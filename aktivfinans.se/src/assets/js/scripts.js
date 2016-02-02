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

});


$(window).load(function(){
	
});


$(window).resize(function(){
	
});