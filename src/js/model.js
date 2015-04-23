var helpers = require("./helpers"),
    sampleData = require("./sample");

module.exports = (function () {

    var init,
        process,
        poll,
        distance,
        getDistance,
        interval,
        get;

    getDistance = function () {
        try {
            return document.getElementById("distance").innerHTML;
        } catch (e) {
            console.error("distance value not found in html");
        }
        return "5";
    };
    

    // users lat long
    poll = function (lat, lng) {
        interval = setInterval(function () {
            window.JSONP("http://foundry.thirdmurph.net:5000/?latlong="+lat+","+lng+"&dist=" + getDistance(), function (data) {
                window.publish("update", [data, lat, lng]);
            });
        }, 10000);
    };

    init = function (lat, lng) {
       // window.publish("update", [sampleData, lat, lng]);
        window.JSONP("http://foundry.thirdmurph.net:5000/?latlong="+lat+","+lng+"&dist=" + getDistance(), function (data) {
             window.publish("update", [data, lat, lng]);
        });
        poll(lat, lng);
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