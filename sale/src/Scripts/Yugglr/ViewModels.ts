module Yugglr {
	export interface IImage {
		Id: string;
		Name: string;
	}

	export interface IDocument {
		Id: string;
		Name: string;
		Modified: Date;
		Created: Date;
		Description: string;
		IsAdmin: boolean;
	}

	export interface Album {
		Id: string;
		Name: string;
		TimeCreated: string;
		TimeModified: string;
		Creator: NameAndUrl;
		Owner: NameAndUrl;
		HasModifyAccess: boolean;
		SystemType: AlbumSystemType;
		ShareKind: ShareKind;
		Image: IImage;
	}

	export interface NameAndUrl {
		Id: string;
		Name: string;
		Url: string;
	}

	export interface Viewable {
		Id: string;
		Name: string;
		Url: string;
		Type: string;
        CoverPhoto: IImage;
        IsAdminMember: boolean;
        IsOwner: boolean;
	}

	export interface Photo {
		Id: string;
		Image: IImage;
		Name: string;
		Description: string;
		TimeCreated: string;
		Creator: NameAndUrl;
	}

    export interface IUserDetails {
        Id: string;
        FirstName: string;
        LastName: string;
        UserName: string;
    }

	export class PhotoModel {
		constructor(photo: Photo) {
			this.Id = photo.Id;
			this.ImageThumbUrl = Url.BuildImageUrl(photo.Image, { Width: 200, Height: 200 });
			this.ImageUrl = Url.BuildImageUrl(photo.Image, { Width: 1280 });
			this.Name = photo.Name;
			this.Description = photo.Description;
			this.TimeCreated = photo.TimeCreated;
			this.Creator = photo.Creator;
		}

		Id: string;
		ImageThumbUrl: string;
		ImageUrl: string;
		Name: string;
		Description: string;
		TimeCreated: string;
		Creator: NameAndUrl;
	}

	export class NameAndUrlModel {
		constructor(nameAndUrl: NameAndUrl) {
			this.Id = nameAndUrl.Id;
			this.Name = nameAndUrl.Name;
			this.Url = nameAndUrl.Url;
		}

		Id: string;
		Name: string;
		Url: string;
	}


	export class ViewableModel {
		Id: string;
		Name: string;
		Type: string;
		Url: string;
        CoverPhotoUrl: string;
        IsAdminMember: boolean;
        IsOwner: boolean;

		constructor(viewable: Viewable) {
			this.Id = viewable.Id;
			this.Name = viewable.Name;
			this.Url = viewable.Url;
			this.Type = viewable.Type;
            this.CoverPhotoUrl = Url.BuildImageUrl(viewable.CoverPhoto, { Width: 50, Height: 50 }, this.GetDefaultImage());
		    this.IsAdminMember = viewable.IsAdminMember;
            this.IsOwner = viewable.IsOwner;
		}

		private GetDefaultImage(): string {
			switch (this.Type.toLowerCase()) {
				default:
				case 'user':
					return '/images/elements/default_userpicture.png';
				case 'group':
					return '/images/elements/default_group.png';
				case 'family':
					return '/images/elements/family_default_icon.png';
			}
		}
	}
    export class UserDetails {
        constructor(user: IUserDetails) {
            this.Id = user.Id;
            this.FirstName = user.FirstName;
            this.LastName = user.LastName;
            this.UserName = user.UserName;
        }

        Id: string;
        FirstName: string;
        LastName: string;
        UserName: string;
    }
} 