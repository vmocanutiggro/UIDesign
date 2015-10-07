//
/*	Fix to keep minification from producing incorrect code.
	Don't know why it happens but this comment fixes it. Magic!
*/
(function ($) {
	$.validator.unobtrusive.adapters.addBool("checked", "required");
	$.validator.unobtrusive.adapters.add('video', function (options) {
		if (options.message) {
			options.messages['video'] = options.message;
		}
	});

	$.validator.addMethod('video', function (value, element) {
		return this.optional(element) || Yugglr.Video.ValidateVideo(value);
	}, 'Please specify a valid Vimeo or Youtube url.');

	$.validator.addClassRules('video', { 'video': true });
}(jQuery));