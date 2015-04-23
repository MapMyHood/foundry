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