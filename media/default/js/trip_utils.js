TYPE_OFFER = 0;
TYPE_DEMAND = 1;
TYPE_BOTH = 2;

var Step = Class.create({
    initialize: function(city, address, linestring, marker) {
        this.city = city;
        this.address = address;
        this.linestring = linestring; // points between previous step and current step
        this.marker = marker; // feature point
    }
});

/* route buffer or point buffer */
var buffer_style = OpenLayers.Util.applyDefaults({
    fillOpacity : 0.25,
    graphicOpacity : 1,
    strokeColor : "#2A4776",
    fillColor : "#2A4776"
}, OpenLayers.Feature.Vector.style['default']);

/* route */
var route_style = OpenLayers.Util.applyDefaults({
    strokeWidth : 3
}, buffer_style);

/* generic marker */
var marker_step_style = OpenLayers.Util.applyDefaults({
    graphicWidth: 26,
    graphicHeight: 44,
    graphicYOffset: -44,
    graphicOpacity: 1
}, OpenLayers.Feature.Vector.style['default']);

var marker_step2_style = OpenLayers.Util.applyDefaults({
    graphicWidth: 29,
    graphicHeight: 25,
    graphicXOffset: -29,
    graphicYOffset: -25,
    graphicOpacity: 1
}, OpenLayers.Feature.Vector.style['default']);

/* departure marker */
var departure_style = OpenLayers.Util.applyDefaults({
    externalGraphic: media_url + "img/start.png"
}, marker_step2_style);
var departure_car_style = OpenLayers.Util.applyDefaults({
    externalGraphic: media_url + "img/start_car.png"
}, marker_step_style);
var departure_passenger_style = OpenLayers.Util.applyDefaults({
    externalGraphic: media_url + "img/start_passenger.png"
}, marker_step_style);

/* step marker */
var step_style = OpenLayers.Util.applyDefaults({
    externalGraphic: media_url + "img/step.png"
}, marker_step2_style);

/* arrival marker */
var arrival_style = OpenLayers.Util.applyDefaults({
    externalGraphic: media_url + "img/stop.png"
}, marker_step2_style);
var arrival_car_style = OpenLayers.Util.applyDefaults({
    externalGraphic: media_url + "img/stop_car.png"
}, marker_step_style);
var arrival_passenger_style = OpenLayers.Util.applyDefaults({
    externalGraphic: media_url + "img/stop_passenger.png"
}, marker_step_style);

ToolBar = OpenLayers.Class(OpenLayers.Control.Panel, {
    initialize: function(layer, options, drawpoint_callback) {
        OpenLayers.Control.Panel.prototype.initialize.apply(this, [options]);

        this.addControls(
            [ new OpenLayers.Control.Navigation({'zoomWheelEnabled': false}) ]
        );
        var controls = [
            new OpenLayers.Control.DrawFeature(layer, OpenLayers.Handler.Point, {'displayClass': 'olControlDrawFeaturePoint'})
        ];
        for (var i = 0; i < controls.length; i++) {
            controls[i].featureAdded = drawpoint_callback;
        }
        this.addControls(controls);
    },

    draw: function() {
        var div = OpenLayers.Control.Panel.prototype.draw.apply(this, arguments);
        this.activateControl(this.controls[0]);
        return div;
    },

    CLASS_NAME: "ToolBar"
});

