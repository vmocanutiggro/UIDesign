module Yugglr {
	export module CalendarEvent {
		$(document).on('click', '.location-collapse', function (e) {
			e.preventDefault();

			$(this)
				.closest('.location-container')
				.toggleClass('collapsed');
		});
	}
}