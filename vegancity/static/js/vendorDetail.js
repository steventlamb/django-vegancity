/*global $, L, VEGANCITY */

(function (N) {
    var U = N.mapUtils;

    N.vendorDetail = N.vendorDetail || {};

    N.vendorDetail.initMap = function (name, lat, lng) {
        var vendorLocation = [lat, lng];

        var map = L.map("map_canvas").setView(vendorLocation, 17);

        L.tileLayer(U.TILE_URL, {attribution: U.TILE_ATTRIBUTION}).addTo(map);

        L.marker(vendorLocation).addTo(map).bindPopup(name).openPopup();
    };
})(VEGANCITY);
