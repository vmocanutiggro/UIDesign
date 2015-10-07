/// <reference path="Ajax.ts" />

module Yugglr {
	class FeedItemType {
		public static Post: string = "Post";
		public static Notification: string = "Notification";
		public static Request: string = "Request";
		public static Event: string = "Event";
	}

	export interface IFeedErrorMessages {
		TooLargeFile: string;
		FailedToPost: string;
	}

	interface LikeResult {
		TotalLikes: number;
	}

	interface DeleteCommentResult {
		TotalComments: number;
	}

	interface CommentResult {
		Comment: Comment;
		TotalComments: number;
	}

	export interface Comment {
		Id: string;
		Text: string;
		From: Viewable;
		TimeCreated: Date;
		CanEdit: boolean;
	}

	export interface Location {
		Address: string;
		Longitude: number;
		Latitude: number;
	}

	export interface FeedItem {
		Id: string;
		From: Viewable;
		Comments: Comment[];
		NumLikes: number;
		NumComments: number;
		Location: Location;
		Type: string;
		CanEdit: boolean;
		TimeCreated: Date;
		TimeModified: Date;
	}

	export interface EventItem extends FeedItem {
		Title: string;
		IsAllDayEvent: boolean;
		Description: string;
		TimeZoneID: string;
		Start: Date;
		End: Date;
		RequestID: string;
		IsMember: boolean;
		Attendance: string;
		Attendees: Viewable[];
	}

	interface PostItem extends FeedItem {
		Image: IImage;
		Document: IDocument;
		AttachmentType: string;
		Url: string;
		VideoUrl: string;
		Body: string;
		LinkUrl: string;
	}

	export class CommentModel {
		constructor(comment: Comment) {
			this.Id = comment.Id;
			this.Text = comment.Text;
			this.From = new ViewableModel(comment.From);
			this.TimeCreated = comment.TimeCreated;
			this.CanEdit = comment.CanEdit;
			this.TimeString = moment(this.TimeCreated).fromNow();
		}

		Id: string;
		Text: string;
		From: ViewableModel;
		TimeCreated: Date;
		TimeString: string;
		CanEdit: boolean;
	}

	export class FeedModel {

		constructor(items: FeedItemModel[]) {
			this.Items = ko.observableArray(items);
		}

		public Items: KnockoutObservableArray<FeedItemModel>;

		public AddItem(item: FeedItem) {
			var feedItem = FeedItemModel.CreateItem(item);
			if (feedItem) {
				this.Items.unshift(feedItem);
			}
		}

		public AddItemLast(item: FeedItem) {
			var feedItem = FeedItemModel.CreateItem(item);
			if (feedItem) {
				this.Items.push(feedItem);
			}
		}

		public GetItem(itemId: string): FeedItemModel {
			var result = this.Items().filter((value, index, array) => {
				return value.Id() == itemId;
			});

			if (result == null || result.length <= 0) {
				return null;
			} else {
				return result[0];
			}
		}

		public SelectTemplate(item: FeedItemModel): string {
			switch (item.Type) {
				case FeedItemType.Event:
					return 'template-post-event';

				case FeedItemType.Post:
					return 'template-post-post';
			}
		}
	}

	export class FeedItemModel {
		constructor(item: FeedItem) {
			this.From = new ViewableModel(item.From);
			this.Comments = ko.observableArray(item.Comments.map((comment: Comment, i: number) => new CommentModel(comment)));
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
			} else {
				this.MapUrl = null;
			}
		}

		From: ViewableModel;
		Comments: KnockoutObservableArray<CommentModel>;
		Likes: KnockoutObservableArray<ViewableModel>;
		NumLikes: KnockoutObservable<number>;
		NumComments: KnockoutObservable<number>;
		MapUrl: string;
		MapAddress: string;
		Type: string;
		CanEdit: boolean;
		TimeCreated: Date;
		TimeModified: Date;
		TimeString: string;

		public CreatedWhen(): string {
			var m = moment(this.TimeCreated);
			return m.fromNow();
		}

		public AddComment(comment: Comment): void {
			this.Comments.unshift(new CommentModel(comment));
		}

