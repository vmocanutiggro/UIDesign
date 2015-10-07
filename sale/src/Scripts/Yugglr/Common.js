var Yugglr;
(function (Yugglr) {
    var Guid;
    (function (Guid) {
        Guid.Empty = '00000000-0000-0000-0000-000000000000';
    })(Guid = Yugglr.Guid || (Yugglr.Guid = {}));
    var language = null;
    function Language() {
        if (language == null) {
            language = $('html').attr('lang') || 'en';
        }
        return language;
    }
    Yugglr.Language = Language;
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=Common.js.map