/*global google *, $, _, Backbone */

/////////////////////////////////////
// TEMPLATES
/////////////////////////////////////


/////////////////////////////////////
// MAP WRAPPER OBJECT
/////////////////////////////////////

var vendorMap = {
    initialize: function(map_container_id, vendors, mapType, autoResize) {
        var center;
        this.vendors = vendors;
        this.captionBubble = new google.maps.InfoWindow();
        this.map = null;
        this.markers = {};
        this.markerImage = null;

        if (typeof defaultCenter === "undefined") {
            center = this.getBounds().getCenter();
        } else {
            center = defaultCenter;
        }

        this.map = new google.maps.Map($(map_container_id).get(0),
                                       { 
                                           zoom: 14,
                                           maxZoom: 18,
                                           minZoom: 9,
                                           center: center,
                                           mapTypeId: google.maps.MapTypeId.ROADMAP 
                                       });


        this.mapType = mapType;
        if (mapType === "summary") {
            this.captionTemplate = summaryCaptionTemplate;
            // this.markerImage = "//www.google.com/mapfiles/marker.png";
        } else if (mapType === "detail") {
            this.captionTemplate = detailCaptionTemplate;
            // this.markerImage = "//www.google.com/mapfiles/arrow.png";
        }

        if (autoResize === true) {
            vendorMap.redrawToBounds();
        }

        vendorMap.plotAllPoints();
    },
    
    plotAllPoints: function() {
        _.each(this.vendors, function(vendor) {
            this.markers[vendor.id] = this.place(vendor);
        }, this);
    },

    getBounds: function () {
        var bounds = new google.maps.LatLngBounds();
        _.each(this.vendors, function(vendor) {
            var LatLng = new google.maps.LatLng(vendor.latitude, vendor.longitude);
            bounds.extend(LatLng);
        });
        return bounds;
    },

    redrawToBounds: function () {
        this.map.fitBounds(this.getBounds());
    },


    place: function(vendor) {
        var image = null,
            latLng = new google.maps.LatLng(vendor.latitude, vendor.longitude),
            marker = null,
            vendorMap = this,
            bodyText = _.template(this.captionTemplate)(vendor);

        if (this.mapType === 'summary') {
            // convert veg level to super category and then lookup an icon for that category
            // TODO make this more readable.
            image = new google.maps.MarkerImage(vegCategoryMarkerMapping[vegLevelCategoryMapping[vendor.vegLevel]]);
        } else if (this.mapType === 'detail') {
            image = new google.maps.MarkerImage("/static/images/vegphilly-carrot-map-logo.png");
        }

        marker = new google.maps.Marker({
                position: latLng,
                icon:image,
        });
        marker.setMap(this.map);

        if (bodyText) {
            google.maps.event.addListener(marker, 'click', function () {
                vendorMap.captionBubble.setContent(bodyText);
                vendorMap.captionBubble.open(vendorMap.map, this);
    	    });
        };
        return marker;   
    }
};


$(document).ready(function () {
    new SearchFormView({el: $('body') });

    function syncSelect(srcSelector, destSelector) {
        var itemName = $(srcSelector + ' :selected').text();
        $(destSelector).text(itemName);
    }

    var syncNeighborhoodMask = _.partial(syncSelect, '#id_neighborhood', '#neighborhood_mask');
    var syncCuisineMask = _.partial(syncSelect, '#id_cuisine', '#cuisine_mask');

    $('#id_neighborhood').change(syncNeighborhoodMask);
    $('#id_cuisine_tag').change(syncCuisineMask);
    $(document)
        .ready(syncNeighborhoodMask)
        .ready(syncCuisineMask);

    $('#map-show-controls').click(function () {
        $('#map-area').hide();
    });

});
