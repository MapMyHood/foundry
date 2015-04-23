(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
    distance: function (lat1, lon1, lat2, lon2, unit) {
        var radlat1 = Math.PI * lat1 / 180,
            radlat2 = Math.PI * lat2 / 180,
            radlon1 = Math.PI * lon1 / 180,
            radlon2 = Math.PI * lon2 / 180,
            theta = lon1 - lon2,
            radtheta = Math.PI * theta / 180,
            dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;

        if (unit == "K") {
            dist = dist * 1.609344;
        }

        if (unit == "N") {
            dist = dist * 0.8684;
        }

        return Math.round(dist);
    },
    hashCode: function (str) {

        var hash = 0;

        if (this.length === 0) return hash;

        for (i = 0; i < this.length; i++) {

            char = this.charCodeAt(i);

            hash = ((hash<<5)-hash)+char;

            hash = hash & hash; // Convert to 32bit integer

        }

        return hash;

    }

};
},{}],2:[function(require,module,exports){
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
    template = dot.template('<ul class="table-view">{{~it :value:index}}<li class="table-view-cell media"><a class="navigate-right"><img class="media-object pull-left" src="{{=value.thumbnail.uri}}"><div class="media-body">{{=value.headline}}<br /><button class="btn btn-primary btn-outlined">{{=value.distance}} kms</button><br /><p>{{=value.standfirst}}</p></div></a></li>{{~}}</ul>');

    render = function (data) {
        listView.innerHTML = template(data);
    };

    // add event to re-render template
    window.subscribe("data", function (data) {
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
},{"./lib/dot":3,"./map":4,"./model":5}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
/* jshint: loopfunc: true*/

var helpers = require("./helpers");

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

        render = function(selector) {

            var mapElem = document.getElementById(selector),
                markerExists,
                markers = [],
                map = plugin.google.maps.Map.getMap(mapElem, {
                target: latLng,
                'controls': {
                    'compass': true,
                    'myLocationButton': true,
                    'indoorPicker': true,
                    'zoom': true
                }
            });

            markerExists = function (url) {
                return !!markers[helpers.hashCode(url)] || false;
            };

            // subscribe to updates

            window.subscribe('data', function (data) {
                
                var len = data.length;
                
                while (len--) {

                    // check if marker exists
                    if (markerExists(data[len].url)) {
                        console.log("marker exists");
                    } else {
                        console.log("marker does not exist");
                        map.addMarker({
                            snippet: data[len].url,
                            animation: plugin.google.maps.Animation.BOUNCE,
                            title: data[len].headline,
                            'position': new plugin.google.maps.LatLng(
                                data[len].location[0].latitude,
                                data[len].location[0].longitude
                            ),
                        }, function (marker) {
                            markers[helpers.hashCode(marker.getSnippet())] = marker;
                        });
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
                      'zoom': 14
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
},{"./helpers":1}],5:[function(require,module,exports){
var helpers = require("./helpers");

module.exports = (function () {

    var init,
        process,
        poll,
        distance = document.getElementById("distance").innerHTML,
        sampleData = require("./sample"),
        interval,
        get;

    // users lat long
    poll = function (lat, lng, distance) {
        distance = document.getElementById("distance").innerHTML;
        interval = setInterval(function () {
            window.JSONP("http://foundry.thirdmurph.net:5000/?latlong="+lat+","+lng+"&dist=" + distance, function (data) {
                window.publish("update", [data, lat, lng, distance]);
            });
        }, 10000);
    };

    init = function (lat, lng) {
        window.publish("update", [sampleData, lat, lng]);
        window.JSONP("http://foundry.thirdmurph.net:5000/?latlong="+lat+","+lng+"&dist=" + distance, function (data) {
             window.publish("update", [data, lat, lng]);
        });
        poll(lat, lng, "5");
    };

    distance = function (data, lat, lng) {
        data.forEach(function (value, index, arr) {
            data[index].distance = helpers.distance(
                value.location[0].latitude,
                value.location[0].longitude,
                lat,
                lng,
                "K"
            );
        });
        return data;
    };

    get = function () {
        return results;
    };

    // update distance on location change
    window.subscribe('location', function (lat, lng) {
        init(lat, lng);
    });

    // update distance on location change
    // pass in users lat long
    window.subscribe('update', function (data, lat, lng) {
        console.log("data", data);
        window.publish('data', [distance(data.resultSet, lat, lng)]);
    });
}());
},{"./helpers":1,"./sample":6}],6:[function(require,module,exports){
module.exports = {
	"resultSet": [{
		"thumbnail ": {
			"width ": 100,
			"height ": 75,
			"uri ": "http: //cdn.newsapi.com.au/image/v1/thumbnail/0e1ee0374a2c46a42186eeb07c205874"
		},
		"standfirst": "REMEMBER when Trent Barrett played in the halves for NSW? What about Brett Kimmorley? Braith Anasta? Andrew Johns?\n\n",
		"location": [{
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/061434ef2b505650de74cf1d1620aaca?domain=newscorpaustralia.com",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Why can’t Blues settle on a halves combo?"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/f002dba90ab59d0666cc9f5d99563179"
		},
		"standfirst": "A VICTORIAN strike force will examine more allegations against Bill Spedding, who is charged with child rape and remains a person of interest in the William Tyrrell case. \n\n",
		"location": [{
			"longitude": 152.834444,
			"latitude": -31.581667
		}, {
			"longitude": 152.916667,
			"latitude": -31.433333
		}, {
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/887a1c586a521415424c505a5f0b0939?domain=heraldsun.com.au",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Spedding ’repeatedly raped girl, 3, in caravan’"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/9c575316c91df5479e1f722a8242f106"
		},
		"standfirst": "ST KILDA midfielder Shane Savage believes it’s “not out of the question” an AFL franchise will be based in New Zealand in the future. HAVE YOUR SAY.\n\n",
		"location": [{
			"longitude": 144.981944,
			"latitude": -37.864167
		}, {
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/860f50b939cb5db5ace4107415189415?domain=newscorpaustralia.com",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Is New Zealand AFL’s next destination?"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/f93a9e22458ae0ff7e2d5df63ce890a5"
		},
		"standfirst": "MELBOURNE’s hopes of upsetting NSW in Saturday night’s ANZAC Day clash have been rocked by the loss of leading forward Luke Jones.\n\n",
		"location": [{
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/e03b239ae761ca0f857220d7d2c14f68?domain=newscorpaustralia.com",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Rebels hit by loss of Jones"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/c1882f9201df896503462bb6e9441319"
		},
		"standfirst": "BUYERS will now have a new kind of flexibility in their floorplan with the release of EVO Homes in Jordan Springs, in Sydney’s west. \n\n",
		"location": [{
			"longitude": 151.207222,
			"latitude": -33.867778
		}, {
			"longitude": 150.784444,
			"latitude": -33.681667
		}],
		"url": "http://cdn.newsapi.com.au/link/bf55b2ff50fd31f452975c3c777b6c0c?domain=newsapi.com.au",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Innovative designs offer homebuyers flexibility"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/ae713aeef40f671b4a1edb25780c236b"
		},
		"standfirst": "MANLY winger Jorge Taufua has been placed on a booze ban until the end of the year and fined $10,000 for his role in a brawl with Bulldog Jacob Loko.\n\n",
		"location": [{
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/213231769b73e388be897fe9dd29c971?domain=newscorpaustralia.com",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Taufua hit with booze ban, $10k fine"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/d6a58bd2354547a78aa0ea775b131f32"
		},
		"standfirst": "A FUNDING win has Pararoos Thomas Goodman and Ryan Kinner dreaming of Rio after their Paralympic hopes were dashed last year.\n\n",
		"location": [{
			"longitude": 151.207222,
			"latitude": -33.867778
		}, {
			"longitude": 138.513056,
			"latitude": -35.071111
		}],
		"url": "http://cdn.newsapi.com.au/link/5530d8f0d29ac5eaffaeacf7b1fdfbc2?domain=newsapi.com.au",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Paralympic dream revived for SA duo"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/8188bd09946ec95715419c43c7834b7a"
		},
		"standfirst": "IT’S the final week of the regular season before final kick off. Check out what teams have been selected for round 27.\n\n",
		"location": [{
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/b4568f98ffa6cbe22f9e784fd9920008?domain=newscorpaustralia.com",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "A-League teams: Round 27"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/4f0b9bf82e6c3e58e268c3e553ed101d"
		},
		"standfirst": "BLAKE Spriggs regrets cutting short his apprenticeship with trainer Gai Waterhouse.\n\n",
		"location": [{
			"longitude": 150.817778,
			"latitude": -34.465
		}, {
			"longitude": 153.028056,
			"latitude": -27.468056
		}, {
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/0e32e31ead435f8b31a6726c1a3634bc?domain=newscorpaustralia.com",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Spriggs finds his groove again"
	},
	{
		"thumbnail": {
			"width": 100,
			"height": 75,
			"uri": "http://cdn.newsapi.com.au/image/v1/thumbnail/c7b40b10aa665f5e6dbaa24208dfd0d3"
		},
		"standfirst": "JASON Collett is reaping the rewards of hard work and perseverance, with top trainers jumping at the chance to use the Kiwi rider at Randwick. \n\n",
		"location": [{
			"longitude": 151.207222,
			"latitude": -33.867778
		}],
		"url": "http://cdn.newsapi.com.au/link/31cdc6bee58db74bf4cebf158a18518d?domain=newscorpaustralia.com",
		"originalSource": "news",
		"paidStatus": "NON_PREMIUM",
		"headline": "Telepathic tops Collett’s full book"
	},
	{
		"thumbnail": {
			"width": 120,
			"height": 90,
			"uri": "https://i2.au.reastatic.net/120x90/ae00066a65287c284b241e2c559c3aba83765d5281ec28230269e491bc677a65/main.jpg"
		},
		"standfirst": "Auction on Sat 23 May at 9:00 AM. Set in an appealing converted warehouse, the apartment is a top-floor, north-facing home, spanning 2 floors. ...",
		"location": [{
			"longitude": 151.20937,
			"latitude": -33.884464
		}],
		"originalSource": "REA",
		"url": "http://www.realestate.com.au/119628135",
		"paidStatus": "NON_PREMIUM",
		"headline": "Top-floor, N-facing, converted warehouse"
	},
	{
		"thumbnail": {
			"width": 120,
			"height": 90,
			"uri": "https://i2.au.reastatic.net/120x90/069ff60f478f27633735b44be5c1ec257885a70150cf222731b4f93b59c9edb4/main.jpg"
		},
		"standfirst": "Auction on Sat 02 May at 12:00 PM. Oversize 64 sqm one bed in this secure 3 level building in the heart of Surry Hills - Warehouse charm with very...",
		"location": [{
			"longitude": 151.20937,
			"latitude": -33.884464
		}],
		"originalSource": "REA",
		"url": "http://www.realestate.com.au/119462391",
		"paidStatus": "NON_PREMIUM",
		"headline": "\"KIPPAX APARTMENTS\" Stylish Inner City Loft apartment Auction 2/5/15 @ 12noon"
	},
	{
		"thumbnail": {
			"width": 120,
			"height": 90,
			"uri": "https://i2.au.reastatic.net/120x90/3287b3ea29d4509f6576a6ebbaa1199a87baf052750d94c50f5b1fbccb55c92d/main.jpg"
		},
		"standfirst": "Auction on Mon 27 Apr at 6:30 PM. With one of the coolest finishes in 'Hart', enjoy the area's most sought-after building. An in/outdoor home with...",
		"location": [{
			"longitude": 151.20973,
			"latitude": -33.885983
		}],
		"originalSource": "REA",
		"url": "http://www.realestate.com.au/119450463",
		"paidStatus": "NON_PREMIUM",
		"headline": "Split-level style in popular 'Hart' complex"
	},
	{
		"thumbnail": {
			"width": 120,
			"height": 90,
			"uri": "https://i2.au.reastatic.net/120x90/4dfbb3921087494c0fbda8dba32bff4da5589465f821b10c1cabdae3ed8a1fb6/main.jpg"
		},
		"standfirst": "Auction on Mon 27 Apr at 6:00 PM. An intelligent design, sleek contemporary interiors and exclusive access all combine to provide an exceptional...",
		"location": [{
			"longitude": 151.2116,
			"latitude": -33.884098
		}],
		"originalSource": "REA",
		"url": "http://www.realestate.com.au/119448919",
		"paidStatus": "NON_PREMIUM",
		"headline": "Exclusive Residence in the Delano Apartments"
	},
	{
		"thumbnail": {
			"width": 120,
			"height": 90,
			"uri": "https://i2.au.reastatic.net/120x90/39515bf8f0e3dccf1b7baca316e6db289c5b344de7a9b6cc9516bf10526a9984/main.jpg"
		},
		"standfirst": "Auction on Sat 16 May at 10:30 AM. This tranquil apartment can be found on the 2nd level of a contemporary, boutique building. It boasts both an...",
		"location": [{
			"longitude": 151.2129,
			"latitude": -33.886684
		}],
		"originalSource": "REA",
		"url": "http://www.realestate.com.au/119548459",
		"paidStatus": "NON_PREMIUM",
		"headline": "NORTH-EAST FACING IN AN IDEAL LOCATION! "
	},
	{
		"thumbnail": {
			"width": 120,
			"height": 90,
			"uri": "https://i2.au.reastatic.net/120x90/82e42f9e6329f3b33e982dc41e3097d36555b28c03a44e883ea656c81c73cb58/main.jpg"
		},
		"standfirst": "Auction on Sat 02 May at 3:45 PM. Lifestyle - Opening to an expansive private aspect and enjoying an impressively peaceful rear setting in a highly...",
		"location": [{
			"longitude": 151.20688,
			"latitude": -33.887978
		}],
		"originalSource": "REA",
		"url": "http://www.realestate.com.au/119466331",
		"paidStatus": "NON_PREMIUM",
		"headline": "Privacy, peace and convenience"
	},
	{
		"thumbnail": {
			"width": 120,
			"height": 90,
			"uri": "https://i2.au.reastatic.net/120x90/36f4a022867bb5a39c51fca4078de91c313956ea39a296e5f869eb3e7af4be10/main.jpg"
		},
		"standfirst": "Auction on Sat 09 May at 2:30 PM. PLEASE NOTE, THIS PROPERTY WILL NOT BE OPEN FOR INSPECTION ON ANZAC DAY, SATURDAY 25 APRIL 2015, HOWEVER THE...",
		"location": [{
			"longitude": 151.21317,
			"latitude": -33.88711
		}],
		"originalSource": "REA",
		"url": "http://www.realestate.com.au/119476551",
		"paidStatus": "NON_PREMIUM",
		"headline": "Uplifting Design - Remarkable 3 Level Terrace"
	}
],
"resultSize": 17
};
},{}]},{},[1,2,4,5,6]);
