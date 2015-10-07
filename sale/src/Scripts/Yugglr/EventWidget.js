var Yugglr;
(function (Yugglr) {
    var EventWidgetManager = (function () {
        function EventWidgetManager(ownerId, profileOwnerId, ownerType, isAdmin, recentEvents, editingEvent, feedItems) {
            this.IsAdmin = isAdmin;
            this.RecentEvents = recentEvents;
            this.EditingEvent = editingEvent;
            this.FeedItems = feedItems;
            this.Initialize();
            this._newEvent = new Yugglr.NewEvent();
            ko.applyBindings(this, $('#add-event-modal')[0]);
            var _self = this;
            $('#add-event-modal').on('click', '.btn_post', function (e) {
                e.preventDefault();
                var $this = $(this);
                var $form = $('#add-event-modal').find('form');
                if (!$form.valid()) {
                    return;
                }
                var eventId = $('#add-event-modal [name="newEvent\\.Id"]').val();
                var $btn = $(this);
                $btn.button('loading');
                if ($form.is('.event-form')) {
                    if (eventId && eventId.length > 0) {
                        Yugglr.Events.EventsRepository.Update(function (result) {
                            $btn.button('reset');
                            if (result.success) {
                                var items = result.data;
                                var wind = $('#add-event-modal');
                                var title = wind.find('[name="newEvent\\.Title"]').val();
                                var desc = wind.find('[name="newEvent\\.Description"]').val();
                                var start = moment(wind.find('[name="newEvent\\.Start"]').val());
                                var currentEvent = ko.utils.arrayFirst(_self.RecentEvents(), function (currentEvnt) { return currentEvnt.Id() == eventId; });
                                if (currentEvent) {
                                    currentEvent.Title(title);
                                    currentEvent.Start(start);
                                }
                                var currentFeedEvent = ko.utils.arrayFirst(_self.FeedItems(), function (currentItem) { return currentItem.Id() == eventId; });
                                if (currentFeedEvent) {
                                    var feedItem = Yugglr.FeedItemModel.CreateItem(items[0]);
                                    if (feedItem) {
                                        feedItem.From.CoverPhotoUrl = '/images/elements/default_group.png';
                                        _self.FeedItems.replace(currentFeedEvent, feedItem);
                                    }
                                }
                                _self.StopEditing($form);
                                $('#add-event-modal').modal('hide');
                            }
                        }, eventId, $form);
                    }
                    else {
                        Yugglr.Events.EventsRepository.Create(function (result) {
                            $btn.button('reset');
                            if (result.success) {
                                var items = result.data;
                                if (items != null && items.length > 0) {
                                    var item = items[0];
                                    var newEvent = new Yugglr.EventDateModel(moment(item.Start), moment(item.End), item.Id, item.IsAllDay, item.Title, item.Description, item.TimeZoneID);
                                    _self.RecentEvents.push(newEvent);
                                    var from = { Id: '', Name: '', Url: '', Type: '', CoverPhoto: { Id: '', Name: '' }, IsAdminMember: true, IsOwner: true };
                                    var newFeedItem = {
                                        Id: item.Id,
                                        From: from,
                                        Comments: [],
                                        NumLikes: 0,
                                        NumComments: 0,
                                        Location: item.Location,
                                        Type: "Event",
                                        CanEdit: true,
                                        TimeCreated: moment().toDate(),
                                        TimeModified: moment().toDate(),
                                        Title: item.Title,
                                        IsAllDayEvent: item.IsAllDay,
                                        Description: item.Description,
                                        TimeZoneID: item.TimeZoneID,
                                        Start: item.Start,
                                        End: item.End,
                                        RequestID: '',
                                        IsMember: true,
                                        Attendance: '',
                                        Attendees: []
                                    };
                                    var feedItem = Yugglr.FeedItemModel.CreateItem(newFeedItem);
                                    if (feedItem) {
                                        feedItem.From.CoverPhotoUrl = '/images/elements/default_group.png';
                                        _self.FeedItems.unshift(feedItem);
                                    }
                                }
                                /*for (var item in items) {
                                model.AddItem(<FeedItem>(items[item]));
                            }*/
                                _self.StopEditing($form);
                                $('#add-event-modal').modal('hide');
                            }
                        }, ownerType, ownerId, $form);
                    }
                }
            });
            $('#add-event-modal').on('click', '.btn_delete', function (e) {
                e.preventDefault();
                var $this = $(this);
                var $form = $('#add-event-modal').find('form');
                if (!$form.valid()) {
                    return;
                }
                var eventId = $('#add-event-modal [name="newEvent\\.Id"]').val();
                var $btn = $(this);
                $btn.button('deleting');
                if ($form.is('.event-form') && eventId && eventId.length > 0) {
                    $('#add-event-modal').modal('hide');
                    Yugglr.Confirm('#сonfirm-delete-event-message', function ($modal) {
                        Yugglr.Events.EventsRepository.Delete(function (result) {
                            if (result.success) {
                                _self.StopEditing($form);
                                $('#add-event-modal [name="newEv;ent\\.Id"]').val();
                                var currentEvent = ko.utils.arrayFirst(_self.RecentEvents(), function (currentEvnt) { return currentEvnt.Id() == eventId; });
                                if (currentEvent) {
                                    _self.RecentEvents.remove(currentEvent);
                                }
                                var currentFeedEvent = ko.utils.arrayFirst(_self.FeedItems(), function (currentItem) { return currentItem.Id() == eventId; });
                                if (currentFeedEvent) {
                                    _self.FeedItems.remove(currentFeedEvent);
                                }
                                $modal.modal('hide');
                            }
                            else {
                                $modal.modal('hide');
                                $('#add-event-modal').modal('show');
                            }
                        }, eventId);
                    });
                }
            });
            $('#NewEventParticipants-UserSearch').viewablesearch({
                callback: function (e, suggestion) {
                    var user = suggestion.viewable;
                    if (user) {
                        var newEvent = _self.NewEvent();
                        if (!newEvent.InvitedUsers().some(function (u, i) { return u.Id == user.Id; })) {
                            newEvent.InvitedUsers.push(user);
                        }
                    }
                    $('#NewEventParticipants-UserSearch').typeahead('val', '');
                },
                search: [Yugglr.UsersRepository.FindUser],
                typeaheadOptions: {
                    minLength: 1
                }
            });
            $('#NewEventParticipants-GroupSearch').viewablesearch({
                callback: function (e, suggestion) {
                    var group = suggestion.viewable;
                    if (group) {
                        var newEvent = _self.NewEvent();
                        if (!newEvent.InvitedGroups().some(function (g, i) { return g.Id == group.Id; })) {
                            newEvent.InvitedGroups.push(group);
                        }
                    }
                    $('#NewEventParticipants-GroupSearch').typeahead('val', '');
                },
                search: [Yugglr.GroupsRepository.Find, Yugglr.FamiliesRepository.Find],
                typeaheadOptions: {
                    minLength: 1
                }
            });
        }
        EventWidgetManager.prototype.NewEvent = function () {
            return this._newEvent;
        };
        EventWidgetManager.prototype.Initialize = function () {
            var _self = this;
            $('#add-event-modal').on('focus', '.location-box', function (e) {
                var $this = $(this);
                $this.next().show(function () {
                    Yugglr.GoogleMaps.RebuildFieldMap($($('input', $this)[1]));
                });
            });
            $('#view-event-modal').on('focus', '.location-box', function (e) {
                var $this = $(this);
                $this.next().show(function () {
                    Yugglr.GoogleMaps.RebuildFieldMap($($('input', $this)[1]));
                });
            });
            $('#NewEventIsAllDayEvent').on('click', function (e) {
                var $t = $(this);
                var isChecked = $t.is(':checked');
                $('#add-event-modal .event_date')
                    .each(function (i, picker) {
                    var $picker = $(picker);
                    var p = $picker.data('DateTimePicker');
                    p.destroy();
                    $picker.datetimepicker({ pickTime: !isChecked, language: Yugglr.Language(), useSeconds: false });
                    if ($picker.val()) {
                        var p = $picker.data('DateTimePicker');
                        var date = p.getDate();
                        p.setDate(date);
                    }
                })
                    .each(function (i, picker) {
                    var $picker = $(picker);
                    if ($picker.val()) {
                        var p = $picker.data('DateTimePicker');
                        var date = p.getDate();
                        if ($picker.is('[name="newEvent.Start"]')) {
                            var $other = $('#add-event-modal .event_date[name="newEvent.End"]');
                            $other.data('DateTimePicker').setMinDate(date);
                        }
                        else {
                            var $other = $('#add-event-modal .event_date[name="newEvent.Start"]');
                            $other.data('DateTimePicker').setMaxDate(date);
                        }
                    }
                });
            });
            $('#add-event-modal .event_date')
                .datetimepicker()
                .on('dp.change', function (e) {
                var $this = $(this);
                if ($this.is('[name="newEvent.Start"]')) {
                    var $other = $('#add-event-modal .event_date[name="newEvent.End"]');
                    $other.data('DateTimePicker').setMinDate(e.date);
                }
                else {
                    var $other = $('#add-event-modal .event_date[name="newEvent.Start"]');
                    $other.data('DateTimePicker').setMaxDate(e.date);
                }
            });
            //Yugglr.GoogleMaps.CreateGeocoderField('#add-event-modal #newevent_location', '#add-event-modal #new_event_map');
            //Yugglr.GoogleMaps.CreateGeocoderField('#view-event-modal #newevent_location', '#view-event-modal #new_event_map');
        };
        EventWidgetManager.prototype.ShowControls = function () {
            /*$('.share_box_controls_holder').show();
            $('.share_box_tabs_holder > .tab-pane.active').removeClass('active');*/
        };
        EventWidgetManager.prototype.StopEditing = function (form) {
            var _self = this;
            window.setTimeout(function () {
                $('a[data-dismiss=fileinput]', $('.fileinput', form)).click();
                $('textarea, input[type=text], input[type=url], select', form).val('').delay(100).resetValidation();
                $('input[type=checkbox], input[type=radio]', form).attr('checked', false);
                $('#add-event-modal .event_date').delay(100).each(function (i, picker) {
                    var $picker = $(picker);
                    var p = $picker.data('DateTimePicker');
                    p.destroy();
                    $picker.datetimepicker({ pickTime: true, language: Yugglr.Language(), useSeconds: false });
                });
                _self._newEvent.Clear();
            }, 100);
            this.ShowControls();
        };
        return EventWidgetManager;
    })();
    Yugglr.EventWidgetManager = EventWidgetManager;
    var EventWidget;
    (function (EventWidget) {
        function Init(groupId, profileUrlId, groupType, isAdmin, recentEvents, editingEvent, feedItems) {
            if (feedItems === void 0) { feedItems = null; }
            var _eventWidget = new EventWidgetManager(groupId, profileUrlId, groupType, isAdmin, recentEvents, editingEvent, feedItems);
        }
        EventWidget.Init = Init;
    })(EventWidget = Yugglr.EventWidget || (Yugglr.EventWidget = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=EventWidget.js.map