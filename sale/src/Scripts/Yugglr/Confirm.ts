module Yugglr {
	var $modal = $('#confirmation_modal');
	var $confirm = $('.confirm-btn', $modal);
	var $deny = $('.deny-btn', $modal);
	var $title = $('.modal-title', $modal);
	var $body = $('.modal-body', $modal);

	export function Confirm(template: string, onClick: ($modal: JQuery) => void) {
		$confirm.unbind().click(function (e: JQueryEventObject) {
			e.preventDefault();
			onClick($modal);
		});

		var $template = $(template);
		

		$title.text($template.data('title'));
		$confirm.text($template.data('confirm-text'));
		$deny.text($template.data('deny-text'));
		$body.html($template.html());

		$modal.modal('show');
	}
} 