(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.L || (g.L = {})).Routing = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.domain +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],2:[function(require,module,exports){
var polyline = {};

// Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
//
// Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
// by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)

function encode(coordinate, factor) {
    coordinate = Math.round(coordinate * factor);
    coordinate <<= 1;
    if (coordinate < 0) {
        coordinate = ~coordinate;
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
}

// This is adapted from the implementation in Project-OSRM
// https://github.com/DennisOSRM/Project-OSRM-Web/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
polyline.decode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

polyline.encode = function(coordinates, precision) {
    if (!coordinates.length) return '';

    var factor = Math.pow(10, precision || 5),
        output = encode(coordinates[0][0], factor) + encode(coordinates[0][1], factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0] - b[0], factor);
        output += encode(a[1] - b[1], factor);
    }

    return output;
};

if (typeof module !== undefined) module.exports = polyline;

},{}],3:[function(require,module,exports){
(function() {
	'use strict';

	L.Routing = L.Routing || {};

	L.Routing.Autocomplete = L.Class.extend({
		options: {
			timeout: 500,
			blurTimeout: 100,
			noResultsMessage: 'No results found.'
		},

		initialize: function(elem, callback, context, options) {
			L.setOptions(this, options);

			this._elem = elem;
			this._resultFn = options.resultFn ? L.Util.bind(options.resultFn, options.resultContext) : null;
			this._autocomplete = options.autocompleteFn ? L.Util.bind(options.autocompleteFn, options.autocompleteContext) : null;
			this._selectFn = L.Util.bind(callback, context);
			this._container = L.DomUtil.create('div', 'leaflet-routing-geocoder-result');
			this._resultTable = L.DomUtil.create('table', '', this._container);

			// TODO: looks a bit like a kludge to register same for input and keypress -
			// browsers supporting both will get duplicate events; just registering
			// input will not catch enter, though.
			L.DomEvent.addListener(this._elem, 'input', this._keyPressed, this);
			L.DomEvent.addListener(this._elem, 'keypress', this._keyPressed, this);
			L.DomEvent.addListener(this._elem, 'keydown', this._keyDown, this);
			L.DomEvent.addListener(this._elem, 'blur', function() {
				if (this._isOpen) {
					this.close();
				}
			}, this);
		},

		close: function() {
			L.DomUtil.removeClass(this._container, 'leaflet-routing-geocoder-result-open');
			this._isOpen = false;
		},

		_open: function() {
			var rect = this._elem.getBoundingClientRect();
			if (!this._container.parentElement) {
				this._container.style.left = (rect.left + window.scrollX) + 'px';
				this._container.style.top = (rect.bottom + window.scrollY) + 'px';
				this._container.style.width = (rect.right - rect.left) + 'px';
				document.body.appendChild(this._container);
			}

			L.DomUtil.addClass(this._container, 'leaflet-routing-geocoder-result-open');
			this._isOpen = true;
		},

		_setResults: function(results) {
			var i,
			    tr,
			    td,
			    text;

			delete this._selection;
			this._results = results;

			while (this._resultTable.firstChild) {
				this._resultTable.removeChild(this._resultTable.firstChild);
			}

			for (i = 0; i < results.length; i++) {
				tr = L.DomUtil.create('tr', '', this._resultTable);
				tr.setAttribute('data-result-index', i);
				td = L.DomUtil.create('td', '', tr);
				text = document.createTextNode(results[i].name);
				td.appendChild(text);
				// mousedown + click because:
				// http://stackoverflow.com/questions/10652852/jquery-fire-click-before-blur-event
				L.DomEvent.addListener(td, 'mousedown', L.DomEvent.preventDefault);
				L.DomEvent.addListener(td, 'click', this._createClickListener(results[i]));
			}

			if (!i) {
				tr = L.DomUtil.create('tr', '', this._resultTable);
				td = L.DomUtil.create('td', 'leaflet-routing-geocoder-no-results', tr);
				td.innerHTML = this.options.noResultsMessage;
			}

			this._open();

			if (results.length > 0) {
				// Select the first entry
				this._select(1);
			}
		},

		_createClickListener: function(r) {
			var resultSelected = this._resultSelected(r);
			return L.bind(function() {
				this._elem.blur();
				resultSelected();
			}, this);
		},

		_resultSelected: function(r) {
			return L.bind(function() {
				this.close();
				this._elem.value = r.name;
				this._lastCompletedText = r.name;
				this._selectFn(r);
			}, this);
		},

		_keyPressed: function(e) {
			var index;

			if (this._isOpen && e.keyCode === 13 && this._selection) {
				index = parseInt(this._selection.getAttribute('data-result-index'), 10);
				this._resultSelected(this._results[index])();
				L.DomEvent.preventDefault(e);
				return;
			}

			if (e.keyCode === 13) {
				this._complete(this._resultFn, true);
				return;
			}

			if (this._autocomplete && document.activeElement === this._elem) {
				if (this._timer) {
					clearTimeout(this._timer);
				}
				this._timer = setTimeout(L.Util.bind(function() { this._complete(this._autocomplete); }, this),
					this.options.timeout);
				return;
			}

			this._unselect();
		},

		_select: function(dir) {
			var sel = this._selection;
			if (sel) {
				L.DomUtil.removeClass(sel.firstChild, 'leaflet-routing-geocoder-selected');
				sel = sel[dir > 0 ? 'nextSibling' : 'previousSibling'];
			}
			if (!sel) {
				sel = this._resultTable[dir > 0 ? 'firstChild' : 'lastChild'];
			}

			if (sel) {
				L.DomUtil.addClass(sel.firstChild, 'leaflet-routing-geocoder-selected');
				this._selection = sel;
			}
		},

		_unselect: function() {
			if (this._selection) {
				L.DomUtil.removeClass(this._selection.firstChild, 'leaflet-routing-geocoder-selected');
			}
			delete this._selection;
		},

		_keyDown: function(e) {
			if (this._isOpen) {
				switch (e.keyCode) {
				// Escape
				case 27:
					this.close();
					L.DomEvent.preventDefault(e);
					return;
				// Up
				case 38:
					this._select(-1);
					L.DomEvent.preventDefault(e);
					return;
				// Down
				case 40:
					this._select(1);
					L.DomEvent.preventDefault(e);
					return;
				}
			}
		},

		_complete: function(completeFn, trySelect) {
			var v = this._elem.value;
			function completeResults(results) {
				this._lastCompletedText = v;
				if (trySelect && results.length === 1) {
					this._resultSelected(results[0])();
				} else {
					this._setResults(results);
				}
			}

			if (!v) {
				return;
			}

			if (v !== this._lastCompletedText) {
				completeFn(v, completeResults, this);
			} else if (trySelect) {
				completeResults.call(this, this._results);
			}
		}
	});
})();

},{}],4:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);

	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Itinerary'));
	L.extend(L.Routing, require('./L.Routing.Line'));
	L.extend(L.Routing, require('./L.Routing.Plan'));
	L.extend(L.Routing, require('./L.Routing.OSRM'));
	L.extend(L.Routing, require('./L.Routing.ErrorControl'));

	L.Routing.Control = L.Routing.Itinerary.extend({
		options: {
			fitSelectedRoutes: 'smart',
			routeLine: function(route, options) { return L.Routing.line(route, options); },
			autoRoute: true,
			routeWhileDragging: false,
			routeDragInterval: 500,
			waypointMode: 'connect',
			useZoomParameter: false,
			showAlternatives: false,
			addWaypoints: false
		},

		initialize: function(options) {
			L.Util.setOptions(this, options);

			this._router = this.options.router || new L.Routing.OSRM(options);
			this._plan = this.options.plan || L.Routing.plan(this.options.waypoints, options);
			this._requestCount = 0;

			L.Routing.Itinerary.prototype.initialize.call(this, options);

			this.on('routeselected', this._routeSelected, this);
			this._plan.on('waypointschanged', this._onWaypointsChanged, this);
			if (options.routeWhileDragging) {
				this._setupRouteDragging();
			}

			if (this.options.autoRoute) {
				this.route();
			}
		},

		onAdd: function(map) {
			var container = L.Routing.Itinerary.prototype.onAdd.call(this, map);

			this._map = map;
			this._map.addLayer(this._plan);

			if (this.options.useZoomParameter) {
				this._map.on('zoomend', function() {
					this.route({
						callback: L.bind(this._updateLineCallback, this)
					});
				}, this);
			}

			if (this._plan.options.geocoder) {
				container.insertBefore(this._plan.createGeocoders(), container.firstChild);
			}

			return container;
		},

		onRemove: function(map) {
			if (this._line) {
				map.removeLayer(this._line);
			}
			map.removeLayer(this._plan);
			return L.Routing.Itinerary.prototype.onRemove.call(this, map);
		},

		getWaypoints: function() {
			return this._plan.getWaypoints();
		},

		setWaypoints: function(waypoints) {
			this._plan.setWaypoints(waypoints);
			return this;
		},

		spliceWaypoints: function() {
			var removed = this._plan.spliceWaypoints.apply(this._plan, arguments);
			return removed;
		},

		getPlan: function() {
			return this._plan;
		},

		getRouter: function() {
			return this._router;
		},

		_routeSelected: function(e) {
			var route = e.route,
				alternatives = this.options.showAlternatives && e.alternatives,
				fitMode = this.options.fitSelectedRoutes,
				fitBounds =
					(fitMode === 'smart' && !this._waypointsVisible()) ||
					(fitMode !== 'smart' && fitMode);

			this._updateLines({route: route, alternatives: alternatives});

			if (fitBounds) {
				this._map.fitBounds(this._line.getBounds());
			}

			if (this.options.waypointMode === 'snap') {
				this._plan.off('waypointschanged', this._onWaypointsChanged, this);
				this.setWaypoints(route.waypoints);
				this._plan.on('waypointschanged', this._onWaypointsChanged, this);
			}
		},

		_waypointsVisible: function() {
			var wps = this.getWaypoints(),
				mapSize,
				bounds,
				boundsSize,
				i,
				p;

			try {
				mapSize = this._map.getSize();

				for (i = 0; i < wps.length; i++) {
					p = this._map.latLngToLayerPoint(wps[i].latLng);

					if (bounds) {
						bounds.extend(p);
					} else {
						bounds = L.bounds([p]);
					}
				}

				boundsSize = bounds.getSize();
				return (boundsSize.x > mapSize.x / 5 ||
					boundsSize.y > mapSize.y / 5) && this._waypointsInViewport();

			} catch (e) {
				return false;
			}
		},

		_waypointsInViewport: function() {
			var wps = this.getWaypoints(),
				mapBounds,
				i;

			try {
				mapBounds = this._map.getBounds();
			} catch (e) {
				return false;
			}

			for (i = 0; i < wps.length; i++) {
				if (mapBounds.contains(wps[i].latLng)) {
					return true;
				}
			}

			return false;
		},

		_updateLines: function(routes) {
			var addWaypoints = this.options.addWaypoints !== undefined ?
				this.options.addWaypoints : true;
			this._clearLines();

			// add alternatives first so they lie below the main route
			this._alternatives = [];
			if (routes.alternatives) routes.alternatives.forEach(function(alt, i) {
				this._alternatives[i] = this.options.routeLine(alt,
					L.extend({
						isAlternative: true
					}, this.options.altLineOptions || this.options.lineOptions));
				this._alternatives[i].addTo(this._map);
				this._hookAltEvents(this._alternatives[i]);
			}, this);

			this._line = this.options.routeLine(routes.route,
				L.extend({
					addWaypoints: addWaypoints,
					extendToWaypoints: this.options.waypointMode === 'connect'
				}, this.options.lineOptions));
			this._line.addTo(this._map);
			this._hookEvents(this._line);
		},

		_hookEvents: function(l) {
			l.on('linetouched', function(e) {
				this._plan.dragNewWaypoint(e);
			}, this);
		},

		_hookAltEvents: function(l) {
			l.on('linetouched', function(e) {
				var alts = this._routes.slice();
				var selected = alts.splice(e.target._route.routesIndex, 1)[0];
				this.fire('routeselected', {route: selected, alternatives: alts});
			}, this);
		},

		_onWaypointsChanged: function(e) {
			if (this.options.autoRoute) {
				this.route({});
			}
			if (!this._plan.isReady()) {
				this._clearLines();
				this._clearAlts();
			}
			this.fire('waypointschanged', {waypoints: e.waypoints});
		},

		_setupRouteDragging: function() {
			var timer = 0,
				waypoints;

			this._plan.on('waypointdrag', L.bind(function(e) {
				waypoints = e.waypoints;

				if (!timer) {
					timer = setTimeout(L.bind(function() {
						this.route({
							waypoints: waypoints,
							geometryOnly: true,
							callback: L.bind(this._updateLineCallback, this)
						});
						timer = undefined;
					}, this), this.options.routeDragInterval);
				}
			}, this));
			this._plan.on('waypointdragend', function() {
				if (timer) {
					clearTimeout(timer);
					timer = undefined;
				}
				this.route();
			}, this);
		},

		_updateLineCallback: function(err, routes) {
			if (!err) {
				this._updateLines({route: routes[0], alternatives: routes.slice(1) });
			} else {
				this._clearLines();
			}
		},

		route: function(options) {
			var ts = ++this._requestCount,
				wps;

			options = options || {};

			if (this._plan.isReady()) {
				if (this.options.useZoomParameter) {
					options.z = this._map && this._map.getZoom();
				}

				wps = options && options.waypoints || this._plan.getWaypoints();
				this.fire('routingstart', {waypoints: wps});
				this._router.route(wps, options.callback || function(err, routes) {
					// Prevent race among multiple requests,
					// by checking the current request's timestamp
					// against the last request's; ignore result if
					// this isn't the latest request.
					if (ts === this._requestCount) {
						this._clearLines();
						this._clearAlts();
						if (err) {
							this.fire('routingerror', {error: err});
							return;
						}

						routes.forEach(function(route, i) { route.routesIndex = i; });

						if (!options.geometryOnly) {
							this.fire('routesfound', {waypoints: wps, routes: routes});
							this.setAlternatives(routes);
						} else {
							var selectedRoute = routes.splice(0,1)[0];
							this._routeSelected({route: selectedRoute, alternatives: routes});
						}
					}
				}, this, options);
			}
		},

		_clearLines: function() {
			if (this._line) {
				this._map.removeLayer(this._line);
				delete this._line;
			}
			if (this._alternatives && this._alternatives.length) {
				for (var i in this._alternatives) {
					this._map.removeLayer(this._alternatives[i]);
				}
				this._alternatives = [];
			}
		}
	});

	L.Routing.control = function(options) {
		return new L.Routing.Control(options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.ErrorControl":5,"./L.Routing.Itinerary":8,"./L.Routing.Line":10,"./L.Routing.OSRM":12,"./L.Routing.Plan":13}],5:[function(require,module,exports){
(function() {
	'use strict';

	L.Routing = L.Routing || {};

	L.Routing.ErrorControl = L.Control.extend({
		options: {
			header: 'Routing error',
			formatMessage: function(error) {
				if (error.status < 0) {
					return 'Calculating the route caused an error. Technical description follows: <code><pre>' +
						error.message + '</pre></code>';
				} else {
					return 'The route could not be calculated. ' +
						error.message;
				}
			}
		},

		initialize: function(routingControl, options) {
			L.Control.prototype.initialize.call(this, options);
			routingControl
				.on('routingerror', L.bind(function(e) {
					if (this._element) {
						this._element.children[1].innerHTML = this.options.formatMessage(e.error);
						this._element.style.visibility = 'visible';
					}
				}, this))
				.on('routingstart', L.bind(function() {
					if (this._element) {
						this._element.style.visibility = 'hidden';
					}
				}, this));
		},

		onAdd: function() {
			var header,
				message;

			this._element = L.DomUtil.create('div', 'leaflet-bar leaflet-routing-error');
			this._element.style.visibility = 'hidden';

			header = L.DomUtil.create('h3', null, this._element);
			message = L.DomUtil.create('span', null, this._element);

			header.innerHTML = this.options.header;

			return this._element;
		},

		onRemove: function() {
			delete this._element;
		}
	});

	L.Routing.errorControl = function(routingControl, options) {
		return new L.Routing.ErrorControl(routingControl, options);
	};
})();

},{}],6:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);

	L.Routing = L.Routing || {};

	L.extend(L.Routing, require('./L.Routing.Localization'));

	L.Routing.Formatter = L.Class.extend({
		options: {
			units: 'metric',
			unitNames: {
				meters: 'm',
				kilometers: 'km',
				yards: 'yd',
				miles: 'mi',
				hours: 'h',
				minutes: 'mín',
				seconds: 's'
			},
			language: setRoutingLanguage(),
			roundingSensitivity: 1,
			distanceTemplate: '{value} {unit}'
		},

		initialize: function(options) {
			this.language = setRoutingLanguage.language;
			L.setOptions(this, options);
		},

		formatDistance: function(d /* Number (meters) */, sensitivity) {
			var un = this.options.unitNames,
				simpleRounding = sensitivity <= 0,
				round = simpleRounding ? function(v) { return v; } : L.bind(this._round, this),
			    v,
			    yards,
				data,
				pow10;

			if (this.options.units === 'imperial') {
				yards = d / 0.9144;
				if (yards >= 1000) {
					data = {
						value: round(d / 1609.344, sensitivity),
						unit: un.miles
					};
				} else {
					data = {
						value: round(yards, sensitivity),
						unit: un.yards
					};
				}
			} else {
				v = round(d, sensitivity);
				data = {
					value: v >= 1000 ? (v / 1000) : v,
					unit: v >= 1000 ? un.kilometers : un.meters
				};
			}

			if (simpleRounding) {
				pow10 = Math.pow(10, -sensitivity);
				data.value = Math.round(data.value * pow10) / pow10;
			}

			return L.Util.template(this.options.distanceTemplate, data);
		},

		_round: function(d, sensitivity) {
			var s = sensitivity || this.options.roundingSensitivity,
				pow10 = Math.pow(10, (Math.floor(d / s) + '').length - 1),
				r = Math.floor(d / pow10),
				p = (r > 5) ? pow10 : pow10 / 2;

			return Math.round(d / p) * p;
		},

		formatTime: function(t /* Number (seconds) */) {
			if (t > 86400) {
				return Math.round(t / 3600) + ' h';
			} else if (t > 3600) {
				return Math.floor(t / 3600) + ' h ' +
					Math.round((t % 3600) / 60) + ' min';
			} else if (t > 300) {
				return Math.round(t / 60) + ' min';
			} else if (t > 60) {
				return Math.floor(t / 60) + ' min' +
					(t % 60 !== 0 ? ' ' + (t % 60) + ' s' : '');
			} else {
				return t + ' s';
			}
		},

		formatInstruction: function(instr, i) {
			if (instr.text === undefined) {
				return L.Util.template(this._getInstructionTemplate(instr, i),
					L.extend({
						exitStr: instr.exit ? L.Routing.Localization[this.options.language].formatOrder(instr.exit) : '',
						dir: L.Routing.Localization[this.options.language].directions[instr.direction]
					},
					instr));
			} else {
				return instr.text;
			}
		},

		getIconName: function(instr, i) {
			switch (instr.type) {
			case 'INIT':
				return 'depart';
			case 'CONTINUE':
				return 'continue';
			case 'DEPART':
				return 'continue';
			case 'SLIGHTLY_RIGHT':
				return 'bear-right';
			case 'RIGHT':
				return 'turn-right';
			case 'HARD_RIGHT':
				return 'sharp-right';
			case 'UTURN_LEFT':
				return 'u-turn';
			case 'HARD_LEFT':
				return 'sharp-left';
			case 'LEFT':
				return 'turn-left';
			case 'SLIGHTLY_LEFT':
				return 'bear-left';
			case 'WaypointReached':
				return 'via';
			case 'CIRCLE_COUNTERCLOCKWISE':
				return 'enter-roundabout';
			case 'END':
				return 'none';
			default:
				return 'none';
			}
		},

		_getInstructionTemplate: function(instr, i) {
			var type = instr.type === 'Straight' ? (i === 0 ? 'Head' : 'Continue') : instr.type,
				strings = L.Routing.Localization[this.options.language].instructions[type];
			if (lng === 'fi' || lng === 'sv') {
				instr.road = checkUnnamedStreets(instr.road);
			}
			return strings[0] + (strings.length > 1 && instr.road ? strings[1] : '');
		}
	});

	module.exports = L.Routing;
})();


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Localization":11}],7:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);
	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Autocomplete'));

	function selectInputText(input) {
		if (input.setSelectionRange) {
			// On iOS, select() doesn't work
			input.setSelectionRange(0, 9999);
		} else {
			// On at least IE8, setSeleectionRange doesn't exist
			input.select();
		}
	}

	L.Routing.GeocoderElement = L.Class.extend({
		includes: L.Mixin.Events,

		options: {
			createGeocoder: function(i, nWps, options) {
				var container = L.DomUtil.create('div', 'leaflet-routing-geocoder'),
					input = L.DomUtil.create('input', '', container),
					remove = options.addWaypoints ? L.DomUtil.create('span', 'leaflet-routing-remove-waypoint', container) : undefined;

				input.disabled = !options.addWaypoints;

				return {
					container: container,
					input: input,
					closeButton: remove
				};
			},
			geocoderPlaceholder: function(i, numberWaypoints, plan) {
				var l = L.Routing.Localization[plan.options.language].ui;
				return i === 0 ?
					l.startPlaceholder :
					(i < numberWaypoints - 1 ?
						L.Util.template(l.viaPlaceholder, {viaNumber: i}) :
						l.endPlaceholder);
			},

			geocoderClass: function() {
				return '';
			},

			waypointNameFallback: function(latLng) {
				var ns = latLng.lat < 0 ? 'S' : 'N',
					ew = latLng.lng < 0 ? 'W' : 'E',
					lat = (Math.round(Math.abs(latLng.lat) * 10000) / 10000).toString(),
					lng = (Math.round(Math.abs(latLng.lng) * 10000) / 10000).toString();
				return ns + lat + ', ' + ew + lng;
			},
			maxGeocoderTolerance: 200,
			autocompleteOptions: {},
			language: setRoutingLanguage(),
		},

		initialize: function(wp, i, nWps, options) {
			L.setOptions(this, options);

			var g = this.options.createGeocoder(i, nWps, this.options),
				closeButton = g.closeButton,
				geocoderInput = g.input;
			geocoderInput.setAttribute('placeholder', this.options.geocoderPlaceholder(i, nWps, this));
			geocoderInput.className = this.options.geocoderClass(i, nWps);

			this._element = g;
			this._waypoint = wp;

			this.update();
			// This has to be here, or geocoder's value will not be properly
			// initialized.
			// TODO: look into why and make _updateWaypointName fix this.
			geocoderInput.value = wp.name;

			L.DomEvent.addListener(geocoderInput, 'click', function() {
				selectInputText(this);
			}, geocoderInput);

			if (closeButton) {
				L.DomEvent.addListener(closeButton, 'click', function() {
					this.fire('delete', { waypoint: this._waypoint });
				}, this);
			}

			new L.Routing.Autocomplete(geocoderInput, function(r) {
					geocoderInput.value = r.name;
					wp.name = r.name;
					wp.latLng = r.center;
					this.fire('geocoded', { waypoint: wp, value: r });
				}, this, L.extend({
					resultFn: this.options.geocoder.geocode,
					resultContext: this.options.geocoder,
					autocompleteFn: this.options.geocoder.suggest,
					autocompleteContext: this.options.geocoder
				}, this.options.autocompleteOptions));
		},

		getContainer: function() {
			return this._element.container;
		},

		setValue: function(v) {
			this._element.input.value = v;
		},

		update: function(force) {
			var wp = this._waypoint,
				wpCoords;

			wp.name = wp.name || '';

			if (wp.latLng && (force || !wp.name)) {
				wpCoords = this.options.waypointNameFallback(wp.latLng);
				if (this.options.geocoder && this.options.geocoder.reverse) {
					this.options.geocoder.reverse(wp.latLng, 67108864 /* zoom 18 */, function(rs) {
						if (rs.length > 0 && rs[0].center.distanceTo(wp.latLng) < this.options.maxGeocoderTolerance) {
							wp.name = rs[0].name;
						} else {
							wp.name = wpCoords;
						}
						this._update();
					}, this);
				} else {
					wp.name = wpCoords;
					this._update();
				}
			}
		},

		focus: function() {
			var input = this._element.input;
			input.focus();
			selectInputText(input);
		},

		_update: function() {
			var wp = this._waypoint,
			    value = wp && wp.name ? wp.name : '';
			this.setValue(value);
			this.fire('reversegeocoded', {waypoint: wp, value: value});
		}
	});

	L.Routing.geocoderElement = function(wp, i, nWps, plan) {
		return new L.Routing.GeocoderElement(wp, i, nWps, plan);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Autocomplete":3}],8:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);

	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Formatter'));
	L.extend(L.Routing, require('./L.Routing.ItineraryBuilder'));

	L.Routing.Itinerary = L.Control.extend({
		includes: L.Mixin.Events,

		options: {
			pointMarkerStyle: {
				radius: 5,
				color: '#03f',
				fillColor: 'white',
				opacity: 1,
				fillOpacity: 0.7
			},
			summaryTemplate: '',
			timeTemplate: '{time}',
			containerClassName: '',
			alternativeClassName: '',
			minimizedClassName: '',
			itineraryClassName: '',
			totalDistanceRoundingSensitivity: -1,
			show: true,
			collapsible: undefined,
			collapseBtn: function(itinerary) {
				var collapseBtn = L.DomUtil.create('span', itinerary.options.collapseBtnClass);
				L.DomEvent.on(collapseBtn, 'click', itinerary._toggle, itinerary);
				itinerary._container.insertBefore(collapseBtn, itinerary._container.firstChild);
			},
			collapseBtnClass: 'leaflet-routing-collapse-btn'
		},

		initialize: function(options) {
			L.setOptions(this, options);
			this._formatter = this.options.formatter || new L.Routing.Formatter(this.options);
			this._itineraryBuilder = this.options.itineraryBuilder || new L.Routing.ItineraryBuilder({
				containerClassName: this.options.itineraryClassName
			});
		},

		onAdd: function(map) {
			var collapsible = this.options.collapsible;

			collapsible = collapsible || (collapsible === undefined && map.getSize().x <= 640);

			this._container = L.DomUtil.create('div', 'leaflet-routing-container ' +
				(!this.options.show ? 'leaflet-routing-container-hide ' : '') +
				(collapsible ? 'leaflet-routing-collapsible ' : '') +
				this.options.containerClassName);
			this._altContainer = this.createAlternativesContainer();
			this._container.appendChild(this._altContainer);
			L.DomEvent.disableClickPropagation(this._container);
			L.DomEvent.addListener(this._container, 'mousewheel', function(e) {
				L.DomEvent.stopPropagation(e);
			});

			if (collapsible) {
				this.options.collapseBtn(this);
			}

			return this._container;
		},

		onRemove: function() {
		},

		// Main container for all alternatives
		createAlternativesContainer: function() {
			return L.DomUtil.create('div', 'alternative-container');
		},

		/**
		 * Main function, which is called from the route function,
		 * and creates and displays all the alternatives which were returned from the server
		 * @param routes (data about the alternatives which was selected in the _routeDone function)
		 * @returns {L.Routing.Itinerary}
         */
		setAlternatives: function(routes) {
			var i,
			    alt,
			    altDiv;

			this._clearAlts();

			this._routes = routes;

			// Creating alternatives and adding them to the main alternative container
			for (i = 0; i < this._routes.length; i++) {
				alt = this._routes[i];
				altDiv = this._createAlternative(alt, i);
				this._altContainer.appendChild(altDiv);
				this._altElements.push(altDiv);
			}

			// If there is only one alternative, instructions are shown and back button is hidden
			if (this._routes.length == 1) {
				$(".panel-group").show();
				$(".fa-lg").hide();
			}

			// The first alternative route is shown by default
			this._selectRoute({route: this._routes[0], alternatives: this._routes.slice(1)});

			// Hiding all settings menus if the route is calculated
			$('.walkSpeed, .bikeSpeed, .walkDistance, .carbonDioxide, .applyDiv').hide('fast');
			$("#settings").addClass("settingsIcon").removeClass("settingsIconClicked");

			if ($('#mobile-indicator').is(':visible')){
				$(".logo, .leaflet-routing-geocoders, .now-later, .applyDiv").hide();
				$("#mobileButtons").show();
			}

			return this;
		},

		show: function() {
			L.DomUtil.removeClass(this._container, 'leaflet-routing-container-hide');
		},

		hide: function() {
			L.DomUtil.addClass(this._container, 'leaflet-routing-container-hide');
		},

		_toggle: function() {
			var collapsed = L.DomUtil.hasClass(this._container, 'leaflet-routing-container-hide');
			this[collapsed ? 'show' : 'hide']();
		},

		/**
		 * Creates div with single alternative
		 * @param alt (one of the alternatives)
		 * @param i
		 * @returns {div}
         * @private
         */
		_createAlternative: function(alt, i) {
			var altDiv = L.DomUtil.create('div', 'single-alternative ' +
				this.options.alternativeClassName +
				(i > 0 ? ' leaflet-routing-alt-minimized ' + this.options.minimizedClassName : '')),
				// Header of the alternative, which contains img, time, distance and trees
				header = L.DomUtil.create('div', 'alternative-header', altDiv),
				treeImageDiv = L.DomUtil.create('div', 'header-tree-img'),
				template = this.options.summaryTemplate,
				carbonEmission,
				data = L.extend({
					name: alt.name,
					distance: this._formatter.formatDistance(alt.summary.totalDistance, this.options.totalDistanceRoundingSensitivity),
					time: this._formatter.formatTime(alt.summary.totalTime)
				}, alt);
			L.DomEvent.addListener(altDiv, 'click', this._onAltClicked, this);
			// Calculating CO2
			carbonEmission = CO2calculation(alt.carDistance, alt.busDistance);
			// Inserting date, time and mode icon to the header
			header.innerHTML = '<div class="header-mode-img"><img src=' + iconBySelectedMode() + '></div>' +
			'<div class="header-text"><h4>' + data.time + '</h4><h5>' + data.distance + '</h5></div>';
			// Adding tree image
			header.appendChild(treeImageDiv);
			// Adding tool tip for showing CO2 emission on trees hover
			treeImageDiv.innerHTML = '<img id="co2Tooltip" src=' + OffsetByTree(carbonEmission) + '>';
            this.on('routeselected', this._selectAlt, this);
			this._addToolTip(treeImageDiv, carbonEmission);
            this._openInstructions(header);
			altDiv.appendChild(this._createItineraryContainer(alt, i));
			return altDiv;
		},

		_clearAlts: function() {
			var el = this._altContainer;
			while (el && el.firstChild) {
				el.removeChild(el.firstChild);
			}

			this._altElements = [];
		},

		/**
		 * Common function for creating the body of the route instructions
		 * @param r (one of the alternatives)
		 * @param collapseIndex (special index for collapsing accordion panels)
		 * @returns {div} container (with legs header and steps inside them)
         * @private
         */
		_createItineraryContainer: function(r, collapseIndex) {
			var container = this._itineraryBuilder.createContainer(),
			    legPanel, panelTitle, panelBody,
				k = 1,
			    i, j,
			    instr, step, distance, text, icon, panelImg,
				stopID, stopName, time, busNumber,
				busFlag = false,
				arrowBack;
			// collapseIndex depends on the number of alternatives
			// each alternative have 10 digits (k) for the collapsing panels id
			// in order not to mix them
			if (collapseIndex == 1) {
				k = 10;
			}
			else if (collapseIndex == 2) {
				k = 20;
			}
			else if (collapseIndex == 3) {
				k = 30;
			}
			// In simple words r.coordinates.length is the number of legs
			// inside one alternative. Usually all modes exept bus and P&R
			// contains only one leg.
			for (j = 0; j < r.coordinates.length; j++) {
				for (i = 0; i < r.instructions[j].length; i++) {
					instr = r.instructions[j][i];

					// Bus stops instructions have special type 'busStop'
					// Their step calls createBusStop method with the required
					// data parameters
					if (instr.type === 'busStop') {
						stopID = instr.stopIndex;
						stopName = instr.streetName;
						time = instr.arriveTime;
						step = this._itineraryBuilder.createBusStop(stopID, stopName, time, panelBody);
						this._addRowListeners(step, instr.positionIndex);
					}

					else {
						// This variable contains the name of the road
						text = instr.road;
						// Checking for unnamed streets
						if (lng === 'fi' || lng === 'sv') {
							text = checkUnnamedStreets(text);
						}
						// Instruction type INIT means the start of the next leg
						// Each leg has special heading (panel-title) depending on the mode
						if (instr.type === 'INIT') {
							// Getting data for creating title for the BUS mode
							if (instr.mode === 'BUS') {
								// This flag shows that after bus mode will be finished
								// there should be special title for the next leg
								busFlag = true;
								icon = '<img class="busEnter" src="css/images/Bus-in.png">';
								time = instr.timeDep;
								busNumber = instr.routeNumber;
								stopID = instr.stopIndex;
								panelTitle = this._itineraryBuilder.createPanelTitleBus(text, k, icon, time, busNumber, stopID);
							}
							// P&R mode has special icon park entering instead of the
							// normal text(road name which is P+R in this mode)
							else if (text == "P+R") {
								text = '<img class="ParkPlace" src="css/images/ParkPlace.png">';
								panelTitle = this._itineraryBuilder.createPanelTitleParkRide(text, k);
							}
							// If new leg is other mode than bus there are two oprions
							else {
								// New leg goes after bus mode.
								// It means its' title should contain the img leaving the bus
								// as the user used bus transport before
								if (busFlag) {
									busFlag = false;
									icon = '<img class="busEnter" src="css/images/Bus-out.png">';
									time = instr.timeArr;
									stopID = instr.stopIndex;
									panelTitle = this._itineraryBuilder.createPanelTitleBus(text, k, icon, time, busNumber, stopID);
								}
								// Ir new leg doesn't go after bus, it has
								// normal title with the name of the road
								else {
									switch (instr.mode) {
										case 'WALK':
											panelImg = '<img class="panelImg" src="css/images/Walk-gray.png">';
											break;
										case 'CAR':
											panelImg = '<img class="panelImg" src="css/images/Car-gray.png">';
											break;
										case 'BICYCLE':
											panelImg = '<img class="panelImg" src="css/images/Biking-gray.png">';
											break;
									}
									panelTitle = this._itineraryBuilder.createPanelTitle(text, k, panelImg);
								}
							}
							// Creating other html structure for the instructions container
							// by calling additional functions from itineraryBuilder class
							panelBody = this._itineraryBuilder.createPanelBody();
							legPanel = this._itineraryBuilder.createLeg(panelTitle, panelBody, k);
							container.appendChild(legPanel);
							this._addHeaderLegListeners(panelTitle, instr.index);
							k++;
							
						}
						// This chunk of code creates normal step instruction
						// which will be contained after the leg title
						else {
							text = this._formatter.formatInstruction(instr, i);
							distance = this._formatter.formatDistance(instr.distance);
							if (instr.distance === 0)
								distance = "";
							icon = this._formatter.getIconName(instr, i);
							step = this._itineraryBuilder.createStep(text, distance, icon, panelBody);
							this._addRowListeners(step, instr.index);
							if (instr.type === 'END')
								$(step).addClass('lastStepMargin');
						}
					}
				}
			}
			// Creating the back arrow for the routes
			// which has more than one alternatives
			// If one alternative - arrow is hidden
			arrowBack = L.DomUtil.create('i', 'fa fa-arrow-left fa-lg');
			arrowBack.setAttribute("aria-hidden", "true");
			container.appendChild(arrowBack);
			this._backToAlts(arrowBack);

			return container;
		},

		/**
		 * Function which shows tooltip with CO2 info
		 * on the tree image hover
		 * @param icon (trees for the hover event)
		 * @param carbonEmission (data)
         * @private
         */
		_addToolTip: function(icon, carbonEmission) {
			L.DomEvent.addListener(icon, 'mouseover', function() {
				var offset = $(icon).offset();
				$("#co2Calc").append("<span>" + carbonEmission + "</span>");
				$("#offsetCalc").append("<span>" + Math.round(carbonEmission / 60) + "</span>");
				$("#co2Calc").show();
				$("#offsetCalc").show();
				// $("#tipCO2 p").last().text("Offset: " + Math.round(carbonEmission / 60) + " (trees/day)");
				$("#tipCO2").css({
					top: offset.top +10,
					left: offset.left +100,
					display: "block"
				});
				$("#tipCO2").animate({opacity: 1.0}, 200);
			}, this);
			L.DomEvent.addListener(icon, 'mouseout', function() {
				$(".toolTip").animate({opacity: 0.0}, 200).css({display: "none"});
				$("#tipCO2 span").remove();
			}, this);

		},

		/**
		 * Adding Mouseover/out and ckick events for the steps
		 * @param row
		 * @param coordinate
         * @private
         */
		_addRowListeners: function(row, coordinate) {
			L.DomEvent.addListener(row, 'mouseover', function() {
				this._marker = L.circleMarker(coordinate,
					this.options.pointMarkerStyle).addTo(this._map);
			}, this);
			L.DomEvent.addListener(row, 'mouseout', function() {
				if (this._marker) {
					this._map.removeLayer(this._marker);
					delete this._marker;
				}
			}, this);
			L.DomEvent.addListener(row, 'click', function(e) {
				this._map.panTo(coordinate);
				L.DomEvent.stopPropagation(e);
			}, this);
		},

		/**
		 * The same as previous but without click event, as
		 * header has anothe ckick functionality
		 * @param row
		 * @param coordinate
         * @private
         */
		_addHeaderLegListeners: function(row, coordinate) {
			L.DomEvent.addListener(row, 'mouseover', function() {
				this._marker = L.circleMarker(coordinate,
					this.options.pointMarkerStyle).addTo(this._map);
			}, this);
			L.DomEvent.addListener(row, 'mouseout', function() {
				if (this._marker) {
					this._map.removeLayer(this._marker);
					delete this._marker;
				}
			}, this);
		},

		/**
		 * Double click on the header opens detailed
		 * instructions for this alternative if the
		 * route shown more than one options.
		 * @param header
         * @private
         */
		_openInstructions: function (header) {
			L.DomEvent.addListener(header, 'dblclick', function() {
				$(".single-alternative.leaflet-routing-alt-minimized, .now-later").hide();
				$(".single-alternative .panel-group").show("slow");
			}, this);

		},

		/**
		 * Shows the headers of all alternatives
		 * after clicking the back arrow from the
		 * detailed view of the alternative's instructions
		 * @param arrow
         * @private
         */
		_backToAlts: function (arrow) {
			L.DomEvent.addListener(arrow, 'click', function() {
				$(".single-alternative .panel-group").hide("fast");
				$(".single-alternative.leaflet-routing-alt-minimized").show();
			}, this);

		},

		/**
		 * Function for selecting the route by clicking on the alternative
		 * @param e
         * @private
         */
		_onAltClicked: function(e) {
			var altElem = e.target || window.event.srcElement;
			while (!L.DomUtil.hasClass(altElem, 'single-alternative')) {
				altElem = altElem.parentElement;
			}
			var j = this._altElements.indexOf(altElem);
			var alts = this._routes.slice();
			var route = alts.splice(j, 1)[0];

			this.fire('routeselected', {
				route: route,
				alternatives: alts
			});
		},

		/**
		 * In old version this function used for opening collapsed instructions
		 * if there were more than one alternatives.
		 * In new implementation the main usage of this functions is adding and removing
		 * class 'leaflet-routing-alt-minimized' on click, which works as a flag in other functions.
		 * @param e
         * @private
         */
		_selectAlt: function(e) {
			var altElem,
			    j,
			    n,
			    classFn;
			altElem = this._altElements[e.route.routesIndex];
			if (L.DomUtil.hasClass(altElem, 'leaflet-routing-alt-minimized')) {
				for (j = 0; j < this._altElements.length; j++) {
					n = this._altElements[j];
					classFn = j === e.route.routesIndex ? 'removeClass' : 'addClass';
					L.DomUtil[classFn](n, 'leaflet-routing-alt-minimized');
					if (this.options.minimizedClassName) {
						L.DomUtil[classFn](n, this.options.minimizedClassName);
					}
					if (j !== e.route.routesIndex) n.scrollTop = 0;
				}
			}

			L.DomEvent.stop(e);
		},

		_selectRoute: function(routes) {
			if (this._marker) {
				this._map.removeLayer(this._marker);
				delete this._marker;
			}
			this.fire('routeselected', routes);
		}
		
	});

	L.Routing.itinerary = function(options) {
		return new L.Routing.Itinerary(options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Formatter":6,"./L.Routing.ItineraryBuilder":9}],9:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);
	L.Routing = L.Routing || {};

	L.Routing.ItineraryBuilder = L.Class.extend({
		options: {
			containerClassName: ''
		},

		initialize: function(options) {
			L.setOptions(this, options);
		},

		// Container for legs
		createContainer: function() {
			var panelGroup = L.DomUtil.create('div', 'panel-group');
			panelGroup.setAttribute('id', 'accordion');
			return panelGroup;
		},

		// Container for steps
		createLeg: function(panelTitle, panelBody, k) {
			var legPanel = L.DomUtil.create('div', 'panel panel-default'),
				panelHeading = L.DomUtil.create('div', 'panel-heading', legPanel),
				stepsDiv = L.DomUtil.create('div', 'panel-collapse collapse in', legPanel);
			stepsDiv.setAttribute('id', 'collapse' + k);
			stepsDiv.appendChild(panelBody);
			panelHeading.appendChild(panelTitle);
			return legPanel;
		},

		// Title for leg
		createPanelTitle: function (text, k, panelImg) {
			var panelTitle = L.DomUtil.create('h4', 'panel-title'),
				header = L.DomUtil.create('a', '', panelTitle);
			header.setAttribute('data-toggle', 'collapse');
			header.setAttribute('data-parent', '#accordion');
			header.setAttribute('href', '#collapse' + k);
			header.innerHTML = panelImg;
			header.appendChild(document.createTextNode(" " + text));
			return panelTitle;
		},

		createPanelTitleParkRide: function (text, k) {
			var panelTitle = L.DomUtil.create('h4', 'panel-title'),
				header = L.DomUtil.create('a', '', panelTitle);
			header.setAttribute('data-toggle', 'collapse');
			header.setAttribute('data-parent', '#accordion');
			header.setAttribute('href', '#collapse' + k);
			header.innerHTML = text;
			return panelTitle;
		},

		createPanelTitleBus: function (text, k, icon, time, busNumber, stopID) {
			var panelTitle = L.DomUtil.create('h4', 'panel-title'),
				header = L.DomUtil.create('a', '', panelTitle);
			header.setAttribute('data-toggle', 'collapse');
			header.setAttribute('data-parent', '#accordion');
			header.setAttribute('href', '#collapse' + k);
			header.innerHTML = icon;
			header.appendChild(document.createTextNode(' № ' + busNumber));
			header.appendChild(document.createTextNode(' | ' + stopID + ' - ' + text));
			header.appendChild(document.createTextNode(' | ' + time));
			return panelTitle;
		},

		createPanelBody: function () {
			return L.DomUtil.create('div', 'panel-body');
		},

		// Creating steps
		createStep: function(text, distance, icon, panelBody) {
			var step = L.DomUtil.create('ul', '', panelBody),
				stepIcon = L.DomUtil.create('li', 'stepInline iconList', step),
				stepText = L.DomUtil.create('li', 'stepInline stepList', step),
				stepDistance = L.DomUtil.create('li', 'stepInline', step),
				span;
			span = L.DomUtil.create('span', 'leaflet-routing-icon leaflet-routing-icon-'+ icon, stepIcon);
			stepText.appendChild(document.createTextNode(text));
			stepDistance.appendChild(document.createTextNode(distance));
			return step;
		},

		createBusStop: function(stopID, stopName, time, panelBody) {
			var step = L.DomUtil.create('ul', '', panelBody),
				busStopName = L.DomUtil.create('li', 'stepInline busStopList', step),
				busStopTime = L.DomUtil.create('li', 'stepInline', step);
			busStopName.appendChild(document.createTextNode(stopID + ' - ' + stopName));
			busStopTime.appendChild(document.createTextNode(time));
			return step;
		}
	});

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);

	L.Routing = L.Routing || {};

	L.Routing.Line = L.LayerGroup.extend({
		includes: L.Mixin.Events,

		options: {
			styles: [
				{color: 'black', opacity: 0.15, weight: 9},
				{color: 'white', opacity: 0.8, weight: 6},
				{color: 'red', opacity: 1, weight: 2}
			],
			missingRouteStyles: [
				{color: 'black', opacity: 0.15, weight: 7},
				{color: 'white', opacity: 0.6, weight: 4},
				{color: 'gray', opacity: 0.8, weight: 2, dashArray: '7,12'}
			],
			addWaypoints: true,
			extendToWaypoints: true,
			missingRouteTolerance: 10
		},

		initialize: function(route, options) {
			L.setOptions(this, options);
			L.LayerGroup.prototype.initialize.call(this, options);
			this._route = route;

			if (this.options.extendToWaypoints) {
				this._extendToWaypoints();
			}

			for (var j = 0; j < route.coordinates.length; j++) {
				//console.log(route.instructions[j][0]);
				if (route.instructions[j][0] != undefined){
					if (route.instructions[j][0]["mode"] == "WALK"){
						this.options.styles[2]["color"] = "green";
						this.options.styles[2]["weight"] = 5;
					}
					else if (route.instructions[j][0]["mode"] == "CAR"){
						this.options.styles[2]["color"] = "blue";
						this.options.styles[2]["weight"] = 5;
					}
					else if (route.instructions[j][0]["mode"] == "BICYCLE"){
						this.options.styles[2]["color"] = "yellow";
						this.options.styles[2]["weight"] = 5;
					}
					else if (route.instructions[j][0]["mode"] == "BUS"){
						this.options.styles[2]["color"] = "black";
						this.options.styles[2]["weight"] = 5;
					}
					else {
						this.options.styles[2]["color"] = "yellow";
					}
				}
				else {
						this.options.styles[2]["color"] = "yellow";
					}
				
				this._addSegment(
					route.coordinates[j],
					this.options.styles,
					this.options.addWaypoints);
			}
		},

		addTo: function(map) {
			map.addLayer(this);
			return this;
		},
		getBounds: function() {
			return L.latLngBounds(this._route.coordinates);
		},

		_findWaypointIndices: function() {
			var wps = this._route.inputWaypoints,
			    indices = [],
			    i;
			for (i = 0; i < wps.length; i++) {
				indices.push(this._findClosestRoutePoint(wps[i].latLng));
			}

			return indices;
		},

		_findClosestRoutePoint: function(latlng) {
			var minDist = Number.MAX_VALUE,
				minIndex,
			    i,
			    d;

			for (var j = 0; j < this._route.coordinates.length; j++) {
			for (i = this._route.coordinates[j].length - 1; i >= 0 ; i--) {
				// TODO: maybe do this in pixel space instead?
				d = latlng.distanceTo(this._route.coordinates[j][i]);
				if (d < minDist) {
					minIndex = i;
					minDist = d;
				}
			}}

			return minIndex;
		},

		_extendToWaypoints: function() {
			var wps = this._route.inputWaypoints,
				wpIndices = this._getWaypointIndices(),
			    i, j,
			    wpLatLng,
			    routeCoord;
				
			for (j = 0; j < this._route.coordinates.length; j++) {
			for (i = 0; i < wps.length; i++) {
//				wpLatLng = wps[i].latLng;
//				routeCoord = L.latLng(this._route.coordinates[j][wpIndices[i]]);
//				if (wpLatLng.distanceTo(routeCoord) >
//					this.options.missingRouteTolerance) {
//					this._addSegment([wpLatLng, routeCoord],
//						this.options.missingRouteStyles);
//				}
			}}
		},

		_addSegment: function(coords, styles, mouselistener) {
			var i,
				pl;

			for (i = 0; i < styles.length; i++) {
				pl = L.polyline(coords, styles[i]);
				this.addLayer(pl);
				if (mouselistener) {
					pl.on('mousedown', this._onLineTouched, this);
				}
			}
		},

		_findNearestWpBefore: function(i) {
			var wpIndices = this._getWaypointIndices(),
				j = wpIndices.length - 1;
			while (j >= 0 && wpIndices[j] > i) {
				j--;
			}

			return j;
		},

		_onLineTouched: function(e) {
			var afterIndex = this._findNearestWpBefore(this._findClosestRoutePoint(e.latlng));
			this.fire('linetouched', {
				afterIndex: afterIndex,
				latlng: e.latlng
			});
		},

		_getWaypointIndices: function() {
			if (!this._wpIndices) {
				this._wpIndices = this._route.waypointIndices || this._findWaypointIndices();
			}

			return this._wpIndices;
		}
	});

	L.Routing.line = function(route, options) {
		return new L.Routing.Line(route, options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],11:[function(require,module,exports){
(function() {
	'use strict';
	L.Routing = L.Routing || {};

	L.Routing.Localization = {
		'en': {
			directions: {
				NORTH: 'north',
				NORTHEAST: 'northeast',
				EAST: 'east',
				SOUTHEAST: 'southeast',
				SOUTH: 'south',
				SOUTHWEST: 'southwest',
				WEST: 'west',
				NORTHWEST: 'northwest',
				NONE: ''
			},
			instructions: {
				// instruction, postfix if the road is named
				'INIT':
					['INIT'],
				'DEPART':
					['Head {dir}', ' on {road}'],
				'CONTINUE':
					['Continue {dir}', ' on {road}'],
				'SLIGHTLY_RIGHT':
					['Turn slightly right', ' onto {road}'],
				'RIGHT':
					['Turn right', ' onto {road}'],
				'HARD_RIGHT':
					['Turn sharply right', ' onto {road}'],
				'HARD_LEFT':
					['Turn sharply left', ' onto {road}'],
				'LEFT':
					['Turn left', ' onto {road}'],
				'SLIGHTLY_LEFT':
					['Turn slightly left', ' onto {road}'],
				'CIRCLE_CLOCKWISE':
					['Turn clockwise', ' onto {road}'],
				'CIRCLE_COUNTERCLOCKWISE': 
					['Turn counterclockwise', ' onto {road}'],
				'UTURN_LEFT':
					['Make a U-turn to the left'],
				'UTURN_RIGHT':
					['Make a U-turn to the right'],
				'ELEVATOR':
					['ELEVATOR'],
				'END':
					['Destination reached']
			},
			formatOrder: function(n) {
				var i = n % 10 - 1,
				suffix = ['st', 'nd', 'rd'];

				return suffix[i] ? n + suffix[i] : n + 'th';
			},
			ui: {
				startPlaceholder: 'Start',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'End'
			}
		},

		'fi': {
			directions: {
				NORTH: 'pohjoiseen',
				NORTHEAST: 'koilliseen',
				EAST: 'itään',
				SOUTHEAST: 'kaakkoon',
				SOUTH: 'etelään',
				SOUTHWEST: 'lounaaseen',
				WEST: 'länteen',
				NORTHWEST: 'luoteeseen',
				NONE: ''
			},
			instructions: {
				// instruction, postfix if the road is named
				'INIT':
					['INIT'],
				'DEPART':
					['Aja {dir}:', ' {road}'],
				'CONTINUE':
					['Jatka {dir}:', ' {road}'],
				'SLIGHTLY_RIGHT':
					['Käänny loivasti oikealle:', ' {road}'],
				'RIGHT':
					['Käänny oikealle:', ' {road}'],
				'HARD_RIGHT':
					['Käänny jyrkästi oikealle:', ' {road}'],
				'HARD_LEFT':
					['Käänny jyrkästi vasemmalle:', ' {road}'],
				'LEFT':
					['Käänny vasemmalle:', ' {road}'],
				'SLIGHTLY_LEFT':
					['Käänny loivasti vasemmalle:', ' {road}'],
				'CIRCLE_CLOCKWISE':
					['Kierrä myötäpäivään:', ' {road}'],
				'CIRCLE_COUNTERCLOCKWISE':
					['Kierrä vastapäivään:', ' {road}'],
				'UTURN_LEFT':
					['U-käännös vasemmalle'],
				'UTURN_RIGHT':
					['U-käännös oikealle'],
				'ELEVATOR':
					['ELEVATOR'],
				'END':
					['Olet perillä']
			},
			formatOrder: function(n) {

			},
			ui: {
				startPlaceholder: 'Alku',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Loppu'
			}
		},

		'sv': {
			directions: {
				NORTH: 'norr',
				NORTHEAST: 'nordost',
				EAST: 'öst',
				SOUTHEAST: 'sydost',
				SOUTH: 'syd',
				SOUTHWEST: 'sydväst',
				WEST: 'väst',
				NORTHWEST: 'nordväst',
				NONE: ''
			},
			instructions: {
				// instruction, postfix if the road is named
				'INIT':
					['INIT'],
				'DEPART':
					['Åk åt {dir}', ' på {road}'],
				'CONTINUE':
					['Fortsätt {dir}', ' på {road}'],
				'SLIGHTLY_RIGHT':
					['Sväng svagt höger', ' på {road}'],
				'RIGHT':
					['Sväng höger', ' på {road}'],
				'HARD_RIGHT':
					['Sväng skarpt höger', ' på {road}'],
				'HARD_LEFT':
					['Sväng skarpt vänster', ' på {road}'],
				'LEFT':
					['Sväng vänster', ' på {road}'],
				'SLIGHTLY_LEFT':
					['Sväng svagt vänster', ' på {road}'],
				'CIRCLE_CLOCKWISE':
					['Sväng cirkel medsols'],
				'CIRCLE_COUNTERCLOCKWISE':
					['Sväng cirkel moturs'],
				'UTURN_LEFT':
					['Gör en U-sväng till vänster'],
				'UTURN_RIGHT':
					['Gör en U-sväng till höger'],
				'ELEVATOR':
					['ELEVATOR'],
				'END':
					['Framme vid resans mål']
			},
			formatOrder: function(n) {
				return ['första', 'andra', 'tredje', 'fjärde', 'femte',
					'sjätte', 'sjunde', 'åttonde', 'nionde', 'tionde'
					/* Can't possibly be more than ten exits, can there? */][n - 1];
			},
			ui: {
				startPlaceholder: 'Från',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Till'
			}
		},

		'de': {
			directions: {
				N: 'Norden',
				NE: 'Nordosten',
				E: 'Osten',
				SE: 'Südosten',
				S: 'Süden',
				SW: 'Südwesten',
				W: 'Westen',
				NW: 'Nordwesten'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Richtung {dir}', ' auf {road}'],
				'Continue':
					['Geradeaus Richtung {dir}', ' auf {road}'],
				'SlightRight':
					['Leicht rechts abbiegen', ' auf {road}'],
				'Right':
					['Rechts abbiegen', ' auf {road}'],
				'SharpRight':
					['Scharf rechts abbiegen', ' auf {road}'],
				'TurnAround':
					['Wenden'],
				'SharpLeft':
					['Scharf links abbiegen', ' auf {road}'],
				'Left':
					['Links abbiegen', ' auf {road}'],
				'SlightLeft':
					['Leicht links abbiegen', ' auf {road}'],
				'WaypointReached':
					['Zwischenhalt erreicht'],
				'Roundabout':
					['Nehmen Sie die {exitStr} Ausfahrt im Kreisverkehr', ' auf {road}'],
				'DestinationReached':
					['Sie haben ihr Ziel erreicht']
			},
			formatOrder: function(n) {
				return n + '.';
			},
			ui: {
				startPlaceholder: 'Start',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Ziel'
			}
		},

		'sp': {
			directions: {
				N: 'norte',
				NE: 'noreste',
				E: 'este',
				SE: 'sureste',
				S: 'sur',
				SW: 'suroeste',
				W: 'oeste',
				NW: 'noroeste'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Derecho {dir}', ' sobre {road}'],
				'Continue':
					['Continuar {dir}', ' en {road}'],
				'SlightRight':
					['Leve giro a la derecha', ' sobre {road}'],
				'Right':
					['Derecha', ' sobre {road}'],
				'SharpRight':
					['Giro pronunciado a la derecha', ' sobre {road}'],
				'TurnAround':
					['Dar vuelta'],
				'SharpLeft':
					['Giro pronunciado a la izquierda', ' sobre {road}'],
				'Left':
					['Izquierda', ' en {road}'],
				'SlightLeft':
					['Leve giro a la izquierda', ' en {road}'],
				'WaypointReached':
					['Llegó a un punto del camino'],
				'Roundabout':
					['Tomar {exitStr} salida en la rotonda', ' en {road}'],
				'DestinationReached':
					['Llegada a destino']
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Inicio',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Destino'
			}
		},
		'nl': {
			directions: {
				N: 'noordelijke',
				NE: 'noordoostelijke',
				E: 'oostelijke',
				SE: 'zuidoostelijke',
				S: 'zuidelijke',
				SW: 'zuidewestelijke',
				W: 'westelijke',
				NW: 'noordwestelijke'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Vertrek in {dir} richting', ' de {road} op'],
				'Continue':
					['Ga in {dir} richting', ' de {road} op'],
				'SlightRight':
					['Volg de weg naar rechts', ' de {road} op'],
				'Right':
					['Ga rechtsaf', ' de {road} op'],
				'SharpRight':
					['Ga scherpe bocht naar rechts', ' de {road} op'],
				'TurnAround':
					['Keer om'],
				'SharpLeft':
					['Ga scherpe bocht naar links', ' de {road} op'],
				'Left':
					['Ga linksaf', ' de {road} op'],
				'SlightLeft':
					['Volg de weg naar links', ' de {road} op'],
				'WaypointReached':
					['Aangekomen bij tussenpunt'],
				'Roundabout':
					['Neem de {exitStr} afslag op de rotonde', ' de {road} op'],
				'DestinationReached':
					['Aangekomen op eindpunt']
			},
			formatOrder: function(n) {
				if (n === 1 || n >= 20) {
					return n + 'ste';
				} else {
					return n + 'de';
				}
			},
			ui: {
				startPlaceholder: 'Vertrekpunt',
				viaPlaceholder: 'Via {viaNumber}',
				endPlaceholder: 'Bestemming'
			}
		},
		'fr': {
			directions: {
				N: 'nord',
				NE: 'nord-est',
				E: 'est',
				SE: 'sud-est',
				S: 'sud',
				SW: 'sud-ouest',
				W: 'ouest',
				NW: 'nord-ouest'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Tout droit au {dir}', ' sur {road}'],
				'Continue':
					['Continuer au {dir}', ' sur {road}'],
				'SlightRight':
					['Légèrement à droite', ' sur {road}'],
				'Right':
					['A droite', ' sur {road}'],
				'SharpRight':
					['Complètement à droite', ' sur {road}'],
				'TurnAround':
					['Faire demi-tour'],
				'SharpLeft':
					['Complètement à gauche', ' sur {road}'],
				'Left':
					['A gauche', ' sur {road}'],
				'SlightLeft':
					['Légèrement à gauche', ' sur {road}'],
				'WaypointReached':
					['Point d\'étape atteint'],
				'Roundabout':
					['Au rond-point, prenez la {exitStr} sortie', ' sur {road}'],
				'DestinationReached':
					['Destination atteinte']
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Départ',
				viaPlaceholder: 'Intermédiaire {viaNumber}',
				endPlaceholder: 'Arrivée'
			}
		},
		'it': {
			directions: {
				N: 'nord',
				NE: 'nord-est',
				E: 'est',
				SE: 'sud-est',
				S: 'sud',
				SW: 'sud-ovest',
				W: 'ovest',
				NW: 'nord-ovest'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Dritto verso {dir}', ' su {road}'],
				'Continue':
					['Continuare verso {dir}', ' su {road}'],
				'SlightRight':
					['Mantenere la destra', ' su {road}'],
				'Right':
					['A destra', ' su {road}'],
				'SharpRight':
					['Strettamente a destra', ' su {road}'],
				'TurnAround':
					['Fare inversione di marcia'],
				'SharpLeft':
					['Strettamente a sinistra', ' su {road}'],
				'Left':
					['A sinistra', ' sur {road}'],
				'SlightLeft':
					['Mantenere la sinistra', ' su {road}'],
				'WaypointReached':
					['Punto di passaggio raggiunto'],
				'Roundabout':
					['Alla rotonda, prendere la {exitStr} uscita'],
				'DestinationReached':
					['Destinazione raggiunta']
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Partenza',
				viaPlaceholder: 'Intermedia {viaNumber}',
				endPlaceholder: 'Destinazione'
			}
		},
		'pt': {
			directions: {
				N: 'norte',
				NE: 'nordeste',
				E: 'leste',
				SE: 'sudeste',
				S: 'sul',
				SW: 'sudoeste',
				W: 'oeste',
				NW: 'noroeste'
			},
			instructions: {
				// instruction, postfix if the road is named
				'Head':
					['Siga {dir}', ' na {road}'],
				'Continue':
					['Continue {dir}', ' na {road}'],
				'SlightRight':
					['Curva ligeira a direita', ' na {road}'],
				'Right':
					['Curva a direita', ' na {road}'],
				'SharpRight':
					['Curva fechada a direita', ' na {road}'],
				'TurnAround':
					['Retorne'],
				'SharpLeft':
					['Curva fechada a esquerda', ' na {road}'],
				'Left':
					['Curva a esquerda', ' na {road}'],
				'SlightLeft':
					['Curva ligueira a esquerda', ' na {road}'],
				'WaypointReached':
					['Ponto de interesse atingido'],
				'Roundabout':
					['Pegue a {exitStr} saída na rotatória', ' na {road}'],
				'DestinationReached':
					['Destino atingido']
			},
			formatOrder: function(n) {
				return n + 'º';
			},
			ui: {
				startPlaceholder: 'Origem',
				viaPlaceholder: 'Intermédio {viaNumber}',
				endPlaceholder: 'Destino'
			}
		}
	};

	module.exports = L.Routing;
})();

},{}],12:[function(require,module,exports){
(function (global){
(function() {
	'use strict';
	
	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null),
		corslite = require('corslite'),
		polyline = require('polyline');

	// Ignore camelcase naming for this file, since OSRM's API uses
	// underscores.
	/* jshint camelcase: false */

	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.Waypoint'));

	L.Routing.OSRM = L.Class.extend({
		options: {
			// serviceUrl: 'http://hub.geosmartcity.eu/otp/routers/default/plan',
			serviceUrl: 'http://gis.dc.turkuamk.fi:8080/otp/routers/default/plan',
			timeout: 30 * 1000,
			routingOptions: {}
		},

		initialize: function(options) {
			L.Util.setOptions(this, options);
			this._hints = {
				locations: {}
			};
		},

		route: function(waypoints, callback, context, options) {
			var timedOut = false,
				wps = [],
				url,
				timer,
				wp,
				i;

			url = this.buildRouteUrl(waypoints, L.extend({}, this.options.routingOptions, options));
			timer = setTimeout(function() {
				timedOut = true;
				callback.call(context || callback, {
					status: -1,
					message: 'OSRM request timed out.'
				});
			}, this.options.timeout);

			// Create a copy of the waypoints, since they
			// might otherwise be asynchronously modified while
			// the request is being processed.
			for (i = 0; i < waypoints.length; i++) {
				wp = waypoints[i];
				wps.push(new L.Routing.Waypoint(wp.latLng, wp.name, wp.options));
			}

			corslite(url, L.bind(function(err, resp) {
				var data,
					errorMessage,
					statusCode;

				clearTimeout(timer);
				if (!timedOut) {
					errorMessage = 'HTTP request failed: ' + err;
					statusCode = -1;

					if (!err) {
						try {
							data = JSON.parse(resp.responseText);
							try {
								
								return this._routeDone(data, wps, callback, context);
							} catch (ex) {
								statusCode = -3;
								errorMessage = ex.toString();
							}
						} catch (ex) {
							statusCode = -2;
							errorMessage = 'Error parsing OSRM response: ' + ex.toString();
						}
					}

					callback.call(context || callback, {
						status: statusCode,
						message: errorMessage
					});
				}
			}, this));

			return this;
		},

		/**
		 * In this function the data, got from the server, is sorted
		 * and put to another object 'alts' which is than used by callback function
		 * @param response (data from the server)
		 * @param inputWaypoints
		 * @param callback
         * @param context
         * @private
         */
		_routeDone: function(response, inputWaypoints, callback, context) {
			// Can be useful if you want to see which data was returned from the server
			console.log(response);
			var coordinates,
			    alts,
			    actualWaypoints,
			    itinerary,
				leg,
				stopIdBus;

			context = context || callback;

			alts = [];
			// For loop will for depending on the number of itineraries(alternatives) returned in response
			for (itinerary = 0; itinerary < response["plan"]["itineraries"].length; itinerary++) {
				coordinates = [];
				actualWaypoints = this._toWaypoints(inputWaypoints, [[response["plan"]["from"]["lat"], response["plan"]["from"]["lon"]], [response["plan"]["to"]["lat"], response["plan"]["to"]["lon"]]]);

				var steps = [];
				var routeSum = [];
				var direction, type;
				var speed;

				var legBusDistance = 0;
				var legCarDistance = 0;
				var totalDistance = 0;
				var totalTime = 0;

				// speed = response["plan"]["itineraries"][itinerary]["legs"][0]["distance"] / response["plan"]["itineraries"][itinerary]["legs"][0]["duration"];
				var currentLeg = response["plan"]["itineraries"][itinerary]["legs"];
				
				// Calculating total distance
				for (leg = 0; leg < currentLeg.length; leg++) {
					totalDistance += currentLeg[leg]["distance"];
				}
				
				// Loop for each leg inside the itinerary
				for (leg = 0; leg < currentLeg.length; leg++) {
					coordinates.push(this._decodePolyline(currentLeg[leg]["legGeometry"]["points"]));
					steps.push([]);
					// Getting data for bus leg
					var busDeparture = new Date(currentLeg[leg]["from"]["departure"]);
					var busArrival = new Date(currentLeg[leg]["from"]["arrival"]);
					var busStop = "";

					// Bus stop which is used to get into/out of the bus
					if (currentLeg[leg]["mode"] == 'BUS' || currentLeg[leg]["from"]["vertexType"] == 'TRANSIT') {
						stopIdBus = currentLeg[leg]["from"]["stopId"].split(':');
						busStop = stopIdBus[1];
					}

					// Calculating bus distance
					if (currentLeg[leg]["mode"] == 'BUS') {
						legBusDistance += currentLeg[leg]["distance"];
					}
					// Calculating car distance
					if (currentLeg[leg]["mode"] == 'CAR') {
						legCarDistance += currentLeg[leg]["distance"];
					}

					// type "INIT" and its' data to separate different legs
					steps[leg].push({
								type: "INIT",
								distance: 0,
								timeDep: busDeparture.getHours() + ':' + (('0' + busDeparture.getMinutes()).slice(-2)),
								timeArr: busArrival.getHours() + ':' + (('0' + busArrival.getMinutes()).slice(-2)),
								road: currentLeg[leg]["from"]["name"],
								direction: "NONE",
								exit: undefined,
								index: L.latLng(currentLeg[leg]["from"]["lat"], currentLeg[leg]["from"]["lon"]),
								mode: currentLeg[leg]["mode"],
								routeNumber: currentLeg[leg]["route"],
								stopIndex: busStop
							});

					// Getting data for the bus stops if they exists
					if (currentLeg[leg]["intermediateStops"].length != 0) {
						for (var j = 0; j < currentLeg[leg]["intermediateStops"].length; j++) {
							var time = new Date(currentLeg[leg]["intermediateStops"][j]["arrival"]);
							var stopId = currentLeg[leg]["intermediateStops"][j]["stopId"].split(':');
							steps[leg].push({
								type: "busStop",
								arriveTime: time.getHours() + ':' + (('0' + time.getMinutes()).slice(-2)),
								streetName: currentLeg[leg]["intermediateStops"][j]["name"],
								stopIndex: stopId[1],
								positionIndex: L.latLng(currentLeg[leg]["intermediateStops"][j]["lat"], currentLeg[leg]["intermediateStops"][j]["lon"])
							});
						}
					}

					// Getting data if normal step instruction (inside the leg)
					else {
						var currentStep = currentLeg[leg]["steps"];
						for (var i = 0; i < currentStep.length; i++) {
							steps[leg].push({
								type: currentStep[i]["relativeDirection"],
								distance: currentStep[i]["distance"],
								// time: Math.round(currentStep[i]["distance"] / speed),
								road: currentStep[i]["streetName"],
								direction: currentStep[i]["absoluteDirection"],
								exit: undefined,
								index: L.latLng(currentStep[i]["lat"], currentStep[i]["lon"]),
								mode: currentLeg[leg]["mode"]
							});
						}
					}

					// Last instruction of the alternative with the type END
					if (leg === currentLeg.length - 1) {
						steps[leg].push({
							type: "END",
							distance: 0,
							time: currentLeg[leg]["duration"],
							road: currentLeg[leg]["to"]["name"],
							direction: "NONE",
							exit: undefined,
							index: L.latLng(response["plan"]["to"]["lat"], response["plan"]["to"]["lon"]),
							mode: currentLeg[leg]["mode"]
						});
					}
			}
				// total time and distance of the alternative
				routeSum = {
					totalDistance: totalDistance,
					totalTime: response["plan"]["itineraries"][itinerary]["duration"]

				};

				// Pushing data into tha object (alts)
				alts.push({
					name: this._createName([response["plan"]["from"]["name"], response["plan"]["to"]["name"]]),
					coordinates: coordinates,
					instructions: steps,
					summary: routeSum,
					inputWaypoints: inputWaypoints,
					waypoints: actualWaypoints,
					busDistance: legBusDistance,
					carDistance: legCarDistance
					});
			}

			// Can be useful if you want to check which data is contained inside
			// the object which was created from the response
			// console.log(alts);

			// only versions <4.5.0 will support this flag
			if (response.hint_data) {
				this._saveHintData(response.hint_data, inputWaypoints);
			}
			callback.call(context, null, alts);
		},

		_decodePolyline: function(routeGeometry) {
			var cs = polyline.decode(routeGeometry, 5),
				result = new Array(cs.length),
				i;
			for (i = cs.length - 1; i >= 0; i--) {
				result[i] = L.latLng(cs[i]);
			}

			return result;
		},

		_toWaypoints: function(inputWaypoints, vias) {
			var wps = [],
			    i;
			for (i = 0; i < vias.length; i++) {
				wps.push(L.Routing.waypoint(L.latLng(vias[i]),
				                            inputWaypoints[i].name,
				                            inputWaypoints[i].options));
			}

			return wps;
		},

		_createName: function(nameParts) {
			var name = '',
				i;

			for (i = 0; i < nameParts.length; i++) {
				if (nameParts[i]) {
					if (name) {
						name += ', ';
					}
					name += nameParts[i].charAt(0).toUpperCase() + nameParts[i].slice(1);
				}
			}

			return name;
		},

		/**
		 * Function builds the URL - reques which is sent to the server
		 * @param waypoints
		 * @param options
         * @returns {string}
         */
		buildRouteUrl: function(waypoints, options) {

			var dateString, timeString, d, t;
			var arriveBy = false;
			
			// Turns on arrive by mode
			if ($(".time-options").find("input[value='Arrival']").prop("checked")) {
				arriveBy = true;
			}
			
			if ($(".time-options").find("input[value='Now']").prop("checked")){
				d = new Date();
				t = new Date();
				dateString = (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getFullYear();
				timeString = t.toLocaleTimeString().replace(/([\t]+:[\t]{2})(:[\t]{2})(.*)/, "$1$3");
			} else {
				d = $("#dateId").val();
				dateString = d.split("/");
				dateString = dateString[0] + "-" + dateString[1] + "-" + dateString[2];
				timeString = $("#timeId").val();
			}

			// Additional request options
			var walkSpeed = $('#walkSpeedInput option:selected').val();
			var bikeSpeed = $('#bikeSpeedInput option:selected').val();
			var walkDistance = $('#walkDistInput').val();


			return this.options.serviceUrl + '?' + "fromPlace=" + waypoints[0]["latLng"]["lat"] + "%2C" + waypoints[0]["latLng"]["lng"] + "&toPlace=" + waypoints[1]["latLng"]["lat"] + "%2C" + waypoints[1]["latLng"]["lng"] +
				"&time=" + timeString + "&date=" + dateString + "&arriveBy=" + arriveBy + "&mode=" + selectedMode +
				"&showIntermediateStops=" + true + "&walkSpeed=" + walkSpeed + "&bikeSpeed=" + bikeSpeed + "&maxWalkDistance=" + walkDistance;
		},

		_locationKey: function(location) {
			return location.lat + ',' + location.lng;
		},

		_saveHintData: function(hintData, waypoints) {
			var loc;
			this._hints = {
				checksum: hintData.checksum,
				locations: {}
			};
			for (var i = hintData.locations.length - 1; i >= 0; i--) {
				loc = waypoints[i].latLng;
				this._hints.locations[this._locationKey(loc)] = hintData.locations[i];
			}
		},

		_convertSummary: function(osrmSummary) {
			return {
				totalDistance: osrmSummary.total_distance,
				totalTime: osrmSummary.total_time
			};
		},

		_convertInstructions: function(osrmInstructions) {
			var result = [],
			    i,
			    instr,
			    type,
			    driveDir;

			for (i = 0; i < osrmInstructions.length; i++) {
				instr = osrmInstructions[i];
				type = this._drivingDirectionType(instr[0]);
				driveDir = instr[0].split('-');
				if (type) {
					result.push({
						type: type,
						distance: instr[2],
						time: instr[4],
						road: instr[1],
						direction: instr[6],
						exit: driveDir.length > 1 ? driveDir[1] : undefined,
						index: instr[3]
					});
				}
			}
			return result;
		},

		_drivingDirectionType: function(d) {
			switch (parseInt(d, 10)) {
			case 1:
				return 'Straight';
			case 2:
				return 'SlightRight';
			case 3:
				return 'Right';
			case 4:
				return 'SharpRight';
			case 5:
				return 'TurnAround';
			case 6:
				return 'SharpLeft';
			case 7:
				return 'Left';
			case 8:
				return 'SlightLeft';
			case 9:
				return 'WaypointReached';
			case 10:
				// TODO: "Head on"
				// https://github.com/DennisOSRM/Project-OSRM/blob/master/DataStructures/TurnInstructions.h#L48
				return 'Straight';
			case 11:
			case 12:
				return 'Roundabout';
			case 15:
				return 'DestinationReached';
			default:
				return null;
			}
		},

		_clampIndices: function(indices, coords) {
			var maxCoordIndex = coords.length - 1,
				i;
			for (i = 0; i < indices.length; i++) {
				indices[i] = Math.min(maxCoordIndex, Math.max(indices[i], 0));
			}
			return indices;
		}
	});

	L.Routing.osrm = function(options) {
		return new L.Routing.OSRM(options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.Waypoint":14,"corslite":1,"polyline":2}],13:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);
	L.Routing = L.Routing || {};
	L.extend(L.Routing, require('./L.Routing.GeocoderElement'));
	L.extend(L.Routing, require('./L.Routing.Waypoint'));

	L.Routing.Plan = L.Class.extend({
		includes: L.Mixin.Events,

		options: {
			dragStyles: [
				{color: 'black', opacity: 0.15, weight: 9},
				{color: 'white', opacity: 0.8, weight: 6},
				{color: 'red', opacity: 1, weight: 2, dashArray: '7,12'}
			],
			draggableWaypoints: true,
			routeWhileDragging: false,
			addWaypoints: true,
			reverseWaypoints: false,
			addButtonClassName: '',
			language: setRoutingLanguage(),
			createGeocoderElement: L.Routing.geocoderElement,
			createMarker: function(i, wp) {
				var options = {
						draggable: this.draggableWaypoints
					},
				    marker = L.marker(wp.latLng, options);

				return marker;
			},
			geocodersClassName: ''
		},

		initialize: function(waypoints, options) {
			L.Util.setOptions(this, options);
			this._waypoints = [];
			this.setWaypoints(waypoints);
		},

		isReady: function() {
			var i;
			for (i = 0; i < this._waypoints.length; i++) {
				if (!this._waypoints[i].latLng) {
					return false;
				}
			}

			return true;
		},

		getWaypoints: function() {
			var i,
				wps = [];

			for (i = 0; i < this._waypoints.length; i++) {
				wps.push(this._waypoints[i]);
			}

			return wps;
		},

		setWaypoints: function(waypoints) {
			var args = [0, this._waypoints.length].concat(waypoints);
			this.spliceWaypoints.apply(this, args);
			return this;
		},

		spliceWaypoints: function() {
			var args = [arguments[0], arguments[1]],
			    i;

			for (i = 2; i < arguments.length; i++) {
				args.push(arguments[i] && arguments[i].hasOwnProperty('latLng') ? arguments[i] : L.Routing.waypoint(arguments[i]));
			}

			[].splice.apply(this._waypoints, args);

			// Make sure there's always at least two waypoints
			while (this._waypoints.length < 2) {
				this.spliceWaypoints(this._waypoints.length, 0, null);
			}

			this._updateMarkers();
			this._fireChanged.apply(this, args);
		},

		onAdd: function(map) {
			this._map = map;
			this._updateMarkers();
		},

		onRemove: function() {
			var i;
			this._removeMarkers();

			if (this._newWp) {
				for (i = 0; i < this._newWp.lines.length; i++) {
					this._map.removeLayer(this._newWp.lines[i]);
				}
			}

			delete this._map;
		},

		createGeocoders: function() {
			var container = L.DomUtil.create('div', 'leaflet-routing-geocoders ' + this.options.geocodersClassName),
				waypoints = this._waypoints,
			    addWpBtn,
			    reverseBtn;

			this._geocoderContainer = container;
			this._geocoderElems = [];


			if (this.options.addWaypoints) {
				addWpBtn = L.DomUtil.create('button', 'leaflet-routing-add-waypoint ' + this.options.addButtonClassName, container);
				addWpBtn.setAttribute('type', 'button');
				L.DomEvent.addListener(addWpBtn, 'click', function() {
					this.spliceWaypoints(waypoints.length, 0, null);
				}, this);
			}

			if (this.options.reverseWaypoints) {
				reverseBtn = L.DomUtil.create('button', 'leaflet-routing-reverse-waypoints', container);
				reverseBtn.setAttribute('type', 'button');
				L.DomEvent.addListener(reverseBtn, 'click', function() {
					this._waypoints.reverse();
					this.setWaypoints(this._waypoints);
				}, this);
			}

			this._updateGeocoders();
			this.on('waypointsspliced', this._updateGeocoders);

			return container;
		},

		_createGeocoder: function(i) {
			var geocoder = this.options.createGeocoderElement(this._waypoints[i], i, this._waypoints.length, this.options);
			geocoder
			.on('delete', function() {
				if (i > 0 || this._waypoints.length > 2) {
					this.spliceWaypoints(i, 1);
				} else {
					this.spliceWaypoints(i, 1, new L.Routing.Waypoint());
				}
			}, this)
			.on('geocoded', function(e) {
				this._updateMarkers();
				this._fireChanged();
				this._focusGeocoder(i + 1);
				this.fire('waypointgeocoded', {
					waypointIndex: i,
					waypoint: e.waypoint
				});
			}, this)
			.on('reversegeocoded', function(e) {
				this.fire('waypointgeocoded', {
					waypointIndex: i,
					waypoint: e.waypoint
				});
			}, this);

			return geocoder;
		},

		_updateGeocoders: function() {
			var elems = [],
				i,
			    geocoderElem;

			for (i = 0; i < this._geocoderElems.length; i++) {
				this._geocoderContainer.removeChild(this._geocoderElems[i].getContainer());
			}

			for (i = this._waypoints.length - 1; i >= 0; i--) {
				geocoderElem = this._createGeocoder(i);
				this._geocoderContainer.insertBefore(geocoderElem.getContainer(), this._geocoderContainer.firstChild);
				elems.push(geocoderElem);
			}

			this._geocoderElems = elems.reverse();
		},

		_removeMarkers: function() {
			var i;
			if (this._markers) {
				for (i = 0; i < this._markers.length; i++) {
					if (this._markers[i]) {
						this._map.removeLayer(this._markers[i]);
					}
				}
			}
			this._markers = [];
		},

		_updateMarkers: function() {
			var i,
			    m;

			if (!this._map) {
				return;
			}

			this._removeMarkers();

			for (i = 0; i < this._waypoints.length; i++) {
				if (this._waypoints[i].latLng) {
					m = this.options.createMarker(i, this._waypoints[i], this._waypoints.length);
					if (m) {
						m.addTo(this._map);
						if (this.options.draggableWaypoints) {
							this._hookWaypointEvents(m, i);
						}
					}
				} else {
					m = null;
				}
				this._markers.push(m);
			}
		},

		_fireChanged: function() {
			this.fire('waypointschanged', {waypoints: this.getWaypoints()});

			if (arguments.length >= 2) {
				this.fire('waypointsspliced', {
					index: Array.prototype.shift.call(arguments),
					nRemoved: Array.prototype.shift.call(arguments),
					added: arguments
				});
			}
		},

		_hookWaypointEvents: function(m, i, trackMouseMove) {
			var eventLatLng = function(e) {
					return trackMouseMove ? e.latlng : e.target.getLatLng();
				},
				dragStart = L.bind(function(e) {
					this.fire('waypointdragstart', {index: i, latlng: eventLatLng(e)});
				}, this),
				drag = L.bind(function(e) {
					this._waypoints[i].latLng = eventLatLng(e);
					this.fire('waypointdrag', {index: i, latlng: eventLatLng(e)});
				}, this),
				dragEnd = L.bind(function(e) {
					this._waypoints[i].latLng = eventLatLng(e);
					this._waypoints[i].name = '';
					if (this._geocoderElems) {
						this._geocoderElems[i].update(true);
					}
					this.fire('waypointdragend', {index: i, latlng: eventLatLng(e)});
					this._fireChanged();
				}, this),
				mouseMove,
				mouseUp;

			if (trackMouseMove) {
				mouseMove = L.bind(function(e) {
					this._markers[i].setLatLng(e.latlng);
					drag(e);
				}, this);
				mouseUp = L.bind(function(e) {
					this._map.dragging.enable();
					this._map.off('mouseup', mouseUp);
					this._map.off('mousemove', mouseMove);
					dragEnd(e);
				}, this);
				this._map.dragging.disable();
				this._map.on('mousemove', mouseMove);
				this._map.on('mouseup', mouseUp);
				dragStart({latlng: this._waypoints[i].latLng});
			} else {
				m.on('dragstart', dragStart);
				m.on('drag', drag);
				m.on('dragend', dragEnd);
			}
		},

		dragNewWaypoint: function(e) {
			var newWpIndex = e.afterIndex + 1;
			if (this.options.routeWhileDragging) {
				this.spliceWaypoints(newWpIndex, 0, e.latlng);
				this._hookWaypointEvents(this._markers[newWpIndex], newWpIndex, true);
			} else {
				this._dragNewWaypoint(newWpIndex, e.latlng);
			}
		},

		_dragNewWaypoint: function(newWpIndex, initialLatLng) {
			var wp = new L.Routing.Waypoint(initialLatLng),
				prevWp = this._waypoints[newWpIndex - 1],
				nextWp = this._waypoints[newWpIndex],
				marker = this.options.createMarker(newWpIndex, wp, this._waypoints.length + 1),
				lines = [],
				mouseMove = L.bind(function(e) {
					var i;
					if (marker) {
						marker.setLatLng(e.latlng);
					}
					for (i = 0; i < lines.length; i++) {
						lines[i].spliceLatLngs(1, 1, e.latlng);
					}
				}, this),
				mouseUp = L.bind(function(e) {
					var i;
					if (marker) {
						this._map.removeLayer(marker);
					}
					for (i = 0; i < lines.length; i++) {
						this._map.removeLayer(lines[i]);
					}
					this._map.off('mousemove', mouseMove);
					this._map.off('mouseup', mouseUp);
					this.spliceWaypoints(newWpIndex, 0, e.latlng);
				}, this),
				i;

			if (marker) {
				marker.addTo(this._map);
			}

			for (i = 0; i < this.options.dragStyles.length; i++) {
				lines.push(L.polyline([prevWp.latLng, initialLatLng, nextWp.latLng],
					this.options.dragStyles[i]).addTo(this._map));
			}

			this._map.on('mousemove', mouseMove);
			this._map.on('mouseup', mouseUp);
		},

		_focusGeocoder: function(i) {
			if (this._geocoderElems[i]) {
				this._geocoderElems[i].focus();
			} else {
				document.activeElement.blur();
			}
		}
	});

	L.Routing.plan = function(waypoints, options) {
		return new L.Routing.Plan(waypoints, options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./L.Routing.GeocoderElement":7,"./L.Routing.Waypoint":14}],14:[function(require,module,exports){
(function (global){
(function() {
	'use strict';

	var L = (typeof window !== "undefined" ? window.L : typeof global !== "undefined" ? global.L : null);
	L.Routing = L.Routing || {};

	L.Routing.Waypoint = L.Class.extend({
			options: {
				allowUTurn: false
			},
			initialize: function(latLng, name, options) {
				L.Util.setOptions(this, options);
				this.latLng = L.latLng(latLng);
				this.name = name;
			}
		});

	L.Routing.waypoint = function(latLng, name, options) {
		
		return new L.Routing.Waypoint(latLng, name, options);
	};

	module.exports = L.Routing;
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[4])(4)
});