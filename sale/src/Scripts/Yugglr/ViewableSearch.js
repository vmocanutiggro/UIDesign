var Yugglr;
(function (Yugglr) {
    (function ($) {
        $.fn.viewablesearch = function (options) {
            var to = $.extend({
                highlight: true,
                hint: true,
                minLength: 3
            }, options.typeaheadOptions);
            var datasets = $.map(options.search, function (search, i) {
                return {
                    source: function (query, cb) {
                        search(function (result) {
                            if (result.success) {
                                cb(result.data.map(function (v, i) {
                                    return { viewable: new Yugglr.ViewableModel(v), value: v.Name };
                                }));
                            }
                            else {
                                cb([]);
                            }
                        }, query);
                    }
                };
            });
            this.each(function () {
                var $t = $(this);
                $t.on('typeahead:selected', function (e, suggestion) {
                    e.preventDefault();
                    options.callback(e, suggestion);
                });
                if (datasets.length > 1) {
                    $t.typeahead(to, datasets[0], datasets[1]);
                }
                else {
                    $t.typeahead(to, datasets[0]);
                }
            });
            return this;
        };
    })(jQuery);
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=ViewableSearch.js.map