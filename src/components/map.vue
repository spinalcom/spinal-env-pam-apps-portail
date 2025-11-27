<template>
    <div id="map"></div>
</template>

<script>

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default {
    props: {
        markers: {
            type: Array,
            default: () => []
        }
    },
    mounted() {
        var map = new maplibregl.Map({
            container: 'map', // container id

            // I have a key from MapTiler, you can use your own style or key
            style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=hpivTiT82TMaSJNq4mMG',
            center: [0, 0], // starting position [lng, lat]
            zoom: 5 // starting zoom
        });

        this.addMarkers(map);
    },

    methods: {
        addMarkers(map) {
            this.markers.map(marker => {
                new maplibregl.Marker()
                    .setLngLat([marker.lng, marker.lat])
                    .addTo(map);
            });
        }
    }
}
</script>

<style scoped>
#map {
    width: 100%;
    height: 100%;
}
</style>