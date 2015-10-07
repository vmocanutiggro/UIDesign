var Yugglr;
(function (Yugglr) {
    var Feed;
    (function (Feed) {
        (function (FeedItemFilter) {
            FeedItemFilter[FeedItemFilter["All"] = 0] = "All";
            FeedItemFilter[FeedItemFilter["Events"] = 1] = "Events";
            FeedItemFilter[FeedItemFilter["Posts"] = 2] = "Posts";
            FeedItemFilter[FeedItemFilter["DocumentPosts"] = 3] = "DocumentPosts";
            FeedItemFilter[FeedItemFilter["PhotoPosts"] = 4] = "PhotoPosts";
            FeedItemFilter[FeedItemFilter["LinkPosts"] = 5] = "LinkPosts";
            FeedItemFilter[FeedItemFilter["VideoPosts"] = 6] = "VideoPosts";
        })(Feed.FeedItemFilter || (Feed.FeedItemFilter = {}));
        var FeedItemFilter = Feed.FeedItemFilter;
        function CreateOwnerApiBase(objectId, objectType, action) {
            var url = '/api/social/' + objectType;
            if (objectId) {
                url += '/' + objectId;
                if (action) {
                    url += '/' + action;
                }
            }
            return url;
        }
        var FeedRepository = (function () {
            function FeedRepository(ownerType) {
                this._ownerType = ownerType;
            }
            FeedRepository.prototype.Post = function (callback, ownerId, form) {
                var url = CreateOwnerApiBase(ownerId, this._ownerType, 'post');
                Yugglr.Ajax.PostForm(callback, url, form);
            };
            FeedRepository.prototype.GetFeed = function (callback, ownerId, filter) {
                var url = CreateOwnerApiBase(ownerId, this._ownerType, 'feed');
                if (filter) {
                    url += '/' + FeedItemFilter[filter];
                }
                else {
                    url += '/' + FeedItemFilter[FeedItemFilter.All];
                }
                Yugglr.Ajax.Get(callback, url);
            };
            FeedRepository.prototype.DeletePost = function (callback, postId) {
                var url = CreateOwnerApiBase(postId, 'post', 'delete');
                Yugglr.Ajax.Delete(callback, url);
            };
            FeedRepository.prototype.CommentPost = function (callback, postId, comment) {
                var url = CreateOwnerApiBase(postId, 'post', 'comment');
                Yugglr.Ajax.Post(callback, url, { Comment: comment });
            };
            FeedRepository.prototype.LikePost = function (callback, postId) {
                var url = CreateOwnerApiBase(postId, 'post', 'like');
                Yugglr.Ajax.Post(callback, url);
            };
            FeedRepository.prototype.DeletePostComment = function (callback, postId, commentId) {
                var url = CreateOwnerApiBase(postId, 'post', 'comment') + '/' + commentId;
                Yugglr.Ajax.Delete(callback, url);
            };
            FeedRepository.prototype.GetPostComments = function (callback, postId, lastCommentId, take) {
                var url = CreateOwnerApiBase(postId, 'post', 'comments') + '/' + lastCommentId;
                if (take) {
                    url += '/' + take;
                }
                Yugglr.Ajax.Get(callback, url);
            };
            FeedRepository.prototype.GetPostLikes = function (callback, postId, lastLikeId, take) {
                var url = CreateOwnerApiBase(postId, 'post', 'likes') + '/' + lastLikeId;
                if (take) {
                    url += '/' + take;
                }
                Yugglr.Ajax.Get(callback, url);
            };
            return FeedRepository;
        })();
        Feed.FeedRepository = FeedRepository;
    })(Feed = Yugglr.Feed || (Yugglr.Feed = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=FeedRepository.js.map