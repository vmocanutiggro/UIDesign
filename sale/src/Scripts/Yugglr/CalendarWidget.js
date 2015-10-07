var Yugglr;
(function (Yugglr) {
    var CalendarWidget;
    (function (CalendarWidget) {
        var _model = {
            Events: null
        };
        function Init(widgetRoot) {
            var $w = $(widgetRoot);
            if (!_model.Events) {
                _model.Events = ko.observableArray(null);
                Yugglr.Events.EventsRepository.GetUpcomingEventOverviews(function (result) {
                    if (result.success) {
                        _model.Events([]);
                        result.data.forEach(function (o) {
                            _model.Events.push({
                                Id: o.Id,
                                Title: o.Title,
                                StartTime: moment(o.Start.toString(), null, $('html').attr('lang')).format('L LT'),
                                Url: Yugglr.Url.BuildEventUrl('profile', 'me', o.Id)
                            });
                        });
                    }
                }, 'user', $w.data('user-id'));
            }
            ko.applyBindings(_model, $w.get(0));
        }
        $('[data-provides="calendar-widget"]').each(function (idx, e) {
            Init(e);
        });
        $('#widget_calendar').on('click', '.media a', function (e) {
            e.preventDefault();
            var href = $(this).attr('href');
            $.fancybox({
                type: 'ajax',
                href: href,
                autoSize: false
            });
        });
    })(CalendarWidget || (CalendarWidget = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=CalendarWidget.js.map