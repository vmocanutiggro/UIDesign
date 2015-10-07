/// <reference path="Ajax.ts" />

module Yugglr {
	export enum ShareKind {
		Default = 0,
		Global = 1,
		Public = 2,
		Private = 3,
		Secret = 4,
	}

	export enum AlbumSystemType {
		Default,
		SystemProfilePictures,
		SystemWallPictures,
		SystemMobilePictures
	}

	class Row {
		constructor() {
			this.Albums = [];
		}

		Albums: AlbumModel[];
	}

	class GalleryModel {
		constructor() {
			this.Albums = ko.observableArray([]);
			this.NewAlbum = new NewAlbumModel();
			this.AlbumsWithNew = ko.computed(() => [].concat([this.NewAlbum], this.Albums()));
			this.AlbumRows = ko.computed(() => {
				var rows = [];

				var currentRow: Row = null;

				var array = this.AlbumsWithNew();
				for (var i = 0; i < array.length; ++i) {
					if (i % 4 == 0) {
						currentRow = new Row();
						rows.push(currentRow);
					}

					currentRow.Albums.push(array[i]);
				}

				return rows;
			});
		}

		private NewAlbum: NewAlbumModel;
		Albums: KnockoutObservableArray<AlbumModel>;
		AlbumsWithNew: KnockoutComputed<AlbumModel[]>;
		AlbumRows: KnockoutComputed<Row[]>;

		public SetAlbums(albums: AlbumModel[]): void {
			this.Albums(albums);
			this.Albums.sort(AlbumModel.Compare);
		}

		public OnDeleteAlbum(album: AlbumModel): boolean {
			var _self = this;

			Yugglr.Confirm('#delete-album-message', ($modal) => {
				_manager.DeleteAlbum((result) => {
					if (result.success) {
						_self.Albums.remove(album);
					}
				}, album);

				$modal.modal('hide');
			});

			return false;
		}

		public AddAlbum(album: AlbumModel): void {
			this.Albums.push(album);
			this.Albums.sort(AlbumModel.Compare);
		}

		public SelectTemplate(album: AlbumModel): string {
			var template = album.IsNewAlbum ? 'template-new-album' : 'template-album';
			return template;
		}

		public OnCreateAlbum(): boolean {
			var modalModel = _manager.NewAlbumModalModel;
			modalModel.Show();

			return false;
		}
	}

	class AlbumModel {
		constructor(album: Album) {
			this.Id = album.Id;
			this.ImageUrl = Url.BuildImageUrl(album.Image, { Width: 163, Height: 116 }, '/images/elements/empty_album.svg');
			this.Name = ko.observable(album.Name);
			this.Created = new Date(album.TimeCreated)
			this.Creator = album.Creator;
			this.Modified = new Date(album.TimeModified).toFriendlyString();
			this.Owner = album.Owner
			this.HasModifyAccess = album.HasModifyAccess;
			this.CanEdit = this.HasModifyAccess;
			this.IsNewAlbum = false;
			this.ShareKind = ko.observable(album.ShareKind);
			this.SystemType = album.SystemType;

			if (_manager) {
				if (_manager.OwnerType == 'user') {
					this.Url = Url.BuildAlbumUrl(album, _manager.ProfileOwnerId);
				} else {
					this.Url = Url.BuildAlbumUrl(album, _manager.ProfileOwnerId, { Id: _manager.OwnerId, Type: _manager.OwnerType == 'group' ? 0 : 1 });
				}
			} else {
				this.Url = '';
			}

			var _self = this;
			this.CanDelete = ko.computed(() => {
				return _self.OnCanDelete();
			});
		}

		private OnCanDelete(): boolean {
			return this.HasModifyAccess && this.SystemType == Yugglr.AlbumSystemType.Default;
		}

		Id: string;
		Url: string;
		ImageUrl: string;
		Name: KnockoutObservable<string>;
		Created: Date;
		Creator: NameAndUrl;
		Modified: string;
		Owner: NameAndUrl;
		HasModifyAccess: boolean;
		CanEdit: boolean;
		IsNewAlbum: boolean;
		SystemType: AlbumSystemType;
		ShareKind: KnockoutObservable<ShareKind>;
		CanDelete: KnockoutComputed<boolean>;

