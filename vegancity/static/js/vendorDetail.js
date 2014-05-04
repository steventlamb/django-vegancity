/*global $, L */

var VEGANCITY = VEGANCITY || {};

(function (N) {
    N.vendorDetail = N.vendorDetail || {};

    N.vendorDetail.initMap = function (name, lat, lng) {
        var vendorLocation = [lat, lng];

        var map = L.map("map_canvas").setView(vendorLocation, 17);

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker(vendorLocation).addTo(map).bindPopup(name).openPopup();
    };
})(VEGANCITY);