CustomLayerSwitcher = OpenLayers.Class(OpenLayers.Control.LayerSwitcher, {
    fontColor: "white",
    opacity: 0.75,
    baseLbl: null,
    baseLblTitle: "Base Layers",
    dataLblTitle: "Overlays",

    loadContents: function() {
        //configure main div
        this.div.style.position = "absolute";
        this.div.style.top = "25px";
        this.div.style.right = "0px";
        this.div.style.left = "";
        this.div.style.fontFamily = "sans-serif";
        this.div.style.fontWeight = "bold";
        this.div.style.marginTop = "3px";
        this.div.style.marginLeft = "3px";
        this.div.style.marginBottom = "3px";
        this.div.style.fontSize = "smaller";   
        this.div.style.color = this.fontColor;   
        this.div.style.backgroundColor = "transparent";

        OpenLayers.Event.observe(this.div, "mouseup", 
            OpenLayers.Function.bindAsEventListener(this.mouseUp, this));
        OpenLayers.Event.observe(this.div, "click",
                      this.ignoreEvent);
        OpenLayers.Event.observe(this.div, "mousedown",
            OpenLayers.Function.bindAsEventListener(this.mouseDown, this));
        OpenLayers.Event.observe(this.div, "dblclick", this.ignoreEvent);


        // layers list div        
        this.layersDiv = document.createElement("div");
        this.layersDiv.id = "layersDiv";
        this.layersDiv.style.paddingTop = "5px";
        this.layersDiv.style.paddingLeft = "10px";
        this.layersDiv.style.paddingBottom = "5px";
        this.layersDiv.style.paddingRight = "75px";
        this.layersDiv.style.backgroundColor = this.activeColor;        

        // had to set width/height to get transparency in IE to work.
        // thanks -- http://jszen.blogspot.com/2005/04/ie6-opacity-filter-caveat.html
        //
        this.layersDiv.style.width = "100%";
        this.layersDiv.style.height = "100%";


        this.baseLbl = document.createElement("div");
        this.baseLbl.innerHTML = "<u>" + this.baseLblTitle + "</u>";
        this.baseLbl.style.marginTop = "3px";
        this.baseLbl.style.marginLeft = "3px";
        this.baseLbl.style.marginBottom = "3px";

        this.baseLayersDiv = document.createElement("div");
        this.baseLayersDiv.style.paddingLeft = "10px";

        this.dataLbl = document.createElement("div");
        this.dataLbl.innerHTML = "<u>" + this.dataLblTitle + "</u>";
        this.dataLbl.style.marginTop = "3px";
        this.dataLbl.style.marginLeft = "3px";
        this.dataLbl.style.marginBottom = "3px";

        this.dataLayersDiv = document.createElement("div");
        this.dataLayersDiv.style.paddingLeft = "10px";

        if (this.ascending) {
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
        } else {
            this.layersDiv.appendChild(this.dataLbl);
            this.layersDiv.appendChild(this.dataLayersDiv);
            this.layersDiv.appendChild(this.baseLbl);
            this.layersDiv.appendChild(this.baseLayersDiv);
        }

        this.div.appendChild(this.layersDiv);

        OpenLayers.Rico.Corner.round(this.div, {corners: "tl bl",
                                        bgColor: "transparent",
                                        color: this.activeColor,
                                        blend: false});

        OpenLayers.Rico.Corner.changeOpacity(this.layersDiv, this.opacity);

        var imgLocation = OpenLayers.Util.getImagesLocation();
        var sz = new OpenLayers.Size(25,25);        

        // maximize button div
        var img = imgLocation + 'layer-switcher-maximize.png';
        this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MaximizeDiv", 
                                    null, 
                                    sz, 
                                    img, 
                                    "absolute");
        this.maximizeDiv.style.top = "5px";
        this.maximizeDiv.style.right = "0px";
        this.maximizeDiv.style.left = "";
        this.maximizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.maximizeDiv, "click", 
            OpenLayers.Function.bindAsEventListener(this.maximizeControl, this)
        );

        this.div.appendChild(this.maximizeDiv);

        // minimize button div
        img = imgLocation + 'layer-switcher-minimize.png';
        sz = new OpenLayers.Size(18,18);
        this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv(
                                    "OpenLayers_Control_MinimizeDiv", 
                                    null, 
                                    sz, 
                                    img, 
                                    "absolute");
        this.minimizeDiv.style.top = "5px";
        this.minimizeDiv.style.right = "0px";
        this.minimizeDiv.style.left = "";
        this.minimizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.minimizeDiv, "click", 
            OpenLayers.Function.bindAsEventListener(this.minimizeControl, this)
        );

        this.div.appendChild(this.minimizeDiv);
    },

    CLASS_NAME: "CustomLayerSwitcher"
});

