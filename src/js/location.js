module.exports = (function () {

    var getUsersLocation,
        onSuccess,
        onError;

    // onSuccess Geolocation
    //
    onSuccess = function (position) {
        var element = document.getElementById('geolocation');
        element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
                            'Longitude: '          + position.coords.longitude             + '<br />' +
                            'Altitude: '           + position.coords.altitude              + '<br />' +
                            'Accuracy: '           + position.coords.accuracy              + '<br />' +
                            'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                            'Heading: '            + position.coords.heading               + '<br />' +
                            'Speed: '              + position.coords.speed                 + '<br />' +
                            'Timestamp: '          + position.timestamp                    + '<br />';
    };

    // onError Callback receives a PositionError object
    //
    onError = function (error) {
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    };

    getUsersLocation = function (callback) {

        alert("Get users location..");

        navigator.geolocation.getCurrentPosition(function (position) {
            callback(position);
            onSuccess(position);
        }, function (error) {
            callback(null);
            onError(error);
        });
    };

    return {
        getUsersLocation: getUsersLocation
    };

}());
