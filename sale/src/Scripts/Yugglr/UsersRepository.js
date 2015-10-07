var Yugglr;
(function (Yugglr) {
    var UsersRepository = (function () {
        function UsersRepository() {
        }
        UsersRepository.FindUser = function (callback, term, maxItems) {
            var url = 'nfsale2.azurewebsites.net/api/social/user/search/' + encodeURIComponent(term);
            if (maxItems) {
                url += '/' + maxItems;
            }
            Yugglr.Ajax.Get(callback, url);
        };
        return UsersRepository;
    })();
    Yugglr.UsersRepository = UsersRepository;
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=UsersRepository.js.map