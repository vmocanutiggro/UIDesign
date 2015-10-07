module Yugglr.Documents {

	export interface ILibrary {
		Id: string;
		Name: string;
		Modified: Date;
		Created: Date;
		Description: string;
		IsSystem: boolean;
        IsAdmin: boolean;
        OwnerType: string;
        OwnerId: string;

	}

	export class DocumentsRepository {
		private static ApiBase: string = 'nfsale2.azurewebsites.net/api/social/documents/';

		static GetLibraries(callback: Ajax.AjaxCallbackT<ILibrary[]>, ownerId: string, ownerType: string): void {
			var url = DocumentsRepository.ApiBase + ownerType + '/' + ownerId + '/libraries';
			Ajax.Get(callback, url);
		}

		static DeleteLibrary(callback: Ajax.AjaxCallback, libraryId: string): void {
			var url = DocumentsRepository.ApiBase + 'library/' + libraryId;
			Ajax.Delete(callback, url);
		}

		static GetDocuments(callback: Ajax.AjaxCallbackT<IDocument[]>, libraryId: string): void {
			var url = DocumentsRepository.ApiBase + 'library/' + libraryId + '/documents';
			Ajax.Get(callback, url);
		}

		static DeleteDocument(callback: Ajax.AjaxCallback, documentId: string): void {
			var url = DocumentsRepository.ApiBase + documentId;
			Ajax.Delete(callback, url);
		}

        static CreateLibrary(callback: Ajax.AjaxCallbackT<ILibrary>, form: JQuery, ownerId: string, ownerType: string): void {
            var url = DocumentsRepository.ApiBase + ownerType + '/' + ownerId + '/library';
			Ajax.PostForm(callback, url, form);
		}

		static CreateDocument(callback: Ajax.AjaxCallbackT<IDocument>, libraryId: string, form: JQuery): void {
			var url = DocumentsRepository.ApiBase + 'library/' + libraryId + '/document';
			Ajax.PostForm(callback, url, form);
		}
	}

	class LibraryModel {
		constructor(library: ILibrary) {
			this.Id = library.Id;
			this.Name = library.Name;
			this.Modified = moment(library.Modified).local().format('YYYY-MM-DD hh:mm:ss');
			this.Created = moment(library.Created).local().format('YYYY-MM-DD hh:mm:ss');
            this.Description = library.Description;
            this.Url = library.OwnerType != "Group" ? Url.BuildDocumentLibraryUrl(_manager.ProfileOwnerId, library) : Url.BuildGroupDocumentLibraryUrl(_manager.ProfileOwnerId, library, library.OwnerId, library.OwnerType);
			this.IsSystem = library.IsSystem;
            this.IsAdmin = library.IsAdmin;
            this.OwnerType = library.OwnerType;
		    this.OwnerId = library.OwnerId;

		}

		public Id: string;
		public Name: string;
		public Modified: string;
		public Created: string;
		public Description: string;
		public Url: string;
		public IsSystem: boolean;
        public IsAdmin: boolean;
        public OwnerType: string;
        public OwnerId: string;

		public Delete(): void {
			_manager.DeleteLibrary(this);
		}

		public Share(): void {
			_manager.ShareLibrary(this);
		}
	}

	class LibrariesManager {
		private _ownerId: string;
		private _ownerType: string;
		private _profileOwnerId: string;
		public Libraries: KnockoutObservableArray<LibraryModel>;

		public get ProfileOwnerId(): string {
			return this._profileOwnerId;
		}

		constructor(profileOwnerId: string, ownerId: string, ownerType: string) {
			this._ownerId = ownerId;
			this._profileOwnerId = profileOwnerId;
			this._ownerType = ownerType;
			this.Libraries = ko.observableArray<LibraryModel>([]);

			var _self = this;
			DocumentsRepository.GetLibraries((result: Ajax.AjaxResultT<ILibrary[]>) => {
				if (result.success) {
					var a = result.data;
					for (var i = 0; i < a.length; ++i) {
						this.Libraries.push(new LibraryModel(a[i]));
					}
				}
			}, ownerId, ownerType);

			var $modal = $('#add-library-modal');
			$modal.on('show.bs.modal', function (e) {
				var form = (<HTMLFormElement>$modal.find('form').resetValidation().get(0));
				if (form) {
					form.reset();
				}
			});

			$modal.on('click', 'button[data-action=create]', function (e) {
				e.preventDefault();

				var $form = $(this).closest('form');
				if ($form.valid()) {
					DocumentsRepository.CreateLibrary((result: Ajax.AjaxResultT<ILibrary>) => {
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

		public DeleteLibrary(library: LibraryModel): void {
			var _self = this;
			DocumentsRepository.DeleteLibrary((result: Ajax.AjaxResult) => {
				if (result.success) {
					var i = _self.Libraries.indexOf(library);
					if (i >= 0) {
						_self.Libraries.splice(i, 1);
					}
				}
			}, library.Id);
		}

		public ShareLibrary(library: LibraryModel): void {
		}
	}

	export class DocumentModel {
		public Id: string;
		public Name: string;
		public Modified: string;
		public Created: string;
		public Description: string;
		public IsAdmin: boolean;
		public Url: string;

		constructor(document: IDocument) {
			this.Id = document.Id;
			this.Name = document.Name;
			this.Modified = moment(document.Modified).local().format('YYYY-MM-DD hh:mm:ss');
			this.Created = moment(document.Created).local().format('YYYY-MM-DD hh:mm:ss');
			this.Description = document.Description;
			this.Url = Url.BuildDocumentUrl(document, 'attachment');
			this.IsAdmin = document.IsAdmin;
		}

		public Delete(): void {
			_libraryManager.DeleteDocument(this);
		}

		public Share(): void {
			_libraryManager.ShareDocument(this);
		}
	}

	class LibraryManager {
		private _ownerId: string;
		private _ownerType: string;
		private _profileOwnerId: string;
		public Documents: KnockoutObservableArray<DocumentModel>;

		public get ProfileOwnerId(): string {
			return this._profileOwnerId;
		}

		constructor(profileOwnerId: string, ownerId: string, ownerType: string, libraryId: string) {
			this._ownerId = ownerId;
			this._profileOwnerId = profileOwnerId;
			this._ownerType = ownerType;
			this.Documents = ko.observableArray<LibraryModel>([]);

			var _self = this;
			DocumentsRepository.GetDocuments((result: Ajax.AjaxResultT<IDocument[]>) => {
				if (result.success) {
					var a = result.data;
					for (var i = 0; i < a.length; ++i) {
						this.Documents.push(new DocumentModel(a[i]));
					}
				}
			}, libraryId);

			var $modal = $('#add-document-modal');
			$modal.on('show.bs.modal', function (e) {
				var form = (<HTMLFormElement>$modal.find('form').resetValidation().get(0));
				if (form) {
					form.reset();
				}

				$('[data-provides=fileinput]', $modal).fileinput('clear');
			});

			$modal.on('click', 'button[data-action=create]', function (e) {
				e.preventDefault();

				var $form = $(this).closest('form');
				if ($form.valid()) {
					DocumentsRepository.CreateDocument((result: Ajax.AjaxResultT<IDocument>) => {
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

		public DeleteDocument(document: DocumentModel): void {
			var _self = this;
			DocumentsRepository.DeleteDocument((result: Ajax.AjaxResult) => {
				if (result.success) {
					var i = _self.Documents.indexOf(document);
					if (i >= 0) {
						_self.Documents.splice(i, 1);
					}
				}
			}, document.Id);
		}

		public ShareDocument(document: DocumentModel): void {
		}
	}

	var _manager: LibrariesManager;
	var _libraryManager: LibraryManager;

	export function Init(profileOwnerId: string, ownerId: string, ownerType: string): void {
		_manager = new LibrariesManager(profileOwnerId, ownerId, ownerType);
	}

	export function InitLibrary(profileOwnerId: string, ownerId: string, ownerType: string, libraryId: string): void {
		_libraryManager = new LibraryManager(profileOwnerId, ownerId, ownerType, libraryId);
	}
}