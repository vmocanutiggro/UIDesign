var Yugglr;
(function (Yugglr) {
    var CalendarType;
    (function (CalendarType) {
        CalendarType[CalendarType["Day"] = 0] = "Day";
        CalendarType[CalendarType["Week"] = 1] = "Week";
        CalendarType[CalendarType["Month"] = 2] = "Month";
    })(CalendarType || (CalendarType = {}));
    var LocationBindingModel = (function () {
        function LocationBindingModel(location) {
            if (location.Address)
                this.Address = location.Address;
            else
                this.Address = "";
            if (location.Longitude)
                this.Longitude = location.Longitude;
            else
                this.Longitude = 0;
            if (location.Latitude)
                this.Latitude = location.Latitude;
            else
                this.Latitude = 0;
        }
        return LocationBindingModel;
    })();
    Yugglr.LocationBindingModel = LocationBindingModel;
    var EventDate = (function () {
        function EventDate(start, end, id, allDay, title, description, timeZoneId) {
            this.Id = id;
            this.Title = title;
            this.Start = start;
            this.End = end;
            this.IsAllDay = allDay;
            this.Url = _manager != null ? _manager.GetEventUrl(this.Id) : Yugglr.Url.BuildEventUrl('profile', 'me', id);
            ;
            this.Description = description;
            this.Location = new LocationBindingModel({ Address: "", Longitude: 0, Latitude: 0 });
            this.TimeZoneID = timeZoneId;
        }
        EventDate.prototype.EventClass = function () {
            if (this.IsAllDay) {
                return 'calendar-event full_day_event cc_safron';
            }
            else {
                return 'calendar-event single_event cc_safron';
            }
        };
        EventDate.prototype.StartTime = function () {
            return this.Start.format('LT');
        };
        EventDate.prototype.DayEventStyle = function (group) {
            var hours = this.Start.diff(group.Start, 'seconds') / 3600;
            var length = this.End.diff(this.Start, 'seconds') / 3600;
            var numEvents = group.Events().length;
            var top = hours * 100;
            var height = length * 100;
            var width = (1 / numEvents) * 100;
            return {
                width: width.toFixed(4) + '%',
                height: height + 'px',
                'margin-top': top + 'px'
            };
        };
        return EventDate;
    })();
    Yugglr.EventDate = EventDate;
    var EventDateModel = (function () {
        function EventDateModel(start, end, id, allDay, title, description, timeZoneId) {
            this.Id = ko.observable(id);
            this.Title = ko.observable(title);
            this.Start = ko.observable(start);
            this.End = ko.observable(end);
            this.IsAllDay = ko.observable(allDay);
            this.Description = ko.observable(description);
            this.Location = ko.observable(null);
            this.Location(new LocationBindingModel({ Address: "", Longitude: 0, Latitude: 0 }));
            this.TimeZoneID = ko.observable(timeZoneId);
        }
        EventDateModel.prototype.StartTime = function () {
            return this.Start().format('LT');
        };
        return EventDateModel;
    })();
    Yugglr.EventDateModel = EventDateModel;
    var Week = (function () {
        function Week(week) {
            this.Days = ko.observableArray([]);
            for (var i = 1; i <= 7; ++i) {
                this.Days.push(new Day(week));
                week = week.add(1, 'd');
            }
        }
        Week.prototype.AddEvents = function (dayOfYear, events) {
            var days = this.Days();
            for (var i = 0; i < days.length; i++) {
                var day = days[i];
                if (day.Date.dayOfYear() == dayOfYear) {
                    day.SetEvents(events);
                    return true;
                }
            }
            return false;
        };
        return Week;
    })();
    var Day = (function () {
        function Day(date) {
            this.Date = moment(date);
            this.Events = ko.observableArray([]);
            this.ExtraEvents = ko.observableArray([]);
        }
        Day.prototype.IsCurrnetMonth = function () {
            return this.Date.month() == _manager.CurrentMonth() && this.Date.year() == _manager.CurrentYear();
        };
        Day.prototype.DayOfMonth = function () {
            return this.Date.date();
        };
        Day.prototype.DayClass = function () {
            var dayClass = 'item_outer';
            if (!this.IsCurrnetMonth()) {
                dayClass += ' item_outer not_current_months_day';
            }
            return dayClass;
        };
        Day.prototype.DayInnerClass = function () {
            var dayClass = 'item_inner';
            if (this.Date.isSame(moment(), 'day')) {
                dayClass += ' current_day_item';
            }
            return dayClass;
        };
        Day.prototype.SetEvents = function (events) {
            this.ExtraEvents([]);
            this.Events([]);
            for (var i = 0; i < events.length; ++i) {
                var e = events[i];
                if (i >= 2) {
                    this.ExtraEvents.push(e);
                }
                else {
                    this.Events.push(e);
                }
            }
        };
        return Day;
    })();
    var MonthlyCalendar = (function () {
        function MonthlyCalendar() {
            var day = moment().startOf('week');
            this.NamesOfDays = [day.format('dddd'),
                day.add(1, 'd').format('dddd'),
                day.add(1, 'd').format('dddd'),
                day.add(1, 'd').format('dddd'),
                day.add(1, 'd').format('dddd'),
                day.add(1, 'd').format('dddd'),
                day.add(1, 'd').format('dddd')];
            this.Rows = ko.observableArray([]);
        }
        return MonthlyCalendar;
    })();
    var EventGroup = (function () {
        function EventGroup(evt) {
            this.Start = evt.Start;
            this.End = evt.End;
            this.Events = ko.observableArray([evt]);
        }
        EventGroup.prototype.StartTopStyle = function () {
            var startHours = this.Start.hours() + (this.Start.minutes() / 60);
            return { top: (startHours * 100) + 'px' };
        };
        EventGroup.prototype.AddEvent = function (evt) {
            if (!this.Start) {
                this.Start = evt.Start;
            }
            else {
                this.Start = evt.Start.min(this.Start);
            }
            if (!this.End) {
                this.End = evt.End;
            }
            else {
                this.End = this.End.max(evt.End);
            }
            this.Events.push(evt);
        };
        EventGroup.prototype.Overlaps = function (evt) {
            if (!this.Start || !this.End) {
                return true;
            }
            var isOverlaping = (evt.Start.isAfter(this.Start) && evt.Start.isBefore(this.End)) ||
                (evt.End.isAfter(this.Start) && evt.End.isBefore(this.End)) ||
                ((evt.Start.isBefore(this.Start) || evt.Start.isSame(this.Start)) && (evt.End.isAfter(this.End) || evt.End.isSame(this.End)));
            return isOverlaping;
        };
        return EventGroup;
    })();
    Yugglr.EventGroup = EventGroup;
    var DailyCalendar = (function () {
        function DailyCalendar(date) {
            this.NameOfDay = ko.observable('');
            this.Groups = ko.observableArray([]);
            this.SetDate(date);
        }
        DailyCalendar.prototype.SetDate = function (date) {
            this.Groups([]);
            this.Date = moment(date);
            this.NameOfDay(date ? date.format('dddd Do MMM') : '');
        };
        DailyCalendar.prototype.AddEvent = function (evt) {
            if (!this.Overlaps(evt)) {
                return;
            }
            var startOfDay = moment(this.Date).startOf('day');
            var endOfDay = moment(this.Date).endOf('day');
            var newEvt = new EventDate(evt.Start.min(startOfDay), evt.End.max(endOfDay), evt.Id, evt.IsAllDay, evt.Title, evt.Description, evt.TimeZoneID);
            if (window.console && window.console.log) {
                console.log('Created new sub-event:\n' +
                    '    Old [' + evt.Id + ': ' + evt.Start.format() + ' - ' + evt.End.format() + ']\n' +
                    '    Day                                       [' + startOfDay.format() + ' - ' + endOfDay.format() + ']\n' +
                    '    New [' + newEvt.Id + ': ' + newEvt.Start.format() + ' - ' + newEvt.End.format() + ']');
            }
            var groups = this.Groups();
            for (var i = 0; i < groups.length; ++i) {
                var group = groups[i];
                if (group.Overlaps(newEvt)) {
                    group.AddEvent(newEvt);
                    return;
                }
            }
            var group = new EventGroup(newEvt);
            this.Groups.push(group);
        };
        DailyCalendar.prototype.Overlaps = function (evt) {
            var start = moment(this.Date).startOf('day');
            var end = moment(this.Date).endOf('day');
            var isOverlapping = (evt.Start.isAfter(start) && evt.Start.isBefore(end)) ||
                (evt.End.isAfter(start) && evt.End.isBefore(end)) ||
                ((evt.Start.isBefore(start) || evt.Start.isSame(start)) && (evt.End.isAfter(end) || evt.End.isSame(end)));
            return isOverlapping;
        };
        return DailyCalendar;
    })();
    var WeeklyCalendar = (function () {
        function WeeklyCalendar(date) {
            this.Days = ko.observableArray([]);
            this.SetDate(date);
        }
        WeeklyCalendar.prototype.SetDate = function (date) {
            var d = moment(date).startOf('week');
            this.Start = moment(d);
            this.End = moment(d).endOf('week');
            var days = [
                new DailyCalendar(d),
                new DailyCalendar(d.add(1, 'day')),
                new DailyCalendar(d.add(1, 'day')),
                new DailyCalendar(d.add(1, 'day')),
                new DailyCalendar(d.add(1, 'day')),
                new DailyCalendar(d.add(1, 'day')),
                new DailyCalendar(d.add(1, 'day')),
            ];
            this.Days(days);
        };
        WeeklyCalendar.prototype.Overlaps = function (evt) {
            if (!this.Start || !this.End) {
                return true;
            }
            var isOverlapping = (evt.Start.isAfter(this.Start) && evt.Start.isBefore(this.End)) ||
                (evt.End.isAfter(this.Start) && evt.End.isBefore(this.End)) ||
                ((evt.Start.isBefore(this.Start) || evt.Start.isSame(this.Start)) && (evt.End.isAfter(this.End) || evt.End.isSame(this.End)));
            return isOverlapping;
        };
        WeeklyCalendar.prototype.AddEvent = function (evt) {
            if (this.Overlaps(evt)) {
                var days = this.Days();
                for (var i = 0; i < days.length; ++i) {
                    var day = days[i];
                    if (day.Overlaps(evt)) {
                        day.AddEvent(evt);
                    }
                }
            }
        };
        return WeeklyCalendar;
    })();
    var CalendarManager = (function () {
        function CalendarManager(ownerEmail, ownerId, ownerType, dictionary) {
            var _self = this;
            this.ViewModes = [
                { Type: CalendarType.Month, Text: dictionary.Month },
                { Type: CalendarType.Week, Text: dictionary.Week },
                { Type: CalendarType.Day, Text: dictionary.Day }
            ];
            this._ownerId = ownerId;
            this._ownerType = ownerType;
            this._ownerEmail = ownerEmail;
            this.Type = ko.observable(CalendarType.Month);
            this.Type.subscribe(function (type) {
                switch (type) {
                    case CalendarType.Day:
                        var date = _self.CurrentDate();
                        _self.DayModel.SetDate(date);
                        _self.BuildCalendar(date);
                        break;
                    case CalendarType.Week:
                        var date = _self.CurrentDate();
                        _self.WeekModel.SetDate(date);
                        _self.BuildCalendar(date);
                        break;
                    default:
                    case CalendarType.Month:
                        _self.Type(CalendarType.Month);
                        break;
                }
            });
            this.Template = ko.computed(function () {
                switch (_self.Type()) {
                    case CalendarType.Day:
                        return 'view-day-template';
                    case CalendarType.Week:
                        return 'view-week-template';
                    default:
                    case CalendarType.Month:
                        return 'view-month-template';
                }
            });
            moment.locale(Yugglr.Language());
            this.CurrentYear = ko.observable(null);
            this.CurrentMonth = ko.observable(null);
            this.CurrentDate = ko.observable(null);
            this.MonthModel = new MonthlyCalendar();
            this.WeekModel = new WeeklyCalendar(this.CurrentDate());
            this.DayModel = new DailyCalendar(this.CurrentDate());
            this.MonthHeading = ko.pureComputed(function () {
                if (_self.CurrentDate() == null) {
                    return '';
                }
                return _self.CurrentDate().format('MMMM YYYY');
            });
            function DestroyPopvers(e) {
                $('.more_events_trigger').popover('destroy');
            }
            ko.applyBindings(this, document.getElementById('monthly-calendar'));
            $('#monthly-calendar').on('shown.bs.popover', '.more_events_trigger', function () {
                $(document).on('click', DestroyPopvers);
            });
            $('#monthly-calendar').on('hidden.bs.popover', '.more_events_trigger', function () {
                $(document).off('click', DestroyPopvers);
            });
            $('#monthly-calendar').on('click', '.more_events_trigger', function (e) {
                e.stopImmediatePropagation();
                $('.more_events_trigger').popover('destroy');
                var $this = $(this);
                $this.popover({
                    html: true,
                    content: function () {
                        var $this = $(this);
                        return $this.next('div.hide').html();
                    },
                    template: '<div class="popover popover_more_events" role="tooltip"><div class="popover-inner popover-content"></div></div>'
                });
                $this.popover('show');
                $(document).on('click', '.popover.popover_more_events', function (e) {
                    e.stopImmediatePropagation();
                });
            });
            $('#monthly-calendar').on('click', 'a.calendar-event', function (e) {
                e.preventDefault();
                var href = $(this).attr('href');
                $.fancybox({
                    type: 'ajax',
                    href: href,
                    autoSize: false
                });
            });
        }
        CalendarManager.prototype.GetEventUrl = function (eventId) {
            return Yugglr.Url.BuildEventUrl('profile', this._ownerEmail, eventId);
        };
        CalendarManager.prototype.SetDate = function (date) {
            this.CurrentYear(date.year());
            this.CurrentMonth(date.month());
            this.CurrentDate(date);
            this.BuildCalendar(date);
        };
        CalendarManager.prototype.Today = function () {
            this.SetDate(moment());
        };
        CalendarManager.prototype.SetDayType = function () {
            this.Type(CalendarType.Day);
            var date = this.CurrentDate();
            this.DayModel.SetDate(date);
            this.BuildCalendar(date);
        };
        CalendarManager.prototype.SetWeekType = function () {
            this.Type(CalendarType.Week);
            var date = this.CurrentDate();
            this.WeekModel.SetDate(date);
            this.BuildCalendar(date);
        };
        CalendarManager.prototype.SetMonthType = function () {
            this.Type(CalendarType.Month);
        };
        CalendarManager.prototype.NextClick = function () {
            var unit = this.GetUnit();
            if (!unit) {
                return;
            }
            this.SetDate(moment(this.CurrentDate()).startOf(unit).add(1, unit));
        };
        CalendarManager.prototype.PreviousClick = function () {
            var unit = this.GetUnit();
            if (!unit) {
                return;
            }
            this.SetDate(moment(this.CurrentDate()).startOf(unit).add(-1, unit));
        };
        CalendarManager.prototype.GetUnit = function () {
            var unit;
            switch (this.Type()) {
                case CalendarType.Day:
                    unit = 'd';
                    break;
                case CalendarType.Week:
                    unit = 'w';
                    break;
                case CalendarType.Month:
                    unit = 'M';
                    break;
                default:
                    return null;
            }
            return unit;
        };
        CalendarManager.prototype.BuildCalendar = function (date) {
            var builder;
            switch (this.Type()) {
                case CalendarType.Day:
                    builder = this.BuildDailyCalendar;
                    this.DayModel.SetDate(this.CurrentDate());
                    break;
                case CalendarType.Week:
                    builder = this.BuildWeeklyCalendar;
                    this.WeekModel.SetDate(this.CurrentDate());
                    break;
                case CalendarType.Month:
                    builder = this.BuildMonthlyCalendar;
                    break;
                default:
                    return;
            }
            builder.apply(this, [date]);
        };
        CalendarManager.prototype.BuildMonthlyCalendar = function (date) {
            var startOfMonth = moment(date)
                .startOf('month');
            var startOfNextMonth = moment(startOfMonth)
                .add(1, 'M');
            var firstDate = moment(startOfMonth)
                .startOf('week');
            var weeks = ko.observableArray([]);
            for (var week = firstDate; week.isBefore(startOfNextMonth); week = week.add(1, 'w')) {
                var weekRow = new Week(moment(week));
                weeks.push(weekRow);
            }
            this.GetMonthlyEvents();
            this.MonthModel.Rows(weeks());
        };
        CalendarManager.prototype.BuildDailyCalendar = function (date) {
            this.GetDailyEvents();
        };
        CalendarManager.prototype.BuildWeeklyCalendar = function (date) {
            this.GetWeeklyEvents();
        };
        CalendarManager.prototype.GetMonthlyEvents = function () {
            var _self = this;
            var start = moment(this.CurrentDate())
                .startOf('M')
                .startOf('w')
                .toISOString();
            var end = moment(this.CurrentDate())
                .endOf('M')
                .endOf('w')
                .toISOString();
            Yugglr.Events.EventsRepository.GetEventOverviews(function (result) {
                if (result.success) {
                    var x = {};
                    var events = result.data;
                    events.forEach(function (value, index, array) {
                        var start = moment(value.Start);
                        var end = moment(value.End);
                        var limit = moment(end).add(1, 'd');
                        for (var i = moment(start); i.isBefore(limit, 'd'); i.add(1, 'd')) {
                            var allDay = value.IsAllDay;
                            if (!i.isSame(start, 'd') && !i.isSame(end, 'd')) {
                                allDay = true;
                            }
                            var e = new EventDate(start, end, value.Id, allDay, value.Title, value.Description, value.TimeZoneID);
                            e.Location = new LocationBindingModel(value.Location);
                            var arr = x[i.dayOfYear()] = (x[i.dayOfYear()] || []);
                            arr.push(e);
                        }
                    });
                    for (var i in x) {
                        var arr = x[i];
                        var rows = _self.MonthModel.Rows();
                        for (var idx = 0; idx < rows.length; idx++) {
                            var row = rows[idx];
                            if (row.AddEvents(i, arr)) {
                                break;
                            }
                        }
                    }
                }
            }, this._ownerType, this._ownerId, start, end);
        };
        CalendarManager.prototype.GetWeeklyEvents = function () {
            var _self = this;
            var start = moment(this.CurrentDate())
                .startOf('w')
                .toISOString();
            var end = moment(this.CurrentDate())
                .endOf('w')
                .toISOString();
            Yugglr.Events.EventsRepository.GetEventOverviews(function (result) {
                if (result.success) {
                    var events = result.data;
                    events.forEach(function (value, index, array) {
                        var evnt = new EventDate(moment(value.Start), moment(value.End), value.Id, value.IsAllDay, value.Title, value.Description, value.TimeZoneID);
                        evnt.Location = new LocationBindingModel(value.Location);
                        _self.WeekModel.AddEvent(evnt);
                    });
                }
            }, this._ownerType, this._ownerId, start, end);
        };
        CalendarManager.prototype.GetDailyEvents = function () {
            var _self = this;
            var start = moment(this.CurrentDate())
                .startOf('d')
                .toISOString();
            var end = moment(this.CurrentDate())
                .endOf('d')
                .toISOString();
            Yugglr.Events.EventsRepository.GetEventOverviews(function (result) {
                if (result.success) {
                    var events = result.data;
                    events.forEach(function (value, index, array) {
                        var evnt = new EventDate(moment(value.Start), moment(value.End), value.Id, value.IsAllDay, value.Title, value.Description, value.TimeZoneID);
                        evnt.Location = new LocationBindingModel(value.Location);
                        _self.DayModel.AddEvent(evnt);
                    });
                }
            }, this._ownerType, this._ownerId, start, end);
        };
        return CalendarManager;
    })();
    var _manager;
    var Calendar;
    (function (Calendar) {
        function Init(ownerEmail, ownerId, ownerType, dictionary) {
            _manager = new CalendarManager(ownerEmail, ownerId, ownerType, dictionary);
            _manager.SetDate(moment());
        }
        Calendar.Init = Init;
    })(Calendar = Yugglr.Calendar || (Yugglr.Calendar = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Calendar.js.map