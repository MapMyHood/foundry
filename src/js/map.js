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

            // Initialize the map view
            map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
                
                map.getMyLocation(function(location) {

                    alert("getting location" + JSON.stringify(location));

                    var latLng = new plugin.google.maps.LatLng(
                        location.latLng.lat,
                        location.latLng.lng
                    );

                    map.moveCamera({
                      'target': latLng,
                      'zoom': 17
                    });

                    map.addCircle({
                        'center': latLng,
                        'radius': 6,
                        'strokeColor' : '#428bca',
                        'strokeWidth': 1,
                        'fillColor' : '#007aff'
                    });

                    // users location
                    /*map.addMarker({
                        'position': latLng,
                        icon: 'img/svg/people.svg'
                    });*/
                });

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