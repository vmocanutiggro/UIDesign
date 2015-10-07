/// <reference path="Ajax.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Yugglr;
(function (Yugglr) {
    var FeedItemType = (function () {
        function FeedItemType() {
        }
        FeedItemType.Post = "Post";
        FeedItemType.Notification = "Notification";
        FeedItemType.Request = "Request";
        FeedItemType.Event = "Event";
        return FeedItemType;
    })();
    var CommentModel = (function () {
        function CommentModel(comment) {
            this.Id = comment.Id;
            this.Text = comment.Text;
            this.From = new Yugglr.ViewableModel(comment.From);
            this.TimeCreated = comment.TimeCreated;
            this.CanEdit = comment.CanEdit;
            this.TimeString = moment(this.TimeCreated).fromNow();
        }
        return CommentModel;
    })();
    Yugglr.CommentModel = CommentModel;
    var FeedModel = (function () {
        function FeedModel(items) {
            this.Items = ko.observableArray(items);
        }
        FeedModel.prototype.AddItem = function (item) {
            var feedItem = FeedItemModel.CreateItem(item);
            if (feedItem) {
                this.Items.unshift(feedItem);
            }
        };
        FeedModel.prototype.AddItemLast = function (item) {
            var feedItem = FeedItemModel.CreateItem(item);
            if (feedItem) {
                this.Items.push(feedItem);
            }
        };
        FeedModel.prototype.GetItem = function (itemId) {
            var result = this.Items().filter(function (value, index, array) {
                return value.Id() == itemId;
            });
            if (result == null || result.length <= 0) {
                return null;
            }
            else {
                return result[0];
            }
        };
        FeedModel.prototype.SelectTemplate = function (item) {
            switch (item.Type) {
                case FeedItemType.Event:
                    return 'template-post-event';
                case FeedItemType.Post:
                    return 'template-post-post';
            }
        };
        return FeedModel;
    })();
    Yugglr.FeedModel = FeedModel;
    var FeedItemModel = (function () {
        function FeedItemModel(item) {
            this.From = new Yugglr.ViewableModel(item.From);
            this.Comments = ko.observableArray(item.Comments.map(function (comment, i) { return new CommentModel(comment); }));
            this.Likes = ko.observableArray([]);
            this.NumLikes = ko.observable(item.NumLikes);
            this.NumComments = ko.observable(item.NumComments);
            this.Type = item.Type;
            this.CanEdit = item.CanEdit;
            this.TimeCreated = item.TimeCreated;
            this.TimeModified = item.TimeModified;
            this.TimeString = (item.TimeCreated || new Date()).toString();
            if (item.Location) {
                var l = item.Location;
                this.MapUrl = Yugglr.GoogleMaps.BuildStaticMap(null, {
                    lat: l.Latitude,
                    long: l.Longitude,
                    location: l.Address,
                    markerColor: 'green'
                });
                this.MapAddress = item.Location.Address;
            }
            else {
                this.MapUrl = null;
            }
        }
        FeedItemModel.prototype.CreatedWhen = function () {
            var m = moment(this.TimeCreated);
            return m.fromNow();
        };
        FeedItemModel.prototype.AddComment = function (comment) {
            this.Comments.unshift(new CommentModel(comment));
        };
        FeedItemModel.prototype.AddComments = function (comments) {
            this.Comments(this.Comments()
                .concat(comments.map(function (comment, i) { return new CommentModel(comment); })));
        };
        FeedItemModel.prototype.SetComments = function (comments) {
            this.Comments.removeAll();
            for (var comment in comments) {
                this.Comments.push(new CommentModel(comments[new comment]));
            }
        };
        FeedItemModel.prototype.RemoveComment = function (commentId) {
            this.Comments.remove(function (comment) { return comment.Id == commentId; });
        };
        FeedItemModel.prototype.Id = function () {
            throw "Not implemented";
        };
        FeedItemModel.CreateItem = function (item) {
            switch (item.Type) {
                case FeedItemType.Post:
                    return new PostItemModel(item);
                case FeedItemType.Event:
                    return new EventItemModel(item);
                default:
                    return null;
            }
        };
        return FeedItemModel;
    })();
    Yugglr.FeedItemModel = FeedItemModel;
    var EventItemModel = (function (_super) {
        __extends(EventItemModel, _super);
        function EventItemModel(item) {
            var _this = this;
            _super.call(this, item);
            this._start = moment(item.Start);
            this._end = moment(item.End);
            this.Title = ko.observable(item.Title);
            this.IsAllDayEvent = item.IsAllDayEvent;
            this.Description = ko.observable(item.Description);
            this.TimeZoneID = item.TimeZoneID;
            this.EventId = item.Id;
            this.Start = this._start.format();
            this.End = this._end.format();
            this.RequestID = item.RequestID;
            this.IsMember = item.IsMember;
            this.Attendance = ko.observable(item.Attendance || null);
            this.Attendees = ko.observableArray((item.Attendees || []).map(function (a) { return new Yugglr.ViewableModel(a); }));
            this.Url = Yugglr.Url.BuildEventUrl('profile', _manager.GetFeedOwnerEmail(), item.Id);
            this.Attendance.subscribe(function (newValue) {
                var a = null;
                Yugglr.Events.EventsRepository.RSVP(function (result) {
                    if (result.success == false) {
                    }
                }, _this.EventId, newValue);
            });
            this.NewEvent = ko.observable(null);
        }
        EventItemModel.prototype.When = function () {
            var formatString = 'L';
            if (!this.IsAllDayEvent) {
                formatString += ' LT';
            }
            if (this._start.isSame(this._end) || this._start.isAfter(this._end)) {
                return this._start.format(formatString);
            }
            else if (this._start.isSame(this._end, 'day')) {
                var value = this._start.format(formatString);
                if (!this.IsAllDayEvent) {
                    value += ' - ';
                    value += this._end.format('LT');
                }
                return value;
            }
            else {
                var value = this._start.format(formatString);
                value += ' - ';
                value += this._end.format(formatString);
                return value;
            }
        };
        EventItemModel.prototype.Where = function () {
            if (this.MapAddress != null || this.MapAddress != '') {
                return this.MapAddress;
            }
            return null;
        };
        EventItemModel.prototype.Id = function () {
            return this.EventId;
        };
        EventItemModel.prototype.HasRequest = function () {
            return this.RequestID != Yugglr.Guid.Empty;
        };
        EventItemModel.prototype.OnEditEvent = function (eventId) {
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
                    wind.find('.btn_delete').hide();
                    _this.LoadEventInfo(e, '#add-event-modal', wind);
                    $('#add-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        };
        EventItemModel.prototype.OnDeleteEvent = function (eventId) {
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
                    wind.find('#add-event-modal-label-title').hide();
                    wind.find('#add-event-modal-label-delete').show();
                    wind.find('.btn_post').hide();
                    wind.find('.btn_delete').show();
                    _this.LoadEventInfo(e, '#add-event-modal', wind);
                    $('#add-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        };
        EventItemModel.prototype.LoadEventInfo = function (e, windId, wind) {
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
            wind.find('[name="newEvent\\.Location.Address"]').val(e.Location.Address);
            wind.find('[name="newEvent\\.Location.Longitude"]').val(e.Location.Longitude.toString());
            wind.find('[name="newEvent\\.Location.Latitude"]').val(e.Location.Latitude.toString());
            var $this = wind.find('.location-box');
            $this.next().show(function () {
                wind.find('[name="newEvent\\.Location.Address"]').focus();
                //Yugglr.GoogleMaps.ShowFieldMap($($('input', $this)[1]), e.Location.Latitude, e.Location.Longitude);
                Yugglr.GoogleMaps.VioShowFieldMap(windId + ' #newevent_location', windId + ' #new_event_map', e.Location.Latitude, e.Location.Longitude);
            });
        };
        return EventItemModel;
    })(FeedItemModel);
    Yugglr.EventItemModel = EventItemModel;
    var PostItemModel = (function (_super) {
        __extends(PostItemModel, _super);
        function PostItemModel(item) {
            _super.call(this, item);
            this.PostId = item.Id;
            this.Body = item.Body;
            this.LinkUrl = item.LinkUrl;
            this.VideoUrl = item.VideoUrl;
            this.ImageUrl = Yugglr.Url.BuildImageUrl(item.Image, { Width: 499, Height: 250 });
            this.DocumentUrl = Yugglr.Url.BuildDocumentUrl(item.Document, 'attachment');
            this.DocumentName = item.Document != null ? item.Document.Name : null;
            this.FullImageUrl = Yugglr.Url.BuildImageUrl(item.Image, { Width: 1280 });
            this.AttachmentType = item.AttachmentType;
            this.Url = item.Url;
            if (item.VideoUrl) {
                this.VideoCode = Yugglr.Video.EmbedVideo(Yugglr.Video.ParseVideo(item.VideoUrl), { Width: 500, Height: 245 });
            }
            else {
                this.VideoCode = null;
            }
        }
        PostItemModel.prototype.Id = function () {
            return this.PostId;
        };
        return PostItemModel;
    })(FeedItemModel);
    var AllLikesModel = (function () {
        function AllLikesModel() {
            var _this = this;
            this.Likes = ko.observableArray([]);
            this.FeedItem = ko.observable(null);
            this.HasMore = ko.computed(function () {
                var item = _this.FeedItem();
                if (item == null) {
                    return false;
                }
                return item.NumLikes() > _this.Likes().length;
            });
        }
        AllLikesModel.prototype.SetLikes = function (likes) {
            this.Likes([].concat(likes));
        };
        AllLikesModel.prototype.AddLikes = function (likes) {
            for (var i in likes) {
                var like = likes[i];
                this.Likes.push(like);
            }
        };
        AllLikesModel.prototype.RemoveLike = function (likeId) {
            this.Likes.remove(function (item) { return item.Id == likeId; });
        };
        return AllLikesModel;
    })();
    var FeedManager = (function () {
        function FeedManager(feedOwnerEmail, ownerId, profileOwnerId, ownerType) {
            this._ownerType = ownerType;
            this._feedRepository = new Feed.FeedRepository(ownerType);
            this._feedOwnerId = ownerId;
            this._feedOwnerEmail = feedOwnerEmail;
            this._profileOwnerId = profileOwnerId;
            this._model = ko.observable(new FeedModel([]));
            ko.applyBindings(this._model, $('#activity-feed')[0]);
            var _self = this;
            var $activityFeed = $('#activity-feed');
            var repository = this.GetFeedRepository();
            this._likesManager = new LikesManager(repository, this._model(), $activityFeed);
            this._commentsManager = new CommentsManager(repository, this._model(), $activityFeed);
            $('#feed-filter').on('change', function (e) {
                var filter = Feed.FeedItemFilter[$('#feed-filter').val()];
                repository.GetFeed(function (result) {
                    if (result.success) {
                        _manager.GetModel().Items([]);
                        _manager.OnLoadItems(result.data);
                    }
                }, _self._feedOwnerId, filter);
            });
            $activityFeed.on('click', '.post_info_box.main_event > .move_to_trash', function (e) {
                e.preventDefault();
                var $event = $(this).closest('.feed-item-root');
                Yugglr.Confirm('#delete-event-message', function ($modal) {
                    Yugglr.Events.EventsRepository.Delete(function (result) {
                        if (result.success) {
                            $event.remove();
                        }
                    }, $event.data('event-id'));
                    $modal.modal('hide');
                });
            });
            $activityFeed.on('click', '.post_info_box.main_post > .move_to_trash', function (e) {
                e.preventDefault();
                var $post = $(this).closest('.feed-item-root');
                Yugglr.Confirm('#delete-post-message', function ($modal) {
                    repository.DeletePost(function (result) {
                        if (result.success) {
                            $post.remove();
                        }
                    }, $post.data('post-id'));
                    $modal.modal('hide');
                });
            });
            var filter = Feed.FeedItemFilter[$('#feed-filter').val()];
            repository.GetFeed(function (result) {
                if (result.success) {
                    _manager.OnLoadItems(result.data);
                }
            }, this._feedOwnerId, filter);
        }
        FeedManager.prototype.GetFeedOwnerEmail = function () {
            return this._feedOwnerEmail;
        };
        FeedManager.prototype.GetModel = function () {
            return this._model();
        };
        FeedManager.prototype.GetFeedRepository = function () {
            return this._feedRepository;
        };
        FeedManager.prototype.OnLoadItems = function (items) {
            for (var item in items) {
                this._model().AddItemLast(items[item]);
            }
        };
        FeedManager.prototype.OnAddEvent = function () {
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
                //wind.find('[name="newEvent\\.Location.Address"]').focus();
                Yugglr.GoogleMaps.VioShowFieldMap('#add-event-modal #newevent_location', '#add-event-modal #new_event_map', 59.329, 18.069);
            });
            $('#add-event-modal').modal({
                backdrop: 'static'
            });
        };
        return FeedManager;
    })();
    Yugglr.FeedManager = FeedManager;
    var LikesManager = (function () {
        function LikesManager(repository, model, activityFeed) {
            this._allLikesModel = ko.observable(new AllLikesModel());
            ko.applyBindings(this._allLikesModel, $('#all-likes-modal')[0]);
            var _self = this;
            //	Setup click event for see all likes
            activityFeed.on('click', '[data-provides=see-all-likes]', function (e) {
                e.preventDefault();
                var $this = $(this);
                var feedItemId = null;
                var $feedItem = $this.closest('.feed-item-root');
                var type = null;
                if ($feedItem.is('[data-post-id]')) {
                    feedItemId = $feedItem.data('post-id');
                    type = 'post';
                }
                else if ($feedItem.is('[data-event-id]')) {
                    feedItemId = $feedItem.data('event-id');
                    type = 'event';
                }
                else {
                    //	Invalid feed item
                    return;
                }
                var feedItem = model.GetItem(feedItemId);
                var likes = feedItem.Likes();
                var likeId = Yugglr.Guid.Empty;
                if (likes.length > 0) {
                    likeId = likes[likes.length - 1].Id;
                }
                var likesModel = _self._allLikesModel();
                likesModel.FeedItem(feedItem);
                likesModel.SetLikes(likes);
                if (type == 'post') {
                    repository.GetPostLikes(function (result) {
                        if (result.success) {
                            likesModel.AddLikes(result.data.map(function (like, i) { return new Yugglr.ViewableModel(like); }));
                        }
                    }, feedItemId, likeId, 3);
                }
                else if (type == 'event') {
                    Yugglr.Events.EventsRepository.GetLikes(function (result) {
                        if (result.success) {
                            likesModel.AddLikes(result.data.map(function (like, i) { return new Yugglr.ViewableModel(like); }));
                        }
                    }, feedItemId, likeId, 3);
                }
                $('#all-likes-modal').modal('show');
            });
            //	Setup click event for showing more likes in a likes modal.
            $('#all-likes-modal').on('click', '#more-likes-btn', function (e) {
                e.preventDefault();
                var likesModel = _self._allLikesModel();
                var likes = likesModel.Likes();
                var likeId = Yugglr.Guid.Empty;
                if (likes.length > 0) {
                    likeId = likes[likes.length - 1].Id;
                }
                var feedItemId = likesModel.FeedItem().Id();
                var type = likesModel.FeedItem().Type;
                if (type == FeedItemType.Event) {
                    Yugglr.Events.EventsRepository.GetLikes(function (result) {
                        if (result.success) {
                            likesModel.AddLikes(result.data);
                        }
                    }, feedItemId, likeId, 3);
                }
                else if (type == FeedItemType.Post) {
                    repository.GetPostLikes(function (result) {
                        if (result.success) {
                            likesModel.AddLikes(result.data);
                        }
                    }, feedItemId, likeId, 3);
                }
            });
            //	Setup click event for liking a post
            activityFeed.on('click', '.action_box_like a', function (e) {
                e.preventDefault();
                var $this = $(this);
                var feedItemId = null;
                var $feedItem = $this.closest('.feed-item-root');
                var type = null;
                if ($feedItem.is('[data-post-id]')) {
                    feedItemId = $feedItem.data('post-id');
                    type = 'post';
                }
                else if ($feedItem.is('[data-event-id]')) {
                    feedItemId = $feedItem.data('event-id');
                    type = 'event';
                }
                else {
                    //	Invalid feed item
                    return;
                }
                if (type == 'post') {
                    repository.LikePost(function (result) {
                        if (result.success) {
                            var likes = result.data;
                            var evt = model.GetItem(feedItemId);
                            evt.NumLikes(likes.TotalLikes);
                        }
                    }, feedItemId);
                }
                else if (type == 'event') {
                    Yugglr.Events.EventsRepository.Like(function (result) {
                        if (result.success) {
                            var likes = result.data;
                            var evt = model.GetItem(feedItemId);
                            evt.NumLikes(likes.TotalLikes);
                        }
                    }, feedItemId);
                }
            });
        }
        return LikesManager;
    })();
    var CommentsManager = (function () {
        function CommentsManager(repository, model, activityFeed) {
            this._feedRepository = repository;
            this._model = model;
            var _self = this;
            activityFeed.on('focus', '.reply_holder textarea', function () {
                var currentTextarea = $(this);
                var currentButton = currentTextarea.closest('.reply_holder').find('.btn_holder');
                currentButton.animate({ 'width': '50px', 'marginLeft': '10px' }, 200, function () {
                    currentTextarea.focusout(function () {
                        if (currentTextarea.val() == '') {
                            currentButton.animate({ 'width': '0', 'marginLeft': '0' }, 200);
                        }
                        else {
                            return false;
                        }
                    });
                });
            });
            activityFeed.on('click', '.reply_holder button', function (e) {
                e.preventDefault();
                if (!$(this).closest('form').valid()) {
                    return;
                }
                var $this = $(this);
                var $holder = $this.closest('.reply_holder');
                var $feedItem = $this.closest('.feed-item-root');
                var $text = $('textarea', $holder);
                var type = null;
                var feedItemId = null;
                if ($feedItem.is('[data-post-id]')) {
                    type = 'post';
                }
                else if ($feedItem.is('[data-event-id]')) {
                    type = 'event';
                }
                else {
                    return;
                }
                feedItemId = $feedItem.data(type + '-id');
                var comment = $holder.find('textarea:first').val();
                $this
                    .closest('.post_content_holder')
                    .find('.comments')
                    .slideDown();
                switch (type) {
                    case 'event':
                        Yugglr.Events.EventsRepository.Comment(function (result) {
                            if (result.success) {
                                var comments = result.data;
                                var feedItem = model.GetItem(feedItemId);
                                feedItem.AddComment(comments.Comment);
                                feedItem.NumComments(comments.TotalComments);
                                $text.val('');
                            }
                        }, feedItemId, comment);
                        break;
                    case 'post':
                        repository.CommentPost(function (result) {
                            if (result.success) {
                                var comments = result.data;
                                var feedItem = model.GetItem(feedItemId);
                                feedItem.AddComment(comments.Comment);
                                feedItem.NumComments(comments.TotalComments);
                                $text.val('');
                            }
                        }, feedItemId, comment);
                        break;
                }
            });
            activityFeed.on('click', '.comments a.move_to_trash', function (e) {
                e.preventDefault();
                var $this = $(this);
                Yugglr.Confirm('#delete-comment-message', function ($modal) {
                    _self.PerformDeleteComment($this);
                    $modal.modal('hide');
                });
            });
            activityFeed.on('click', '.action_box_comment a', function (e) {
                e.preventDefault();
                var $this = $(this);
                $this
                    .closest('.post_content_holder')
                    .find('.comments')
                    .slideToggle();
            });
            activityFeed.on('click', '[data-provides=see-all-comments]', function (e) {
                e.preventDefault();
                var $this = $(this);
                var $feedItem = $this.closest('.feed-item-root');
                var type = null;
                var feedItemId = null;
                if ($feedItem.is('[data-post-id]')) {
                    type = 'post';
                }
                else if ($feedItem.is('[data-event-id]')) {
                    type = 'event';
                }
                else {
                    return;
                }
                feedItemId = $feedItem.data(type + '-id');
                $this
                    .closest('.post_content_holder')
                    .find('.comments')
                    .slideDown();
                var feedItem = (model.GetItem(feedItemId));
                var comments = feedItem.Comments();
                var commentId = Yugglr.Guid.Empty;
                if (comments.length > 0) {
                    commentId = comments[comments.length - 1].Id;
                }
                switch (type) {
                    case 'event':
                        Yugglr.Events.EventsRepository.GetComments(function (result) {
                            if (result.success) {
                                feedItem.AddComments(result.data);
                            }
                        }, feedItemId, commentId, -1);
                        break;
                    case 'post':
                        repository.GetPostComments(function (result) {
                            if (result.success) {
                                feedItem.AddComments(result.data);
                            }
                        }, feedItemId, commentId, -1);
                        break;
                }
            });
        }
        CommentsManager.prototype.PerformDeleteComment = function ($element) {
            var $comment = $element.closest('.media_holder_post.inner_post');
            var commentId = $comment.data('comment-id');
            var $feedItem = $comment.closest('.feed-item-root');
            var type = null;
            var feedItemId = null;
            if ($feedItem.is('[data-post-id]')) {
                type = 'post';
            }
            else if ($feedItem.is('[data-event-id]')) {
                type = 'event';
            }
            else {
                return;
            }
            feedItemId = $feedItem.data(type + '-id');
            var _self = this;
            switch (type) {
                case 'event':
                    Yugglr.Events.EventsRepository.DeleteComment(function (result) {
                        if (result.success) {
                            var deleteResult = result.data;
                            var feedItem = _self._model.GetItem(feedItemId);
                            _self.OnCommentDeleted(deleteResult, feedItem, commentId);
                        }
                    }, feedItemId, commentId);
                    break;
                case 'post':
                    var repository = this._feedRepository;
                    repository.DeletePostComment(function (result) {
                        if (result.success) {
                            var deleteResult = result.data;
                            var feedItem = _self._model.GetItem(feedItemId);
                            _self.OnCommentDeleted(deleteResult, feedItem, commentId);
                        }
                    }, feedItemId, commentId);
                    break;
            }
        };
        CommentsManager.prototype.OnCommentDeleted = function (deleteResult, feedItem, commentId) {
            feedItem.RemoveComment(commentId);
            feedItem.NumComments(deleteResult.TotalComments);
        };
        return CommentsManager;
    })();
    var _manager;
    var _shareBox;
    var _errorMessages;
    var Feed;
    (function (Feed) {
        function Init(feedOwnerEmail, feedOwnerId, profileOwnerId, ownerType, errorMessages) {
            _errorMessages = errorMessages;
            _manager = new FeedManager(feedOwnerEmail, feedOwnerId, profileOwnerId, ownerType);
            _shareBox = new Yugglr.ShareBox(feedOwnerId, profileOwnerId, ownerType, _manager, _errorMessages);
            return _manager;
        }
        Feed.Init = Init;
    })(Feed = Yugglr.Feed || (Yugglr.Feed = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Feed.js.map