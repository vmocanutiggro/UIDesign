/// <reference path="Ajax.ts" />

module Yugglr {

    class GroupModel {
        constructor(details: GroupDetails, searched?: boolean) {
            this.Id = details.Id;
            this.IsOwner = details.IsOwner;
            this.IsAdmin = details.IsAdmin;
            this.CanEdit = this.IsAdmin || this.IsOwner;
            this.IsSearched = searched || false;
            this.IsMemberOf = ko.observable(details.IsMemberOf);
            this.ImageUrl = ko.observable(details.ImageUrl);
            this.GroupUrl = Url.BuildProfileGroupUrl(_manager.ProfileUrlId, _manager.GroupType, details.Id);
            this.Name = ko.observable(details.Name);
            this.Description = ko.observable(details.Description);
            this.Mode = ko.observable(details.Mode);
            this.IsJoinRequested = ko.observable(details.IsJoinRequested);
        }

        Id: string;
        IsOwner: boolean;
        IsSearched: boolean;
        IsAdmin: boolean;
        CanEdit: boolean;
        IsMemberOf: KnockoutObservable<boolean>;
        ImageUrl: KnockoutObservable<string>;
        GroupUrl: string;
        Name: KnockoutObservable<string>;
        Description: KnockoutObservable<string>;
        Mode: KnockoutObservable<GroupMode>;
        IsJoinRequested: KnockoutObservable<boolean>;

        public static Compare(x: GroupModel, y: GroupModel): number {
            if (x.IsSearched || y.IsSearched && x.IsSearched != y.IsSearched) {
                if (x.IsSearched) {
                    return -1;
                } else {
                    return 1;
                }
            }

            var xName = x.Name().toLowerCase(),
                yName = y.Name().toLowerCase();

            return xName.localeCompare(yName);
        }

        public GetImageUrl() {
            return this.ImageUrl() || (_manager.GroupType == "groups" ? '/images/elements/default_group.png' : '/images/elements/family_default_icon.png');
        }

        public Edit(group: GroupModel): boolean {
            return false;
        }
    }

    class ProfileGroupSettingsManager {
        private _groupId: string;
        private _profileUrlId: string;
        private _groupType: string;
        EditedGroup: KnockoutObservable<GroupModel>;
        public Members: KnockoutObservableArray<ViewableModel>;
        public Administrators: KnockoutObservableArray<ViewableModel>;
        public SelectedUsers: KnockoutObservableArray<ViewableModel>;
        public IsAdmin: boolean;


        public get GroupType(): string {
            return this._groupType;
        }

        public get ProfileUrlId(): string {
            return this._profileUrlId;
        }

        constructor(groupId: string, profileUrlId: string, groupType: string, isAdmin: boolean) {
            var _self = this;
            this.EditedGroup = ko.observable(null);
            this.Members = ko.observableArray([]);
            this.Administrators = ko.observableArray([]);
            this.SelectedUsers = ko.observableArray([]);
            this._groupId = groupId;
            this._groupType = groupType;
            this._profileUrlId = profileUrlId;
            this.IsAdmin = isAdmin;
            
            
            
            
            this.GetGroup((result)=> {
                if (result.success) {
                    _self.EditedGroup(new GroupModel(result.data));
                    ko.applyBindings(_self.EditedGroup, $('#tab_name_and_blason')[0]);
                }
            }, groupId);


            this.GetGroupMembers((result: Ajax.AjaxResultT<Viewable[]>) => {
                if (result.success) {
                    this.Members(result.data.map((e, i) => new ViewableModel(e)));
                    ko.applyBindings(_self, $('#tab_family_members')[0]);
                }
            }, 0, 999);

            $('#tab_name_and_blason [data-action=save]').on('click', function (e) {
                e.preventDefault();
                
                var $t = $(this);
                if ($t.closest('form').valid()) {
                    _self.UpdateGroup((result) => {
                        if (result.success) {
                            _self.SetGroup(result.data);
                            Yugglr.Alert('#notification-area', $t.data('success-message'), 'success');
                        } else {
                            Yugglr.Alert('#notification-area', $t.data('error-message'), 'danger');
                        }
                    },'#edit_group', _self._groupId);
                }
            });


            $('#add-member-modal .user-search').viewablesearch({
                callback: (e: JQueryEventObject, suggestion: any) => {
                    var user = suggestion.viewable;
                    if (!_self.SelectedUsers().some((u, i) => u.Id == user.Id)) {
                        _self.SelectedUsers.push(user);
                    }
                    $('#add-member-modal .user-search').typeahead('val', '');
                },
                search: [UsersRepository.FindUser]
            });

            $('#add-member-modal').on('click', 'button.close', function (e) {
                e.preventDefault();

                var userId = $(this).data('user-id');
                var users = _self.SelectedUsers().filter((u, i) => u.Id == userId);
                if (users.length >= 1) {
                    _self.SelectedUsers.removeAll(users);
                }
            });

            $('#add-member-modal .btn-add').click((e) => {
                e.preventDefault();

                var ids = _self.SelectedUsers().map((u, i) => u.Id);
                _self.InviteMembers((result) => {
                    $('#add-member-modal').modal('hide');
                    _self.SelectedUsers([]);
                }, ids);
            });
        }

