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
    template = dot.template('<ul class="table-view">{{~it :value:index}}<li class="table-view-cell media"><a class="navigate-right" href="{{=value.url}}" target="_blank"><img class="media-object pull-left" src="{{=value.thumbnail.uri}}"><div class="media-body">{{=value.headline}}<br /><button class="btn btn-primary btn-outlined">{{=value.distance}} kms</button>&nbsp;<button class="btn btn-primary btn-outlined">{{=value.originalSource}}</button><br /><p>{{=value.standfirst}}</p></div></a></li>{{~}}</ul>');

    render = function (data) {
       // alert("Render list data");
        //console.log(template(data));
        listView.innerHTML = template(data);
    };

    // add event to re-render template
    window.subscribe("data", function (data) {
        render(data);
    });

    toggleView = function (btn) {

        if (mapView.classList.contains("hidden")) {
             btn.src = "img/list-view.svg";
            listView.classList.add("hidden");
            mapView.classList.remove("hidden");

        } else {
            listView.classList.remove("hidden");
            btn.src = "img/map-view.png";
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

    window.settings = window.settings || {};

    // Application Constructor
    initialize = function() {
        var panels = document.querySelectorAll("section.panel"),    
            len = panels.length;

        while (len--) {
            panels[len].style.height = (window.innerHeight - 114) + 'px';
        }

        bindEvents();

        window.settings = window.settings || {};
        window.settings.categories = [
            'news',
            'alerts',
            'whatson'
        ];
    };

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents = function() {

        var btnToggle   = document.getElementById("btn-toggle-view"),
            btnLogin   = document.getElementById("btn-login"),
            btnSettings = document.getElementById("btn-settings"),
            btnNews     = document.getElementById("btn-news"),
            sliderDistance = document.getElementById("distance"),
            footerTab = document.querySelectorAll("footer .tab-item"),
            btnAlerts   = document.getElementById("btn-alerts"),
            btnSearch   = document.getElementById("btn-search"),
            btnOffers   = document.getElementById("btn-offers"),
            len,
            clearFooterTabs;

        document.addEventListener('deviceready', onDeviceReady, false);

        btnLogin.addEventListener("touchstart", function () {
            togglePanel('login');
            btnToggle.classList.toggle("hidden");
            btnSettings.classList.toggle("hidden");
            mapView.classList.toggle("hidden");
        });
        

        clearFooterTabs = function (elem) {
            btnNews.classList.remove("active");
            btnAlerts.classList.remove("active");
            btnOffers.classList.remove("active");
        };
        
        btnNews.addEventListener("touchstart", function () {
            clearFooterTabs();
            btnNews.classList.toggle("active");
            window.settings.categories = "news";

           /* window.markers.forEach(function (value) {
                if (value.source === "traffic" || value.source === "shopping" || value.source === "eventful") {
                    try {
                        value.ref.remove();
                    } catch (e) {
                        console.log("Unable to remove marker", e);
                    }
                }
            });*/

        });
        btnOffers.addEventListener("touchstart", function () {
            clearFooterTabs();
            btnOffers.classList.toggle("active");
            window.settings.categories = "whatson";

            /*window.markers.forEach(function (value) {
                if (value.source === "news" || value.source === "rea" || value.source === "twitter"| value.source === "traffic") {
                    try {
                        value.ref.remove();
                    } catch (e) {
                        console.log("Unable to remove marker", e);
                    }
                }
            });*/
        });
        btnAlerts.addEventListener("touchstart", function () {
            clearFooterTabs();
            btnAlerts.classList.toggle("active");
            window.settings.categories = "alerts";

           /* window.markers.forEach(function (value) {
                if (value.source === "news" || value.source === "rea" || value.source === "twitter"| value.source === "eventful" || value.source === "eventful") {
                    try {
                        value.ref.remove();
                    } catch (e) {
                        console.log("Unable to remove marker", e);
                    }
                }
            });*/
        });

        btnToggle.addEventListener("touchstart", function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleView(e.target);
        }, false);

        btnSearch.addEventListener("touchstart", function () {
            togglePanel('search');
            btnToggle.classList.toggle("hidden");
            btnLogin.classList.toggle("hidden");
            btnSettings.classList.toggle("hidden");
            mapView.classList.toggle("hidden");
            btnSearch.classList.toggle("active");
        });

        btnSettings.addEventListener("touchstart", function () {
            
            togglePanel('settings');

            // highlight with color
            btnSettings.classList.toggle("active");

            // hide map view
            btnToggle.classList.toggle("hidden");
            btnLogin.classList.toggle("hidden");
            mapView.classList.toggle("hidden");
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