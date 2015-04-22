(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var location = require("./location");
var map = require("./map");

window.app = (function() {

    var initialize,
        bindEvents,
        onDeviceReady,
        render;

    // Application Constructor
    initialize = function() {
        bindEvents();
    };

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents = function() {
        document.addEventListener('deviceready', onDeviceReady, false);
    };

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady = function() {
        var mapHandle = map.newMap();
        mapHandle.render("map_canvas");
    };

    return {
        initialize: initialize
    };

}());
},{"./location":2,"./map":3}],2:[function(require,module,exports){
module.exports = (function () {

    var getUsersLocation,
        onSuccess,
        onError;

    // onSuccess Geolocation
    //
    onSuccess = function (position) {
    };

    // onError Callback receives a PositionError object
    //
    onError = function (error) {
    };

    getUsersLocation = function (callback) {

        alert("get users location");
        navigator.geolocation.getCurrentPosition(function (position) {
            callback(position);
            onSuccess(position);
        }, function (error) {
            callback(null);
            onError(error);
        });
    };

    return {
        getUsersLocation: getUsersLocation
    };

}());

},{}],3:[function(require,module,exports){
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

            alert("render map +++ " + selector);

            var mapElem = document.getElementById(selector),
                map = plugin.google.maps.Map.getMap();

            // Initialize the map view
            map.getMyLocation(function(location) {

                alert("getting location");

                var latLng = new plugin.google.maps.LatLng(
                    location.latLng.lat,
                    location.latLng.lng
                );

                alert("Setting location" + JSON.stringify(latLng));

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
},{}]},{},[1,2,3]);
