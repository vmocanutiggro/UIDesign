module Yugglr {
	export interface IViewableSuggestion {
		viewable: ViewableModel;
		value: string;
	}

	export interface SearchCallback {
		(callback: Ajax.AjaxCallback, term: string, maxItems?: number): void;
	}

	export interface IViewableSearchOptions {
		typeaheadOptions?: TypeaheadeOptions
		callback: (e: JQueryEventObject, suggestion: IViewableSuggestion) => void;
		search: SearchCallback[];
	}

	(($: JQueryStatic) => {
		$.fn.viewablesearch = function (options: IViewableSearchOptions) {
			var to: TypeaheadeOptions = $.extend({
				highlight: true,
				hint: true,
				minLength: 3
			}, options.typeaheadOptions);

			var datasets = $.map(options.search, (search, i) => {
				return {
					source: (query: string, cb: (results: any[]) => any) => {
						search(
							(result: Ajax.AjaxResultT<Viewable[]>) => {
								if (result.success) {
									cb(result.data.map((v, i) => {
										return { viewable: new ViewableModel(v), value: v.Name };
									}));
								} else {
									cb([]);
								}
							},
							query);
					}
				}
			});

			this.each(function () {
				var $t = $(this);

				$t.on('typeahead:selected', (e: JQueryEventObject, suggestion: IViewableSuggestion) => {
					e.preventDefault();

					options.callback(e, suggestion);
				});

				if (datasets.length > 1) {
					$t.typeahead(to, datasets[0], datasets[1]);
				} else {
					$t.typeahead(to, datasets[0]);
				}
			});
			return this;
		};
	})(jQuery);
}

interface JQuery {
	viewablesearch(option: Yugglr.IViewableSearchOptions): JQuery;
} 
