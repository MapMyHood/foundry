/* jshint: loopfunc: true*/

var helpers = require("./helpers");

module.exports = (function() {

    var newMap;

    newMap = function() {

        var render,
            map,
            updateMapData,
            getLocation,
            centerMap,
            latLng = new plugin.google.maps.LatLng(
                -33.885193,
                151.209399
            );

        render = function(selector) {

            var mapElem = document.getElementById(selector),
                markerExists,
                markers = [],
                map = plugin.google.maps.Map.getMap(mapElem, {
                target: latLng,
                'controls': {
                    'compass': true,
                    'myLocationButton': true,
                    'indoorPicker': true,
                    'zoom': true
                }
            });

            markerExists = function (url) {
                return !!markers[helpers.hashCode(url)] || false;
            };

            // subscribe to updates

            window.subscribe('data', function (data) {
                
                var len = data.length;
                
                while (len--) {

                    // check if marker exists
                    if (markerExists(data[len].url)) {
                        console.log("marker exists");
                    } else {
                        console.log("marker does not exist");
                        map.addMarker({
                            snippet: data[len].url,
                            animation: plugin.google.maps.Animation.BOUNCE,
                            title: data[len].headline,
                            'position': new plugin.google.maps.LatLng(
                                data[len].location[0].latitude,
                                data[len].location[0].longitude
                            ),
                        }, function (marker) {
                            markers[helpers.hashCode(marker.getSnippet())] = marker;
                        });
                    }
                }
            });

            // Initialize the map view
            map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
                
                map.getMyLocation(function(location) {

                    // change this to location to be real time
                    window.publish('location', [-33.885193, 151.209399]);

                    map.moveCamera({
                      'target': latLng,
                      'zoom': 14
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