module Yugglr.Events {
	export class EventsRepository {
		public static Create(callback: Ajax.AjaxCallback, ownerType: string, ownerId: string, form: any) {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + ownerType + '/' + ownerId;
			Ajax.PostForm(callback, url, form);
		}

        public static Update(callback: Ajax.AjaxCallback, eventId: string, form: any) {
            var url = 'nfsale2.azurewebsites.net/api/social/event/update/' + eventId;
            Ajax.PostForm(callback, url, form);
        }

		public static Delete(callback: Ajax.AjaxCallback, eventId: string) {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId;
			Ajax.Delete(callback, url);
		}

		public static RSVP(callback: Ajax.AjaxCallback, eventId: string, value: string) {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/rsvp/' + value;
			Ajax.Post(callback, url, null);
		}

		public static GetLikes(callback: Ajax.AjaxCallback, eventId: string, lastLikeId: string, take?: number): void {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/likes/' + lastLikeId;
			if (take) {
				url += '/' + take;
			}

			Ajax.Get(callback, url);
		}

		public static Like(callback: Ajax.AjaxCallback, eventId: string): void {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/like';
			Ajax.Post(callback, url, null);
		}

		public static Comment(callback: Ajax.AjaxCallback, eventId: string, comment: string): void {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/comment';
			Ajax.Post(callback, url, {
				Comment: comment
			});
		}

		public static DeleteComment(callback: Ajax.AjaxCallback, eventId: string, commentId: string): void {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/comment/' + commentId;
			Ajax.Delete(callback, url);
		}

		public static GetComments(callback: Ajax.AjaxCallback, eventId: string, lastCommentId: string, take?: number): void {
			var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/comments/' + lastCommentId;
			if (take) {
				url += '/' + take;
			}
			Ajax.Get(callback, url);
		}

        public static GetEventDetail(callback: Ajax.AjaxCallback, eventId: string): void {
            var url = 'nfsale2.azurewebsites.net/api/social/event/detail/' + eventId;
            Ajax.Get(callback, url);
        }

		public static GetEventOverviews(callback: Ajax.AjaxCallback, ownerType: string, ownerId: string, start: string, end: string): void {
			var url = 'nfsale2.azurewebsites.net/api/social/event/overview/' + ownerType + '/' + ownerId + '?start=' + encodeURIComponent(start) + '&end=' + encodeURIComponent(end);
			Ajax.Get(callback, url);
		}

		public static GetUpcomingEventOverviews(callback: Ajax.AjaxCallback, ownerType: string, ownerId: string, maxEvents?: number): void {
			var url = 'nfsale2.azurewebsites.net/api/social/event/upcoming/overview/' + ownerType + '/' + ownerId + '?maxEvents=' + encodeURIComponent((maxEvents || 3).toString());
			Ajax.Get(callback, url);
		}
	}
} 