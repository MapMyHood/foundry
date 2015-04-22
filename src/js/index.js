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

var map      = require("./map"),
    model    = require("./model"),
    dot      = require("./lib/dot");

window.app = (function() {

    var initialize,
        bindEvents,
        onDeviceReady,
        togglePanel,
        render,
        template,
        panelMap = document.querySelector("section.panel.panel-map"),
        panelList = document.querySelector("section.panel.panel-list");

    // list template
    template = dot.template("<ul>{{~it.resultSet :value:index}}<li>{{=value.headline}}!</li>{{~}}</ul>");

    render = function (data) {
        panelList.innerHTML = template(data);
    };

    togglePanel = function () {
        panelMap.classList.toggle("hidden");
        panelList.classList.toggle("hidden");
    };

    // Application Constructor
    initialize = function() {
        panelMap.style.height = (window.innerHeight - 60) + 'px';
        panelList.style.height = (window.innerHeight - 60) + 'px';
        bindEvents();
    };

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents = function() {

        var btnToggle   = document.querySelector("button.btn-toggle"),
            btnSettings = document.querySelector("button.btn-settings"),
            btnSearch   = document.querySelector("button.btn-search"),
            btnNews     = document.querySelector("button.btn-news"),
            btnAlerts   = document.querySelector("button.btn-alerts"),
            btnOffers   = document.querySelector("button.btn-offers");

        document.addEventListener('deviceready', onDeviceReady, false);

        btnToggle.addEventListener("touchstart", function () {
            togglePanel();
        }, false);

    };

    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady = function() {
        var mapHandle = map.newMap();
        mapHandle.render("map_canvas");

        render(model);
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