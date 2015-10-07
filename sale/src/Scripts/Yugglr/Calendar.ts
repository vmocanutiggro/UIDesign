module Yugglr {
	export interface ICalendarDictionary {
		Day: string;
		Week: string;
		Month: string;
	}

	export interface IEventOverview {
        Id: string;
        Title: string;
        Start: Date;
        End: Date;
        IsAllDay: boolean;
        Description: string;
        TimeZoneID: string;
        Location: Location
	}

	interface ICalendarBuilder {
		(date: Moment): void;
	}

	enum CalendarType {
		Day,
		Week,
		Month
	}

	interface IViewMode {
		Type: CalendarType;
		Text: string;
    }

    export class LocationBindingModel {
        public Address: string;
        public Longitude: number;
        public Latitude: number;

        constructor(location: Location) {
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
    }

	export class EventDate {
		constructor(start: Moment, end: Moment, id: string, allDay: boolean, title: string, description: string, timeZoneId: string) {
			this.Id = id;
			this.Title = title;
			this.Start = start;
			this.End = end;
			this.IsAllDay = allDay;
            this.Url = _manager!=null?_manager.GetEventUrl(this.Id):Url.BuildEventUrl('profile', 'me', id);;
            this.Description = description;
            this.Location = new LocationBindingModel({ Address: "", Longitude: 0, Latitude:0 });
		    this.TimeZoneID = timeZoneId;
		}

		public Id: string;
		public Title: string;
		public Start: Moment;
		public End: Moment;
		public IsAllDay: boolean;
		public Url: string;
        public Description: string;
        public Location: LocationBindingModel;
        public TimeZoneID: string;

		public EventClass(): string {
			if (this.IsAllDay) {
				return 'calendar-event full_day_event cc_safron';
			} else {
				return 'calendar-event single_event cc_safron';
			}
		}

		public StartTime(): string {
			return this.Start.format('LT');
		}

		public DayEventStyle(group: EventGroup): any {
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
		}
	}

    export class EventDateModel {

        constructor(start: Moment, end: Moment, id: string, allDay: boolean, title: string, description: string, timeZoneId: string) {
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

        public Id: KnockoutObservable<string>;
        public Title: KnockoutObservable<string>;
        public Start: KnockoutObservable<Moment>;
        public End: KnockoutObservable<Moment>;
        public IsAllDay: KnockoutObservable<boolean>;
        public Description: KnockoutObservable<string>;
        public Location: KnockoutObservable<LocationBindingModel>;
        public TimeZoneID: KnockoutObservable<string>;

        public StartTime(): string {
            return this.Start().format('LT');
        }

    }

	class Week {
		public Days: KnockoutObservableArray<Day>;

		constructor(week: Moment) {
			this.Days = ko.observableArray([]);

			for (var i = 1; i <= 7; ++i) {
				this.Days.push(new Day(week));
				week = week.add(1, 'd');
			}
		}

		public AddEvents(dayOfYear: number, events: EventDate[]): boolean {
			var days = this.Days();
			for (var i = 0; i < days.length; i++) {
				var day = days[i];
				if (day.Date.dayOfYear() == dayOfYear) {
					day.SetEvents(events);
					return true;
				}
			}

			return false;
		}
	}

	class Day {
		constructor(date: Moment) {
			this.Date = moment(date);
			this.Events = ko.observableArray([]);
			this.ExtraEvents = ko.observableArray([]);
		}

		public IsCurrnetMonth(): boolean {
			return this.Date.month() == _manager.CurrentMonth() && this.Date.year() == _manager.CurrentYear();
		}

		public DayOfMonth(): number {
			return this.Date.date();
		}

		public DayClass(): string {
			var dayClass = 'item_outer';

			if (!this.IsCurrnetMonth()) {
				dayClass += ' item_outer not_current_months_day';
			}

			return dayClass;
		}

		public DayInnerClass(): string {
			var dayClass = 'item_inner';

			if (this.Date.isSame(moment(), 'day')) {
				dayClass += ' current_day_item';
			}

			return dayClass;
		}

		public SetEvents(events: EventDate[]): void {
			this.ExtraEvents([]);
			this.Events([]);

			for (var i = 0; i < events.length; ++i) {
				var e = events[i];
				if (i >= 2) {
					this.ExtraEvents.push(e);
				} else {
					this.Events.push(e);
				}
			}
		}

		public Date: Moment;
		public Events: KnockoutObservableArray<EventDate>;
		public ExtraEvents: KnockoutObservableArray<EventDate>;
	}

	class MonthlyCalendar {
		constructor() {
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

		public NamesOfDays: string[];
		public Rows: KnockoutObservableArray<Week>;
	}

	export class EventGroup {
		public Events: KnockoutObservableArray<EventDate>;
		public Start: Moment;
		public End: Moment;

		public StartTopStyle(): any {
			var startHours = this.Start.hours() + (this.Start.minutes() / 60);

			return { top: (startHours * 100) + 'px' };
		}

		constructor(evt: EventDate) {
			this.Start = evt.Start;
			this.End = evt.End;
			this.Events = ko.observableArray([evt]);
		}

		public AddEvent(evt: EventDate): void {
			if (!this.Start) {
				this.Start = evt.Start;
			} else {
				this.Start = evt.Start.min(this.Start);
			}

			if (!this.End) {
				this.End = evt.End;
			} else {
				this.End = this.End.max(evt.End);
			}

			this.Events.push(evt);
		}

		public Overlaps(evt: EventDate): boolean {
			if (!this.Start || !this.End) {
				return true;
			}

			var isOverlaping =
				(evt.Start.isAfter(this.Start) && evt.Start.isBefore(this.End)) ||
				(evt.End.isAfter(this.Start) && evt.End.isBefore(this.End)) ||
				((evt.Start.isBefore(this.Start) || evt.Start.isSame(this.Start)) && (evt.End.isAfter(this.End) || evt.End.isSame(this.End)));

			return isOverlaping;
		}
	}

	class DailyCalendar {
		constructor(date: Moment) {
			this.NameOfDay = ko.observable('');
			this.Groups = ko.observableArray([]);
			this.SetDate(date);
		}

		public SetDate(date: Moment): void {
			this.Groups([]);
			this.Date = moment(date);
			this.NameOfDay(date ? date.format('dddd Do MMM') : '');
		}

		public AddEvent(evt: EventDate): void {
			if (!this.Overlaps(evt)) {
				return;
			}

			var startOfDay = moment(this.Date).startOf('day');
			var endOfDay = moment(this.Date).endOf('day');

			var newEvt = new EventDate(
				evt.Start.min(startOfDay),
				evt.End.max(endOfDay),
				evt.Id,
				evt.IsAllDay,
                evt.Title,
                evt.Description,
                evt.TimeZoneID);

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
		}

		public Overlaps(evt: EventDate): boolean {
			var start = moment(this.Date).startOf('day');
			var end = moment(this.Date).endOf('day');

			var isOverlapping =
				(evt.Start.isAfter(start) && evt.Start.isBefore(end)) ||
				(evt.End.isAfter(start) && evt.End.isBefore(end)) ||
				((evt.Start.isBefore(start) || evt.Start.isSame(start)) && (evt.End.isAfter(end) || evt.End.isSame(end)));

			return isOverlapping;
		}

		public NameOfDay: KnockoutObservable<string>;
		public Date: Moment;
		public Groups: KnockoutObservableArray<EventGroup>;
	}

	class WeeklyCalendar {
		constructor(date: Moment) {
			this.Days = ko.observableArray([]);
			this.SetDate(date);
		}

		public SetDate(date: Moment) {
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
		}

		public Start: Moment;
		public End: Moment;
		public Days: KnockoutObservableArray<DailyCalendar>;

		public Overlaps(evt: EventDate): boolean {
			if (!this.Start || !this.End) {
				return true;
			}

			var isOverlapping =
				(evt.Start.isAfter(this.Start) && evt.Start.isBefore(this.End)) ||
				(evt.End.isAfter(this.Start) && evt.End.isBefore(this.End)) ||
				((evt.Start.isBefore(this.Start) || evt.Start.isSame(this.Start)) && (evt.End.isAfter(this.End) || evt.End.isSame(this.End)));

			return isOverlapping;
		}

		public AddEvent(evt: EventDate): void {
			if (this.Overlaps(evt)) {
				var days = this.Days();
				for (var i = 0; i < days.length; ++i) {
					var day = days[i];

					if (day.Overlaps(evt)) {
						day.AddEvent(evt);
					}
				}
			}
		}
	}

	class CalendarManager {
		private _ownerId: string;
		private _ownerType: string;
		private _ownerEmail: string;

		public CurrentYear: KnockoutObservable<number>;
		public CurrentMonth: KnockoutObservable<number>;
		public CurrentDate: KnockoutObservable<Moment>;
		public MonthHeading: KnockoutObservable<string>;
		public Type: KnockoutObservable<CalendarType>;
		public Template: KnockoutComputed<string>;
		public ViewModes: IViewMode[];

		public MonthModel: MonthlyCalendar;
		public WeekModel: WeeklyCalendar;
		public DayModel: DailyCalendar;

        public GetEventUrl(eventId: string): string {
			return Url.BuildEventUrl('profile', this._ownerEmail, eventId);
		}

		constructor(ownerEmail: string, ownerId: string, ownerType: string, dictionary: ICalendarDictionary) {
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
			this.Type.subscribe((type: CalendarType) => {
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

			this.Template = ko.computed(() => {
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

			moment.locale(Language());

			this.CurrentYear = ko.observable(null);
			this.CurrentMonth = ko.observable(null);
			this.CurrentDate = ko.observable(null);

			this.MonthModel = new MonthlyCalendar();
			this.WeekModel = new WeeklyCalendar(this.CurrentDate());
			this.DayModel = new DailyCalendar(this.CurrentDate());

			this.MonthHeading = ko.pureComputed(() => {
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

		public SetDate(date: Moment): void {
			this.CurrentYear(date.year());
			this.CurrentMonth(date.month());
			this.CurrentDate(date);

			this.BuildCalendar(date);
		}

		public Today(): void {
			this.SetDate(moment());
		}

		public SetDayType(): void {
			this.Type(CalendarType.Day);

			var date = this.CurrentDate();
			this.DayModel.SetDate(date);
			this.BuildCalendar(date);
		}

		public SetWeekType(): void {
			this.Type(CalendarType.Week);

			var date = this.CurrentDate();
			this.WeekModel.SetDate(date);
			this.BuildCalendar(date);
		}

		public SetMonthType(): void {
			this.Type(CalendarType.Month);
		}

		public NextClick(): void {
			var unit = this.GetUnit();
			if (!unit) {
				return;
			}

			this.SetDate(moment(this.CurrentDate()).startOf(unit).add(1, unit));
		}

		public PreviousClick(): void {
			var unit = this.GetUnit();
			if (!unit) {
				return;
			}

			this.SetDate(moment(this.CurrentDate()).startOf(unit).add(-1, unit));
		}

		private GetUnit(): string {
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
		}

		private BuildCalendar(date: Moment): void {
			var builder: ICalendarBuilder;
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
		}

		private BuildMonthlyCalendar(date: Moment): void {
			var startOfMonth = moment(date)
				.startOf('month');

			var startOfNextMonth = moment(startOfMonth)
				.add(1, 'M');

			var firstDate = moment(startOfMonth)
				.startOf('week');

			var weeks: KnockoutObservableArray<Week> = ko.observableArray([]);
			for (var week = firstDate; week.isBefore(startOfNextMonth); week = week.add(1, 'w')) {
				var weekRow = new Week(moment(week));
				weeks.push(weekRow);
			}

			this.GetMonthlyEvents();

			this.MonthModel.Rows(weeks());
		}

		private BuildDailyCalendar(date: Moment): void {
			this.GetDailyEvents();
		}

		private BuildWeeklyCalendar(date: Moment): void {
			this.GetWeeklyEvents();
		}

		private GetMonthlyEvents(): void {
			var _self = this;

			var start = moment(this.CurrentDate())
				.startOf('M')
				.startOf('w')
				.toISOString();

			var end = moment(this.CurrentDate())
				.endOf('M')
				.endOf('w')
				.toISOString();

			Events.EventsRepository.GetEventOverviews((result) => {
				if (result.success) {
					var x = {
					};

					var events = <IEventOverview[]>result.data;
					events.forEach((value, index, array) => {
						var start = moment(value.Start);
						var end = moment(value.End);
						var limit = moment(end).add(1, 'd')

						for (var i = moment(start); i.isBefore(limit, 'd'); i.add(1, 'd')) {
							var allDay = value.IsAllDay;
							if (!i.isSame(start, 'd') && !i.isSame(end, 'd')) {
								allDay = true;
							}

                            var e = new EventDate(start, end, value.Id, allDay, value.Title, value.Description, value.TimeZoneID);
						    e.Location = new LocationBindingModel(value.Location);
							var arr: EventDate[] = x[i.dayOfYear()] = (x[i.dayOfYear()] || []);
							arr.push(e);
						}
					});

					for (var i in x) {
						var arr: EventDate[] = x[i];
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
		}

		private GetWeeklyEvents(): void {
			var _self = this;

			var start = moment(this.CurrentDate())
				.startOf('w')
				.toISOString();

			var end = moment(this.CurrentDate())
				.endOf('w')
				.toISOString();

			Events.EventsRepository.GetEventOverviews((result) => {
				if (result.success) {
					var events = <IEventOverview[]>result.data;
                    events.forEach((value, index, array) => {
                        var evnt = new EventDate(
                            moment(value.Start),
                            moment(value.End),
                            value.Id,
                            value.IsAllDay,
                            value.Title,
                            value.Description,
                            value.TimeZoneID);

                            evnt.Location = new LocationBindingModel(value.Location);
                        _self.WeekModel.AddEvent(
                            evnt
                        );
                    });
				}
			}, this._ownerType, this._ownerId, start, end);
		}

		private GetDailyEvents(): void {
			var _self = this;

			var start = moment(this.CurrentDate())
				.startOf('d')
				.toISOString();

			var end = moment(this.CurrentDate())
				.endOf('d')
				.toISOString();

			Events.EventsRepository.GetEventOverviews((result) => {
				if (result.success) {
					var events = <IEventOverview[]>result.data;
                    events.forEach((value, index, array) => {
                        var evnt = new EventDate(
                            moment(value.Start),
                            moment(value.End),
                            value.Id,
                            value.IsAllDay,
                            value.Title,
                            value.Description,
                            value.TimeZoneID);
                        evnt.Location = new LocationBindingModel(value.Location);
                        _self.DayModel.AddEvent(
                            evnt
                            );
                    });
				}
			}, this._ownerType, this._ownerId, start, end);
		}
	}

	var _manager: CalendarManager;

	export module Calendar {
        export function Init(ownerEmail: string, ownerId: string, ownerType: string, dictionary: ICalendarDictionary): void {
			_manager = new CalendarManager(ownerEmail, ownerId, ownerType, dictionary);
			_manager.SetDate(moment());
		}
	}
}
