module.exports = (function() {

    var newMap;

    newMap = function() {

        var render,
            map,
            updateMapData,
            markers = [],
            getLocation,
            centerMap,
            latLng = new plugin.google.maps.LatLng(
                -33.885193,
                151.209399
            );

        render = function(selector) {

            var mapElem = document.getElementById(selector),
                map = plugin.google.maps.Map.getMap(mapElem, {
                target: latLng,
                'controls': {
                    'compass': true,
                    'myLocationButton': true,
                    'indoorPicker': true,
                    'zoom': true
                }
            });

            // subscribe to updates

            window.subscribe('data', function (data) {
                
                var len = data.length;

                map.clear();
                
                while (len--) {
                    map.addMarker({
                        snippet: data[len].url,
                        animation: plugin.google.maps.Animation.BOUNCE,
                        title: data[len].headline,
                        'position': new plugin.google.maps.LatLng(
                            data[len].location[0].latitude,
                            data[len].location[0].longitude
                        ),
                    });
                }
            });

            // Initialize the map view
            map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
                
                map.getMyLocation(function(location) {

                    // change this to location to be real time
                    window.publish('location', [-33.885193, 151.209399]);

                    map.moveCamera({
                      'target': latLng,
                      'zoom': 12
                    });
                    
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