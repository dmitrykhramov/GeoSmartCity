/**
 * This file creates leaflet map and sets the initial settings
 */

window.onload = function(){
    var map = L.map('mapid',{
        center:[60.4500, 22.2667],
        zoom:14,
        zoomControl:false,
        minZoom:4
    });

    map.locate({setView:true, maxZoom:14});
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

    function onLocationFound(e) {}

    map.on('locationfound', onLocationFound);

    function onLocationError(e){
        alert(e.message);
        map.on('locationerror',onLocationError);
    }

    route=L.Routing.control({
        waypoints:
            [
                //no waypoint on the initials
            ],
        routeWhileDragging:true,
        geocoder: L.Control.Geocoder.nominatim() // choosen geocoder, can be changed to anyone from Control.Geocoder.js
    }).addTo(map);

    // If there is an error during calculating, error div is
    // displayed below geocoders div
    route.on('routingerror', function(e) {
        $('#error').css('display', 'block').insertAfter(".leaflet-routing-geocoders");
    });

    // If route is found, error div is hidden
    route.on('routesfound', function(e) {
       $('#error').css('display', 'none');
    });

};








