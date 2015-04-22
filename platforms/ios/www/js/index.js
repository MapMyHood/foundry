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
        panelMap = document.querySelector("section.panel.panel-map"),
        panelList = document.querySelector("section.panel.panel-list");

    // list template
    template = dot.template("<ul>{{~it.resultSet :value:index}}<li>{{=value.headline}}!</li>{{~}}</ul>");

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

    /*
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
    */

    return {
        initialize: initialize
    };

}());
},{"./lib/dot":2,"./map":3,"./model":4}],2:[function(require,module,exports){
// doT.js
// 2011-2014, Laura Doktorova, https://github.com/olado/doT
// Licensed under the MIT license.

(function() {
	"use strict";

	var doT = {
		version: "1.0.3",
		templateSettings: {
			evaluate:    /\{\{([\s\S]+?(\}?)+)\}\}/g,
			interpolate: /\{\{=([\s\S]+?)\}\}/g,
			encode:      /\{\{!([\s\S]+?)\}\}/g,
			use:         /\{\{#([\s\S]+?)\}\}/g,
			useParams:   /(^|[^\w$])def(?:\.|\[[\'\"])([\w$\.]+)(?:[\'\"]\])?\s*\:\s*([\w$\.]+|\"[^\"]+\"|\'[^\']+\'|\{[^\}]+\})/g,
			define:      /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
			defineParams:/^\s*([\w$]+):([\s\S]+)/,
			conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
			iterate:     /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
			varname:	"it",
			strip:		true,
			append:		true,
			selfcontained: false,
			doNotSkipEncoded: false
		},
		template: undefined, //fn, compile template
		compile:  undefined  //fn, for express
	}, _globals;

	doT.encodeHTMLSource = function(doNotSkipEncoded) {
		var encodeHTMLRules = { "&": "&#38;", "<": "&#60;", ">": "&#62;", '"': "&#34;", "'": "&#39;", "/": "&#47;" },
			matchHTML = doNotSkipEncoded ? /[&<>"'\/]/g : /&(?!#?\w+;)|<|>|"|'|\//g;
		return function(code) {
			return code ? code.toString().replace(matchHTML, function(m) {return encodeHTMLRules[m] || m;}) : "";
		};
	};

	_globals = (function(){ return this || (0,eval)("this"); }());

	if (typeof module !== "undefined" && module.exports) {
		module.exports = doT;
	} else if (typeof define === "function" && define.amd) {
		define(function(){return doT;});
	} else {
		_globals.doT = doT;
	}

	var startend = {
		append: { start: "'+(",      end: ")+'",      startencode: "'+encodeHTML(" },
		split:  { start: "';out+=(", end: ");out+='", startencode: "';out+=encodeHTML(" }
	}, skip = /$^/;

	function resolveDefs(c, block, def) {
		return ((typeof block === "string") ? block : block.toString())
		.replace(c.define || skip, function(m, code, assign, value) {
			if (code.indexOf("def.") === 0) {
				code = code.substring(4);
			}
			if (!(code in def)) {
				if (assign === ":") {
					if (c.defineParams) value.replace(c.defineParams, function(m, param, v) {
						def[code] = {arg: param, text: v};
					});
					if (!(code in def)) def[code]= value;
				} else {
					new Function("def", "def['"+code+"']=" + value)(def);
				}
			}
			return "";
		})
		.replace(c.use || skip, function(m, code) {
			if (c.useParams) code = code.replace(c.useParams, function(m, s, d, param) {
				if (def[d] && def[d].arg && param) {
					var rw = (d+":"+param).replace(/'|\\/g, "_");
					def.__exp = def.__exp || {};
					def.__exp[rw] = def[d].text.replace(new RegExp("(^|[^\\w$])" + def[d].arg + "([^\\w$])", "g"), "$1" + param + "$2");
					return s + "def.__exp['"+rw+"']";
				}
			});
			var v = new Function("def", "return " + code)(def);
			return v ? resolveDefs(c, v, def) : v;
		});
	}

	function unescape(code) {
		return code.replace(/\\('|\\)/g, "$1").replace(/[\r\t\n]/g, " ");
	}

	doT.template = function(tmpl, c, def) {
		c = c || doT.templateSettings;
		var cse = c.append ? startend.append : startend.split, needhtmlencode, sid = 0, indv,
			str  = (c.use || c.define) ? resolveDefs(c, tmpl, def || {}) : tmpl;

		str = ("var out='" + (c.strip ? str.replace(/(^|\r|\n)\t* +| +\t*(\r|\n|$)/g," ")
					.replace(/\r|\n|\t|\/\*[\s\S]*?\*\//g,""): str)
			.replace(/'|\\/g, "\\$&")
			.replace(c.interpolate || skip, function(m, code) {
				return cse.start + unescape(code) + cse.end;
			})
			.replace(c.encode || skip, function(m, code) {
				needhtmlencode = true;
				return cse.startencode + unescape(code) + cse.end;
			})
			.replace(c.conditional || skip, function(m, elsecase, code) {
				return elsecase ?
					(code ? "';}else if(" + unescape(code) + "){out+='" : "';}else{out+='") :
					(code ? "';if(" + unescape(code) + "){out+='" : "';}out+='");
			})
			.replace(c.iterate || skip, function(m, iterate, vname, iname) {
				if (!iterate) return "';} } out+='";
				sid+=1; indv=iname || "i"+sid; iterate=unescape(iterate);
				return "';var arr"+sid+"="+iterate+";if(arr"+sid+"){var "+vname+","+indv+"=-1,l"+sid+"=arr"+sid+".length-1;while("+indv+"<l"+sid+"){"
					+vname+"=arr"+sid+"["+indv+"+=1];out+='";
			})
			.replace(c.evaluate || skip, function(m, code) {
				return "';" + unescape(code) + "out+='";
			})
			+ "';return out;")
			.replace(/\n/g, "\\n").replace(/\t/g, '\\t').replace(/\r/g, "\\r")
			.replace(/(\s|;|\}|^|\{)out\+='';/g, '$1').replace(/\+''/g, "");
			//.replace(/(\s|;|\}|^|\{)out\+=''\+/g,'$1out+=');

		if (needhtmlencode) {
			if (!c.selfcontained && _globals && !_globals._encodeHTML) _globals._encodeHTML = doT.encodeHTMLSource(c.doNotSkipEncoded);
			str = "var encodeHTML = typeof _encodeHTML !== 'undefined' ? _encodeHTML : ("
				+ doT.encodeHTMLSource.toString() + "(" + (c.doNotSkipEncoded || '') + "));"
				+ str;
		}
		try {
			return new Function(c.varname, str);
		} catch (e) {
			if (typeof console !== "undefined") console.log("Could not create a template function: " + str);
			throw e;
		}
	};

	doT.compile = function(tmpl, def) {
		return doT.template(tmpl, null, def);
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

        render = function(selector) {

            alert("Render map");

            var mapElem = document.getElementById(selector),
                map = plugin.google.maps.Map.getMap();

            map.setDiv(mapElem);
            /*var latLng = new plugin.google.maps.LatLng(
                location.latLng.lat,
                location.latLng.lng
            );*/

            map.setOptions({
                'backgroundColor': 'white',
                'camera': {
                    'zoom': 16
                }
            });


            // Initialize the map view
            /*map.getMyLocation(function(location) {

                alert("getting location");

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
},{}],4:[function(require,module,exports){
module.exports = (function () {

    var results = {
        resultSize: 2,
        resultSet: [{
            headline: "Story One",
            standfirst: "Stand First One",
            url: "http://www.google.com.au?v=1",
            location: "1,2",
            thumbnail: {
                uri: "",
                width: 100,
                height: 100
            }
        },{
            headline: "Story Two",
            standfirst: "Stand First Two",
            url: "http://www.google.com.au?v=2",
            location: "1,2",
            thumbnail: {
                uri: "",
                width: 100,
                height: 100
            }
        }]
    };

    return results;
}());
},{}]},{},[1,2,3,4]);
