module Yugglr {
	module CalendarWidget {
		interface IEventOverview {
			Id: string;
			Title: string;
			Start: Date;
			End: Date;
			IsAllDay: boolean;
		}

		interface IEventModel {
			Id: string;
			Title: string;
			StartTime: string;
			Url: string;
		}

		interface IModel {
			Events: KnockoutObservableArray<IEventModel>
		}

		var _model: IModel = {
			Events: null
		}

		function Init(widgetRoot: any) {
			var $w = $(widgetRoot);

			if (!_model.Events) {
				_model.Events = ko.observableArray<IEventModel>(null);
				Events.EventsRepository.GetUpcomingEventOverviews((result: Ajax.AjaxResultT<IEventOverview[]>) => {
					if (result.success) {
						_model.Events([]);
						result.data.forEach((o) => {
							_model.Events.push({
								Id: o.Id,
								Title: o.Title,
								StartTime: moment(o.Start.toString(), null, $('html').attr('lang')).format('L LT'),
								Url: Url.BuildEventUrl('profile', 'me', o.Id)
							});
						});
					}
				}, 'user', $w.data('user-id'));
			}

			ko.applyBindings(_model, $w.get(0));
		}

		$('[data-provides="calendar-widget"]').each((idx, e) => {
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
	}
} 