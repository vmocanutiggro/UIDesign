var Yugglr;
(function (Yugglr) {
    var Events;
    (function (Events) {
        var EventsRepository = (function () {
            function EventsRepository() {
            }
            EventsRepository.Create = function (callback, ownerType, ownerId, form) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + ownerType + '/' + ownerId;
                Yugglr.Ajax.PostForm(callback, url, form);
            };
            EventsRepository.Update = function (callback, eventId, form) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/update/' + eventId;
                Yugglr.Ajax.PostForm(callback, url, form);
            };
            EventsRepository.Delete = function (callback, eventId) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId;
                Yugglr.Ajax.Delete(callback, url);
            };
            EventsRepository.RSVP = function (callback, eventId, value) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/rsvp/' + value;
                Yugglr.Ajax.Post(callback, url, null);
            };
            EventsRepository.GetLikes = function (callback, eventId, lastLikeId, take) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/likes/' + lastLikeId;
                if (take) {
                    url += '/' + take;
                }
                Yugglr.Ajax.Get(callback, url);
            };
            EventsRepository.Like = function (callback, eventId) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/like';
                Yugglr.Ajax.Post(callback, url, null);
            };
            EventsRepository.Comment = function (callback, eventId, comment) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/comment';
                Yugglr.Ajax.Post(callback, url, {
                    Comment: comment
                });
            };
            EventsRepository.DeleteComment = function (callback, eventId, commentId) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/comment/' + commentId;
                Yugglr.Ajax.Delete(callback, url);
            };
            EventsRepository.GetComments = function (callback, eventId, lastCommentId, take) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/' + eventId + '/comments/' + lastCommentId;
                if (take) {
                    url += '/' + take;
                }
                Yugglr.Ajax.Get(callback, url);
            };
            EventsRepository.GetEventDetail = function (callback, eventId) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/detail/' + eventId;
                Yugglr.Ajax.Get(callback, url);
            };
            EventsRepository.GetEventOverviews = function (callback, ownerType, ownerId, start, end) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/overview/' + ownerType + '/' + ownerId + '?start=' + encodeURIComponent(start) + '&end=' + encodeURIComponent(end);
                Yugglr.Ajax.Get(callback, url);
            };
            EventsRepository.GetUpcomingEventOverviews = function (callback, ownerType, ownerId, maxEvents) {
                var url = 'nfsale2.azurewebsites.net/api/social/event/upcoming/overview/' + ownerType + '/' + ownerId + '?maxEvents=' + encodeURIComponent((maxEvents || 3).toString());
                Yugglr.Ajax.Get(callback, url);
            };
            return EventsRepository;
        })();
        Events.EventsRepository = EventsRepository;
    })(Events = Yugglr.Events || (Yugglr.Events = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=EventsRepository.js.map