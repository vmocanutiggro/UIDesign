module Yugglr {
	export interface IEventModel {
		Id: string;
		Title: string;
        StartTime: string;
        Url: string;
	}
	class GroupsAsideManager {
		private _groupId: string;
        private _groupType: string;
        private returnedMemberCount: number;
        private returnMembersCount: number;

		public IsAdmin: boolean;
        public GroupId: string;
		public RecentPhotos: KnockoutObservableArray<PhotoModel>;
        public RecentDocuments: KnockoutObservableArray<Yugglr.Documents.DocumentModel>;
        public RecentEvents: KnockoutObservableArray<Yugglr.EventDateModel>;
		public Members: KnockoutObservableArray<ViewableModel>;
		public SelectedUsers: KnockoutObservableArray<ViewableModel>;
		public Events: KnockoutObservableArray<IEventModel>;
        public SelectedUsersByEmail: KnockoutObservableArray<UserDetails>;
        public NewEvent: KnockoutObservable<Yugglr.EventDate>;

		constructor(groupId: string, groupType: string, isAdmin: boolean) {
			this._groupId = groupId;
            this.GroupId = groupId;
			this._groupType = groupType;
			this.IsAdmin = isAdmin;

			this.RecentPhotos = ko.observableArray([]);
            this.RecentDocuments = ko.observableArray([]);
            this.RecentEvents = ko.observableArray([]);
			this.Members = ko.observableArray([]);
			this.SelectedUsers = ko.observableArray([]);
			this.Events = ko.observableArray([]);
            this.SelectedUsersByEmail = ko.observableArray([]);
            this.NewEvent = ko.observable(null);
        }

        public AddGroupAdmin(model: ViewableModel, event) {
            this.AddAdmin((data)=> {
                if (data.success) {
                    model.IsAdminMember = true;
                    $(event.target).hide();
                    var member = $(event.target).closest('[data-member-id]');
                    member.find('[RemoveAdmin]').show();
                    member.find('[Remove]').hide();
                }
            }, model.Id);
        }

        public RemoveGroupAdmin(model: ViewableModel, event) {
            this.RemoveAdmin((data) => {
                if (data.success) {
                    model.IsAdminMember = false;
                    var member = $(event.target).closest('[data-member-id]');
                    $(event.target).closest('[RemoveAdmin]').hide();
                    member.find('[AddAdmin]').show();
                    member.find('[Remove]').show();
                }
            }, model.Id);
        }

        public LeaveGroupAdmin(model: ViewableModel, event) {
            var _self = this;
            this.Leave((data) => {
                if (data.success) {
                    _self.Members.remove(model);
                    $(event.target).closest('[data-member-id]').remove();
                }
            }, model.Id);
        }
        
        public Init(): void {
            var _self = this;
            _self.returnedMemberCount = 0;
            _self.returnMembersCount = 10;
            
            this.GetGroupMembers((result: Ajax.AjaxResultT<Viewable[]>) => {
                if (result.success) {
                    _self.returnedMemberCount += result.data.length;
                    this.Members(result.data.map((e, i) => new ViewableModel(e)));
                }
            }, _self.returnedMemberCount, 3);

			this.GetRecentPhotos((result: Ajax.AjaxResultT<Photo[]>) => {
				if (result.success) {
					this.RecentPhotos(result.data.map((e, i) => new PhotoModel(e)));
				}
            }, 1);

            this.GetRecentDocuments((result: Ajax.AjaxResultT<IDocument[]>) => {
                if (result.success) {
                    this.RecentDocuments(result.data.map((e, i) => new Yugglr.Documents.DocumentModel(e)));
                }
            }, 5);

			Events.EventsRepository.GetUpcomingEventOverviews((result: Ajax.AjaxResultT<IEventOverview[]>) => {
				if (result.success) {
					_self.Events([]);
					result.data.forEach((o) => {
						_self.Events.push({
							Id: o.Id,
							Title: o.Title,
							StartTime: moment(o.Start.toString(), null, $('html').attr('lang')).format('L LT'),
							Url: Url.BuildEventUrl('profile', 'me', o.Id)
						});
					});
				}
			}, this._groupType, this._groupId);

            var _self = this;

		    var now = new Date();

            var start = moment(now)
                .startOf('M')
                .startOf('w')
                .toISOString();

		    
            var endDate = new Date(now.getFullYear()+1, 12, 31, 0, 0, 0, 0);

            var end = moment(endDate)
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
                        var e = new EventDateModel(start, end, value.Id, value.IsAllDay, value.Title, value.Description, value.TimeZoneID);
                        e.Location(new LocationBindingModel(value.Location));
                        _self.RecentEvents.push(e);
                    });

                }
            }, "group", _self._groupId, start, end);

			ko.applyBindings(this, document.getElementById('sidebar_right'));

            //ko.applyBindings(this, document.getElementById('groupaside_widgets'));

			$('#add-member-modal .user-search').viewablesearch({
				callback: (e: JQueryEventObject, suggestion: any) => {
					var user = suggestion.viewable;
					if (!_self.SelectedUsers().some((u, i) => u.Id == user.Id)) {
						_self.SelectedUsers.push(user);
					}
					$('#add-member-modal .user-search').typeahead('val', '');
				},
				search: [UsersRepository.FindUser]
			});

			$('#add-member-modal').on('click', 'button.close', function (e) {
				e.preventDefault();

				var userId = $(this).data('user-id');
				var users = _self.SelectedUsers().filter((u, i) => u.Id == userId);
				if (users.length >= 1) {
					_self.SelectedUsers.removeAll(users);
				}
			});

			$('#add-member-modal .btn-add').click((e) => {
				e.preventDefault();

				var ids = _self.SelectedUsers().map((u, i) => u.Id);
				_self.InviteMembers((result) => {
					$('#add-member-modal').modal('hide');
					_self.SelectedUsers([]);
				}, ids);
			});
            $('#add-event-modal .btn-add').click((e) => {
                e.preventDefault();

                var ids = _self.SelectedUsers().map((u, i) => u.Id);
                _self.InviteMembers((result) => {
                    $('#add-event-modal').modal('hide');
                    _self.SelectedUsers([]);
                }, ids);
            });



            $('#add-member-byemail-modall').on('click', 'button.close', function (e) {
                e.preventDefault();

                e.preventDefault();

                var userId = $(this).data('user-id');
                var users = _self.SelectedUsersByEmail().filter((u, i) => u.Id == userId);
                if (users.length >= 1) {
                    _self.SelectedUsersByEmail.removeAll(users);
                }
            });

            $('#add-member-byemail-modall').on('click', 'button.add', function (e) {

                var $form = $('#add-member-byemail-modall').find('form');
                if (!$form.valid()) {
                    return;
                }

                var win = $('#add-member-byemail-modall');
                var firstname = win.find(".userbyemail-firstname");
                var lastname = win.find(".userbyemail-lastname");
                var username = win.find(".userbyemail-username");

                var newInvitingUser = new UserDetails({ Id: "", FirstName: firstname.val(), LastName: lastname.val(), UserName: username.val() });
                _self.SelectedUsersByEmail.push(newInvitingUser);

                firstname.val("");
                lastname.val("");
                username.val("");
            });

            $('#add-member-byemail-modall .btn-add').click((e) => {
                e.preventDefault();
                _self.InviteMembersByEmail((result) => {
                    $('#add-member-byemail-modall').modal('hide');
                    _self.SelectedUsersByEmail([]);
                }, _self.SelectedUsersByEmail());
            });
		}

		public OnAddFamilyMember(): void {
			this.SelectedUsers([]);

			$('#add-member-modal').modal({
				backdrop: 'static'
			});
		}

        public OnShowMoreMember(): void {
            var _self = this;
            this.GetGroupMembers((result: Ajax.AjaxResultT<Viewable[]>) => {
                if (result.success) {
                    _self.returnedMemberCount += result.data.length;
                    result.data.map((e, i) => new ViewableModel(e)).forEach((value, index, array) => {
                        _self.Members.push(value);
                    });
                }
            }, _self.returnedMemberCount, _self.returnMembersCount);

        }

        public OnAddMemberByEmail(): void {
            this.SelectedUsersByEmail([]);

            $('#add-member-byemail-modall').modal({
                backdrop: 'static'
            });
        }

        public OnAddEvent(): void {
            this.NewEvent(new EventDate(moment(new Date()), moment(new Date()), "", false, "New event", "", ""));
            //select the user's timezone
            var select = $('#add-event-modal [name*="TimeZoneID"]');
            var zoneName = "W. Europe Standard Time";
            var zoneName1 = moment(new Date()).format("Z");
            var selVal = $('#add-event-modal [name*="TimeZoneID"] option').filter(function () { return $(this).val().indexOf(zoneName) >= 0; });
            if (selVal.val()) {
                select.val(selVal.val());
            } else {
                var selVal1 = $('#add-event-modal [name*="TimeZoneID"] option').filter(function () {
                    return $(this).val().indexOf(zoneName1) >= 0;
                });
                if (selVal1.val())
                    select.val(selVal1.val());
            }

            var wind = $('#add-event-modal');

            var formatDate = 'L';
            wind.find('[name="newEvent\\.Title"]').val("");
            wind.find('[name="newEvent\\.Id"]').val("");
            wind.find('[name="newEvent\\.Start"]').val(moment(new Date()).format(formatDate));
            wind.find('[name="newEvent\\.End"]').val(moment(new Date()).format(formatDate));
            wind.find('[name="newEvent\\.IsAllDayEvent"]').prop('checked', false);
            wind.find('[name="newEvent\\.Description"]').val("");
            wind.find('[name="newEvent\\.Location.Longitude"]').val("");
            wind.find('[name="newEvent\\.Location.Latitude"]').val("");
            wind.find('[name="newEvent\\.Location.Address"]').val("Stockholm, Sweden");

            wind.find('#add-event-modal-label-title').show();
            wind.find('#add-event-modal-label-delete').hide();
            wind.find('.btn_post').show();
            wind.find('.btn_delete').hide();

            var $this = wind.find('.location-box');
            $this.next().show(function () {
                Yugglr.GoogleMaps.VioShowFieldMap('#add-event-modal #newevent_location', '#add-event-modal #new_event_map', 59.329, 18.069);
            });



            $('#add-event-modal').modal({
                backdrop: 'static'
            });
        }

        public OnEditEvent(eventId: string) {
            Events.EventsRepository.GetEventDetail((result) => {
                if (result.success) {
                    var event = <IEventOverview>result.data;
                    
                        var start = moment(event.Start);
                        var end = moment(event.End);
                        var e = new EventDate(start, end, event.Id, event.IsAllDay, event.Title, event.Description, event.TimeZoneID);
                    e.Location = new LocationBindingModel(event.Location);
                    this.NewEvent(e);
                    var wind = $('#add-event-modal');
                    wind.find('#add-event-modal-label-title').show();
                    wind.find('#add-event-modal-label-delete').hide();
                    wind.find('.btn_post').show();
                    wind.find('.btn_delete').show();

                    var wind = $('#add-event-modal');
                    this.LoadEventInfo(e, '#add-event-modal', wind);

                    $('#add-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        }

        public OnViewEvent(eventId: string) {
            Events.EventsRepository.GetEventDetail((result) => {
                if (result.success) {
                    var event = <IEventOverview>result.data;

                    var start = moment(event.Start);
                    var end = moment(event.End);
                    var e = new EventDate(start, end, event.Id, event.IsAllDay, event.Title, event.Description, event.TimeZoneID);
                    e.Location = new LocationBindingModel(event.Location);
                    //this.NewEvent(e);

                    var wind = $('#view-event-modal');
                    this.LoadEventInfo(e, '#view-event-modal', wind);

                    $('#view-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        }

        public LoadEventInfo(e: EventDate, windId: string, wind: JQuery): void {
	     
            //var formatDate = e.IsAllDay ? "DD/MM/YYYY" : "YYYY-MM-DD HH:mm";

            var formatDate = 'L';
            if (!e.IsAllDay) {
                formatDate += ' LT';
            }
            wind.find('[name="newEvent\\.Title"]').val(e.Title);
            wind.find('[name="newEvent\\.Id"]').val(e.Id);
            wind.find('[name="newEvent\\.Start"]').val(e.Start.format(formatDate));
            wind.find('[name="newEvent\\.End"]').val(e.End.format(formatDate));
            //wind.find('[name="newEvent\\.IsAllDayEvent"]').prop('checked', e.IsAllDay);
            wind.find('[name="newEvent\\.Description"]').val(e.Description);
            wind.find('[name="newEvent\\.TimeZoneID"]').val(e.TimeZoneID);
            wind.find('[name="newEvent\\.Location.Longitude"]').val(e.Location.Longitude.toString());
            wind.find('[name="newEvent\\.Location.Latitude"]').val(e.Location.Latitude.toString());
            wind.find('[name="newEvent\\.Location.Address"]').val(e.Location.Address);

            var $this = wind.find('.location-box');
            $this.next().show(function () {
                //wind.find('[name="newEvent\\.Location.Address"]').focus();
                Yugglr.GoogleMaps.VioShowFieldMap(windId + ' #newevent_location', windId + ' #new_event_map', e.Location.Latitude, e.Location.Longitude);
            });
        }

        

		public InviteMembers(callback: Ajax.AjaxCallback, userIds: string[]): void {
			var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/invite';

			Ajax.Post(callback, url, { userIds: userIds });
        }

        public InviteMembersByEmail(callback: Ajax.AjaxCallback, users: UserDetails[]): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/invitebyemail';

            Ajax.Post(callback, url, users );
        }

        public AddAdmin(callback: Ajax.AjaxCallback, userId: string): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/addadmin/' + userId;

            Ajax.Post(callback, url);
        }

        public RemoveAdmin(callback: Ajax.AjaxCallback, userId: string): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/removeadmin/' + userId;
            Ajax.Post(callback, url);
        }

        public Leave(callback: Ajax.AjaxCallback, userId: string): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/leave/' + userId;
            Ajax.Post(callback, url);
        }

		public GetGroupMembers(callback: Ajax.AjaxCallbackT<Viewable[]>, skip?: number, maxItems?: number) {
			var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/members';
		    if (skip) {
		        url += '/' + skip;
		    } else {
		        url += '/' + 0;
		    }
		    if (maxItems) {
					url += '/' + maxItems;
				}
			

			Ajax.Get(callback, url);
		}

		public GetRecentPhotos(callback: Ajax.AjaxCallbackT<Photo[]>, maxItems?: number): void {
			var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/photos/recent';
			if (maxItems) {
				url += '/' + maxItems;
			}

			Ajax.Get(callback, url);
        }

        public GetRecentDocuments(callback: Ajax.AjaxCallbackT<IDocument[]>, maxItems?: number): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/documents/recent';
            if (maxItems) {
                url += '/' + maxItems;
            }

            Ajax.Get(callback, url);
        }
	}

	var _asideManager: GroupsAsideManager;

    export module GroupAside {
        export function Init(groupId: string, profileUrlId: string, groupType: string, isAdmin: boolean, feedItems: KnockoutObservableArray<FeedItemModel> = null): void {
            _asideManager = new GroupsAsideManager(groupId, groupType, isAdmin);
            _asideManager.Init();
            var _eventWidget = Yugglr.EventWidget.Init(groupId, profileUrlId, groupType, isAdmin, _asideManager.RecentEvents, _asideManager.NewEvent, feedItems);


        }
    }
} 