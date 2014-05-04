/*global google *, $, _, Backbone */

/////////////////////////////////////
// TEMPLATES
/////////////////////////////////////

var summaryCaptionTemplate = [
    '<strong><a id="captionBubble_hyperlink" class="uline" href="<%= url %>"><%= name %></a></strong><br/>',
    '<%= address %><br/>',
    '<%= phone %><br/>'].join(""),
    detailCaptionTemplate = '<strong><%= name %></strong><br/>',

    // TODO: all of this can be abstracted beyond veg level to allow coloring by anything
    vegLevelCategoryMapping = {
        1: 'vegan',
        2: 'vegetarian',
        3: 'vegetarian',
        4: 'vegetarian',
        5: 'omni',
        6: 'omni',
        7: 'omni',
        0: 'omni' // There is no zero in postgres, but we are coercing nulls to 0
    },
    vegCategoryMarkerMapping = {
        'vegan': '/static/images/marker-vegan.png',
        'vegetarian': '/static/images/marker-vegetarian.png',
        'omni': '/static/images/marker-omni.png'
    };

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

var SearchFormView = Backbone.View.extend({
    events: {
        "click #clear_all": function (event) {
            this.resetFilters();
            $("#filters").submit();
        },
        "click #clear_search": function (event) {
            $("#search-input").val("");
            $("#filters").submit();
        },
       "change #id_vendors": function (event) {
            var vendor_id = $("#id_vendors").val();
            google.maps.event.trigger(vendorMap.markers[vendor_id], 'click');
            $('html, body').animate({ scrollTop: 100 }, 'slow');
            $('#map-area').show();
       },
        "change #id_neighborhood, #id_cuisine, #id_checked_features, #id_feature": function (event) {
            $('form#filters').submit();
        }
    },

    initialize: function () {
        //TODO: this is a hack, should be able to fix this in django.
        //TODO: change the feature modelchoicefield to a choicefield
        $("#id_feature").val("");

        vendorMap.initialize("#map_canvas", vendors, "summary", autoResize);

        this.styleVegLevelPins();
    },

    styleVegLevelPins: function() {
        var vegLevels = [
            { pinSummary: "Vegan", icon: vegCategoryMarkerMapping['vegan'] },
            { pinSummary: "Vegetarian", icon: vegCategoryMarkerMapping['vegetarian'] },
            { pinSummary: "Non-Vegetarian", icon: vegCategoryMarkerMapping['omni'] }
        ];

        _.each(vegLevels, function (vegLevel) {
            var legendRowTemplate = '<tr><td><img src="<%= icon %>"> <%= pinSummary %></tr></td>',
                tableRow = _.template(legendRowTemplate)({
                    pinSummary: vegLevel.pinSummary,
                    icon: vegLevel.icon
                });

            $("#legend-table tbody").append(tableRow);
        });

        _.each(_.range(0, 7), function (i) {
            var category = vegLevelCategoryMapping[i],
                imageUrl = vegCategoryMarkerMapping[i];
            $(".veg-level-" + i).attr("src", imageUrl);
        });

    },

    resetFilters: function () {
        $("#id_neighborhood, #id_cuisine, #id_checked_features, #id_feature").val(0);
        $("input:checkbox").val(null);
    }

});

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
