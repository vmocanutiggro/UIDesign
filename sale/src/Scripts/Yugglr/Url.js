var Yugglr;
(function (Yugglr) {
    var Url;
    (function (Url) {
        var language = $('html').attr('lang');
        function BuildEventUrl(profileType, profileId, eventId) {
            var url = '/' + language + '/' + profileType + '/' + profileId + '/event/' + eventId;
            return url;
        }
        Url.BuildEventUrl = BuildEventUrl;
        function BuildImageUrl(image, dimensions, defaultUrl) {
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
        Url.BuildImageUrl = BuildImageUrl;
        function BuildDocumentUrl(document, disposition, defaultUrl) {
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
        Url.BuildDocumentUrl = BuildDocumentUrl;
        function BuildDocumentLibraryUrl(profileId, library, defaultUrl) {
            if (!library) {
                return defaultUrl;
            }
            var url = '/' + language + '/profile/' + profileId + '/Library/' + library.Id;
            return url;
        }
        Url.BuildDocumentLibraryUrl = BuildDocumentLibraryUrl;
        function BuildGroupDocumentLibraryUrl(profileId, library, ownerId, ownerType, defaultUrl) {
            if (!library) {
                return defaultUrl;
            }
            var controllerName = "";
            switch (ownerType) {
                case "Group":
                    if ($(location).attr('href').indexOf("/Family/") > 0)
                        controllerName = "Family";
                    else if ($(location).attr('href').indexOf("/Groups/") > 0)
                        controllerName = "Groups";
                    break;
                default:
            }
            var url = '/' + language + '/profile/' + profileId + '/' + controllerName + '/' + ownerId + '/Library/' + library.Id;
            return url;
        }
        Url.BuildGroupDocumentLibraryUrl = BuildGroupDocumentLibraryUrl;
        function BuildProfileGroupUrl(profileId, groupType, groupId) {
            var url = '/' + language + '/profile/' + profileId + '/' + groupType;
            if (groupId) {
                url += '/' + groupId;
            }
            return url;
        }
        Url.BuildProfileGroupUrl = BuildProfileGroupUrl;
        function BuildProfileGroupObjectUrl(profileId, groupType, groupId, objectType, objectId) {
            var url = '/' + language + '/profile/' + profileId + '/' + groupType + '/' + groupId + '/' + objectType;
            if (objectId) {
                url += objectId;
            }
            return url;
        }
        Url.BuildProfileGroupObjectUrl = BuildProfileGroupObjectUrl;
        function BuildAlbumUrl(album, profileId, group) {
            var url = '/' + language + '/profile/' + profileId;
            if (group) {
                var typeName = group.Type == 0 ? 'groups' : 'family';
                url += '/' + typeName + '/' + group.Id;
            }
            url += '/album/' + album.Id;
            return url;
        }
        Url.BuildAlbumUrl = BuildAlbumUrl;
        function GetDimensionString(dimensions) {
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
    })(Url = Yugglr.Url || (Yugglr.Url = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Url.js.map