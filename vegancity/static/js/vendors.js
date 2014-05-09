/*global $, L, _, VEGANCITY */

(function (N) {
    var U = N.mapUtils,
        optionTemplate = _.template('<option value="<%= id %>"><%= name %></option>'),
        optionUniquifier = function (entity) { return entity.id + entity.name; };

    function initSidebar(vendors) {
        _.each(['neighborhood', 'cuisine_tags', 'feature_tags'],
               function (filterCategory) {
                   var filters = _.chain(vendors)
                           .pluck(filterCategory)
                           .flatten()
                           .uniq(optionUniquifier)
                           .value(),
                       els = _.map(filters, optionTemplate);
                   $('#id_' + filterCategory).html(els);
               });

        var $vendors = $('#id_vendors');
        $vendors.change(function (event) {
            var vendorId = $vendors.find('option:selected').val(),
                marker = _.findWhere(vendors, {id: vendorId}).marker;
            marker.openPopup();
        });
        $vendors.html(_.map(vendors, optionTemplate));

        var $neighborhoods = $('#id_neighborhood');
        $neighborhoods.change(function (event) {
            var neighborhoodId = $neighborhoods.find('option:selected').val(),
                matchVendors = _.chain(vendors)
                    .pluck('neighborhood')
                    .where({id: neighborhoodId})
                    .pluck('vendor_id')
                    .value(),
                markers = _.chain(vendors)
                    .filter(function (vendor) { 
                        return !_.contains(matchVendors, vendor.id);
                    })
                    .pluck('marker')
                    .value();

            _.each(markers, function (marker) {
                marker._map.removeLayer(marker);
            });
        });
    }

    function initMap(vendors, defaultCenter) {
        var map = L.map("map_canvas").setView(defaultCenter, 13);

        L.tileLayer(U.TILE_URL, {attribution: U.TILE_ATTRIBUTION}).addTo(map);

        return _.map(vendors, function (vendor) {
            var marker = L.marker([vendor.latitude, vendor.longitude])
                    .addTo(map)
                    .bindPopup(vendor.name);
            return _.extend({}, vendor, {marker: marker});
        });
    }

    N.vendors = N.vendors || {};
    N.vendors.initMap = initMap;
    N.vendors.initSidebar = initSidebar;

})(VEGANCITY);
