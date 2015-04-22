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
        document.getElementById('searchButton').addEventListener('click', showSearch);
        document.getElementById('mapButton').addEventListener('click', showMap);
        document.getElementById('listButton').addEventListener('click', showList);
        document.getElementById('settingsButton').addEventListener('click', showSettings);
    };

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady = function() {

        // make sure status bar is usable
        
        var mapHandle = map.newMap();
        mapHandle.render("map_canvas");
    };

    showSearch = function() {
        document.getElementById('mapPanel').style.display = 'none';
        document.getElementById('listPanel').style.display = 'none';
        document.getElementById('searchPanel').style.display = 'block';
        document.getElementById('settingsPanel').style.display = 'none';                
    };

    showMap = function() {
        document.getElementById('mapPanel').style.display = 'block';
        document.getElementById('listPanel').style.display = 'none';
        document.getElementById('searchPanel').style.display = 'none';
        document.getElementById('settingsPanel').style.display = 'none';                
    };

    showList = function() {
        document.getElementById('mapPanel').style.display = 'none';
        document.getElementById('listPanel').style.display = 'block';
        document.getElementById('searchPanel').style.display = 'none';
        document.getElementById('settingsPanel').style.display = 'none';        
    };

    showSettings = function() {
        document.getElementById('mapPanel').style.display = 'none';
        document.getElementById('listPanel').style.display = 'none';
        document.getElementById('searchPanel').style.display = 'none';
        document.getElementById('settingsPanel').style.display = 'block';
    };

    return {
        initialize: initialize
    };

}());