var Yugglr;
(function (Yugglr) {
    var GroupsRepository = (function () {
        function GroupsRepository() {
        }
        GroupsRepository.Find = function (callback, term, maxItems) {
            var url = '/api/social/group/search/' + encodeURIComponent(term);
            if (maxItems) {
                url += '/' + maxItems;
            }
            Yugglr.Ajax.Get(callback, url);
        };
        return GroupsRepository;
    })();
    Yugglr.GroupsRepository = GroupsRepository;
    var FamiliesRepository = (function () {
        function FamiliesRepository() {
        }
        FamiliesRepository.Find = function (callback, term, maxItems) {
            var url = '/api/social/family/search/' + encodeURIComponent(term);
            if (maxItems) {
                url += '/' + maxItems;
            }
            Yugglr.Ajax.Get(callback, url);
        };
        return FamiliesRepository;
    })();
    Yugglr.FamiliesRepository = FamiliesRepository;
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=GroupsRepositories.js.map