		GetImageUrl(): string {
			return this.ImageUrl;
		}

		public static Compare(x: AlbumModel, y: AlbumModel): number {
			var xName = x.Name();
			var yName = y.Name();

			return xName.localeCompare(yName);
		}
	}

	class NewAlbumModel extends AlbumModel {
		constructor() {
			super({
				Id: null,
				Image: null,
				HasModifyAccess: false,
				TimeCreated: new Date().toString(),
				Creator: null,
				TimeModified: new Date().toString(),
				SystemType: null,
				ShareKind: null,
				Name: '',
				Owner: { Id: null, Name: null, Url: null },
			});
			this.IsNewAlbum = true;
		}
	}

	class NewAlbumModalModel {
		constructor() {
			this.Name = ko.observable<string>();
			this.Description = ko.observable<string>();
			this.ShareKind = ko.observable<ShareKind>();
		}

		Name: KnockoutObservable<string>;
		Description: KnockoutObservable<string>;
		ShareKind: KnockoutObservable<ShareKind>;

		public CreateAlbum(): boolean {
			if ($('#add_album_modal form').valid()) {
				_manager.CreateAlbum((result) => {
					if (result.success) {
						var model = _manager.GalleryModel;
						model.AddAlbum(new AlbumModel(result.data));
					}

					$('#add_album_modal').modal('hide');
				}, this);
			}

			return false;
		}

		public Show(): void {
			this.Name('');
			this.Description('');
			this.ShareKind(ShareKind.Default);

			var $form = $('#add_album_modal form');
			$form.validate().resetForm();
			$form.resetValidation();

			$('#add_album_modal').modal('show');

			$('#add_album_modal form input:first').focus();
		}
	}

	class GalleryManager {
		private _profileOwnerId: string;
		private _ownerId: string;
		private _ownerType: string;
		private _model: GalleryModel;
		private _newModel: NewAlbumModalModel;

		get GalleryModel(): GalleryModel {
			return this._model;
		}

		get NewAlbumModalModel(): NewAlbumModalModel {
			return this._newModel;
		}

		get ProfileOwnerId(): string {
			return this._profileOwnerId;
		}

		get OwnerId(): string {
			return this._ownerId;
		}

		get OwnerType(): string {
			return this._ownerType;
		}

		constructor(profileOwnerId: string, ownerId: string, ownerType: string) {
			this._profileOwnerId = profileOwnerId;
			this._ownerId = ownerId;
			this._ownerType = ownerType;
			this._model = new GalleryModel();
			this._newModel = new NewAlbumModalModel();

			ko.applyBindings(this._model, $('#albums').get(0));
			ko.applyBindings(this._newModel, $('#add_album_modal').get(0));
		}

		public Init(): void {
			this.GetAlbums((result) => {
				if (result.success) {
					var albums: Album[] = result.data;
					this._model.SetAlbums(albums.map((value, index, array) => new AlbumModel(value)));
				}
			});
		}

		GetAlbums(callback: Ajax.AjaxCallback): void {
			var url = 'nfsale2.azurewebsites.net/api/social/' + this._ownerType + '/' + this._ownerId + '/albums';
			Ajax.Get(callback, url);
		}

		CreateAlbum(callback: Ajax.AjaxCallback, newAlbum: NewAlbumModalModel): void {
			var url = 'nfsale2.azurewebsites.net/api/social/' + this._ownerType + '/' + this._ownerId + '/album';
			Ajax.Post(callback, url, {
				Name: newAlbum.Name(),
				Description: newAlbum.Description(),
				ShareKind: newAlbum.ShareKind()
			});
		}

		DeleteAlbum(callback: Ajax.AjaxCallback, album: AlbumModel): void {
			var url = 'nfsale2.azurewebsites.net/api/social/album/' + album.Id;
			Ajax.Delete(callback, url);
		}
	}

	var _manager: GalleryManager;

	export module Gallery {
		export function Init(profileOwnerId: string, ownerId: string, ownerType: string): void {
			_manager = new GalleryManager(profileOwnerId, ownerId, ownerType);
			_manager.Init();
		}
	}
} 