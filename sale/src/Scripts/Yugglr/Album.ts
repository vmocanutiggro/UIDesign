/// <reference path="Ajax.ts" />

module Yugglr {
    class Row {
        constructor() {
            this.Photos = [];
        }

        Photos: PhotoModel[];
    }

    class AlbumModel {
        constructor(manager: AlbumManager) {
            this._manager = manager;
            this.Photos = ko.observableArray([]);
            this.PhotoRows = ko.computed(() => {
                var rows = [];

                var currentRow: Row = null;

                var array = this.Photos();
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

        Photos: KnockoutObservableArray<PhotoModel>;
        PhotoRows: KnockoutComputed<Row[]>;
        private _manager: AlbumManager;

        public SetPhotos(photos: PhotoModel[]): void {
            this.Photos(photos);
            this.Photos.sort(PhotoModel.Compare);
        }

        public OnDeletePhoto(photo: PhotoModel): boolean {
            var _self = this;

            Yugglr.Confirm('#delete-photo-message', ($modal) => {
                _self._manager.DeletePhoto((result) => {
                    if (result.success) {
                        _self.Photos.remove(photo);
                    }
                }, photo);

                $modal.modal('hide');
            });


            return false;
        }

        public AddPhoto(photo: PhotoModel): void {
            this.Photos.push(photo);
            this.Photos.sort(PhotoModel.Compare);
        }

        public SelectTemplate(photo: PhotoModel): string {
            var template = 'template-photo';
            return template;
        }

        public OnCreatePhoto(): boolean {
            var modalModel = _manager.NewPhotoModalModel;
            modalModel.Show();

            return false;
        }

        public CanDelete(): boolean {
            return true;
        }
    }

    class PhotoModel {
        constructor(photo: Photo) {
            this.Id = photo.Id;
            this.ImageUrl = Url.BuildImageUrl(photo.Image, { Width: 900, Height: 500 });
            this.ImageThumbUrl = Url.BuildImageUrl(photo.Image, { Width: 163, Height: 116 });
            this.Name = ko.observable(photo.Name);
            this.Description = photo.Description;
            this.Created = new Date(photo.TimeCreated)
            this.Creator = photo.Creator
        }

        Id: string;
        Url: string;
        ImageUrl: string;
        ImageThumbUrl: string;
        Name: KnockoutObservable<string>;
        Description: string;
        Created: Date;
        Creator: NameAndUrl;

        public static Compare(x: PhotoModel, y: PhotoModel): number {
            var xName = x.Name();
            var yName = y.Name();

            return xName.localeCompare(yName);
        }
    }

    class NewPhotoModalModel {
        constructor() {
            this.Name = ko.observable<string>();
            this.Description = ko.observable<string>();

            this.Validator = null;
        }

        Validator: JQueryValidation.Validator;
        Name: KnockoutObservable<string>;
        Description: KnockoutObservable<string>;

        public OnCreatePhoto(): boolean {
            if (this.Validator.form()) {
                _manager.CreatePhoto((result) => {
                    if (result.success) {
                        var model = _manager.AlbumModel;
                        for (var i = 0; i < result.data.length; i++) {
                            model.AddPhoto(new PhotoModel(result.data[i]));
                        }
                    }

                    $('#add_photo_modal').modal('hide');
                    this.Validator.resetForm();
                }, this);
            }

            return false;
        }

        public Show(): void {
            this.Name('');
            this.Description('');

            if (this.Validator == null) {
                this.Validator = $('#add_photo_modal form').validate();
            }

            this.Validator.resetForm();
            $('#add_photo_modal form').resetValidation();

            $('#add_photo_modal').modal('show');
            $('#add_photo_modal form input:first').focus();
        }
    }

    class AlbumManager {
        private _userId: string;
        private _albumId: string;
        private _model: AlbumModel;
        private _newModel: NewPhotoModalModel;

        get AlbumModel(): AlbumModel {
            return this._model;
        }

        get NewPhotoModalModel(): NewPhotoModalModel {
            return this._newModel;
        }

        constructor(userId: string, albumId: string) {
            this._userId = userId;
            this._albumId = albumId;
            this._model = new AlbumModel(this);
            this._newModel = new NewPhotoModalModel();

            this.GetPhotos((result) => {
                if (result.success) {
                    var albums: Photo[] = result.data;
                    this._model.SetPhotos(albums.map((value, index, array) => new PhotoModel(value)));

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

        GetPhotos(callback: Ajax.AjaxCallback): void {
            var url = 'nfsale2.azurewebsites.net/api/social/album/' + this._albumId + '/photos';
            Ajax.Get(callback, url);
        }

        CreatePhoto(callback: Ajax.AjaxCallback, newPhoto: NewPhotoModalModel): void {
            var url = 'nfsale2.azurewebsites.net/api/social/album/' + this._albumId + '/photo';
            Ajax.PostForm(callback, url, '#add_photo_modal form');
        }

        DeletePhoto(callback: Ajax.AjaxCallback, photo: PhotoModel): void {
            var url = 'nfsale2.azurewebsites.net/api/social/album/' + this._albumId + '/photo/' + photo.Id;
            Ajax.Delete(callback, url);
        }
    }

    var _manager: AlbumManager;

    export module Album {
        export function Init(userId: string, albumId: string): void {
            _manager = new AlbumManager(userId, albumId);
        }
    }
} 