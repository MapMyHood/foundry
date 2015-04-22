module.exports = (function() {

    var newMap;

    newMap = function() {

        var render,
            map,
            getLocation,
            centerMap;

        render = function(selector) {

            alert("Render map");

            var mapElem = document.getElementById(selector),
                map = plugin.google.maps.Map.getMap();

            map.setDiv(mapElem);
            /*var latLng = new plugin.google.maps.LatLng(
                location.latLng.lat,
                location.latLng.lng
            );*/

            map.setOptions({
                'backgroundColor': 'white',
                'camera': {
                    'zoom': 16
                }
            });


            // Initialize the map view
            /*map.getMyLocation(function(location) {

                alert("getting location");

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