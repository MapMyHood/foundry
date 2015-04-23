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

        updateMapData = function (mapHandle) {
         /*   var len = data.length;
            while (len--) {
                mapHandle.addMarker({
                    snippet: data[len].url,
                    animation: plugin.google.maps.Animation.BOUNCE,
                    title: data[len].headline,
                    'position': new plugin.google.maps.LatLng(
                        data[len].location[0].latitude,
                        data[len].location[0].longitude
                    ),
                });
            }*/
        };

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

                alert("render map");

            // Initialize the map view
            map.addEventListener(plugin.google.maps.event.MAP_READY, function() {

                 alert("map ready");
                
                map.getMyLocation(function(location) {

                    alert("Sending location");

                    // change this to location to be real time
                    window.publish('location', [-33.885193, 151.209399]);

                    map.moveCamera({
                      'target': latLng,
                      'zoom': 12
                    }, function () {
                        updateMapData(map);
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