        public OnAddFamilyMember(): void {
            this.SelectedUsers([]);

            $('#add-member-modal').modal({
                backdrop: 'static'
            });
        }

        public InviteMembers(callback: Ajax.AjaxCallback, userIds: string[]): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/invite';

            Ajax.Post(callback, url, { userIds: userIds });
        }

        public AddGroupAdmin(model: ViewableModel, event) {
            this.AddAdmin((data) => {
                if (data.success) {
                    model.IsAdminMember = true;
                    $(event.target).hide();
                    var member = $(event.target).closest('[data-member-id]');
                    member.find('[RemoveAdmin]').show();
                    /*member.find('[Remove]').hide();*/
                }
            }, model.Id);
        }

        public RemoveGroupAdmin(model: ViewableModel, event) {
            this.RemoveAdmin((data) => {
                if (data.success) {
                    model.IsAdminMember = false;
                    var member = $(event.target).closest('[data-member-id]');
                    $(event.target).closest('[RemoveAdmin]').hide();
                    member.find('[AddAdmin]').show();
                    /*member.find('[Remove]').show();*/
                }
            }, model.Id);
        }

        public LeaveGroupAdmin(model: ViewableModel, event) {
            var _self = this;
            this.Leave((data) => {
                if (data.success) {
                    _self.Members.remove(model);
                    $(event.target).closest('[data-member-id]').remove();
                }
            }, model.Id);
        }

        public AddAdmin(callback: Ajax.AjaxCallback, userId: string): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/addadmin/' + userId;

            Ajax.Post(callback, url);
        }

        public RemoveAdmin(callback: Ajax.AjaxCallback, userId: string): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/removeadmin/' + userId;
            Ajax.Post(callback, url);
        }

        public Leave(callback: Ajax.AjaxCallback, userId: string): void {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/leave/' + userId;
            Ajax.Post(callback, url);
        }

        public GetGroupMembers(callback: Ajax.AjaxCallbackT<Viewable[]>, skip?: number, maxItems?: number) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._groupType + '/' + this._groupId + '/members';
            if (skip) {
                url += '/' + skip;

                if (maxItems) {
                    url += '/' + maxItems;
                }
            }

            Ajax.Get(callback, url);
        }

        public GetGroup(callback: Ajax.AjaxCallback, groupId: string): void {
            var action = this._groupType;
            var url = 'nfsale2.azurewebsites.net/api/social/' + action + '/' + groupId  ;
            Ajax.Get(callback, url);
        }

        private UpdateGroup(callback: Ajax.AjaxCallback, formSelector: string, groupId: string): void {
            var objectType = this._groupType;
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId;
            Ajax.PatchForm(callback, url, formSelector);
        }

        public SetGroup(group: GroupDetails): void {
            this.EditedGroup(new GroupModel(group, false));
        }

        


    }

    var _manager: ProfileGroupSettingsManager;

    export module ProfileGroupSettings {

        export function Init(groupId: string, profileUrlId: string, groupType: string, isAdmin: boolean): void {
            _manager = new ProfileGroupSettingsManager(groupId, profileUrlId, groupType, isAdmin);

            _manager.GetGroup((result)=> {
                if (result.success) {
                    _manager.SetGroup(result.data);
                }
            }, groupId);
        }

    }

}