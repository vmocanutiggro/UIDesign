module Yugglr.GoogleMaps {
	class LocationMap {
		private _map: google.maps.Map;
		private _marker: google.maps.Marker;
		private _selector: string;
		private _fieldHTML: string;

		constructor(selector: string) {
			this._selector = selector;
			this.SetupMap();
		}

		public Rebuild(): void {
			google.maps.event.trigger(this._map, 'resize');
			this._map.setZoom(this._map.getZoom());
			this._marker.setPosition(this._marker.getPosition());
		}

		public Show(lat: number, long: number): void {
			var position = new google.maps.LatLng(lat, long);
			this._map.setCenter(position);
			this._marker.setPosition(position);

			var $field = $(this._selector);

			$field.siblings('.location-longitude').val(position.lng().toString());
			$field.siblings('.location-latitude').val(position.lat().toString());
		}

		private SetupMap(): void {
			var $field = $(this._selector);
			var field = $field.get(0);

			this._fieldHTML = field.outerHTML;

			this._map = new google.maps.Map($field.get(0), {
				zoom: 12,
				panControl: false,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			});

			var position = new google.maps.LatLng(61.99806477529907, 15.012702941894531);

			this._map.setCenter(position);

			this._marker = new google.maps.Marker({
				position: new google.maps.LatLng(61.99806477529907, 15.012702941894531),
				map: this._map,
				draggable: false,
				animation: google.maps.Animation.DROP
			});

			this._map.addListener('drag',() => {
				var center = this._map.getCenter();

				$field.siblings('.location-longitude').val(center.lng().toString());
				$field.siblings('.location-latitude').val(center.lat().toString());

				this._marker.setPosition(center);
			});

			$field.show();
		}
	}

	class LocationTextField {
		private _selector: string;
		private _map: LocationMap;
		private _geocoder = new google.maps.Geocoder();
		private _timeoutHandle: number = null;

		constructor(selector: string, map: LocationMap) {
			this._selector = selector;
			this._map = map;

			var $field = $(this._selector);

			var options = {
				highlight: true,
				hint: true,
				minLength: 3
			};

			var dataset = {
				source: (query: string, cb: (results: any[]) => any) => {
					this._geocoder.geocode({
						address: $field.val()
					},(results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
							var mapped = $.map(results,(e, i) => {
								return { location: e.geometry.location, value: e.formatted_address };
							});

							cb(mapped);
						});
				}
			};

			$field
				.on('typeahead:selected',(e: JQueryEventObject, suggestion: any, name: string) => {
				this._map.Show(suggestion.location.lat(), suggestion.location.lng());
			})
				.typeahead(options, dataset);
		}

		public Rebuild(): void {
			this._map.Rebuild();
		}

        public Show(lat: number, longit: number): void {
            this._map.Show(lat, longit);
        }
		private OnGeocodeResult(results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus): void {
			this._timeoutHandle = null;

			if (results.length > 0) {
				var result = results[0];

				this._map.Show(
					result.geometry.location.lat(),
					result.geometry.location.lng());
			}


			var $field = $(this._selector);
		}

		private OnFieldTypingTimeout(): void {
			var $field = $(this._selector);

			this._geocoder.geocode({
				address: $field.val()
			},(results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => { this.OnGeocodeResult(results, status); });
		}
	}

	export function CreateGeocoderField(fieldSelector: string, mapSelector: string): void {
		var $field = $(fieldSelector);
		var field = <LocationTextField>$field.data('yugglr-location-field');
		if (!field) {
			field = new LocationTextField(fieldSelector, new LocationMap(mapSelector));
			$field.data('yugglr-location-field', field);
		} else {
			field.Rebuild();
		}
	}

	export function RebuildFieldMap(fieldSelector: JQuery): void {
		var $field = fieldSelector;
		var field = <LocationTextField>$field.data('yugglr-location-field');
		if (field) {
			field.Rebuild();
		}
	}

    export function ShowFieldMap(fieldSelector: JQuery, lat: number, longit: number): void {
        var $field = fieldSelector;
        var field = <LocationTextField>$field.data('xcorebusiness-location-field');
        if (field) {
            field.Show(lat, longit);
        }
    }

    export function VioShowFieldMap(fieldSelector: string, mapSelector: string, lat: number, longit: number): void {
        var $field = $(fieldSelector);
        var field = <LocationTextField>$field.data('xcorebusiness-location-field');

        if (!field) {
            field = new LocationTextField(fieldSelector, new LocationMap(mapSelector));
            $field.data('xcorebusiness-location-field', field);
            field = <LocationTextField>$field.data('xcorebusiness-location-field')
        }

        if (field) {
            field.Show(lat, longit);
        }
    }

	export interface StaticMapOptions {
		lat: number;
		long: number;
		location: string;
		markerColor: string;
	}

	export function BuildStaticMap(mapSelector: JQuery, options: StaticMapOptions): string {
		var location = options.lat + ',' + options.long;

		var url = '//maps.googleapis.com/maps/api/staticmap?center=';
		url += encodeURIComponent(location) + '&size=500x245&language=' + $('html').attr('lang');
		url += '&zoom=16';
		url += '&markers=' + encodeURIComponent('color:' + options.markerColor + '|' + location);

		return url;
	}
}
