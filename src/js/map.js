module.exports = (function() {

    var newMap;

    newMap = function() {

        var render,
            map,
            getLocation,
            centerMap;

        render = function(selector) {


            var mapElem = document.getElementById(selector),
                map = plugin.google.maps.Map.getMap();

            map.setDiv(mapElem);
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


            // Initialize the map view
            map.getMyLocation(function(location) {

                alert("getting location");

                
                
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