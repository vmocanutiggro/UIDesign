var Yugglr;
(function (Yugglr) {
    var Documents;
    (function (Documents) {
        var DocumentsRepository = (function () {
            function DocumentsRepository() {
            }
            DocumentsRepository.GetLibraries = function (callback, ownerId, ownerType) {
                var url = DocumentsRepository.ApiBase + ownerType + '/' + ownerId + '/libraries';
                Yugglr.Ajax.Get(callback, url);
            };
            DocumentsRepository.DeleteLibrary = function (callback, libraryId) {
                var url = DocumentsRepository.ApiBase + 'library/' + libraryId;
                Yugglr.Ajax.Delete(callback, url);
            };
            DocumentsRepository.GetDocuments = function (callback, libraryId) {
                var url = DocumentsRepository.ApiBase + 'library/' + libraryId + '/documents';
                Yugglr.Ajax.Get(callback, url);
            };
            DocumentsRepository.DeleteDocument = function (callback, documentId) {
                var url = DocumentsRepository.ApiBase + documentId;
                Yugglr.Ajax.Delete(callback, url);
            };
            DocumentsRepository.CreateLibrary = function (callback, form, ownerId, ownerType) {
                var url = DocumentsRepository.ApiBase + ownerType + '/' + ownerId + '/library';
                Yugglr.Ajax.PostForm(callback, url, form);
            };
            DocumentsRepository.CreateDocument = function (callback, libraryId, form) {
                var url = DocumentsRepository.ApiBase + 'library/' + libraryId + '/document';
                Yugglr.Ajax.PostForm(callback, url, form);
            };
            DocumentsRepository.ApiBase = '/api/social/documents/';
            return DocumentsRepository;
        })();
        Documents.DocumentsRepository = DocumentsRepository;
        var LibraryModel = (function () {
            function LibraryModel(library) {
                this.Id = library.Id;
                this.Name = library.Name;
                this.Modified = moment(library.Modified).local().format('YYYY-MM-DD hh:mm:ss');
                this.Created = moment(library.Created).local().format('YYYY-MM-DD hh:mm:ss');
                this.Description = library.Description;
                this.Url = library.OwnerType != "Group" ? Yugglr.Url.BuildDocumentLibraryUrl(_manager.ProfileOwnerId, library) : Yugglr.Url.BuildGroupDocumentLibraryUrl(_manager.ProfileOwnerId, library, library.OwnerId, library.OwnerType);
                this.IsSystem = library.IsSystem;
                this.IsAdmin = library.IsAdmin;
                this.OwnerType = library.OwnerType;
                this.OwnerId = library.OwnerId;
            }
            LibraryModel.prototype.Delete = function () {
                _manager.DeleteLibrary(this);
            };
            LibraryModel.prototype.Share = function () {
                _manager.ShareLibrary(this);
            };
            return LibraryModel;
        })();
        var LibrariesManager = (function () {
            function LibrariesManager(profileOwnerId, ownerId, ownerType) {
                var _this = this;
                this._ownerId = ownerId;
                this._profileOwnerId = profileOwnerId;
                this._ownerType = ownerType;
                this.Libraries = ko.observableArray([]);
                var _self = this;
                DocumentsRepository.GetLibraries(function (result) {
                    if (result.success) {
                        var a = result.data;
                        for (var i = 0; i < a.length; ++i) {
                            _this.Libraries.push(new LibraryModel(a[i]));
                        }
                    }
                }, ownerId, ownerType);
                var $modal = $('#add-library-modal');
                $modal.on('show.bs.modal', function (e) {
                    var form = $modal.find('form').resetValidation().get(0);
                    if (form) {
                        form.reset();
                    }
                });
                $modal.on('click', 'button[data-action=create]', function (e) {
                    e.preventDefault();
                    var $form = $(this).closest('form');
                    if ($form.valid()) {
                        DocumentsRepository.CreateLibrary(function (result) {
                            if (result.success) {
                                _manager.Libraries.push(new LibraryModel(result.data));
                            }
                            $modal.modal('hide');
                            $form.resetValidation();
                        }, $form, ownerId, ownerType);
                    }
                });
                ko.applyBindings(this, document.getElementById('libraries'));
            }
            Object.defineProperty(LibrariesManager.prototype, "ProfileOwnerId", {
                get: function () {
                    return this._profileOwnerId;
                },
                enumerable: true,
                configurable: true
            });
            LibrariesManager.prototype.DeleteLibrary = function (library) {
                var _self = this;
                DocumentsRepository.DeleteLibrary(function (result) {
                    if (result.success) {
                        var i = _self.Libraries.indexOf(library);
                        if (i >= 0) {
                            _self.Libraries.splice(i, 1);
                        }
                    }
                }, library.Id);
            };
            LibrariesManager.prototype.ShareLibrary = function (library) {
            };
            return LibrariesManager;
        })();
        var DocumentModel = (function () {
            function DocumentModel(document) {
                this.Id = document.Id;
                this.Name = document.Name;
                this.Modified = moment(document.Modified).local().format('YYYY-MM-DD hh:mm:ss');
                this.Created = moment(document.Created).local().format('YYYY-MM-DD hh:mm:ss');
                this.Description = document.Description;
                this.Url = Yugglr.Url.BuildDocumentUrl(document, 'attachment');
                this.IsAdmin = document.IsAdmin;
            }
            DocumentModel.prototype.Delete = function () {
                _libraryManager.DeleteDocument(this);
            };
            DocumentModel.prototype.Share = function () {
                _libraryManager.ShareDocument(this);
            };
            return DocumentModel;
        })();
        Documents.DocumentModel = DocumentModel;
        var LibraryManager = (function () {
            function LibraryManager(profileOwnerId, ownerId, ownerType, libraryId) {
                var _this = this;
                this._ownerId = ownerId;
                this._profileOwnerId = profileOwnerId;
                this._ownerType = ownerType;
                this.Documents = ko.observableArray([]);
                var _self = this;
                DocumentsRepository.GetDocuments(function (result) {
                    if (result.success) {
                        var a = result.data;
                        for (var i = 0; i < a.length; ++i) {
                            _this.Documents.push(new DocumentModel(a[i]));
                        }
                    }
                }, libraryId);
                var $modal = $('#add-document-modal');
                $modal.on('show.bs.modal', function (e) {
                    var form = $modal.find('form').resetValidation().get(0);
                    if (form) {
                        form.reset();
                    }
                    $('[data-provides=fileinput]', $modal).fileinput('clear');
                });
                $modal.on('click', 'button[data-action=create]', function (e) {
                    e.preventDefault();
                    var $form = $(this).closest('form');
                    if ($form.valid()) {
                        DocumentsRepository.CreateDocument(function (result) {
                            if (result.success) {
                                _libraryManager.Documents.push(new DocumentModel(result.data));
                            }
                            $modal.modal('hide');
                            $form.resetValidation();
                        }, libraryId, $form);
                    }
                });
                ko.applyBindings(this, document.getElementById('documents'));
            }
            Object.defineProperty(LibraryManager.prototype, "ProfileOwnerId", {
                get: function () {
                    return this._profileOwnerId;
                },
                enumerable: true,
                configurable: true
            });
            LibraryManager.prototype.DeleteDocument = function (document) {
                var _self = this;
                DocumentsRepository.DeleteDocument(function (result) {
                    if (result.success) {
                        var i = _self.Documents.indexOf(document);
                        if (i >= 0) {
                            _self.Documents.splice(i, 1);
                        }
                    }
                }, document.Id);
            };
            LibraryManager.prototype.ShareDocument = function (document) {
            };
            return LibraryManager;
        })();
        var _manager;
        var _libraryManager;
        function Init(profileOwnerId, ownerId, ownerType) {
            _manager = new LibrariesManager(profileOwnerId, ownerId, ownerType);
        }
        Documents.Init = Init;
        function InitLibrary(profileOwnerId, ownerId, ownerType, libraryId) {
            _libraryManager = new LibraryManager(profileOwnerId, ownerId, ownerType, libraryId);
        }
        Documents.InitLibrary = InitLibrary;
    })(Documents = Yugglr.Documents || (Yugglr.Documents = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Documents.js.map