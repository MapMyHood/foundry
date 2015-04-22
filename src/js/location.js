module.exports = (function () {

    var getUsersLocation,
        onSuccess,
        onError;

    // onSuccess Geolocation
    //
    onSuccess = function (position) {
    };

    // onError Callback receives a PositionError object
    //
    onError = function (error) {
    };

    getUsersLocation = function (callback) {

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
