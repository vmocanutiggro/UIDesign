/// <reference path="Ajax.ts" />
var Yugglr;
(function (Yugglr) {
    var Row = (function () {
        function Row() {
            this.Photos = [];
        }
        return Row;
    })();
    var AlbumModel = (function () {
        function AlbumModel(manager) {
            var _this = this;
            this._manager = manager;
            this.Photos = ko.observableArray([]);
            this.PhotoRows = ko.computed(function () {
                var rows = [];
                var currentRow = null;
                var array = _this.Photos();
                for (var i = 0; i < array.length; ++i) {
                    if (i % 4 == 0) {
                        currentRow = new Row();
                        rows.push(currentRow);
                    }
                    currentRow.Photos.push(array[i]);
                }
                return rows;
            });
            var _self = this;
            $('#add_photo_btn').on('click', function (e) {
                e.preventDefault();
                _self._manager.NewPhotoModalModel.Show();
                //$('#add_photo_modal').modal('show');
            });
        }
        AlbumModel.prototype.SetPhotos = function (photos) {
            this.Photos(photos);
            this.Photos.sort(PhotoModel.Compare);
        };
        AlbumModel.prototype.OnDeletePhoto = function (photo) {
            var _self = this;
            Yugglr.Confirm('#delete-photo-message', function ($modal) {
                _self._manager.DeletePhoto(function (result) {
                    if (result.success) {
                        _self.Photos.remove(photo);
                    }
                }, photo);
                $modal.modal('hide');
            });
            return false;
        };
        AlbumModel.prototype.AddPhoto = function (photo) {
            this.Photos.push(photo);
            this.Photos.sort(PhotoModel.Compare);
        };
        AlbumModel.prototype.SelectTemplate = function (photo) {
            var template = 'template-photo';
            return template;
        };
        AlbumModel.prototype.OnCreatePhoto = function () {
            var modalModel = _manager.NewPhotoModalModel;
            modalModel.Show();
            return false;
        };
        AlbumModel.prototype.CanDelete = function () {
            return true;
        };
        return AlbumModel;
    })();
    var PhotoModel = (function () {
        function PhotoModel(photo) {
            this.Id = photo.Id;
            this.ImageUrl = Yugglr.Url.BuildImageUrl(photo.Image, { Width: 900, Height: 500 });
            this.ImageThumbUrl = Yugglr.Url.BuildImageUrl(photo.Image, { Width: 163, Height: 116 });
            this.Name = ko.observable(photo.Name);
            this.Description = photo.Description;
            this.Created = new Date(photo.TimeCreated);
            this.Creator = photo.Creator;
        }
        PhotoModel.Compare = function (x, y) {
            var xName = x.Name();
            var yName = y.Name();
            return xName.localeCompare(yName);
        };
        return PhotoModel;
    })();
    var NewPhotoModalModel = (function () {
        function NewPhotoModalModel() {
            this.Name = ko.observable();
            this.Description = ko.observable();
            this.Validator = null;
        }
        NewPhotoModalModel.prototype.OnCreatePhoto = function () {
            var _this = this;
            if (this.Validator.form()) {
                _manager.CreatePhoto(function (result) {
                    if (result.success) {
                        var model = _manager.AlbumModel;
                        for (var i = 0; i < result.data.length; i++) {
                            model.AddPhoto(new PhotoModel(result.data[i]));
                        }
                    }
                    $('#add_photo_modal').modal('hide');
                    _this.Validator.resetForm();
                }, this);
            }
            return false;
        };
        NewPhotoModalModel.prototype.Show = function () {
            this.Name('');
            this.Description('');
            if (this.Validator == null) {
                this.Validator = $('#add_photo_modal form').validate();
            }
            this.Validator.resetForm();
            $('#add_photo_modal form').resetValidation();
            $('#add_photo_modal').modal('show');
            $('#add_photo_modal form input:first').focus();
        };
        return NewPhotoModalModel;
    })();
    var AlbumManager = (function () {
        function AlbumManager(userId, albumId) {
            var _this = this;
            this._userId = userId;
            this._albumId = albumId;
            this._model = new AlbumModel(this);
            this._newModel = new NewPhotoModalModel();
            this.GetPhotos(function (result) {
                if (result.success) {
                    var albums = result.data;
                    _this._model.SetPhotos(albums.map(function (value, index, array) { return new PhotoModel(value); }));
                    $('#photos a.item_image_holder').fancybox({
                        helpers: {
                            thumbs: {
                                width: 50,
                                height: 50
                            }
                        }
                    });
                }
            });
            ko.applyBindings(this._model, $('#photos').get(0));
            ko.applyBindings(this._newModel, $('#add_photo_modal').get(0));
        }
        Object.defineProperty(AlbumManager.prototype, "AlbumModel", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AlbumManager.prototype, "NewPhotoModalModel", {
            get: function () {
                return this._newModel;
            },
            enumerable: true,
            configurable: true
        });
        AlbumManager.prototype.GetPhotos = function (callback) {
            var url = '/api/social/album/' + this._albumId + '/photos';
            Yugglr.Ajax.Get(callback, url);
        };
        AlbumManager.prototype.CreatePhoto = function (callback, newPhoto) {
            var url = '/api/social/album/' + this._albumId + '/photo';
            Yugglr.Ajax.PostForm(callback, url, '#add_photo_modal form');
        };
        AlbumManager.prototype.DeletePhoto = function (callback, photo) {
            var url = '/api/social/album/' + this._albumId + '/photo/' + photo.Id;
            Yugglr.Ajax.Delete(callback, url);
        };
        return AlbumManager;
    })();
    var _manager;
    var Album;
    (function (Album) {
        function Init(userId, albumId) {
            _manager = new AlbumManager(userId, albumId);
        }
        Album.Init = Init;
    })(Album = Yugglr.Album || (Yugglr.Album = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Album.js.map