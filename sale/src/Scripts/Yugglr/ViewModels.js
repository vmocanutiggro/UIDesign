var Yugglr;
(function (Yugglr) {
    var PhotoModel = (function () {
        function PhotoModel(photo) {
            this.Id = photo.Id;
            this.ImageThumbUrl = Yugglr.Url.BuildImageUrl(photo.Image, { Width: 200, Height: 200 });
            this.ImageUrl = Yugglr.Url.BuildImageUrl(photo.Image, { Width: 1280 });
            this.Name = photo.Name;
            this.Description = photo.Description;
            this.TimeCreated = photo.TimeCreated;
            this.Creator = photo.Creator;
        }
        return PhotoModel;
    })();
    Yugglr.PhotoModel = PhotoModel;
    var NameAndUrlModel = (function () {
        function NameAndUrlModel(nameAndUrl) {
            this.Id = nameAndUrl.Id;
            this.Name = nameAndUrl.Name;
            this.Url = nameAndUrl.Url;
        }
        return NameAndUrlModel;
    })();
    Yugglr.NameAndUrlModel = NameAndUrlModel;
    var ViewableModel = (function () {
        function ViewableModel(viewable) {
            this.Id = viewable.Id;
            this.Name = viewable.Name;
            this.Url = viewable.Url;
            this.Type = viewable.Type;
            this.CoverPhotoUrl = Yugglr.Url.BuildImageUrl(viewable.CoverPhoto, { Width: 50, Height: 50 }, this.GetDefaultImage());
            this.IsAdminMember = viewable.IsAdminMember;
            this.IsOwner = viewable.IsOwner;
        }
        ViewableModel.prototype.GetDefaultImage = function () {
            switch (this.Type.toLowerCase()) {
                default:
                case 'user':
                    return '/images/elements/default_userpicture.png';
                case 'group':
                    return '/images/elements/default_group.png';
                case 'family':
                    return '/images/elements/family_default_icon.png';
            }
        };
        return ViewableModel;
    })();
    Yugglr.ViewableModel = ViewableModel;
    var UserDetails = (function () {
        function UserDetails(user) {
            this.Id = user.Id;
            this.FirstName = user.FirstName;
            this.LastName = user.LastName;
            this.UserName = user.UserName;
        }
        return UserDetails;
    })();
    Yugglr.UserDetails = UserDetails;
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=ViewModels.js.map