/// <reference path="Ajax.ts" />
var Yugglr;
(function (Yugglr) {
    (function (GroupMode) {
        GroupMode[GroupMode["Open"] = 0] = "Open";
        GroupMode[GroupMode["Closed"] = 1] = "Closed";
        GroupMode[GroupMode["Secret"] = 2] = "Secret";
    })(Yugglr.GroupMode || (Yugglr.GroupMode = {}));
    var GroupMode = Yugglr.GroupMode;
    var GroupsModel = (function () {
        function GroupsModel(details) {
            this.Term = ko.observable("");
            this.Groups = ko.observableArray([]);
            this.SearchedGroups = ko.observableArray([]);
            var _self = this;
            this.AllGroups = ko.computed(function () {
                var result = [];
                result = result.concat(_self.SearchedGroups());
                var groups = _self.Groups();
                for (var g in groups) {
                    var group = groups[g];
                    if (result.filter(function (value, index, array) {
                        return value.Id == group.Id;
                    }).length == 0) {
                        result.push(group);
                    }
                }
                return result.sort(GroupModel.Compare);
            });
            this.SetGroups(details);
            this.EditedGroup = ko.observable(null);
        }
        GroupsModel.prototype.SetGroups = function (groups) {
            this.Groups($.map(groups, function (value, index) {
                return new GroupModel(value);
            }));
            this.Groups.sort(GroupModel.Compare);
        };
        GroupsModel.prototype.SetSearchedGroups = function (groups) {
            this.SearchedGroups($.map(groups, function (value, index) {
                return new GroupModel(value, true);
            }));
            this.SearchedGroups.sort(GroupModel.Compare);
        };
        GroupsModel.prototype.AddGroup = function (group) {
            this.Groups.push(new GroupModel(group));
            this.Groups.sort(GroupModel.Compare);
        };
        GroupsModel.prototype.UpdateGroup = function (group) {
            this.EditedGroup().ImageUrl(group.ImageUrl);
            this.EditedGroup().Name(group.Name);
        };
        GroupsModel.prototype.RemoveGroup = function (groupId) {
            this.Groups.remove(function (item) { return item.Id == groupId; });
        };
        GroupsModel.prototype.GetGroup = function (groupId) {
            var result = this.Groups().filter(function (value, index, array) {
                return value.Id == groupId;
            });
            if (result.length == 0) {
                result = this.SearchedGroups().filter(function (value, index, array) {
                    return value.Id == groupId;
                });
            }
            if (result.length <= 0) {
                return null;
            }
            else {
                return result[0];
            }
        };
        GroupsModel.prototype.JoinGroup = function (groupId) {
            var _this = this;
            var index = this.GetGroupIndex(this.Groups(), groupId);
            var moveToGroups = false;
            var group = null;
            if (index == null) {
                index = this.GetGroupIndex(this.SearchedGroups(), groupId);
                if (index != null) {
                    group = this.SearchedGroups()[index];
                    moveToGroups = true;
                }
            }
            else {
                group = this.Groups()[index];
            }
            if (group != null) {
                if (moveToGroups) {
                    this.SearchedGroups.splice(index, 1).forEach(function (v, i, a) {
                        _this.Groups.push(v);
                    });
                    this.Groups.sort(GroupModel.Compare);
                }
                group.IsMemberOf(true);
            }
        };
        GroupsModel.prototype.JoinGroupRequest = function (groupId) {
            var _this = this;
            var index = this.GetGroupIndex(this.Groups(), groupId);
            var moveToGroups = false;
            var group = null;
            if (index == null) {
                index = this.GetGroupIndex(this.SearchedGroups(), groupId);
                if (index != null) {
                    group = this.SearchedGroups()[index];
                    moveToGroups = true;
                }
            }
            else {
                group = this.Groups()[index];
            }
            if (group != null) {
                if (moveToGroups) {
                    this.SearchedGroups.splice(index, 1).forEach(function (v, i, a) {
                        _this.Groups.push(v);
                    });
                    this.Groups.sort(GroupModel.Compare);
                }
                group.IsJoinRequested(true);
            }
        };
        GroupsModel.prototype.LeaveGroup = function (groupId) {
            var _this = this;
            var index = this.GetGroupIndex(this.Groups(), groupId);
            var group = null;
            if (index != null) {
                group = this.Groups()[index];
            }
            if (group != null) {
                this.Groups.splice(index, 1).forEach(function (v, i, a) {
                    _this.SearchedGroups.push(v);
                });
                this.SearchedGroups.sort(GroupModel.Compare);
                group.IsMemberOf(false);
            }
        };
        GroupsModel.prototype.ClearSearch = function () {
            this.Term('');
            this.SetSearchedGroups([]);
        };
        GroupsModel.prototype.EditGroup = function (group) {
            return false;
        };
        GroupsModel.prototype.GetGroupIndex = function (array, groupId) {
            for (var i = 0; i < array.length; i++) {
                var group = array[i];
                if (group.Id == groupId) {
                    return i;
                }
            }
            return null;
        };
        return GroupsModel;
    })();
    var GroupModel = (function () {
        function GroupModel(details, searched) {
            this.Id = details.Id;
            this.IsOwner = details.IsOwner;
            this.IsAdmin = details.IsAdmin;
            this.CanEdit = this.IsAdmin || this.IsOwner;
            this.IsSearched = searched || false;
            this.IsMemberOf = ko.observable(details.IsMemberOf);
            this.ImageUrl = ko.observable(details.ImageUrl);
            this.GroupUrl = Yugglr.Url.BuildProfileGroupUrl(_manager.ProfileUrlId, _manager.GroupType == 0 ? 'groups' : 'family', details.Id);
            this.Name = ko.observable(details.Name);
            this.Description = ko.observable(details.Description);
            this.Mode = ko.observable(details.Mode);
            this.IsJoinRequested = ko.observable(details.IsJoinRequested);
        }
        GroupModel.Compare = function (x, y) {
            if (x.IsSearched || y.IsSearched && x.IsSearched != y.IsSearched) {
                if (x.IsSearched) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            var xName = x.Name().toLowerCase(), yName = y.Name().toLowerCase();
            return xName.localeCompare(yName);
        };
        GroupModel.prototype.GetImageUrl = function () {
            return this.ImageUrl() || (_manager.GroupType == 0 ? '/images/elements/default_group.png' : '/images/elements/family_default_icon.png');
        };
        GroupModel.prototype.Edit = function (group) {
            return false;
        };
        return GroupModel;
    })();
    var GroupsManager = (function () {
        function GroupsManager(groupId, profileUrlId, groupType) {
            this._groupId = groupId;
            this._profileUrlId = profileUrlId;
            this._groupType = groupType;
            this._model = ko.observable(new GroupsModel([]));
            ko.applyBindings(this._model, $('#groups-model-base').get(0));
            ko.applyBindings(this._model, $('#edit_group_modal').get(0));
            $('#groups, #add_group_modal').on('focus', '.elastic_textarea', function (e) {
                $(this).autosize();
            });
            $('#groups, #edit_group_modal').on('focus', '.elastic_textarea', function (e) {
                $(this).autosize();
            });
            $('#add_group_modal').on('show.bs.modal', function () {
                var $form = $('form', this);
                $form.resetValidation();
                $form[0].reset();
            });
            $('#edit_group_modal').on('show.bs.modal', function () {
                var $form = $('form', this);
                //$form.resetValidation();
                //(<HTMLFormElement>$form[0]).reset();
            });
            var _self = this;
            $('#add_new_group_btn').on('click', function (e) {
                e.preventDefault();
                if ($(this.form).valid()) {
                    _self.CreateGroup(function (result) {
                        if (result.success) {
                            _self._model().AddGroup(result.data);
                            var form = $('#add_group_modal form').get(0);
                            form.reset();
                            $('#add_group_modal').modal('hide');
                        }
                    }, '#add_group_modal form');
                }
            });
            $('#edit_group_btn').on('click', function (e) {
                e.preventDefault();
                if ($(this.form).valid()) {
                    var $this = $(this);
                    var groupId = _self._model().EditedGroup().Id;
                    _self.UpdateGroup(function (result) {
                        if (result.success) {
                            _self._model().UpdateGroup(result.data);
                            var form = $('#edit_group_modal form').get(0);
                            form.reset();
                            _self._model().EditedGroup(null);
                            $('#edit_group_modal').modal('hide');
                        }
                    }, '#edit_group_modal form', groupId);
                }
            });
            $('.search_field_holder button').click(function (e) {
                e.preventDefault();
                var model = _self._model();
                var term = model.Term();
                _self.SearchGroups(function (result) {
                    if (result.success) {
                        _self.OnGroupsSearchResponse(result.data);
                    }
                }, term);
            });
            var $groups = $('#groups');
            $groups.on('click', '.join-btn', function (e) {
                e.preventDefault();
                var $this = $(this);
                var groupId = $this.closest('[data-group-id]').data('group-id');
                var model = _self._model();
                _self.JoinGroup(function (result) {
                    if (result.success && result.data) {
                        model.JoinGroup(groupId);
                    }
                }, groupId);
            });
            $groups.on('click', '.join-request-btn', function (e) {
                e.preventDefault();
                var $this = $(this);
                var groupId = $this.closest('[data-group-id]').data('group-id');
                var model = _self._model();
                _self.JoinGroupRequest(function (result) {
                    if (result.success && result.data) {
                        model.JoinGroupRequest(groupId);
                    }
                }, groupId);
            });
            $groups.on('click', '.leave-btn', function (e) {
                var _this = this;
                e.preventDefault();
                Yugglr.Confirm('#leave-group-message', function ($modal) {
                    var $this = $(_this);
                    var groupId = $this.closest('[data-group-id]').data('group-id');
                    var model = _self._model();
                    _self.LeaveGroup(function (result) {
                        if (result.success && result.data) {
                            model.LeaveGroup(groupId);
                        }
                        $modal.modal('hide');
                    }, groupId);
                });
            });
            $groups.on('click', '.delete-btn', function (e) {
                var _this = this;
                e.preventDefault();
                Yugglr.Confirm('#delete-group-message', function ($modal) {
                    var $this = $(_this);
                    var groupId = $this.closest('[data-group-id]').data('group-id');
                    _self.DeleteGroup(function (result) {
                        if (result.success && result.data) {
                            _self._model().RemoveGroup(groupId);
                        }
                        $modal.modal('hide');
                    }, groupId);
                });
            });
            $groups.on('click', '.edit-btn', function (e) {
                e.preventDefault();
                var $this = $(this);
                var groupId = $this.closest('[data-group-id]').data('group-id');
                var group = _self._model().GetGroup(groupId);
                _self._model().EditedGroup(group);
                //$("#edit_group_modal").show();
                $("#edit_group_modal").modal('show');
            });
        }
        Object.defineProperty(GroupsManager.prototype, "GroupType", {
            get: function () {
                return this._groupType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GroupsManager.prototype, "ProfileUrlId", {
            get: function () {
                return this._profileUrlId;
            },
            enumerable: true,
            configurable: true
        });
        GroupsManager.prototype.GetGroups = function (callback, userId) {
            var action = this._groupType == 0 ? 'groups' : 'families';
            var url = 'nfsale2.azurewebsites.net/api/social/user/' + this._groupId + '/' + action;
            Yugglr.Ajax.Get(callback, url);
        };
        GroupsManager.prototype.SearchGroups = function (callback, term, maxResults) {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/search/' + encodeURIComponent(term);
            if (maxResults) {
                url += '/' + maxResults;
            }
            Yugglr.Ajax.Get(callback, url);
        };
        GroupsManager.prototype.CreateGroup = function (callback, formSelector) {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/create';
            Yugglr.Ajax.PostForm(callback, url, formSelector);
        };
        GroupsManager.prototype.UpdateGroup = function (callback, formSelector, groupId) {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId;
            Yugglr.Ajax.PatchForm(callback, url, formSelector);
        };
        GroupsManager.prototype.JoinGroup = function (callback, groupId) {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId + '/join';
            Yugglr.Ajax.Post(callback, url);
        };
        GroupsManager.prototype.JoinGroupRequest = function (callback, groupId) {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId + '/joinrequest';
            Yugglr.Ajax.Post(callback, url);
        };
        GroupsManager.prototype.LeaveGroup = function (callback, groupId, userId) {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId + '/leave';
            if (userId) {
                url += '/' + userId;
            }
            Yugglr.Ajax.Post(callback, url);
        };
        GroupsManager.prototype.DeleteGroup = function (callback, groupId) {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId;
            Yugglr.Ajax.Delete(callback, url);
        };
        GroupsManager.prototype.OnGroupsResponse = function (groups) {
            this._model().SetGroups(groups);
        };
        GroupsManager.prototype.OnGroupsSearchResponse = function (groups) {
            this._model().SetSearchedGroups(groups);
        };
        return GroupsManager;
    })();
    var _manager;
    var Groups;
    (function (Groups) {
        function Init(groupId, profileUrlId, groupType) {
            _manager = new GroupsManager(groupId, profileUrlId, groupType);
            _manager.GetGroups(function (result) {
                if (result.success) {
                    _manager.OnGroupsResponse(result.data);
                }
            }, groupId);
        }
        Groups.Init = Init;
    })(Groups = Yugglr.Groups || (Yugglr.Groups = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Groups.js.map