		public AddComments(comments: Comment[]): void {
			this.Comments(
				this.Comments()
					.concat(comments.map((comment: Comment, i: number) => new CommentModel(comment))));
		}

		public SetComments(comments: Comment[]): void {
			this.Comments.removeAll();
			for (var comment in comments) {
				this.Comments.push(new CommentModel(comments[new comment]));
			}
		}

		public RemoveComment(commentId: string): void {
			this.Comments.remove((comment: CommentModel) => comment.Id == commentId);
		}

		public Id(): string {
			throw "Not implemented";
		}

		public static CreateItem(item: FeedItem): FeedItemModel {
			switch (item.Type) {
				case FeedItemType.Post:
					return new PostItemModel(<PostItem>item);

				case FeedItemType.Event:
					return new EventItemModel(<EventItem>item);

				default:
					return null;
			}
		}
	}

	export class EventItemModel extends FeedItemModel {
		private _start: Moment;
		private _end: Moment;

		constructor(item: EventItem) {
			super(item);

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
			this.Attendees = ko.observableArray((item.Attendees || []).map((a) => { return new ViewableModel(a); }));
			this.Url = Url.BuildEventUrl('profile', _manager.GetFeedOwnerEmail(), item.Id);

			this.Attendance.subscribe((newValue: string) => {
				var a: Feed.FeedRepository = null;
				Events.EventsRepository.RSVP((result) => {
					if (result.success == false) {
					}
				}, this.EventId, newValue);
			});
            this.NewEvent = ko.observable(null);
		}

        Title: KnockoutObservable<string>;
		IsAllDayEvent: boolean;
        Description: KnockoutObservable<string>;
		TimeZoneID: string;
		EventId: string;
		Start: string;
		End: string;
		RequestID: string;
		IsMember: boolean;
		Attendance: KnockoutObservable<string>;
		Attendees: KnockoutObservableArray<ViewableModel>;
		Url: string;
        public NewEvent: KnockoutObservable<Yugglr.EventDate>;

		public When(): string {
			var formatString = 'L';
			if (!this.IsAllDayEvent) {
				formatString += ' LT';
			}

			if (this._start.isSame(this._end) || this._start.isAfter(this._end)) {
				return this._start.format(formatString);
			} else if (this._start.isSame(this._end, 'day')) {
				var value = this._start.format(formatString);

				if (!this.IsAllDayEvent) {
					value += ' - ';
					value += this._end.format('LT');
				}

				return value;
			} else {
				var value = this._start.format(formatString);
				value += ' - ';
				value += this._end.format(formatString)

				return value;
			}
		}

		public Where() {
			if (this.MapAddress != null || this.MapAddress != '') {
				return this.MapAddress;
			}

			return null;
		}

		public Id(): string {
			return this.EventId;
		}

		public HasRequest(): boolean {
			return this.RequestID != Guid.Empty;
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
                    wind.find('.btn_delete').hide();

                    this.LoadEventInfo(e, '#add-event-modal', wind);

                    $('#add-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        }

        public OnDeleteEvent(eventId: string) {
            Events.EventsRepository.GetEventDetail((result) => {
                if (result.success) {
                    var event = <IEventOverview>result.data;

                    var start = moment(event.Start);
                    var end = moment(event.End);
                    var e = new EventDate(start, end, event.Id, event.IsAllDay, event.Title, event.Description, event.TimeZoneID);
                    e.Location = new LocationBindingModel(event.Location);
                    this.NewEvent(e);


                    var wind = $('#add-event-modal');

                    wind.find('#add-event-modal-label-title').hide();
                    wind.find('#add-event-modal-label-delete').show();
                    wind.find('.btn_post').hide();
                    wind.find('.btn_delete').show();
                    
                    this.LoadEventInfo(e, '#add-event-modal', wind);

                    $('#add-event-modal').modal({
                        backdrop: 'static'
                    });
                }
            }, eventId);
        }

        private LoadEventInfo(e: EventDate, windId: string, wind: JQuery): void {


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
        }
	}

	class PostItemModel extends FeedItemModel {
		constructor(item: PostItem) {
			super(item);

			this.PostId = item.Id;
			this.Body = item.Body;
			this.LinkUrl = item.LinkUrl;
			this.VideoUrl = item.VideoUrl;
			this.ImageUrl = Url.BuildImageUrl(item.Image, { Width: 499, Height: 250 });
			this.DocumentUrl = Url.BuildDocumentUrl(item.Document, 'attachment');
			this.DocumentName = item.Document != null ? item.Document.Name : null;
			this.FullImageUrl = Url.BuildImageUrl(item.Image, { Width: 1280 });
			this.AttachmentType = item.AttachmentType;
			this.Url = item.Url;
			if (item.VideoUrl) {
				this.VideoCode = Yugglr.Video.EmbedVideo(Yugglr.Video.ParseVideo(item.VideoUrl), { Width: 500, Height: 245 });
			} else {
				this.VideoCode = null;
			}
		}

		PostId: string;
		Body: string;
		LinkUrl: string;
		VideoUrl: string;
		ImageUrl: string;
		DocumentUrl: string;
		DocumentName: string;
		FullImageUrl: string;
		AttachmentType: string;
		Url: string;
		VideoCode: string;

		public Id(): string {
			return this.PostId;
		}
	}

	class AllLikesModel {
		constructor() {
			this.Likes = ko.observableArray([]);
			this.FeedItem = ko.observable(null);
			this.HasMore = ko.computed(() => {
				var item = this.FeedItem();
				if (item == null) {
					return false;
				}

				return item.NumLikes() > this.Likes().length;
			});
		}

		public SetLikes(likes: ViewableModel[]): void {
			this.Likes([].concat(likes));
		}

		public AddLikes(likes: ViewableModel[]): void {
			for (var i in likes) {
				var like = likes[i];
				this.Likes.push(like);
			}
		}

		public RemoveLike(likeId: string): void {
			this.Likes.remove((item) => item.Id == likeId);
		}

		public FeedItem: KnockoutObservable<FeedItemModel>;
		HasMore: KnockoutComputed<boolean>;
		Likes: KnockoutObservableArray<ViewableModel>;
	}

	export class FeedManager {
		private _feedOwnerId: string;
		private _profileOwnerId: string;
		private _model: KnockoutObservable<FeedModel>;
		private _feedRepository: Feed.FeedRepository;
		private _ownerType: string;
		private _feedOwnerEmail: string;
		private _likesManager: LikesManager;
		private _commentsManager: CommentsManager;

		public GetFeedOwnerEmail(): string {
			return this._feedOwnerEmail;
		}

		public GetModel(): FeedModel {
			return this._model();
		}

		public GetFeedRepository(): Feed.FeedRepository {
			return this._feedRepository;
		}

		constructor(feedOwnerEmail: string, ownerId: string, profileOwnerId: string, ownerType: string) {
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
				var filter: Feed.FeedItemFilter = Feed.FeedItemFilter[<string>$('#feed-filter').val()];
				repository.GetFeed((result) => {
					if (result.success) {
						_manager.GetModel().Items([]);
						_manager.OnLoadItems(<FeedItem[]>result.data);
					}
				}, _self._feedOwnerId, filter);
			});

			$activityFeed.on('click', '.post_info_box.main_event > .move_to_trash', function (e) {
				e.preventDefault();

				var $event = $(this).closest('.feed-item-root');
				Yugglr.Confirm('#delete-event-message',($modal) => {
					Events.EventsRepository.Delete((result) => {
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
				Yugglr.Confirm('#delete-post-message',($modal) => {
					repository.DeletePost((result) => {
						if (result.success) {
							$post.remove();
						}
					}, $post.data('post-id'));

					$modal.modal('hide');
				});
			});

			var filter: Feed.FeedItemFilter = Feed.FeedItemFilter[<string>$('#feed-filter').val()];
			repository.GetFeed((result) => {
				if (result.success) {
					_manager.OnLoadItems(<FeedItem[]>result.data);
				}
			}, this._feedOwnerId, filter);
		}

		public OnLoadItems(items: FeedItem[]) {
			for (var item in items) {
				this._model().AddItemLast(items[item]);
			}
		}
	public OnAddEvent(): void {
            //select the user's timezone
            var select = $('#add-event-modal [name*="TimeZoneID"]');
            var zoneName = "W. Europe Standard Time";
            var zoneName1 = moment(new Date()).format("Z");
            var selVal = $('#add-event-modal [name*="TimeZoneID"] option').filter(function() { return $(this).val().indexOf(zoneName) >= 0; });
            if (selVal.val()) {
                select.val(selVal.val());
            } else {
                var selVal1 = $('#add-event-modal [name*="TimeZoneID"] option').filter(function() {
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
            $this.next().show(function() {
                //wind.find('[name="newEvent\\.Location.Address"]').focus();
                Yugglr.GoogleMaps.VioShowFieldMap('#add-event-modal #newevent_location', '#add-event-modal #new_event_map', 59.329, 18.069);
            });
            $('#add-event-modal').modal({
                backdrop: 'static'
            });
        }
	}

	class LikesManager {
		private _allLikesModel: KnockoutObservable<AllLikesModel>;

		constructor(repository: Feed.FeedRepository, model: FeedModel, activityFeed: JQuery) {
			this._allLikesModel = ko.observable(new AllLikesModel());

			ko.applyBindings(this._allLikesModel, $('#all-likes-modal')[0]);

			var _self = this;

			//	Setup click event for see all likes
			activityFeed.on('click', '[data-provides=see-all-likes]', function (e) {
				e.preventDefault();

				var $this = $(this);

				var feedItemId: string = null;

				var $feedItem = $this.closest('.feed-item-root');

				var type = null;
				if ($feedItem.is('[data-post-id]')) {
					feedItemId = $feedItem.data('post-id');
					type = 'post';
				} else if ($feedItem.is('[data-event-id]')) {
					feedItemId = $feedItem.data('event-id');
					type = 'event';
				} else {
					//	Invalid feed item
					return;
				}

				var feedItem = model.GetItem(feedItemId);
				var likes = feedItem.Likes();
				var likeId = Guid.Empty;
				if (likes.length > 0) {
					likeId = likes[likes.length - 1].Id;
				}

				var likesModel = _self._allLikesModel();
				likesModel.FeedItem(feedItem);
				likesModel.SetLikes(likes);

				if (type == 'post') {
					repository.GetPostLikes((result) => {
						if (result.success) {
							likesModel.AddLikes((<Viewable[]>result.data).map((like, i) => new ViewableModel(like)));
						}
					}, feedItemId, likeId, 3);
				} else if (type == 'event') {
					Events.EventsRepository.GetLikes((result) => {
						if (result.success) {
							likesModel.AddLikes((<Viewable[]>result.data).map((like, i) => new ViewableModel(like)));
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
				var likeId = Guid.Empty;
				if (likes.length > 0) {
					likeId = likes[likes.length - 1].Id;
				}

				var feedItemId = likesModel.FeedItem().Id();
				var type = likesModel.FeedItem().Type;
				if (type == FeedItemType.Event) {
					Events.EventsRepository.GetLikes((result) => {
						if (result.success) {
							likesModel.AddLikes(result.data);
						}
					}, feedItemId, likeId, 3);
				} else if (type == FeedItemType.Post) {
					repository.GetPostLikes((result) => {
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

				var feedItemId: string = null;

				var $feedItem = $this.closest('.feed-item-root');

				var type = null;
				if ($feedItem.is('[data-post-id]')) {
					feedItemId = $feedItem.data('post-id');
					type = 'post';
				} else if ($feedItem.is('[data-event-id]')) {
					feedItemId = $feedItem.data('event-id');
					type = 'event';
				} else {
					//	Invalid feed item
					return;
				}

				if (type == 'post') {
					repository.LikePost((result) => {
						if (result.success) {
							var likes = <LikeResult>result.data;
							var evt = model.GetItem(feedItemId);
							evt.NumLikes(likes.TotalLikes);
						}
					}, feedItemId);
				} else if (type == 'event') {
					Events.EventsRepository.Like((result) => {
						if (result.success) {
							var likes = <LikeResult>result.data;
							var evt = model.GetItem(feedItemId);
							evt.NumLikes(likes.TotalLikes);
						}
					}, feedItemId);
				}
			});
		}
	}

	class CommentsManager {
		private _feedRepository: Feed.FeedRepository;
		private _model: FeedModel;

		constructor(repository: Feed.FeedRepository, model: FeedModel, activityFeed: JQuery) {
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
				} else if ($feedItem.is('[data-event-id]')) {
					type = 'event';
				} else {
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
						Events.EventsRepository.Comment((result) => {
							if (result.success) {
								var comments: CommentResult = result.data;
								var feedItem = model.GetItem(feedItemId);
								feedItem.AddComment(comments.Comment);
								feedItem.NumComments(comments.TotalComments);
								$text.val('');
							}
						}, feedItemId, comment);
						break;

					case 'post':
						repository.CommentPost((result) => {
							if (result.success) {
								var comments: CommentResult = result.data;
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
				Yugglr.Confirm('#delete-comment-message',($modal) => {
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
				} else if ($feedItem.is('[data-event-id]')) {
					type = 'event';
				} else {
					return;
				}

				feedItemId = $feedItem.data(type + '-id');

				$this
					.closest('.post_content_holder')
					.find('.comments')
					.slideDown();

				var feedItem = <PostItemModel>(model.GetItem(feedItemId));
				var comments = feedItem.Comments();
				var commentId = Guid.Empty;
				if (comments.length > 0) {
					commentId = comments[comments.length - 1].Id;
				}

				switch (type) {
					case 'event':
						Events.EventsRepository.GetComments((result) => {
							if (result.success) {
								feedItem.AddComments(result.data);
							}
						}, feedItemId, commentId, -1);
						break;

					case 'post':
						repository.GetPostComments((result) => {
							if (result.success) {
								feedItem.AddComments(result.data);
							}
						}, feedItemId, commentId, -1);
						break;
				}
			});
		}

		private PerformDeleteComment($element: JQuery) {
			var $comment = $element.closest('.media_holder_post.inner_post');
			var commentId = $comment.data('comment-id');

			var $feedItem = $comment.closest('.feed-item-root');

			var type = null;
			var feedItemId = null;
			if ($feedItem.is('[data-post-id]')) {
				type = 'post';
			} else if ($feedItem.is('[data-event-id]')) {
				type = 'event';
			} else {
				return;
			}

			feedItemId = $feedItem.data(type + '-id');

			var _self = this;
			switch (type) {
				case 'event':
					Events.EventsRepository.DeleteComment((result) => {
						if (result.success) {
							var deleteResult: DeleteCommentResult = result.data;
							var feedItem = _self._model.GetItem(feedItemId);
							_self.OnCommentDeleted(deleteResult, feedItem, commentId);
						}
					}, feedItemId, commentId);
					break;

				case 'post':
					var repository = this._feedRepository;
					repository.DeletePostComment((result) => {
						if (result.success) {
							var deleteResult: DeleteCommentResult = result.data;
							var feedItem = _self._model.GetItem(feedItemId);
							_self.OnCommentDeleted(deleteResult, feedItem, commentId);
						}
					}, feedItemId, commentId);
					break;
			}
		}

		private OnCommentDeleted(deleteResult: DeleteCommentResult, feedItem: FeedItemModel, commentId: string): void {
			feedItem.RemoveComment(commentId);
			feedItem.NumComments(deleteResult.TotalComments);
		}
	}

	var _manager: FeedManager;
	var _shareBox: ShareBox;
	var _errorMessages: IFeedErrorMessages;

	export module Feed {
        export function Init(feedOwnerEmail: string, feedOwnerId: string, profileOwnerId: string, ownerType: string, errorMessages: IFeedErrorMessages): FeedManager {
			_errorMessages = errorMessages;
			_manager = new FeedManager(feedOwnerEmail, feedOwnerId, profileOwnerId, ownerType);
			_shareBox = new ShareBox(feedOwnerId, profileOwnerId, ownerType, _manager, _errorMessages);
		    return _manager;
		}
	}
} 