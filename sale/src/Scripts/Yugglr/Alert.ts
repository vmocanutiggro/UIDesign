module Yugglr {
	export function Alert(selector: string, message: string, type: string, permanent?: boolean): void {
		var dismissable = !permanent;

		var html = '<div class="alert alert-' + type;

		if (dismissable) {
			html += ' alert-dismissable';
		}

		html += ' fade in">';

		if (dismissable) {
			html += '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>';
		}

		html += message;

		html += '</div>';

		var $html = $(html);
		var $area = $(selector);
		if ($area.data('settings-alerts') === 'replace') {
			$(selector).empty().append($html);
		} else {
			$(selector).append($html);
		}

		setTimeout(() => {
			$html.alert('close');
		}, 15000);
	}
}
