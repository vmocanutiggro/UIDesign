var Yugglr;
(function (Yugglr) {
    function Alert(selector, message, type, permanent) {
        var dismissable = !permanent;
        var html = '<div class="alert alert-' + type;
        if (dismissable) {
            html += ' alert-dismissable';
        }
        html += ' fade in">';
        if (dismissable) {
            html += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
        }
        html += message;
        html += '</div>';
        var $html = $(html);
        var $area = $(selector);
        if ($area.data('settings-alerts') === 'replace') {
            $(selector).empty().append($html);
        }
        else {
            $(selector).append($html);
        }
        setTimeout(function () {
            $html.alert('close');
        }, 15000);
    }
    Yugglr.Alert = Alert;
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Alert.js.map