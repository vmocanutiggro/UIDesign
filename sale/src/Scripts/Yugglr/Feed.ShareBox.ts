module Yugglr {
	export class NewEvent {
		constructor() {
			this.InvitedUsers = ko.observableArray([]);
			this.SelectedUser = ko.observable(null);

			this.InvitedGroups = ko.observableArray([]);
			this.SelectedGroup = ko.observable(null);
		}

		InvitedUsers: KnockoutObservableArray<ViewableModel>;
		SelectedUser: KnockoutObservable<ViewableModel>;

		InvitedGroups: KnockoutObservableArray<ViewableModel>;
		SelectedGroup: KnockoutObservable<ViewableModel>;

		AddUser(user: ViewableModel): void {
			this.InvitedUsers.push(user);
		}

		RemoveUser(user: ViewableModel): void {
			this.InvitedUsers.remove(user);
		}

		AddGroup(group: ViewableModel): void {
			this.InvitedGroups.push(group);
		}

		RemoveGroup(group: ViewableModel): void {
			this.InvitedGroups.remove(group);
		}

		OnAddUser(): void {
			this.InvitedUsers.push(this.SelectedUser());
			this.SelectedUser(null);
		}

		OnAddGroup(): void {
			this.InvitedGroups.push(this.SelectedGroup());
			this.SelectedGroup(null);
		}

		Clear(): void {
			this.InvitedGroups([]);
			this.InvitedUsers([]);
		}
	}

	export class ShareBox {
		private _newEvent: NewEvent;
		public NewEvent(): NewEvent {
			return this._newEvent;
		}

		constructor(ownerId: string, profileOwnerId: string, ownerType: string, manager: FeedManager, errorMessages: IFeedErrorMessages) {
			this.Initialize();

			this._newEvent = new NewEvent();

			ko.applyBindings(this._newEvent, $('.subsection_activity_feed .share_box_holder')[0]);

			var repository = manager.GetFeedRepository();
			var _self = this;

			$('.share_box_tabs_holder').on('click', '.btn_post', function (e) {
				e.preventDefault();

				var $this = $(this);
				var $form = $this.closest('form');
				if (!$form.valid()) {
					return;
				}

				var $btn = $(this);
				$btn.button('loading');

				var $pt = $	('#post-target');
				var ot, oid;
				if ($pt.length) {
					var values = (<string>$pt.val()).split(';');
					ot = values[1];
					oid = values[0];
				} else {
					ot = ownerType;
					oid = ownerId;
				}

				if ($form.is('.event-form')) {
					var model = manager.GetModel();

					Yugglr.Events.EventsRepository.Create((result) => {
						$btn.button('reset');

						if (result.success) {
							var items = (<Yugglr.FeedItem[]>result.data);
							for (var item in items) {
								model.AddItem(<FeedItem>(items[item]));
							}

							_self.StopEditing($form);
						}
					}, ot, oid, $form);
				} else {
					var model = manager.GetModel();

					var repo = new Feed.FeedRepository(ot);
					repo.Post((result) => {
						$btn.button('reset');

						if (result.success) {
							var items = (<Yugglr.FeedItem[]>result.data);
							for (var item in items) {
								model.AddItem(<FeedItem>(items[item]));
							}

							_self.StopEditing($form);
						} else {
							if (result.data.ExceptionType === 'System.IO.IOException') {
								Alert('#alerts', errorMessages.TooLargeFile, 'danger');
							} else {
								Alert('#alerts', errorMessages.FailedToPost, 'danger');
							}
						}
					}, oid, $form);
				}
			});

			$('#EventParticipants-UserSearch').viewablesearch({
				callback: (e: JQueryEventObject, suggestion: IViewableSuggestion) => {
					var user = suggestion.viewable;

					if (user) {
						var newEvent = _self.NewEvent();
						if (!newEvent.InvitedUsers().some((u, i) => u.Id == user.Id)) {
							newEvent.InvitedUsers.push(user);
						}
					}
					$('#EventParticipants-UserSearch').typeahead('val', '');
				},
				search: [UsersRepository.FindUser],
				typeaheadOptions: {
					minLength: 1
				}
			});

			$('#EventParticipants-GroupSearch').viewablesearch({
				callback: (e: JQueryEventObject, suggestion: IViewableSuggestion) => {
					var group = suggestion.viewable;

					if (group) {
						var newEvent = _self.NewEvent();
						if (!newEvent.InvitedGroups().some((g, i) => g.Id == group.Id)) {
							newEvent.InvitedGroups.push(group);
						}
					}
					$('#EventParticipants-GroupSearch').typeahead('val', '');
				},
				search: [GroupsRepository.Find, FamiliesRepository.Find],
				typeaheadOptions: {
					minLength: 1
				}
			});
		}

		private Initialize() {
			var _self = this;

			$('.return_to_share_box, .textarea_holder .btn_close').click(function (e) {
				e.preventDefault();

				_self.ShowControls();
			});

			$('.textarea_holder .btn_close').click(function () {
				_self.StopEditing($(this).closest('form'));
			});

			$('.return_to_share_box').click(function () {
				_self.StopEditing($(this).closest('form'));
			});

			$('.share_box_tabs_holder').on('focus', '.location-box', function (e) {
				var $this = $(this);
				$this.next().show(function () {
					Yugglr.GoogleMaps.RebuildFieldMap($($('input', $this)[1]));
				});
			});

			$('.share_box_holder').on('shown.bs.tab', '.share_box_tabs_switcher', function (e) {
				var $holder = $($(e.target).attr('href'));

				var $tab = $(e.delegateTarget);
				$tab
					.find('input, select, texarea')
					.resetValidation();

				$('.share_box_controls_holder').hide(0, function () {
					$('.post-title:first, .event-title:first', $holder).focus();
				});
			});

			$('.share_box_holder').on('focus', '.share_box_controls_holder textarea', function () {
				$('a[href="#share_box_tab_whats_new"]').click();
			});

			$('#share_box_tab_whats_new').on('shown.bs.tab', 'a[data-toggle=tab]', function (e) {
				if (e.target) {
					var type = $(e.target).data('attachment-type');
					$(e.target).closest('form').find('[name=AttachmentType]').val(type);
				}

				if (e.relatedTarget) {
					var $tab = $($(e.relatedTarget).attr('href'));

					//$('[data-provides=fileinput]', $tab).fileinput('clear');
                    var $form = $(e.target).closest('form');
                    $('input[type=file]', $form).val('');
                    $('span.fileinput-filename', $form).empty();
                    $('div.fileinput:not([class*="fileinput-new"])', $form).removeClass("fileinput-exists").removeClass("file_is_chosen").addClass("fileinput-new");
                    $('span.you_want_upload:not([class*="hidden"])', $form).addClass("hidden");


					$tab
						.find('input')
						.val('')
						.resetValidation();
				}
			});

			$('#IsAllDayEvent').on('click', function (e) {
				var $t = $(this);
				var isChecked = $t.is(':checked');

				$('#share_box_tab_event .event_date')
					.each((i, picker) => {
						var $picker = $(picker);
						var p = $picker.data('DateTimePicker');
						p.destroy();
						$picker.datetimepicker({ format: !isChecked ? 'L LT' : 'L', locale: Yugglr.Language() });

						if ($picker.val()) {
							var p = $picker.data('DateTimePicker');
							var date = (<any>p).date();
							(<any>p).date(date);
						}
					})
					.each((i, picker) => {
						var $picker = $(picker);
						if ($picker.val()) {
							var p = $picker.data('DateTimePicker');
							var date = (<any>p).date();

							if ($picker.is('[name=Start]')) {
								var $other = $('#share_box_tab_event .event_date[name=End]');
								(<any>$other.data('DateTimePicker')).minDate(date);
							} else {
								var $other = $('#share_box_tab_event .event_date[name=Start]');
								(<any>$other.data('DateTimePicker')).maxDate(date);
							}
						}
					});

			});

			$('#share_box_tab_event .event_date')
				.datetimepicker({ format: false, locale: Yugglr.Language() })
				.on('dp.change', function (e) {
					var $this = $(this);

					if ($this.is('[name=Start]')) {
						var $other = $('#share_box_tab_event .event_date[name=End]');
						(<any>$other.data('DateTimePicker')).minDate(e.date);
					} else {
						var $other = $('#share_box_tab_event .event_date[name=Start]');
						(<any>$other.data('DateTimePicker')).maxDate(e.date);
					}
				});

			Yugglr.GoogleMaps.CreateGeocoderField('#whats_new_location', '#whats_new_map');
			Yugglr.GoogleMaps.CreateGeocoderField('#photo_location', '#photo_map');
			Yugglr.GoogleMaps.CreateGeocoderField('#location_location', '#location_map');
			Yugglr.GoogleMaps.CreateGeocoderField('#event_location', '#event_map');
		}

		public ShowControls() {
			$('.share_box_controls_holder').show();
			$('.share_box_tabs_holder > .tab-pane.active').removeClass('active');
		}

		public StopEditing(form: JQuery): void {
			var _self = this;
            window.setTimeout(function () {
                //clear file upload data
                $('input[type=file]', form).val('');
                $('span.fileinput-filename', form).empty();
                $('div.fileinput:not([class*="fileinput-new"])', form).removeClass("fileinput-exists").removeClass("file_is_chosen").addClass("fileinput-new");
                $('span.you_want_upload:not([class*="hidden"])', form).addClass("hidden");
				//$('a[data-dismiss=fileinput]', $('.fileinput', form)).click();
				$('textarea, input[type=text], input[type=url], select', form).val('').delay(100).resetValidation();
				$('input[type=checkbox], input[type=radio]', form).attr('checked', false);
				$('.location-wrapper').hide();
				var $tab = $($('.nav-tabs li.active a').attr('href'));
				if ($tab.length > 0) {
					$tab.removeClass('active');
					$tab.find('input')
						.val('')
						.delay(100).resetValidation();
				}

				$('.nav-tabs li.active').removeClass('active');
				$('input[name=AttachmentType]').val('None');

				$('#share_box_tab_event .event_date').delay(100).each((i, picker) => {
					var $picker = $(picker);
					var p = $picker.data('DateTimePicker');
					p.destroy();
					$picker.datetimepicker({ format: false, locale: Yugglr.Language() })
				});

				$('#collapse_add_participiants').collapse('hide');
				_self._newEvent.Clear();
			}, 100);

			this.ShowControls();
		}
	}
}
