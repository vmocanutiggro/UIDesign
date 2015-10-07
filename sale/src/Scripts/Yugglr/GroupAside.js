var Yugglr;
(function (Yugglr) {
    var GroupsAsideManager = (function () {
        function GroupsAsideManager(groupId, groupType, isAdmin) {
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
        GroupsAsideManager.prototype.AddGroupAdmin = function (model, event) {
            this.AddAdmin(function (data) {
                if (data.success) {
                    model.IsAdminMember = true;
                    $(event.target).hide();
                    var member = $(event.target).closest('[data-member-id]');
                    member.find('[RemoveAdmin]').show();
                    member.find('[Remove]').hide();
                }
            }, model.Id);
        };
        GroupsAsideManager.prototype.RemoveGroupAdmin = function (model, event) {
            this.RemoveAdmin(function (data) {
                if (data.success) {
                    model.IsAdminMember = false;
                    var member = $(event.target).closest('[data-member-id]');
                    $(event.target).closest('[RemoveAdmin]').hide();
                    member.find('[AddAdmin]').show();
                    member.find('[Remove]').show();
                }
            }, model.Id);
        };
        GroupsAsideManager.prototype.LeaveGroupAdmin = function (model, event) {
            var _self = this;
            this.Leave(function (data) {
                if (data.success) {
                    _self.Members.remove(model);
                    $(event.target).closest('[data-member-id]').remove();
                }
            }, model.Id);
        };
        GroupsAsideManager.prototype.Init = function () {
            var _this = this;
            var _self = this;
            _self.returnedMemberCount = 0;
            _self.returnMembersCount = 10;
            this.GetGroupMembers(function (result) {
                if (result.success) {
                    _self.returnedMemberCount += result.data.length;
                    _this.Members(result.data.map(function (e, i) { return new Yugglr.ViewableModel(e); }));
                }
            }, _self.returnedMemberCount, 3);
            this.GetRecentPhotos(function (result) {
                if (result.success) {
                    _this.RecentPhotos(result.data.map(function (e, i) { return new Yugglr.PhotoModel(e); }));
                }
            }, 1);
            this.GetRecentDocuments(function (result) {
                if (result.success) {
                    _this.RecentDocuments(result.data.map(function (e, i) { return new Yugglr.Documents.DocumentModel(e); }));
                }
            }, 5);
            Yugglr.Events.EventsRepository.GetUpcomingEventOverviews(function (result) {
                if (result.success) {
                    _self.Events([]);
                    result.data.forEach(function (o) {
                        _self.Events.push({
                            Id: o.Id,
                            Title: o.Title,
                            StartTime: moment(o.Start.toString(), null, $('html').attr('lang')).format('L LT'),
                            Url: Yugglr.Url.BuildEventUrl('profile', 'me', o.Id)
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
            var endDate = new Date(now.getFullYear() + 1, 12, 31, 0, 0, 0, 0);
            var end = moment(endDate)
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
                        var e = new Yugglr.EventDateModel(start, end, value.Id, value.IsAllDay, value.Title, value.Description, value.TimeZoneID);
                        e.Location(new Yugglr.LocationBindingModel(value.Location));
                        _self.RecentEvents.push(e);
                    });
                }
            }, "group", _self._groupId, start, end);
            ko.applyBindings(this, document.getElementById('sidebar_right'));
            //ko.applyBindings(this, document.getElementById('groupaside_widgets'));
            $('#add-member-modal .user-search').viewablesearch({
                callback: function (e, suggestion) {
                    var user = suggestion.viewable;
                    if (!_self.SelectedUsers().some(function (u, i) { return u.Id == user.Id; })) {
                        _self.SelectedUsers.push(user);
                    }
                    $('#add-member-modal .user-search').typeahead('val', '');
                },
                search: [Yugglr.UsersRepository.FindUser]
            });
            $('#add-member-modal').on('click', 'button.close', function (e) {
                e.preventDefault();
                var userId = $(this).data('user-id');
                var users = _self.SelectedUsers().filter(function (u, i) { return u.Id == userId; });
                if (users.length >= 1) {
                    _self.SelectedUsers.removeAll(users);
                }
            });
            $('#add-member-modal .btn-add').click(function (e) {
                e.preventDefault();
                var ids = _self.SelectedUsers().map(function (u, i) { return u.Id; });
                _self.InviteMembers(function (result) {
                    $('#add-member-modal').modal('hide');
                    _self.SelectedUsers([]);
                }, ids);
            });
            $('#add-event-modal .btn-add').click(function (e) {
                e.preventDefault();
                var ids = _self.SelectedUsers().map(function (u, i) { return u.Id; });
                _self.InviteMembers(function (result) {
                    $('#add-event-modal').modal('hide');
                    _self.SelectedUsers([]);
                }, ids);
            });
            $('#add-member-byemail-modall').on('click', 'button.close', function (e) {
                e.preventDefault();
                e.preventDefault();
                var userId = $(this).data('user-id');
                var users = _self.SelectedUsersByEmail().filter(function (u, i) { return u.Id == userId; });
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
                var newInvitingUser = new Yugglr.UserDetails({ Id: "", FirstName: firstname.val(), LastName: lastname.val(), UserName: username.val() });
                _self.SelectedUsersByEmail.push(newInvitingUser);
                firstname.val("");
                lastname.val("");
                username.val("");
            });
            $('#add-member-byemail-modall .btn-add').click(function (e) {
                e.preventDefault();
                _self.InviteMembersByEmail(function (result) {
                    $('#add-member-byemail-modall').modal('hide');
                    _self.SelectedUsersByEmail([]);
                }, _self.SelectedUsersByEmail());
            });
        };
        GroupsAsideManager.prototype.OnAddFamilyMember = function () {
            this.SelectedUsers([]);
            $('#add-member-modal').modal({
                backdrop: 'static'
            });
        };
        GroupsAsideManager.prototype.OnShowMoreMember = function () {
            var _self = this;
            this.GetGroupMembers(function (result) {
                if (result.success) {
                    _self.returnedMemberCount += result.data.length;
                    result.data.map(function (e, i) { return new Yugglr.ViewableModel(e); }).forEach(function (value, index, array) {
                        _self.Members.push(value);
                    });
                }
            }, _self.returnedMemberCount, _self.returnMembersCount);
        };
        GroupsAsideManager.prototype.OnAddMemberByEmail = function () {
            this.SelectedUsersByEmail([]);
            $('#add-member-byemail-modall').modal({
                backdrop: 'static'
            });
        };
        GroupsAsideManager.prototype.OnAddEvent = function () {
            this.NewEvent(new Yugglr.EventDate(moment(new Date()), moment(new Date()), "", false, "New event", "", ""));
            //select the user's timezone
            var select = $('#add-event-modal [name*="TimeZoneID"]');
            var zoneName = "W. Europe Standard Time";
            var zoneName1 = moment(new Date()).format("Z");
            var selVal = $('#add-event-modal [name*="TimeZoneID"] option').filter(function () { return $(this).val().indexOf(zoneName) >= 0; });
            if (selVal.val()) {
                select.val(selVal.val());
            }
            else {
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
        };
        GroupsAsideManager.prototype.OnEditEvent = function (eventId) {
            var _this = this;
            Yugglr.Events.EventsRepository.GetEventDetail(function (result) {
                if (result.success) {
                    var event = result.data;
                    var start = moment(event.Start);
                    var end = moment(event.End);
                    var e = new Yugglr.EventDate(start, end, event.Id, event.IsAllDay, event.Title, event.Description, event.TimeZoneID);
                    e.Location = new Yugglr.LocationBindingModel(event.Location);
                    _this.NewEvent(e);
                    var wind = $('#add-event-modal');
                    wind.find('#add-event-modal-label-title').show();
                    wind.find('#add-event-modal-label-delete').hide();
                    wind.find('.btn_post').show();
                    wind.find('.btn_delete').show();
                    var wind = $('#add-event-modal');
                    _this.LoadEventInfo(e, '#add-event-modal', wind);
                    $('#add-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        };
        GroupsAsideManager.prototype.OnViewEvent = function (eventId) {
            var _this = this;
            Yugglr.Events.EventsRepository.GetEventDetail(function (result) {
                if (result.success) {
                    var event = result.data;
                    var start = moment(event.Start);
                    var end = moment(event.End);
                    var e = new Yugglr.EventDate(start, end, event.Id, event.IsAllDay, event.Title, event.Description, event.TimeZoneID);
                    e.Location = new Yugglr.LocationBindingModel(event.Location);
                    //this.NewEvent(e);
                    var wind = $('#view-event-modal');
                    _this.LoadEventInfo(e, '#view-event-modal', wind);
                    $('#view-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        };
        GroupsAsideManager.prototype.LoadEventInfo = function (e, windId, wind) {
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
        };
        GroupsAsideManager.prototype.InviteMembers = function (callback, userIds) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/invite';
            Yugglr.Ajax.Post(callback, url, { userIds: userIds });
        };
        GroupsAsideManager.prototype.InviteMembersByEmail = function (callback, users) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/invitebyemail';
            Yugglr.Ajax.Post(callback, url, users);
        };
        GroupsAsideManager.prototype.AddAdmin = function (callback, userId) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/addadmin/' + userId;
            Yugglr.Ajax.Post(callback, url);
        };
        GroupsAsideManager.prototype.RemoveAdmin = function (callback, userId) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/removeadmin/' + userId;
            Yugglr.Ajax.Post(callback, url);
        };
        GroupsAsideManager.prototype.Leave = function (callback, userId) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/leave/' + userId;
            Yugglr.Ajax.Post(callback, url);
        };
        GroupsAsideManager.prototype.GetGroupMembers = function (callback, skip, maxItems) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/members';
            if (skip) {
                url += '/' + skip;
            }
            else {
                url += '/' + 0;
            }
            if (maxItems) {
                url += '/' + maxItems;
            }
            Yugglr.Ajax.Get(callback, url);
        };
        GroupsAsideManager.prototype.GetRecentPhotos = function (callback, maxItems) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/photos/recent';
            if (maxItems) {
                url += '/' + maxItems;
            }
            Yugglr.Ajax.Get(callback, url);
        };
        GroupsAsideManager.prototype.GetRecentDocuments = function (callback, maxItems) {
            var url = '/api/social/' + this._groupType + '/' + this._groupId + '/documents/recent';
            if (maxItems) {
                url += '/' + maxItems;
            }
            Yugglr.Ajax.Get(callback, url);
        };
        return GroupsAsideManager;
    })();
    var _asideManager;
    var GroupAside;
    (function (GroupAside) {
        function Init(groupId, profileUrlId, groupType, isAdmin, feedItems) {
            if (feedItems === void 0) { feedItems = null; }
            _asideManager = new GroupsAsideManager(groupId, groupType, isAdmin);
            _asideManager.Init();
            var _eventWidget = Yugglr.EventWidget.Init(groupId, profileUrlId, groupType, isAdmin, _asideManager.RecentEvents, _asideManager.NewEvent, feedItems);
        }
        GroupAside.Init = Init;
    })(GroupAside = Yugglr.GroupAside || (Yugglr.GroupAside = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=GroupAside.js.map