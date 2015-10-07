module Yugglr.Feed {
	export enum FeedItemFilter {
		All,
		Events,
		Posts,
		DocumentPosts,
		PhotoPosts,
		LinkPosts,
		VideoPosts
	}

	function CreateOwnerApiBase(objectId: string, objectType: string, action: string) {
		var url = 'nfsale2.azurewebsites.net/api/social/' + objectType;
		if (objectId) {
			url += '/' + objectId;

			if (action) {
				url += '/' + action;
			}
		}

		return url;
	}

	export class FeedRepository {
		private _ownerType: string;

		constructor(ownerType: string) {
			this._ownerType = ownerType;
		}

		public Post(callback: Ajax.AjaxCallback, ownerId: string, form: any): void {
			var url = CreateOwnerApiBase(ownerId, this._ownerType, 'post');
			Ajax.PostForm(callback, url, form);
		}

		public GetFeed(callback: Ajax.AjaxCallback, ownerId: string, filter?: FeedItemFilter): void {
			var url = CreateOwnerApiBase(ownerId, this._ownerType, 'feed');
			if (filter) {
				url += '/' + FeedItemFilter[filter];
			} else {
				url += '/' + FeedItemFilter[FeedItemFilter.All];
			}

			Ajax.Get(callback, url);
		}

		public DeletePost(callback: Ajax.AjaxCallback, postId: string): void {
			var url = CreateOwnerApiBase(postId, 'post', 'delete');
			Ajax.Delete(callback, url);
		}

		public CommentPost(callback: Ajax.AjaxCallback, postId: string, comment: string): void {
			var url = CreateOwnerApiBase(postId, 'post', 'comment');
			Ajax.Post(callback, url, { Comment: comment });
		}

		public LikePost(callback: Ajax.AjaxCallback, postId: string): void {
			var url = CreateOwnerApiBase(postId, 'post', 'like');
			Ajax.Post(callback, url);
		}

		public DeletePostComment(callback: Ajax.AjaxCallback, postId: string, commentId: string): void {
			var url = CreateOwnerApiBase(postId, 'post', 'comment') + '/' + commentId;
			Ajax.Delete(callback, url);
		}

		public GetPostComments(callback: Ajax.AjaxCallback, postId: string, lastCommentId: string, take?: number): void {
			var url = CreateOwnerApiBase(postId, 'post', 'comments') + '/' + lastCommentId;
			if (take) {
				url += '/' + take;
			}
			Ajax.Get(callback, url);
		}

		public GetPostLikes(callback: Ajax.AjaxCallback, postId: string, lastLikeId: string, take?: number): void {
			var url = CreateOwnerApiBase(postId, 'post', 'likes') + '/' + lastLikeId;
			if (take) {
				url += '/' + take;
			}
			Ajax.Get(callback, url);
		}
	}
}
