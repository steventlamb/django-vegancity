/*global Bacon */

// because we can!
var Tempeh = Bacon;

var VEGANCITY = {
    vendors: {},
    vendorDetail: {},
    mapUtils: {
        TILE_URL: 'http://otile1.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpg',
        TILE_ATTRIBUTION: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        VEG_LEVEL_MARKERS: {
            vegan: '/static/images/marker-vegan.png',
            vegetarian: '/static/images/marker-vegetarian.png',
            not_veg: '/static/images/marker-omni.png'
        }
    }
};
