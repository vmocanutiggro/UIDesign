var Yugglr;
(function (Yugglr) {
    var Requests;
    (function (Requests) {
        var RequestRepository = (function () {
            function RequestRepository() {
            }
            RequestRepository.AcceptRequest = function (callback, requestId, param) {
                RequestRepository.RequestAction(callback, requestId, 'accept');
            };
            RequestRepository.DeclineRequest = function (callback, requestId, param) {
                RequestRepository.RequestAction(callback, requestId, 'decline');
            };
            RequestRepository.RequestAction = function (callback, requestId, action, param) {
                var url = '/api/social/user/request/' + requestId + '/' + action;
                if (param) {
                    url += '/' + param;
                }
                Yugglr.Ajax.Post(callback, url);
            };
            RequestRepository.GetRequests = function (callback, userId) {
                var url = '/api/social/user/' + userId + '/requests';
                Yugglr.Ajax.Get(callback, url);
            };
            RequestRepository.CreateRequest = function (callback, userId, newRequest) {
                var url = '/api/social/user/' + userId + '/request';
                Yugglr.Ajax.Post(callback, url, newRequest);
            };
            return RequestRepository;
        })();
        Requests.RequestRepository = RequestRepository;
        (function (RequestType) {
            RequestType[RequestType["JoinGroup"] = 1] = "JoinGroup";
            RequestType[RequestType["InviteGroup"] = 20] = "InviteGroup";
            RequestType[RequestType["InviteEvent"] = 21] = "InviteEvent";
        })(Requests.RequestType || (Requests.RequestType = {}));
        var RequestType = Requests.RequestType;
        var RequestsManager = (function () {
            function RequestsManager(userId, applicationId) {
                var _this = this;
                this._userId = userId;
                this._applicationId = applicationId;
                this.Requests = ko.observableArray([]);
                ko.applyBindings(this, $('#requests')[0]);
                this.GetRequests(function (result) {
                    _this.Requests(result.data.map(function (r, i) { return new RequestModel(r); }));
                });
            }
            RequestsManager.prototype.AcceptRequest = function (request) {
                var _this = this;
                RequestRepository.AcceptRequest(function (result) {
                    if (result.success) {
                        _this.Requests.remove(function (item) { return item.Id == request.Id; });
                    }
                }, request.Id, 'yes');
            };
            RequestsManager.prototype.DeclineRequest = function (request) {
                var _this = this;
                RequestRepository.DeclineRequest(function (result) {
                    if (result.success) {
                        _this.Requests.remove(function (item) { return item.Id == request.Id; });
                    }
                }, request.Id, 'yes');
            };
            RequestsManager.prototype.GetRequests = function (callback) {
                RequestRepository.GetRequests(callback, this._userId);
            };
            RequestsManager.CreateRequest = function (callback, userId, newRequest) {
                RequestRepository.CreateRequest(callback, userId, newRequest);
            };
            return RequestsManager;
        })();
        var RequestModel = (function () {
            function RequestModel(request) {
                var _self = this;
                this.Id = request.Id;
                this.From = new Yugglr.ViewableModel(request.From);
                this.Target = new Yugglr.ViewableModel(request.Target);
                this.RequestMessage = ko.computed(function () {
                    var property = '';
                    switch (request.RequestType) {
                        case RequestType.InviteGroup:
                            property += 'Invite';
                            break;
                        case RequestType.JoinGroup:
                        case RequestType.InviteEvent:
                            property += 'Join';
                            break;
                        default:
                            return null;
                    }
                    switch (_self.Target.Type.toLowerCase()) {
                        case 'group':
                            property += 'Group';
                            break;
                        case 'family':
                            property += 'Family';
                            break;
                        case 'event':
                            property += 'Event';
                            break;
                        default:
                            return null;
                    }
                    return RequestMessages[property];
                });
            }
            RequestModel.prototype.Decline = function () {
                _manager.DeclineRequest(this);
            };
            RequestModel.prototype.Accept = function () {
                _manager.AcceptRequest(this);
            };
            return RequestModel;
        })();
        var _manager;
        function Init(userId, applicationId) {
            _manager = new RequestsManager(userId, applicationId);
        }
        Requests.Init = Init;
        function CreateRequest(callback, userId, newRequest) {
            RequestsManager.CreateRequest(callback, userId, newRequest);
        }
        Requests.CreateRequest = CreateRequest;
    })(Requests = Yugglr.Requests || (Yugglr.Requests = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Requests.js.map