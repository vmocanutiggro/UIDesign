/// <reference path="Ajax.ts" />
var Yugglr;
(function (Yugglr) {
    var GroupModel = (function () {
        function GroupModel(details, searched) {
            this.Id = details.Id;
            this.IsOwner = details.IsOwner;
            this.IsAdmin = details.IsAdmin;
            this.CanEdit = this.IsAdmin || this.IsOwner;
            this.IsSearched = searched || false;
            this.IsMemberOf = ko.observable(details.IsMemberOf);
            this.ImageUrl = ko.observable(details.ImageUrl);
            this.GroupUrl = Yugglr.Url.BuildProfileGroupUrl(_manager.ProfileUrlId, _manager.GroupType, details.Id);
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
            return this.ImageUrl() || (_manager.GroupType == "groups" ? '/images/elements/default_group.png' : '/images/elements/family_default_icon.png');
        };
        GroupModel.prototype.Edit = function (group) {
            return false;
        };
        return GroupModel;
    })();
    var ProfileGroupSettingsManager = (function () {
        function ProfileGroupSettingsManager(groupId, profileUrlId, groupType, isAdmin) {
            var _this = this;
            var _self = this;
            this.EditedGroup = ko.observable(null);
            this.Members = ko.observableArray([]);
            this.Administrators = ko.observableArray([]);
            this.SelectedUsers = ko.observableArray([]);
            this._groupId = groupId;
            this._groupType = groupType;
            this._profileUrlId = profileUrlId;
            this.IsAdmin = isAdmin;
            this.GetGroup(function (result) {
                if (result.success) {
                    _self.EditedGroup(new GroupModel(result.data));
                    ko.applyBindings(_self.EditedGroup, $('#tab_name_and_blason')[0]);
                }
            }, groupId);
            this.GetGroupMembers(function (result) {
                if (result.success) {
                    _this.Members(result.data.map(function (e, i) { return new Yugglr.ViewableModel(e); }));
                    ko.applyBindings(_self, $('#tab_family_members')[0]);
                }
            }, 0, 999);
            $('#tab_name_and_blason [data-action=save]').on('click', function (e) {
                e.preventDefault();
                var $t = $(this);
                if ($t.closest('form').valid()) {
                    _self.UpdateGroup(function (result) {
                        if (result.success) {
                            _self.SetGroup(result.data);
                            Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                        }
                        else {
                            Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                        }
                    }, '#edit_group', _self._groupId);
                }
            });
            $('#add-member-modal .user-search').viewablesearch({
                callback: function (e, suggestion) {
                    var user = suggestion.viewable;
                    if (!_self.SelectedUsers().some(function (u, i) { return u.Id == user.Id; })) {
                        _self.SelectedUsers.push(user);
                    }
                    $('#add-member-modal .user-search').typeahead('val', '');
                },
                search: [Yugglr.UsersRepository.FindUser]
            });
            $('#add-member-modal').on('click', 'button.close', function (e) {
                e.preventDefault();
                var userId = $(this).data('user-id');
                var users = _self.SelectedUsers().filter(function (u, i) { return u.Id == userId; });
                if (users.length >= 1) {
                    _self.SelectedUsers.removeAll(users);
                }
            });
            $('#add-member-modal .btn-add').click(function (e) {
                e.preventDefault();
                var ids = _self.SelectedUsers().map(function (u, i) { return u.Id; });
                _self.InviteMembers(function (result) {
                    $('#add-member-modal').modal('hide');
                    _self.SelectedUsers([]);
                }, ids);
            });
        }
        Object.defineProperty(ProfileGroupSettingsManager.prototype, "GroupType", {
            get: function () {
                return this._groupType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProfileGroupSettingsManager.prototype, "ProfileUrlId", {
            get: function () {
                return this._profileUrlId;
            },
            enumerable: true,
            configurable: true
        });
        ProfileGroupSettingsManager.prototype.OnAddFamilyMember = function () {
            this.SelectedUsers([]);
            $('#add-member-modal').modal({
                backdrop: 'static'
            });
        };
        ProfileGroupSettingsManager.prototype.InviteMembers = function (callback, userIds) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/invite';
            Yugglr.Ajax.Post(callback, url, { userIds: userIds });
        };
        ProfileGroupSettingsManager.prototype.AddGroupAdmin = function (model, event) {
            this.AddAdmin(function (data) {
                if (data.success) {
                    model.IsAdminMember = true;
                    $(event.target).hide();
                    var member = $(event.target).closest('[data-member-id]');
                    member.find('[RemoveAdmin]').show();
                }
            }, model.Id);
        };
        ProfileGroupSettingsManager.prototype.RemoveGroupAdmin = function (model, event) {
            this.RemoveAdmin(function (data) {
                if (data.success) {
                    model.IsAdminMember = false;
                    var member = $(event.target).closest('[data-member-id]');
                    $(event.target).closest('[RemoveAdmin]').hide();
                    member.find('[AddAdmin]').show();
                }
            }, model.Id);
        };
        ProfileGroupSettingsManager.prototype.LeaveGroupAdmin = function (model, event) {
            var _self = this;
            this.Leave(function (data) {
                if (data.success) {
                    _self.Members.remove(model);
                    $(event.target).closest('[data-member-id]').remove();
                }
            }, model.Id);
        };
        ProfileGroupSettingsManager.prototype.AddAdmin = function (callback, userId) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/addadmin/' + userId;
            Yugglr.Ajax.Post(callback, url);
        };
        ProfileGroupSettingsManager.prototype.RemoveAdmin = function (callback, userId) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/removeadmin/' + userId;
            Yugglr.Ajax.Post(callback, url);
        };
        ProfileGroupSettingsManager.prototype.Leave = function (callback, userId) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/leave/' + userId;
            Yugglr.Ajax.Post(callback, url);
        };
        ProfileGroupSettingsManager.prototype.GetGroupMembers = function (callback, skip, maxItems) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/members';
            if (skip) {
                url += '/' + skip;
                if (maxItems) {
                    url += '/' + maxItems;
                }
            }
            Yugglr.Ajax.Get(callback, url);
        };
        ProfileGroupSettingsManager.prototype.GetGroup = function (callback, groupId) {
            var action = this._groupType;
            var url = 'nfsale2.azurewebsites.net/api/social/' + action + '/' + groupId;
            Yugglr.Ajax.Get(callback, url);
        };
        ProfileGroupSettingsManager.prototype.UpdateGroup = function (callback, formSelector, groupId) {
            var objectType = this._groupType;
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId;
            Yugglr.Ajax.PatchForm(callback, url, formSelector);
        };
        ProfileGroupSettingsManager.prototype.SetGroup = function (group) {
            this.EditedGroup(new GroupModel(group, false));
        };
        return ProfileGroupSettingsManager;
    })();
    var _manager;
    var ProfileGroupSettings;
    (function (ProfileGroupSettings) {
        function Init(groupId, profileUrlId, groupType, isAdmin) {
            _manager = new ProfileGroupSettingsManager(groupId, profileUrlId, groupType, isAdmin);
            _manager.GetGroup(function (result) {
                if (result.success) {
                    _manager.SetGroup(result.data);
                }
            }, groupId);
        }
        ProfileGroupSettings.Init = Init;
    })(ProfileGroupSettings = Yugglr.ProfileGroupSettings || (Yugglr.ProfileGroupSettings = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=ProfileGroupSettings.js.map