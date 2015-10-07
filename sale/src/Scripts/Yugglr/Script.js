(function () {
    $('.trigger').click(function (e) {
        e.preventDefault();
    });

    function collapsingLists() {
        var initHeight = $('.collapsable_list_wrapper').height();
        $('.sidebar_right').on('click', '.show_more_trigger', function () {
            if ($(this).hasClass('expanded')) {
                $(this).removeClass('expanded').parents('.widget_body').find('.collapsable_list_wrapper').each(function () {
                    $(this).animate({ height: initHeight }, 500);
                });
            } else {
                $(this).addClass('expanded').parents('.widget_body').find('.collapsable_list_wrapper').each(function () {
                    var trueHeight = $(this).find('.collapsable_list').height();
                    $(this).animate({ height: trueHeight }, 500);
                });
            }
        });
    }

    function addNewDateRow() {
        $('.add_new_event_holder').on('click', '.add_more', function (e) {
            e.preventDefault();
            $(this).parents('.from_to_row').find('.line:first-child').before('<p class="date_number">Date 1</p>');
            var htmlToAdd = $(this).parents('.from_to_row').clone();
            if ($(this).hasClass('add_more_dates')) {
                $(this).text('Delete').addClass('delete').removeClass('add_more').parents('.from_to_row').after(htmlToAdd);
            } else {
                $(this).addClass('delete').removeClass('add_more').parents('.from_to_row').after(htmlToAdd);
            }
        });
        $('.add_new_event_holder').on('click', '.delete', function (e) {
            e.preventDefault();
            if ($(this).hasClass('add_more_dates')) {
                $(this).text('Add more dates').removeClass('delete').addClass('add_more').parents('.from_to_row').remove();
            } else {
                $(this).removeClass('delete').addClass('add_more').parents('.from_to_row').remove();
            }
        });
    }

    function colorTagsSwitching() {
        $('.color_tags_holder').on('click', '.color_tag_item', function (e) {
            e.preventDefault();
            if ($(this).hasClass('active')) {
                return false;
            } else {
                $(this).addClass('active').siblings().removeClass('active');
            }
        });
    }

    function textareaAutoresize() {
        $('.elastic_textarea').on('focus', function () {
            $(this).autosize();
        });
    }

    $(document).ready(function () {
        addNewDateRow();

        colorTagsSwitching();

        //FileInput filename appear
        $('.fileinput').on('change.bs.fileinput', function () {
            $(this).addClass('file_is_chosen');
            $('.you_want_upload').removeClass('hidden');
        });
        $('.fileinput').on('clear.bs.fileinput', function () {
            $('.you_want_upload').addClass('hidden');
        });

        // Question Text Substitute
        $('.questions_set_holder input[type="radio"]').change(function () {
            if ($(this).prop('checked')) {
                var currentText = $(this).attr('data-text');
                $(this).closest('.pseudobuttons_row').find('.question').text(currentText);
            }
        });

        // Question Text Coloring
        $('.questions_set_holder input[type="checkbox"]').change(function () {
            if ($(this).prop('checked')) {
                $(this).closest('.mix_content_item').find('span').addClass('selected');
            } else {
                $(this).closest('.mix_content_item').find('span').removeClass('selected');
            }
        });

        //	Logout
        $('.logout-btn').on('click', function (e) {
            e.preventDefault();
            $(this).prev('form').submit();
        });

        // Bootstrap Custom Dropdown
        $('.selectpicker').selectpicker();

        // Right Sidebar Collapsable Lists
        collapsingLists();

        // Textareas Elastic
        textareaAutoresize();
    });

    $(window).load(function () {
    });

    $(window).resize(function () {
    });
})();
//# sourceMappingURL=Script.js.map
