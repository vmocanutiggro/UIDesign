(function ($) {
    $.fn.resetValidation = function () {
        var $form = this.closest('form');
        //reset jQuery Validate's internals
        $form.validate().resetForm();
        $('.field-validation-error', $form)
            .removeClass('field-validation-error')
            .addClass('field-validation-valid')
            .parent().removeClass('field-validation-error-element');
        $('.input-validation-error', $form)
            .removeClass('input-validation-error')
            .addClass('valid')
            .parent().removeClass('input-validation-error-element');
        //reset unobtrusive validation summary, if it exists
        $form.find("[data-valmsg-summary=true]")
            .removeClass("validation-summary-errors")
            .addClass("validation-summary-valid")
            .find("ul").empty();
        //reset unobtrusive field level, if it exists
        $form.find("[data-valmsg-replace]")
            .removeClass("field-validation-error")
            .addClass("field-validation-valid")
            .empty();
        return $form;
    };
})(jQuery);
var Yugglr;
(function (Yugglr) {
    var Validation;
    (function (Validation) {
        function Init() {
            $.validator.setDefaults({
                highlight: function (element, errorClass, validClass) {
                    var $e = $(element);
                    var $p = $e.parent();
                    var elementClass = errorClass + '-element';
                    $e.removeClass(validClass);
                    $e.addClass(errorClass);
                    $p.addClass(elementClass);
                },
                unhighlight: function (element, errorClass, validClass) {
                    var $e = $(element);
                    var $p = $e.parent();
                    var elementClass = errorClass + '-element';
                    $e.removeClass(errorClass);
                    $e.addClass(validClass);
                    $p.removeClass(elementClass);
                },
                errorClass: 'error',
                validClass: 'valid'
            });
        }
        Init();
    })(Validation = Yugglr.Validation || (Yugglr.Validation = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Validation.js.map