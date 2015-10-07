var Yugglr;
(function (Yugglr) {
    var CalendarEvent;
    (function (CalendarEvent) {
        $(document).on('click', '.location-collapse', function (e) {
            e.preventDefault();
            $(this)
                .closest('.location-container')
                .toggleClass('collapsed');
        });
    })(CalendarEvent = Yugglr.CalendarEvent || (Yugglr.CalendarEvent = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=CalendarEvent.js.map