function calculateRadius(origin, radius) {
    var delta = 90 / (6378137 * Math.PI);
    var glonlat;
    if (origin.CLASS_NAME == 'OpenLayers.LonLat') {
        glonlat = OpenLayers.Layer.SphericalMercator.inverseMercator(origin.lon, origin.lat);
    } else {
        glonlat = OpenLayers.Layer.SphericalMercator.inverseMercator(origin.x, origin.y);
    }
    return radius * (OpenLayers.Layer.SphericalMercator.forwardMercator(glonlat.lon, glonlat.lat + delta).lat - OpenLayers.Layer.SphericalMercator.forwardMercator(glonlat.lon, glonlat.lat - delta).lat);
}

function getCircle(origin, radius) {
    radius = calculateRadius(origin, radius);
    var sides = 40;
    var angle = Math.PI * ((1/sides) - (1/2));
    var rotatedAngle, x, y;
    var points = [];
    for(var i=0; i<sides; ++i) {
        rotatedAngle = angle + (i * 2 * Math.PI / sides);
        x = origin.x + (radius * Math.cos(rotatedAngle));
        y = origin.y + (radius * Math.sin(rotatedAngle));
        points.push(new OpenLayers.Geometry.Point(x, y));
    }
    var ring = new OpenLayers.Geometry.LinearRing(points);
    return new OpenLayers.Geometry.Polygon([ring]);
}

/*************************** Popup utilities *************************************************/
// Global vars
var selectedMarker;
var selectControl;

function onPopupClose(evt) {
    selectControl.unselect(selectedMarker);
}

function hideMarkerPopup(marker) {
    if (marker.popup) {
        map.removePopup(marker.popup);
        marker.popup.destroy();
        marker.popup = null;
    }
}

function showMarkerPopup(marker) {
    if (selectedMarker) {
        hideMarkerPopup(selectedMarker);
    }
    selectedMarker = marker;
    var popup = new OpenLayers.Popup.Anchored(
        "marker",
        new OpenLayers.LonLat(marker.geometry.x, marker.geometry.y),
        new OpenLayers.Size(180, 80),
        marker.attributes.name,
        null, true, onPopupClose);
    popup.backgroundColor = "transparent";
    marker.popup = popup;
    map.addPopup(popup);
}

/*************************** Calculate a Simple Trip Buffer **********************************/
var simple_trip_buffer; // global var !
function getSimpleTripBuffer(simple_trip_route, radius, wait_id, trip_layer) {
    if (wait_id) {
        $(wait_id).show();
    }
    new Ajax.Request('/ajax/calculate_buffer/', { method:'post',
        parameters: {
            geometry: wkt.write(new OpenLayers.Feature.Vector(simple_trip_route)),
            radius: radius
        },
        onSuccess: function(transport) {
            if (simple_trip_buffer) {
                trip_layer.removeFeatures([simple_trip_buffer]);
            }
            if (wait_id) {
                $(wait_id).hide();
                }
            simple_trip_buffer = wkt.read(transport.responseText.evalJSON().buffer);
            if (simple_trip_buffer) { // POLYGON EMPTY ?
                simple_trip_buffer.style = buffer_style;
                trip_layer.addFeatures([simple_trip_buffer]);
            }
        },
        onFailure: function() {
            if (simple_trip_buffer) {
                trip_layer.removeFeatures([simple_trip_buffer]);
            }
            simple_trip_buffer = null;
            if (wait_id) {
                $(wait_id).hide();
            }
        }
    });
}

function extendMapBounds(map, radius) { // to avoid misrepresentations on map borders
    if (radius < 2000) {
        radius = 2000;
    }
    var bounds = map.calculateBounds().clone();
    var point_top = new OpenLayers.Geometry.Point(bounds.left, bounds.top);
    var radius_top = 1.5*calculateRadius(point_top, radius);
    var angle_top = Math.PI * 3 / 4;
    var angle_bottom = -Math.PI / 4;
    point_top.x += (radius_top * Math.cos(angle_top));
    point_top.y += (radius_top * Math.sin(angle_top));
    bounds.extend(point_top);
    var point_bottom = new OpenLayers.Geometry.Point(bounds.right, bounds.bottom);
    var radius_bottom = 1.5*calculateRadius(point_bottom, radius);
    point_bottom.x += (radius_bottom * Math.cos(angle_bottom));
    point_bottom.y += (radius_bottom * Math.sin(angle_bottom));
    bounds.extend(point_bottom);
    return bounds;
}

