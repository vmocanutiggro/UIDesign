var Yugglr;
(function (Yugglr) {
    var GoogleMaps;
    (function (GoogleMaps) {
        var LocationMap = (function () {
            function LocationMap(selector) {
                this._selector = selector;
                this.SetupMap();
            }
            LocationMap.prototype.Rebuild = function () {
                google.maps.event.trigger(this._map, 'resize');
                this._map.setZoom(this._map.getZoom());
                this._marker.setPosition(this._marker.getPosition());
            };
            LocationMap.prototype.Show = function (lat, long) {
                var position = new google.maps.LatLng(lat, long);
                this._map.setCenter(position);
                this._marker.setPosition(position);
                var $field = $(this._selector);
                $field.siblings('.location-longitude').val(position.lng().toString());
                $field.siblings('.location-latitude').val(position.lat().toString());
            };
            LocationMap.prototype.SetupMap = function () {
                var _this = this;
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
                this._map.addListener('drag', function () {
                    var center = _this._map.getCenter();
                    $field.siblings('.location-longitude').val(center.lng().toString());
                    $field.siblings('.location-latitude').val(center.lat().toString());
                    _this._marker.setPosition(center);
                });
                $field.show();
            };
            return LocationMap;
        })();
        var LocationTextField = (function () {
            function LocationTextField(selector, map) {
                var _this = this;
                this._geocoder = new google.maps.Geocoder();
                this._timeoutHandle = null;
                this._selector = selector;
                this._map = map;
                var $field = $(this._selector);
                var options = {
                    highlight: true,
                    hint: true,
                    minLength: 3
                };
                var dataset = {
                    source: function (query, cb) {
                        _this._geocoder.geocode({
                            address: $field.val()
                        }, function (results, status) {
                            var mapped = $.map(results, function (e, i) {
                                return { location: e.geometry.location, value: e.formatted_address };
                            });
                            cb(mapped);
                        });
                    }
                };
                $field
                    .on('typeahead:selected', function (e, suggestion, name) {
                    _this._map.Show(suggestion.location.lat(), suggestion.location.lng());
                })
                    .typeahead(options, dataset);
            }
            LocationTextField.prototype.Rebuild = function () {
                this._map.Rebuild();
            };
            LocationTextField.prototype.Show = function (lat, longit) {
                this._map.Show(lat, longit);
            };
            LocationTextField.prototype.OnGeocodeResult = function (results, status) {
                this._timeoutHandle = null;
                if (results.length > 0) {
                    var result = results[0];
                    this._map.Show(result.geometry.location.lat(), result.geometry.location.lng());
                }
                var $field = $(this._selector);
            };
            LocationTextField.prototype.OnFieldTypingTimeout = function () {
                var _this = this;
                var $field = $(this._selector);
                this._geocoder.geocode({
                    address: $field.val()
                }, function (results, status) { _this.OnGeocodeResult(results, status); });
            };
            return LocationTextField;
        })();
        function CreateGeocoderField(fieldSelector, mapSelector) {
            var $field = $(fieldSelector);
            var field = $field.data('yugglr-location-field');
            if (!field) {
                field = new LocationTextField(fieldSelector, new LocationMap(mapSelector));
                $field.data('yugglr-location-field', field);
            }
            else {
                field.Rebuild();
            }
        }
        GoogleMaps.CreateGeocoderField = CreateGeocoderField;
        function RebuildFieldMap(fieldSelector) {
            var $field = fieldSelector;
            var field = $field.data('yugglr-location-field');
            if (field) {
                field.Rebuild();
            }
        }
        GoogleMaps.RebuildFieldMap = RebuildFieldMap;
        function ShowFieldMap(fieldSelector, lat, longit) {
            var $field = fieldSelector;
            var field = $field.data('xcorebusiness-location-field');
            if (field) {
                field.Show(lat, longit);
            }
        }
        GoogleMaps.ShowFieldMap = ShowFieldMap;
        function VioShowFieldMap(fieldSelector, mapSelector, lat, longit) {
            var $field = $(fieldSelector);
            var field = $field.data('xcorebusiness-location-field');
            if (!field) {
                field = new LocationTextField(fieldSelector, new LocationMap(mapSelector));
                $field.data('xcorebusiness-location-field', field);
                field = $field.data('xcorebusiness-location-field');
            }
            if (field) {
                field.Show(lat, longit);
            }
        }
        GoogleMaps.VioShowFieldMap = VioShowFieldMap;
        function BuildStaticMap(mapSelector, options) {
            var location = options.lat + ',' + options.long;
            var url = '//maps.googleapis.com/maps/api/staticmap?center=';
            url += encodeURIComponent(location) + '&size=500x245&language=' + $('html').attr('lang');
            url += '&zoom=16';
            url += '&markers=' + encodeURIComponent('color:' + options.markerColor + '|' + location);
            return url;
        }
        GoogleMaps.BuildStaticMap = BuildStaticMap;
    })(GoogleMaps = Yugglr.GoogleMaps || (Yugglr.GoogleMaps = {}));
})(Yugglr || (Yugglr = {}));
//# sourceMappingURL=GoogleMaps.js.map