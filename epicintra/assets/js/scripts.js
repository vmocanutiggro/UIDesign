//Substitute SVG with PNG for non-svg browsers
// if (!Modernizr.svg) {
// 	$('.svg-img').each(function(){
// 		$(this).attr('src', ($(this).attr('data-png-src')));
// 	});
// }

//Profile Actions Dropdown List replacing
function profileActionListReplacing() {
	if ($(window).width() < 768) {
		$('#profile-actions-dropdown-list').appendTo('#userpic-holder');
		$('#userpic-holder .userpic').attr('data-toggle', 'dropdown');
	}
	if ($(window).width() > 767) {
		$('#profile-actions-dropdown-list').appendTo('#profile-actions-dropdown-holder');
		$('#userpic-holder .userpic').attr('data-toggle', '');
	}
}

//Fluid Search Field replacing
function searchFieldReplacing() {
	if ($(window).width() < 768) {
		$('#fluid-search-field').appendTo('#search-field-mobile-place');
	}
	if ($(window).width() > 767) {
		$('#fluid-search-field').appendTo('#search-field-desktop-place');
	}
}

//Function Alerts List Items Toggle
function alertsToggle() {
	var listItems = $('#alerts-list > li');
	var listItemsNumber = listItems.length;
	var up = $('.alert-holder .arrows-holder .text-up');
	var down = $('.alert-holder .arrows-holder .text-down');
	var currentItem = 1;

	function toggling(newItem) {
		listItems.hide();
		$('#alerts-list > li:nth-child(' + newItem + ')').show();
	}

	toggling(currentItem);

	if (listItemsNumber) {
		up.on('click', function(){
			if (currentItem === 1) {
				currentItem = listItemsNumber;
				toggling(currentItem);
			}
			else {
				currentItem--;
				toggling(currentItem);
			}
		});

		down.on('click', function(){
			if (currentItem === listItemsNumber) {
				currentItem = 1;
				toggling(currentItem);
			}
			else {
				currentItem++;
				toggling(currentItem);
			}
		});
	}
}

$(document).ready(function(){

	alertsToggle();

	//TabDrop
	$('.nav-tabs-drop').tabdrop({
		text: '<i class="fontello-down-open"></i>'
	});
	
	//Placeholders Fix
	$('input, textarea').placeholder();

	//Hide and Show Placeholder on inputs focus
	var placeholderContent = $('.search-input').attr('placeholder');
	$('.search-input').focusin(function(){
		$(this).attr('placeholder','');
	});
	$('.search-input').focusout(function(){
		$(this).attr('placeholder', placeholderContent);
	});

	//Responsive YouTube videos
	var $allVideos = $(".iframe-holder iframe[src*='www.youtube.com']"),
	$fluidEl = $('.iframe-holder');

	$allVideos.each(function() {
		$(this)
		.data('aspectRatio', this.height / this.width)
		.removeAttr('height')
		.removeAttr('width');
	});

	$(window).resize(function() {
		var newWidth = $fluidEl.width();
		$allVideos.each(function() {
			var $el = $(this);
			$el
			.width(newWidth)
			.height(newWidth * $el.data('aspectRatio'));		
		});
	}).resize();



	profileActionListReplacing();

	searchFieldReplacing();

	//DotDotDot initializing
	$('.column-most-viewed-posts .item-text').dotdotdot({
		ellipsis: '...',
		wrap: 'letter',
		height: 36
	});

	$('.article-demo-text, .sidebar-item.sidebar-item-news .news-preamble p').dotdotdot({
		ellipsis: '...',
		wrap: 'letter',
		height: 72
	});

	//OwlCarousel initializing
	$(".owl-carousel").owlCarousel({
		navigation : true,
		navigationText : ['',''],
		slideSpeed : 300,
		paginationSpeed : 400,
		singleItem : true
	});

	//Sidebar collapse list
	$('.aside-collapse-list >li >a').click(function (e) {
		e.preventDefault();
		$(this).toggleClass('active').next('ul').slideToggle('fast');
	});

	//Input type file
    $('.file-inputs').bootstrapFileInput();

     //Change bg when you click on checkbox
    $(".custom-checkbox").change(function(){
	    if($(this).is(":checked")){
	        $(this).parent().parent().addClass("active"); 
	    }else{
	        $(this).parent().parent().removeClass("active");  
	    }
	});
	$(".select-all").change(function(){
	    if($(this).is(":checked")){
	        $(this).closest('form').find('.checkbox').addClass("active"); 
	    }else{
	        $(this).closest('form').find('.checkbox').removeClass("active"); 
	    }
	});
	$('.list-sort-by > li > a').click(function (e) {
		e.preventDefault();
		$(this).parent().toggleClass('active');
		$(this).parent().next('.sub-menu').slideToggle('fast');
	});

	//Bootstrap select
	$('.selectpicker').selectpicker();

	//Input type file
	$('input[type=file]').bootstrapFileInput();
	$('.file-inputs').bootstrapFileInput();

	//Open hidden block with map
	$('.trigger').click(function(e){
		e.preventDefault();
		$(this).toggleClass("active")
		$(this).next("div").stop('true','true').slideToggle("slow");
	});

	//Bootstrap datepicker
	$('.datepicker-holder input').datepicker({
		autoclose: true
    });

	//Select2 initial
    $(".autocomplite").select2({
        tags: true,
        tokenSeparators: [',', ' '],
        //placeholder: "Search to add Keywords, Phrases, or Domains",
        allowClear: true
    });

    $('.btn-uppgifter').click(function (e) {
    	e.preventDefault();
    	$('.uppgifter-holder').addClass('non-active');
    	$('.uppgifter-new-holder').addClass('active');
    });
    $('.btn-uppgifter-new').click(function (e) {
    	e.preventDefault();
    	$('.uppgifter-holder').removeClass('non-active');
    	$('.uppgifter-new-holder').removeClass('active');
    });

});


$(window).load(function(){
	
});


$(window).resize(function(){

	profileActionListReplacing();

	searchFieldReplacing();

});