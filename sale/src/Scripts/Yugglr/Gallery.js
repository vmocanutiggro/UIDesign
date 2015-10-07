/// <reference path="Ajax.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Yugglr;
(function (Yugglr) {
    (function (ShareKind) {
        ShareKind[ShareKind["Default"] = 0] = "Default";
        ShareKind[ShareKind["Global"] = 1] = "Global";
        ShareKind[ShareKind["Public"] = 2] = "Public";
        ShareKind[ShareKind["Private"] = 3] = "Private";
        ShareKind[ShareKind["Secret"] = 4] = "Secret";
    })(Yugglr.ShareKind || (Yugglr.ShareKind = {}));
    var ShareKind = Yugglr.ShareKind;
    (function (AlbumSystemType) {
        AlbumSystemType[AlbumSystemType["Default"] = 0] = "Default";
        AlbumSystemType[AlbumSystemType["SystemProfilePictures"] = 1] = "SystemProfilePictures";
        AlbumSystemType[AlbumSystemType["SystemWallPictures"] = 2] = "SystemWallPictures";
        AlbumSystemType[AlbumSystemType["SystemMobilePictures"] = 3] = "SystemMobilePictures";
    })(Yugglr.AlbumSystemType || (Yugglr.AlbumSystemType = {}));
    var AlbumSystemType = Yugglr.AlbumSystemType;
    var Row = (function () {
        function Row() {
            this.Albums = [];
        }
        return Row;
    })();
    var GalleryModel = (function () {
        function GalleryModel() {
            var _this = this;
            this.Albums = ko.observableArray([]);
            this.NewAlbum = new NewAlbumModel();
            this.AlbumsWithNew = ko.computed(function () { return [].concat([_this.NewAlbum], _this.Albums()); });
            this.AlbumRows = ko.computed(function () {
                var rows = [];
                var currentRow = null;
                var array = _this.AlbumsWithNew();
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
        GalleryModel.prototype.SetAlbums = function (albums) {
            this.Albums(albums);
            this.Albums.sort(AlbumModel.Compare);
        };
        GalleryModel.prototype.OnDeleteAlbum = function (album) {
            var _self = this;
            Yugglr.Confirm('#delete-album-message', function ($modal) {
                _manager.DeleteAlbum(function (result) {
                    if (result.success) {
                        _self.Albums.remove(album);
                    }
                }, album);
                $modal.modal('hide');
            });
            return false;
        };
        GalleryModel.prototype.AddAlbum = function (album) {
            this.Albums.push(album);
            this.Albums.sort(AlbumModel.Compare);
        };
        GalleryModel.prototype.SelectTemplate = function (album) {
            var template = album.IsNewAlbum ? 'template-new-album' : 'template-album';
            return template;
        };
        GalleryModel.prototype.OnCreateAlbum = function () {
            var modalModel = _manager.NewAlbumModalModel;
            modalModel.Show();
            return false;
        };
        return GalleryModel;
    })();
    var AlbumModel = (function () {
        function AlbumModel(album) {
            this.Id = album.Id;
            this.ImageUrl = Yugglr.Url.BuildImageUrl(album.Image, { Width: 163, Height: 116 }, '/images/elements/empty_album.svg');
            this.Name = ko.observable(album.Name);
            this.Created = new Date(album.TimeCreated);
            this.Creator = album.Creator;
            this.Modified = new Date(album.TimeModified).toFriendlyString();
            this.Owner = album.Owner;
            this.HasModifyAccess = album.HasModifyAccess;
            this.CanEdit = this.HasModifyAccess;
            this.IsNewAlbum = false;
            this.ShareKind = ko.observable(album.ShareKind);
            this.SystemType = album.SystemType;
            if (_manager) {
                if (_manager.OwnerType == 'user') {
                    this.Url = Yugglr.Url.BuildAlbumUrl(album, _manager.ProfileOwnerId);
                }
                else {
                    this.Url = Yugglr.Url.BuildAlbumUrl(album, _manager.ProfileOwnerId, { Id: _manager.OwnerId, Type: _manager.OwnerType == 'group' ? 0 : 1 });
                }
            }
            else {
                this.Url = '';
            }
            var _self = this;
            this.CanDelete = ko.computed(function () {
                return _self.OnCanDelete();
            });
        }
        AlbumModel.prototype.OnCanDelete = function () {
            return this.HasModifyAccess && this.SystemType == Yugglr.AlbumSystemType.Default;
        };
        AlbumModel.prototype.GetImageUrl = function () {
            return this.ImageUrl;
        };
        AlbumModel.Compare = function (x, y) {
            var xName = x.Name();
            var yName = y.Name();
            return xName.localeCompare(yName);
        };
        return AlbumModel;
    })();
    var NewAlbumModel = (function (_super) {
        __extends(NewAlbumModel, _super);
        function NewAlbumModel() {
            _super.call(this, {
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
        return NewAlbumModel;
    })(AlbumModel);
    var NewAlbumModalModel = (function () {
        function NewAlbumModalModel() {
            this.Name = ko.observable();
            this.Description = ko.observable();
            this.ShareKind = ko.observable();
        }
        NewAlbumModalModel.prototype.CreateAlbum = function () {
            if ($('#add_album_modal form').valid()) {
                _manager.CreateAlbum(function (result) {
                    if (result.success) {
                        var model = _manager.GalleryModel;
                        model.AddAlbum(new AlbumModel(result.data));
                    }
                    $('#add_album_modal').modal('hide');
                }, this);
            }
            return false;
        };
        NewAlbumModalModel.prototype.Show = function () {
            this.Name('');
            this.Description('');
            this.ShareKind(ShareKind.Default);
            var $form = $('#add_album_modal form');
            $form.validate().resetForm();
            $form.resetValidation();
            $('#add_album_modal').modal('show');
            $('#add_album_modal form input:first').focus();
        };
        return NewAlbumModalModel;
    })();
    var GalleryManager = (function () {
        function GalleryManager(profileOwnerId, ownerId, ownerType) {
            this._profileOwnerId = profileOwnerId;
            this._ownerId = ownerId;
            this._ownerType = ownerType;
            this._model = new GalleryModel();
            this._newModel = new NewAlbumModalModel();
            ko.applyBindings(this._model, $('#albums').get(0));
            ko.applyBindings(this._newModel, $('#add_album_modal').get(0));
        }
        Object.defineProperty(GalleryManager.prototype, "GalleryModel", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GalleryManager.prototype, "NewAlbumModalModel", {
            get: function () {
                return this._newModel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GalleryManager.prototype, "ProfileOwnerId", {
            get: function () {
                return this._profileOwnerId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GalleryManager.prototype, "OwnerId", {
            get: function () {
                return this._ownerId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GalleryManager.prototype, "OwnerType", {
            get: function () {
                return this._ownerType;
            },
            enumerable: true,
            configurable: true
        });
        GalleryManager.prototype.Init = function () {
            var _this = this;
            this.GetAlbums(function (result) {
                if (result.success) {
                    var albums = result.data;
                    _this._model.SetAlbums(albums.map(function (value, index, array) { return new AlbumModel(value); }));
                }
            });
        };
        GalleryManager.prototype.GetAlbums = function (callback) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._ownerType + '/' + this._ownerId + '/albums';
            Yugglr.Ajax.Get(callback, url);
        };
        GalleryManager.prototype.CreateAlbum = function (callback, newAlbum) {
            var url = 'nfsale2.azurewebsites.net/api/social/' + this._ownerType + '/' + this._ownerId + '/album';
            Yugglr.Ajax.Post(callback, url, {
                Name: newAlbum.Name(),
                Description: newAlbum.Description(),
                ShareKind: newAlbum.ShareKind()
            });
        };
        GalleryManager.prototype.DeleteAlbum = function (callback, album) {
            var url = 'nfsale2.azurewebsites.net/api/social/album/' + album.Id;
            Yugglr.Ajax.Delete(callback, url);
        };
        return GalleryManager;
    })();
    var _manager;
    var Gallery;
    (function (Gallery) {
        function Init(profileOwnerId, ownerId, ownerType) {
            _manager = new GalleryManager(profileOwnerId, ownerId, ownerType);
            _manager.Init();
        }
        Gallery.Init = Init;
    })(Gallery = Yugglr.Gallery || (Yugglr.Gallery = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Gallery.js.map