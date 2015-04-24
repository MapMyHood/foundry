/* jshint: loopfunc: true*/

var helpers = require("./helpers");

module.exports = (function() {

    var newMap,
        pins = {
            news: '',
            rea: '',
            twitter: '',
            offers: '',
            alerts: ''
        };

    window.settings = window.settings || {};
    window.markers = [];

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
                map = plugin.google.maps.Map.getMap(mapElem, {
                    target: latLng,
                    'controls': {
                        'compass': true,
                        'myLocationButton': true,
                        'indoorPicker': true,
                        'zoom': true
                    }
                });

             // setup pins and styles
            pins = {
                rea: window.cordova.file.applicationDirectory + "www/img/pins/rea.png",
                news: window.cordova.file.applicationDirectory + "www/img/pins/news.png",
                alerts: window.cordova.file.applicationDirectory + "www/img/pins/alerts.png",
                twitter: window.cordova.file.applicationDirectory + "www/img/pins/twitter.png",
                whatson: window.cordova.file.applicationDirectory + "www/img/pins/whatson.png"
            };

            markerExists = function (url) {
                return window.markers[helpers.hashCode(url)] &&
                    window.markers[helpers.hashCode(url)].ref  || false;
            };

            // subscribe to updates

            window.subscribe('data', function (data) {
                
                var len = data.length,
                    correctPin,
                    sources = {
                        'news': true,
                        'rea': true,
                        'traffic': true,
                        'twitter': true,
                        'eventful': true,
                        'shopping': true
                    };

                // check if category is green lit

                if (window.settings.categories.indexOf("news") === -1) {
                    sources.news = false;
                    sources.rea = false;
                    sources.twitter = false;
                }
                if (window.settings.categories.indexOf("alerts") === -1) {
                    sources.traffic = false;
                }
                if (window.settings.categories.indexOf("whatson") === -1) {
                    sources.eventful = false;
                    sources.shopping = false;
                }
                
                while (len--) {

                    // check if marker exists

                    if (markerExists(data[len].url)) {
                        console.log("marker exists");
                    } else {

                        // check if source is enabled

                        // get the right pin
                        correctPin = data[len].originalSource.toLowerCase() || "";
                        if (correctPin === "eventful") {
                            correctPin = "whatson";
                        }
                        if (correctPin === "traffic") {
                            correctPin = "alerts]";
                        }
                        if (correctPin === "shopping") {
                            correctPin = "whatson";
                        }

                        console.log(data[len]);

                        //if (sources[data[len].originalSource.toLowerCase()]) {

                            // add marker to global stack
                            window.markers[helpers.hashCode(data[len].url)] = {
                                source: data[len].originalSource.toLowerCase(),
                                ref: null
                            };


                            map.addMarker({
                                icon: pins[correctPin],
                                snippet: data[len].url,
                                animation: plugin.google.maps.Animation.BOUNCE,
                                title: data[len].headline,
                                'position': new plugin.google.maps.LatLng(
                                    data[len].location[0].latitude,
                                    data[len].location[0].longitude
                                ),
                            }, function (marker) {
                                marker.addEventListener(plugin.google.maps.event.INFO_CLICK, function() {
                                   window.open(marker.getSnippet(), "_new");
                                });
                                window.markers[helpers.hashCode(marker.getSnippet())].ref = marker;
                            });
                        //}
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
                      'zoom': 15
                    }, function () {
                        map.addMarker({icon: "img/pins/user.png"});
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