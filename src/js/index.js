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
        location.getUsersLocation(render);
    };

    render = function(position) {
        var mapElem = document.getElementById("map");

        // full size of screen
        mapElem.style.width = window.innerWidth + "px";
        mapElem.style.height = (window.innerHeight - 140) + "px";

        // this is where the custom code will go for each mapping implementation
            var mapOptions = {
                center: {
                    lat: -34.397,
                    lng: 150.644
                },
                zoom: 8
            };
            var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    
    };

    return {
        initialize: initialize
    };

}());