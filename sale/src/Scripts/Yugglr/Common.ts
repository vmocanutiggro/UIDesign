module Yugglr {
	export module Guid {
		export var Empty: string = '00000000-0000-0000-0000-000000000000';
	}

	var language = null;
	export function Language(): string {
		if (language == null) {
			language = $('html').attr('lang') || 'en';
		}

		return language;
	}
}