function calculateSimpleTripBuffer(trip_geom, map, radius, wait_id, trip_layer) {
    if (!trip_geom) {
        return;
    }
    var linestring_array = [];
    var bounds = extendMapBounds(map, radius);
    var points = [];

    var trip_route_array = (trip_geom.geometry.CLASS_NAME == 'OpenLayers.Geometry.MultiLineString') ? trip_geom.geometry.components : [trip_geom.geometry];

    var point;
    var points_length = 0;
    var linestring_array_length = 0;
    var delta = map.getResolution()*4;

    for (index_r = 0, len_r = trip_route_array.length; index_r < len_r; index_r++) {
        for (index = 0, len = trip_route_array[index_r].components.length; index < len; index++) {
            point = trip_route_array[index_r].components[index];
            if (bounds.contains(point.x, point.y)) {
                if (points_length === 0 || index_r == len_r-1 && index == len-1 || points[points_length-1].distanceTo(point) > delta) {
                    points[points_length] = point;
                    points_length += 1;
                }
            } else {
                if (points_length > 0) {
                    if (points_length > 1) {
                        linestring_array[linestring_array_length] = new OpenLayers.Geometry.LineString(points);
                        linestring_array_length += 1;
                    }
                    points = [];
                    points_length = 0;
                }
            }
        }
    }
    if (points_length > 1) {
        linestring_array[linestring_array_length] = new OpenLayers.Geometry.LineString(points);
        linestring_array_length += 1;
    }

    if (linestring_array_length > 0) {
        getSimpleTripBuffer(new OpenLayers.Geometry.MultiLineString(linestring_array), radius, wait_id, trip_layer);
    }
}


/***************************** Trip Updater *********************************/
var Trip = Class.create({ // a Trip result
    initialize: function(id, departure_city, departure_address, departure_marker, arrival_city, arrival_address, arrival_marker, user, route) {
        this.id = id;
        this.departure_city = departure_city;
        this.departure_address = departure_address;
        this.departure_marker = departure_marker; // vector
        this.arrival_city = arrival_city;
        this.arrival_address = arrival_address;
        this.arrival_marker = arrival_marker; // vector
        this.user = user;
        this.route = route; // vector
        this.checked = false;
        this.visible = false;
    }
});

