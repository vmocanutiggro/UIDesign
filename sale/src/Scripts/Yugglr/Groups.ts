/// <reference path="Ajax.ts" />

module Yugglr {
	export enum GroupMode {
        Open = 0,
        Closed = 1,
        Secret = 2
	}

	export interface GroupDetails {
		Id: string;
		IsMemberOf: boolean;
		IsOwner: boolean;
		IsAdmin: boolean;
		ImageUrl: string;
		GroupUrl: string;
		Name: string;
        Description: string;
        Mode: GroupMode;
        IsJoinRequested: boolean;
	}

	class GroupsModel {
		constructor(details: GroupDetails[]) {
			this.Term = ko.observable("");
			this.Groups = ko.observableArray([]);
			this.SearchedGroups = ko.observableArray([]);

			var _self = this;
			this.AllGroups = ko.computed<GroupModel[]>(() => {
				var result: GroupModel[] = [];
				result = result.concat(_self.SearchedGroups());

				var groups = _self.Groups();
				for (var g in groups) {
					var group = groups[g];

					if (result.filter((value, index, array) => {
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

		public SetGroups(groups: GroupDetails[]): void {
			this.Groups($.map(groups, (value, index) => {
				return new GroupModel(value);
			}));
			this.Groups.sort(GroupModel.Compare);
		}

		public SetSearchedGroups(groups: GroupDetails[]): void {
			this.SearchedGroups($.map(groups, (value, index) => {
				return new GroupModel(value, true);
			}));
			this.SearchedGroups.sort(GroupModel.Compare);
		}

		public AddGroup(group: GroupDetails): void {
			this.Groups.push(new GroupModel(group));
			this.Groups.sort(GroupModel.Compare);
        }

        public UpdateGroup(group: GroupDetails): void {
            this.EditedGroup().ImageUrl(group.ImageUrl);
            this.EditedGroup().Name(group.Name);
        }

		public RemoveGroup(groupId: string): void {
			this.Groups.remove((item) => item.Id == groupId);
		}

		public GetGroup(groupId: string): GroupModel {
			var result = this.Groups().filter((value, index, array) => {
				return value.Id == groupId
			});

			if (result.length == 0) {
				result = this.SearchedGroups().filter((value, index, array) => {
					return value.Id == groupId
				});
			}

			if (result.length <= 0) {
				return null;
			} else {
				return result[0];
			}
		}

		public JoinGroup(groupId: string): void {
			var index = this.GetGroupIndex(this.Groups(), groupId);

			var moveToGroups: boolean = false;
			var group: GroupModel = null;
			if (index == null) {
				index = this.GetGroupIndex(this.SearchedGroups(), groupId);
				if (index != null) {
					group = this.SearchedGroups()[index];
					moveToGroups = true;
				}
			} else {
				group = this.Groups()[index];
			}

			if (group != null) {
				if (moveToGroups) {
					this.SearchedGroups.splice(index, 1).forEach((v, i, a) => {
						this.Groups.push(v);
					});

					this.Groups.sort(GroupModel.Compare);
				}

				group.IsMemberOf(true);
			}
        }

        public JoinGroupRequest(groupId: string): void {
            var index = this.GetGroupIndex(this.Groups(), groupId);

            var moveToGroups: boolean = false;
            var group: GroupModel = null;
            if (index == null) {
                index = this.GetGroupIndex(this.SearchedGroups(), groupId);
                if (index != null) {
                    group = this.SearchedGroups()[index];
                    moveToGroups = true;
                }
            } else {
                group = this.Groups()[index];
            }

            if (group != null) {
                if (moveToGroups) {
                    this.SearchedGroups.splice(index, 1).forEach((v, i, a) => {
                        this.Groups.push(v);
                    });

                    this.Groups.sort(GroupModel.Compare);
                }

                group.IsJoinRequested(true);
            }
        }

		public LeaveGroup(groupId: string): void {
			var index = this.GetGroupIndex(this.Groups(), groupId);
			var group: GroupModel = null;
			if (index != null) {
				group = this.Groups()[index];
			}

			if (group != null) {
				this.Groups.splice(index, 1).forEach((v, i, a) => {
					this.SearchedGroups.push(v);
				});

				this.SearchedGroups.sort(GroupModel.Compare);

				group.IsMemberOf(false);
			}
		}

		public ClearSearch(): void {
			this.Term('');
			this.SetSearchedGroups([]);
		}

		public EditGroup(group: GroupModel): boolean {
			return false;
		}

		private GetGroupIndex(array: GroupModel[], groupId: string): number {
			for (var i = 0; i < array.length; i++) {
				var group = array[i];
				if (group.Id == groupId) {
					return i;
				}
			}

			return null;
		}

		Term: KnockoutObservable<string>;
		Groups: KnockoutObservableArray<GroupModel>;
		SearchedGroups: KnockoutObservableArray<GroupModel>;
		AllGroups: KnockoutComputed<GroupModel[]>;
		EditedGroup: KnockoutObservable<GroupModel>;
	}

	class GroupModel {
		constructor(details: GroupDetails, searched?: boolean) {
			this.Id = details.Id;
			this.IsOwner = details.IsOwner;
			this.IsAdmin = details.IsAdmin;
			this.CanEdit = this.IsAdmin || this.IsOwner;
			this.IsSearched = searched || false;
			this.IsMemberOf = ko.observable(details.IsMemberOf);
			this.ImageUrl = ko.observable(details.ImageUrl);
			this.GroupUrl = Url.BuildProfileGroupUrl(_manager.ProfileUrlId, _manager.GroupType == 0 ? 'groups' : 'family', details.Id);
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
			return this.ImageUrl() || (_manager.GroupType == 0 ? '/images/elements/default_group.png' : '/images/elements/family_default_icon.png');
		}

		public Edit(group: GroupModel): boolean {
			return false;
		}
	}

	class GroupsManager {
		private _groupId: string;
		private _profileUrlId: string;
		private _groupType: number;
		private _model: KnockoutObservable<GroupsModel>;

		public get GroupType(): number {
			return this._groupType;
		}

		public get ProfileUrlId(): string {
			return this._profileUrlId;
		}

		constructor(groupId: string, profileUrlId: string, groupType: number) {
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
				(<HTMLFormElement>$form[0]).reset();
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
					_self.CreateGroup((result) => {
						if (result.success) {
							_self._model().AddGroup(result.data);
							var form = <HTMLFormElement>$('#add_group_modal form').get(0);
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
                    _self.UpdateGroup((result) => {
                        if (result.success) {
                            _self._model().UpdateGroup(result.data);
                            var form = <HTMLFormElement>$('#edit_group_modal form').get(0);
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

				_self.SearchGroups((result) => {
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
				_self.JoinGroup((result) => {
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
                _self.JoinGroupRequest((result) => {
                    if (result.success && result.data) {
                        model.JoinGroupRequest(groupId);
                    }
                }, groupId);
            });

			$groups.on('click', '.leave-btn', function (e) {
				e.preventDefault();

				Yugglr.Confirm('#leave-group-message', ($modal) => {
					var $this = $(this);
					var groupId = $this.closest('[data-group-id]').data('group-id');
					var model = _self._model();
					_self.LeaveGroup((result) => {
						if (result.success && result.data) {
							model.LeaveGroup(groupId);
						}

						$modal.modal('hide');
					}, groupId);

				});
			});

			$groups.on('click', '.delete-btn', function (e) {
				e.preventDefault();

				Yugglr.Confirm('#delete-group-message', ($modal) => {
					var $this = $(this);
					var groupId = $this.closest('[data-group-id]').data('group-id');
					_self.DeleteGroup((result) => {
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

                var group: GroupModel = _self._model().GetGroup(groupId);

                _self._model().EditedGroup(group);


                //$("#edit_group_modal").show();
                $("#edit_group_modal").modal('show');
            });
		}

		public GetGroups(callback: Ajax.AjaxCallback, userId: string): void {
			var action = this._groupType == 0 ? 'groups' : 'families';
			var url = 'nfsale2.azurewebsites.net/api/social/user/' + this._groupId + '/' + action;
			Ajax.Get(callback, url);
		}

		public SearchGroups(callback: Ajax.AjaxCallback, term: string, maxResults?: number): void {
			var objectType = this._groupType == 0 ? 'group' : 'family';
			var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/search/' + encodeURIComponent(term);
			if (maxResults) {
				url += '/' + maxResults;
			}
			Ajax.Get(callback, url);
		}

		public CreateGroup(callback: Ajax.AjaxCallback, formSelector: string): void {
			var objectType = this._groupType == 0 ? 'group' : 'family';
			var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/create';
			Ajax.PostForm(callback, url, formSelector);
        }

        public UpdateGroup(callback: Ajax.AjaxCallback, formSelector: string, groupId: string): void {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId;
            Ajax.PatchForm(callback, url, formSelector);
        }

		public JoinGroup(callback: Ajax.AjaxCallback, groupId: string): void {
			var objectType = this._groupType == 0 ? 'group' : 'family';
			var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId + '/join';
			Ajax.Post(callback, url);
        }

        public JoinGroupRequest(callback: Ajax.AjaxCallback, groupId: string): void {
            var objectType = this._groupType == 0 ? 'group' : 'family';
            var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId + '/joinrequest';
            Ajax.Post(callback, url);
        }

		public LeaveGroup(callback: Ajax.AjaxCallback, groupId: string, userId?: string): void {
			var objectType = this._groupType == 0 ? 'group' : 'family';
			var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId + '/leave';
			if (userId) {
				url += '/' + userId;
			}
			Ajax.Post(callback, url);
		}

		public DeleteGroup(callback: Ajax.AjaxCallback, groupId: string): void {
			var objectType = this._groupType == 0 ? 'group' : 'family';
			var url = 'nfsale2.azurewebsites.net/api/social/' + objectType + '/' + groupId;
			Ajax.Delete(callback, url);
		}

		public OnGroupsResponse(groups: GroupDetails[]) {
			this._model().SetGroups(groups);
		}

		public OnGroupsSearchResponse(groups: GroupDetails[]) {
			this._model().SetSearchedGroups(groups);
		}
	}


	var _manager: GroupsManager;

	export module Groups {
		export function Init(groupId: string, profileUrlId: string, groupType: number): void {
			_manager = new GroupsManager(groupId, profileUrlId, groupType);

			_manager.GetGroups((result) => {
				if (result.success) {
					_manager.OnGroupsResponse(result.data);
				}
			}, groupId);
		}
	}
}
