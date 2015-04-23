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
        toggleMapView,
        togglePanel,
        render,
        displayStack =[],
        template,
        panels = document.querySelectorAll("section.panel"),
        panelMap = document.querySelector("section.panel.panel-map"),
        panelList = document.querySelector("section.panel.panel-list");

    // list template
    template = dot.template("<ul>{{~it.resultSet :value:index}}<li class=\"table-view-cell media\"><a class=\"navigate-right\"><img class=\"media-object pull-left\" src=\"http://placehold.it/42x42\"><div class=\"media-body\">{{=value.headline}}<p>{{=value.standfirst}}</p></div></a></li>{{~}}</ul>");

    render = function (data) {
        panelList.innerHTML = template(data);
    };

    toggleMapView = function () {
        panelMap.classList.toggle("hidden");
        panelList.classList.toggle("hidden");
    };

    togglePanel = function (name) {
        var panels = document.querySelectorAll("section.panel"),
            targetPanel = document.querySelector("section.panel-" + name),
            len = panels.length;

        // keep last active panel
        displayStack.push(document.querySelector("section.panel:not(.hidden)"));

        if (targetPanel.classList.contains("hidden")) {
            while (len--) {
                panels[len].classList.add("hidden");
            }
            targetPanel.classList.remove("hidden");
        } else {
            targetPanel.classList.add("hidden");
            displayStack.pop().classList.remove("hidden");
        }
        
    };

    // Application Constructor
    initialize = function() {
        var panels = document.querySelectorAll("section.panel"),    
            len = panels.length;

        while (len--) {
            panels[len].style.height = (window.innerHeight - 64) + 'px';
        }

        bindEvents();
    };

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents = function() {

        var btnToggle   = document.getElementById("btn-toggle"),
            btnSettings = document.getElementById("btn-settings"),
            btnSearch   = document.getElementById("btn-search"),
            btnNews     = document.getElementById("btn-news"),
            btnAlerts   = document.getElementById("btn-alerts"),
            btnOffers   = document.getElementById("btn-offers");

        document.addEventListener('deviceready', onDeviceReady, false);

        btnToggle.addEventListener("touchstart", function () {
            toggleMapView('');
        }, false);

        btnSettings.addEventListener("touchstart", function () {
            togglePanel('settings');
        }, false);

        btnSearch.addEventListener("touchstart", function () {
            togglePanel('search');
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

    return {
        initialize: initialize
    };

}());