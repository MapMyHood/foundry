module.exports = (function() {

    var newMap;

    newMap = function() {

        var render;

        render = function(selector) {

            var mapElem = document.getElementById(selector),
                map = plugin.google.maps.Map.getMap();

            // Initialize the map view
            map.getMyLocation(function(location) {

                var latLng = new plugin.google.maps.LatLng(
                    location.latLng.lat,
                    location.latLng.lng
                );

                alert("Setting location" + JSON.stringify(latLng));

                map.setOptions({
                    'camera': {
                        'latLng': latLng,
                        'zoom': 16
                    }
                });

                map.setDiv(mapElem);
            });
        };

        return {
            render: render
        };
    };

    return {
        newMap: newMap
    };

}());