var TripUpdater = Class.create({
    initialize: function(trip_pg, trip_type, quick_search) {
        this.trips = new Hash();
        this.trip_page_number = null;
        this.trip_current_page = 0;

        this.trip_pg = trip_pg;
        this.trip_type = trip_type;
        this.suffix = (this.trip_type == TYPE_OFFER) ? 'o' : 'd';
        this.trip_list_id = 'trip_list_content_' + this.suffix;
        this.trip_pages_id = 'trip_pages_' + this.suffix;
        this.quick_search = quick_search;
    },

    updateTrips: function(json_trips, authenticated) {
        var new_trips = new Hash();
        var obj_this = this;

        // remove old trip list
        $(this.trip_list_id).select('div', 'p').map(Element.remove);
        $(this.trip_pages_id).select('div').map(Element.remove);

        var json_trips_length = json_trips.length;
        this.trip_page_number = Math.ceil(json_trips_length/this.trip_pg);
        this.trip_current_page = (this.trip_current_page > this.trip_page_number-1) ? 0 : this.trip_current_page;
        if (this.trip_page_number > 0) {
            // build new trip list
            var trip, departure_point, arrival_point, departure_text, arrival_text, end_text, trip_obj;
            var page_num, trip_page, visible;
            var trip_div, header_div, span1, span1_img, span2, span2_da, span2_type, span3, cbx, cbxw, details_div, details_div_top, details_div_mid, p, details_div_bottom, a_show_details, a;
            for (index = 0; index < json_trips_length; index++) {
                trip = json_trips[index];

                departure_point = wkt.read(trip.departure_point).geometry;
                arrival_point = wkt.read(trip.arrival_point).geometry;

                // popup text
                departure_text = "<b>" + gettext('Departure') + ":</b> " + trip.departure_city;
                arrival_text = "<b>" + gettext('Arrival') + ":</b> " + trip.arrival_city;
                if (trip.departure_address) {
                    departure_text += "<br />" + trip.departure_address;
                }
                if (trip.arrival_address) {
                    arrival_text += "<br />" + trip.arrival_address;
                }
                if (trip.date) {
                    end_text = "<br />" + gettext("Departure on") + " " + trip.date;
                } else {
                    end_text = "<br />" + trip.dows;
                }
                departure_text += end_text;
                arrival_text += end_text;
                departure_text += "<br />" + gettext("Offer by") + " " + trip.user_name;
                arrival_text += "<br />" + gettext("Offer by") + " " + trip.user_name;

                trip_obj = new Trip(
                    trip.id,
                    trip.departure_city,
                    trip.departure_address,
                    new OpenLayers.Feature.Vector(
                        departure_point,
                        {id: "d_"+trip.id, name: departure_text},
                        (this.trip_type == TYPE_DEMAND) ? departure_passenger_style : departure_car_style
                    ),
                    trip.arrival_city,
                    trip.arrival_address,
                    new OpenLayers.Feature.Vector(
                        arrival_point,
                        {id: "a_"+trip.id, name: arrival_text},
                        (this.trip_type == TYPE_DEMAND) ? arrival_passenger_style : arrival_car_style
                    ),
                    trip.user,
                    null
                );
                new_trips.set(trip.id, trip_obj);

                if (!(index % this.trip_pg)) {
                    page_num = Math.floor(index/this.trip_pg);
                    if (undefined !== trip_page) {
                        $(this.trip_list_id).appendChild(trip_page);
                    }
                    trip_page = new Element('div', {'id': this.trip_pages_id+'_'+page_num});
                    if (page_num != this.trip_current_page) {
                        trip_page.style.display = 'none';
                    }
                }

                trip_div = new Element('div', {'class': 'trip'});

                header_div = new Element('div', {'class': 'trip_header'});
                span1 = new Element('span', {'class': 'trip_toggle'});
                visible = this.trips.get(trip.id) && this.trips.get(trip.id).visible;
                span1_img = new Element('img', {
                    'id': 'tripti_' + this.suffix + trip.id,
                    'src': media_url+'img/'+(visible ? 'hide' : 'show')+'.png',
                    'alt': gettext("show details")
                });
                span1.appendChild(span1_img);
                header_div.appendChild(span1);

                span2 = new Element('span', {'class': 'trip_title'});
                span2_da = new Element('span', {'class': 'trip_da'}).update(trip.departure_city + " - " + trip.arrival_city);
                span2.appendChild(span2_da);
                span2_type = new Element('span', {'class': 'trip_date'}).update(' ' + ((trip.date) ? trip.date : trip.dows));
                span2.appendChild(span2_type);
                header_div.appendChild(span2);

                span3 = new Element('span', {'class': 'trip_show'});
                cbx = new Element('input', {
                    'id': 'cbx_' + this.suffix + trip.id,
                    'type': 'checkbox',
                    'class': 'checkbox'
                });
                span3.appendChild(cbx);
                cbxw = new Element('img', {
                    'id': 'cbxw_' + this.suffix + trip.id,
                    'src': media_url + 'img/ajax-loader.gif',
                    'alt': 'wait',
                    'style': 'display:none;'
                });
                span3.appendChild(cbxw);
                header_div.appendChild(span3);

                details_div = new Element('div', {
                    'id': 'tripd_' + this.suffix + trip.id,
                    'class': 'trip_details'
                });

                p = new Element('p').update(trip.time ? interpolate(gettext('Departure at about %s'), [trip.time]) : gettext("Departure time not specified"));
                if (this.trip_type == TYPE_OFFER) {
                    if (typeof(trip.seats_available) == 'number') {
                        if (trip.seats_available > 0) {
                            p.innerHTML += "<br />" + interpolate(ngettext('%s seat still available', '%s seats still available', trip.seats_available), [trip.seats_available]);
                        } else {
                            p.innerHTML += "<br />" + gettext("No more seat available");
                        }
                    } else {
                        p.innerHTML += "<br />" + gettext("Seats available not specified");
                    }
                }
                p.innerHTML += "<br /><br />"
                span_italic = new Element('span', {'class': 'label'}).update(gettext("Trip author") + ": ");
                p.appendChild(span_italic);
                p.innerHTML += trip.user_name;
                if (trip.mark) {
                    p.innerHTML += " ";
                    span_mark = new Element('span', {'class': 'mark'}).update(trip.mark);
                    p.appendChild(span_mark);
                }
                p.innerHTML += "<br />";
                a_show_details = new Element('a', {'href': trip.absolute_url}).update(gettext("Show trip details"));
                p.appendChild(a_show_details);

                details_div.appendChild(p);
                if (!visible) {
                    details_div.style.display = 'none';
                }

                trip_div.appendChild(header_div);
                trip_div.appendChild(details_div);
                trip_page.appendChild(trip_div);
            }
            $(this.trip_list_id).appendChild(trip_page); // last page

            // trip pages
            $(this.trip_pages_id).update('Page');
            for (i = 0; i < this.trip_page_number; i++) {
                a = new Element('a', {'id': this.trip_pages_id+'_lnk_'+i});
                if (i == this.trip_current_page) {
                    a.addClassName('current');
                }
                a.update(i+1);
                $(this.trip_pages_id).appendChild(a);
                a.observe('click', function(event) {
                    obj_this.showTripPage.call(obj_this, event);
                });
            }
        } else {
            var p1 = document.createElement('p');
            p1.innerHTML = gettext("No corresponding trip for the moment.");
            var p2 = document.createElement('p');
            if (this.quick_search) {
                if (authenticated) {
                    // user authenticated
                    p2.innerHTML = gettext("You can create a trip by clicking on the button &laquo;Save this search&raquo;, perhaps another carpool user will contact you about it.");
                } else {
                    // anonymous user
                    var a_str = '<a href="/login/">' + gettext("after login") + '</a>';
                    p2.innerHTML = interpolate(gettext("You can create a trip %s, perhaps another carpool user will contact you about it."), [a_str]);
                }
            }
            $(this.trip_list_id).appendChild(p1);
            $(this.trip_list_id).appendChild(p2);
        }

        // check old trip list and update it
        var key;
        var old_trip, new_trip;
        for (index = 0, keys = this.trips.keys(), len = keys.length; index < len; index++) {
            key = keys[index];
            if (!new_trips.get(key)) {
                // trip not in the list anymore - remove it from map
                this.hideTripResult(this.trips.get(key));
                this.trips.unset(key);
            } else {
                // trip in the new list
                old_trip = this.trips.get(key);
                new_trip = new_trips.get(key);
                new_trip.visible = old_trip.visible;
                if (old_trip.checked) {
                    // trip to be displayed on the map
                    new_trip.checked = true;
                    $('cbx_' + this.suffix + key).checked = true;
                    this.hideTripResult(old_trip);
                    this.displayTripResult(new_trip);
                }
                this.trips.set(key, new_trip);
            }
        }

        // check new trip list
        for (index = 0, keys = new_trips.keys(), len = keys.length; index < len; index++) {
            key = keys[index];
            if (!this.trips.get(key)) {
                // trip not yet in the list
                new_trip = new_trips.get(key);
                this.trips.set(key, new_trip);
                // trip details to be hidden
                $('tripd_' + this.suffix + key).hide();
            }
            // set events
            $('cbx_'+ this.suffix + key).observe('click', function(event) {
                obj_this.displayHideTrip.call(obj_this, event);
            });
            $('tripti_' + this.suffix + key).observe('click', function(event) {
                obj_this.toggleTrip.call(obj_this, event);
            });
        }
    },

    showTripPage: function(event) {
        var regex = new RegExp("^"+this.trip_pages_id+'_lnk_'+"([0-9]+)$");
        var match = regex.exec(event.element().id);
        if (match !== null) {
            page_num = match[1];
            Element.extend($(this.trip_pages_id+'_lnk_'+this.trip_current_page));
            Element.extend($(this.trip_pages_id+'_lnk_'+page_num));
            $(this.trip_pages_id+'_'+this.trip_current_page).hide();
            $(this.trip_pages_id+'_lnk_'+this.trip_current_page).removeClassName('current');
            $(this.trip_pages_id+'_'+page_num).show();
            $(this.trip_pages_id+'_lnk_'+page_num).addClassName('current');
            this.trip_current_page = page_num;
        }
    },

    selectTrip: function(trip_id) {
        if (this.trip_type == TYPE_DEMAND) {
            return;
        }
        var trip = new OpenLayers.Layer.WMS("Trip", '/ogcserver/?trip_id='+trip_id, {
                layers: 'trip_'+trip_id,
                format: 'image/png',
                transparent: 'TRUE',
                visibility: true,
                isBaseLayer: false
            }, {gutter: 50}
        );
        trip.id = trip_id;
        trip.displayInLayerSwitcher = false;
        trip.alpha = (BrowserDetect.browser == "Explorer" && BrowserDetect.version == 6);
        var suffix = this.suffix;
        trip.events.register("loadstart", trip, function() {
            $('cbx_'+suffix+trip.id).hide();
            $('cbxw_'+suffix+trip.id).show();
        });
        trip.events.register("loadend", trip, function() {
            $('cbxw_'+suffix+trip.id).hide();
            $('cbx_'+suffix+trip.id).show();
        });
        map.addLayer(trip);
    },

    displayTripResult: function(key) {
        this.selectTrip(key);
        var trip = this.trips.get(key);
        markers.addFeatures([trip.departure_marker, trip.arrival_marker]);
    },

    hideTripResult: function(key) {
        var trip_layer = map.getLayer(key);
        if (trip_layer) {
            map.removeLayer(trip_layer);
        }
        var trip = this.trips.get(key);
        hideMarkerPopup(trip.departure_marker);
        hideMarkerPopup(trip.arrival_marker);
        markers.removeFeatures([trip.departure_marker, trip.arrival_marker]);
    },

    displayHideTrip: function(event) {
        var element = event.element();
        var regex = new RegExp("^cbx_"+this.suffix+"([0-9]+)$");
        var match = regex.exec(element.id);
        if (match !== null) {
            key = match[1];
            if (element.checked) {
                this.displayTripResult(key);
            } else {
                this.hideTripResult(key);
            }
            this.trips.get(key).checked = element.checked;
        }
    },

    toggleTrip: function(event) {
        var element = event.element();
        var regex = new RegExp("^tripti_"+this.suffix+"([0-9]+)$");
        var match = regex.exec(element.id);
        if (match !== null) {
            key = match[1];
            if (!this.trips.get(key).visible) {
                Effect.SlideDown('tripd_' + this.suffix + key, {duration: 0.5});
                element.setAttribute('src', media_url+'img/hide.png');
            } else {
                Effect.SlideUp('tripd_' + this.suffix + key, {duration: 0.5});
                element.setAttribute('src', media_url+'img/show.png');
            }
            this.trips.get(key).visible = !this.trips.get(key).visible;
        }
    }
});

/******************************* SLIDER UTILITIES ****************************************/

function observeRadiusLeft(id_slider, obj_slider) {
    $(id_slider).observe('click', function() {
        var v = obj_slider.value - obj_slider.increment;
        if (v >= obj_slider.minimum) {
            obj_slider.setValue(v);
        }
    });
}
function observeRadiusRight(id_slider, obj_slider) {
    $(id_slider).observe('click', function() {
        var v = obj_slider.value + obj_slider.increment;
        if (v <= obj_slider.maximum) {
            obj_slider.setValue(v);
        }
    });
}

/*****************************************************************************************/

function parseHTML(txt) {
    txt = txt.replace(/&lt;/g,"<")
    txt = txt.replace(/&gt;/g,">");
    txt = txt.replace(/&#39;/g,"'");
    txt = txt.replace(/&quot;/g,"\"");
    txt = txt.replace(/&amp;/g,"&");
    return txt;
}
