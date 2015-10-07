var Yugglr;
(function (Yugglr) {
    var Messages;
    (function (Messages) {
        var MessageRepository = (function () {
            function MessageRepository() {
            }
            MessageRepository.DeleteMessage = function (callback, requestId, param) {
                MessageRepository.MessageAction(callback, requestId, 'delete');
            };
            MessageRepository.MessageAction = function (callback, messageId, action, param) {
                var url = '/api/social/user/message/' + messageId + '/' + action;
                if (param) {
                    url += '/' + param;
                }
                Yugglr.Ajax.Delete(callback, url);
            };
            MessageRepository.GetMessages = function (callback, userId) {
                var url = '/api/social/user/' + userId + '/messages';
                Yugglr.Ajax.Get(callback, url);
            };
            return MessageRepository;
        })();
        Messages.MessageRepository = MessageRepository;
        var MessagesManager = (function () {
            function MessagesManager(userId) {
                var _this = this;
                this._userId = userId;
                this.Messages = ko.observableArray([]);
                ko.applyBindings(this, $('#messages')[0]);
                this.GetMessages(function (result) {
                    _this.Messages(result.data.map(function (r, i) { return new MessageModel(r); }));
                });
            }
            MessagesManager.prototype.DeleteMessage = function (message) {
                var _this = this;
                MessageRepository.DeleteMessage(function (result) {
                    if (result.success) {
                        _this.Messages.remove(function (item) { return item.Id == message.Id; });
                    }
                }, message.Id, 'yes');
            };
            MessagesManager.prototype.GetMessages = function (callback) {
                MessageRepository.GetMessages(callback, this._userId);
            };
            return MessagesManager;
        })();
        var MessageModel = (function () {
            function MessageModel(message) {
                var _self = this;
                this.Id = message.Id;
                this.From = new Yugglr.ViewableModel(message.From);
                this.Heading = ko.observable(message.Heading);
                this.Body = ko.observable(message.Body);
                this.Created = ko.observable(message.Created);
                this.Read = ko.observable(message.Read);
                this.AttachUrl = ko.observable(message.AttachUrl);
                this.From = message.From != null ? new Yugglr.ViewableModel(message.From) : null;
            }
            MessageModel.prototype.Delete = function () {
                _manager.DeleteMessage(this);
            };
            return MessageModel;
        })();
        var _manager;
        function Init(userId) {
            _manager = new MessagesManager(userId);
        }
        Messages.Init = Init;
    })(Messages = Yugglr.Messages || (Yugglr.Messages = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Messages.js.map