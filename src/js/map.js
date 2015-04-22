module.exports = (function() {

    var newMap;

    newMap = function() {

        var render,
            map,
            getLocation,
            centerMap;

        /*centerMap = function () {
             alert("Getting center");
            getLocation(function (pos) {
                alert(JSON.stringy(pos));
                // map.setCenter(pos.latLng.lat, pos.latLng.lng);
            });
        };

        getLocation = function (callback) {
            alert("Getting getLocation");
            map.getMyLocation(callback, function () { alert("Error getting location..."); });
        };*/

        render = function(selector) {


            var mapElem = document.getElementById(selector),
                map = plugin.google.maps.Map.getMap();

            // Initialize the map view
            map.getMyLocation(function(location) {

                var latLng = new plugin.google.maps.LatLng(
                    location.latLng.lat,
                    location.latLng.lng
                );

                map.setOptions({
                    'backgroundColor': 'white',
                    'controls': {
                        'zoom': true // Only for Android
                    },
                    'camera': {
                        'latLng': latLng,
                        'zoom': 16
                    }
                });

                map.setDiv(mapElem);
            });
            /*map = plugin.google.maps.Map.getMap(mapElem, {
                'controls': {
                    'zoom': true
                }
            });

            // Wait until the map is ready status.
            map.addEventListener(plugin.google.maps.event.MAP_READY, function () {
                alert("Map ready");
                map.getMyLocation(function(location) {

                    alert("Setting location" + JSON.stringify(location));
                    map.setZoom(5);
                });
            });*/

        };

        return {
            render: render
        };
    };

    return {
        newMap: newMap
    };

}());