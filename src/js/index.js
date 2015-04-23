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
        toggleView,
        render,
        displayStack =[],
        template,
        panels = document.querySelectorAll("section.panel"),
        mapView = document.querySelector("section.panel > .view-map"),
        listView = document.querySelector("section.panel > .view-list");

    // list template
    template = dot.template('<ul class="table-view">{{~it.resultSet :value:index}}<li class="table-view-cell media"><a class="navigate-right"><img class="media-object pull-left" src="{{=value.thumbnail.uri}}"><div class="media-body">{{=value.headline}}<span class="distance">{{=value.distance}} kms</span><p>{{=value.standfirst}}</p></div></a></li>{{~}}</ul>');

    render = function (data) {
        listView.innerHTML = template(data);
    };

    // add event to re-render template
    window.subscribe("data", function (data) {
        alert(data.resultSet[0].distance);
        render(data);
    });

    toggleView = function (btn) {

        if (mapView.classList.contains("hidden")) {
            btn.innerHTML = "List";
            listView.classList.add("hidden");
            mapView.classList.remove("hidden");

        } else {
            listView.classList.remove("hidden");
            btn.innerHTML = "Map";
            mapView.classList.add("hidden");
        }

    };

    togglePanel = function (name) {
        var panels = document.querySelectorAll("section.panel"),
            targetPanel = document.querySelector("section.panel-" + name),
            len = panels.length;

        if (targetPanel.classList.contains("hidden")) {
            targetPanel.classList.remove("hidden");
        } else {
            targetPanel.classList.add("hidden");
        }
        
    };

    // Application Constructor
    initialize = function() {
        var panels = document.querySelectorAll("section.panel"),    
            len = panels.length;

        while (len--) {
            panels[len].style.height = (window.innerHeight - 114) + 'px';
        }

        bindEvents();
    };

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents = function() {

        var btnToggle   = document.getElementById("btn-toggle-view"),
            btnSettings = document.getElementById("btn-settings"),
            btnNews     = document.getElementById("btn-news"),
            btnAlerts   = document.getElementById("btn-alerts"),
            btnOffers   = document.getElementById("btn-offers");

        document.addEventListener('deviceready', onDeviceReady, false);

        btnToggle.addEventListener("touchstart", function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleView(e.target);
        }, false);

        btnSettings.addEventListener("touchstart", function () {
            togglePanel('settings');

            // highlight with color
            btnSettings.classList.toggle("active");

            // hide map view
            btnToggle.classList.toggle("hidden");
        }, false);

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