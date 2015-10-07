module Yugglr.Url {
	var language = $('html').attr('lang');

	export interface IImageUrlInformation {
		Id: string;
		Name: string;
	}

	export interface IDocumentUrlInformation {
		Id: string;
		Name: string;
	}

	export interface IDocumentLibraryUrlInformation {
		Id: string;
	}

	export interface IImageDimensions {
		Width?: number;
		Height?: number;
	}

	export interface IGroupID {
		Type: number;
		Id: string;
	}

	export function BuildEventUrl(profileType: string, profileId: string, eventId: string): string {
		var url = '/' + language + '/' + profileType + '/' + profileId + '/event/' + eventId;
		return url;
	}

	export function BuildImageUrl(image: IImageUrlInformation, dimensions?: IImageDimensions, defaultUrl?: string): string {
		if (!image) {
			return defaultUrl;
		}

		var url = '/ImageStore/' + image.Id;

		if (dimensions) {
			var s = GetDimensionString(dimensions);
			if (s) {
				url += '/' + s;
			}
		}

		return url + '/' + image.Name;
	}

	export function BuildDocumentUrl(document: IDocumentUrlInformation, disposition?: string, defaultUrl?: string): string {
		if (!document) {
			return defaultUrl;
		}

		var url = '/DocumentStore/';
		if (disposition) {
			url += disposition + '/';
		}

		url += document.Id;

		return url + '/' + document.Name;
	}

	export function BuildDocumentLibraryUrl(profileId: string, library: IDocumentLibraryUrlInformation, defaultUrl?: string): string {
		if (!library) {
			return defaultUrl;
		}

		var url = '/' + language + '/profile/' + profileId + '/Library/' + library.Id;
		return url;
    }

    export function BuildGroupDocumentLibraryUrl(profileId: string, library: IDocumentLibraryUrlInformation, ownerId: string, ownerType: string, defaultUrl?: string): string {
        if (!library) {
            return defaultUrl;
        }

        var controllerName = "";
        switch (ownerType) {
			case "Group":

				if ($(location).attr('href').indexOf("/Family/") > 0)
					controllerName = "Family";
				else
					if ($(location).attr('href').indexOf("/Groups/") > 0)
						controllerName = "Groups";
				break;
            default:
        }
        var url = '/' + language + '/profile/' + profileId + '/' + controllerName + '/' + ownerId + '/Library/' + library.Id;
        return url;
    }

	export function BuildProfileGroupUrl(profileId: string, groupType: string, groupId?: string): string {
		var url = '/' + language + '/profile/' + profileId + '/' + groupType;
		if (groupId) {
			url += '/' + groupId;
		}

		return url;
	}

	export function BuildProfileGroupObjectUrl(profileId: string, groupType: string, groupId: string, objectType: string, objectId?: string): string {
		var url = '/' + language + '/profile/' + profileId + '/' + groupType + '/' + groupId + '/' + objectType;
		if (objectId) {
			url += objectId;
		}

		return url;
	}

	export function BuildAlbumUrl(album: Album, profileId: string, group?: IGroupID): string {
		var url = '/' + language + '/profile/' + profileId;
		if (group) {
			var typeName = group.Type == 0 ? 'groups' : 'family';
			url += '/' + typeName + '/' + group.Id;
		}

		url += '/album/' + album.Id;

		return url;
	}

	function GetDimensionString(dimensions: IImageDimensions): string {
		if (!dimensions.Width && !dimensions.Height) {
			return null;
		}

		var result = '';
		if (dimensions.Width) {
			result += 'w' + Math.floor(dimensions.Width);
		}

		if (dimensions.Height) {
			result += 'h' + Math.floor(dimensions.Height);
		}

		return result;
	}
}