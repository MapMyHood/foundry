var helpers = require("./helpers");

module.exports = (function () {

    var init,
        process,
        distance,
        poll,
        interval,
        get;

    poll = function (lat, lng, distance) {
        interval = setInterval(function () {
            jsonpClient("http://foundry.thirdmurph.net:5000/?latlong="+lat+","+lng+"&dist=" + distance + "&callback=updateFromNick", function (err, data) {
                window.publish("update", [data]);
            });
        }, 1000);
    };

    init = function (lat, lng) {

        //alert(lat + "," + lng);

        poll(lat, lng, "5");

        //alert("init complete");
    };

    distance = function (data) {
        data.forEach(function (value, index, arr) {
            data[index].distance = helpers.distance(
                value.location[0].latitude,
                value.location[0].longitude,
                lat,
                lng,
                "K"
            );
        });
    };

    get = function () {
        return results;
    };

    // update distance on location change
    window.subscribe('location', function (lat, lng) {
        //alert("location");
        init(lat, lng);
    });

    // update distance on location change
    window.subscribe('update', function (data) {
        window.publish('data', [distance(data.resultSet)]);
    });
}());