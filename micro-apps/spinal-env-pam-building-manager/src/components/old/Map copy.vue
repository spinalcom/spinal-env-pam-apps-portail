<!--
Copyright 2022 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <div class="mapContent">
    <l-map :zoom="mapParams.zoom"
           :center="mapParams.center">
      <l-tile-layer :url="mapParams.url"
                    :attribution="mapParams.attribution"
                    :options="mapParams.mapOptions"
                    style="height: 100%"></l-tile-layer>
      <l-marker v-for="(item, i) in mapParams.positions"
                :key="i"
                :lat-lng="item.position"
                :icon="item.icon">
        <l-popup>
          <span class="success--text"> Hello </span>
          <span class="primary--text">
            {{ item.name }}
          </span>
        </l-popup>
      </l-marker>
    </l-map>
  </div>

</template>

<script>
import Vue from "vue";
import { LMap, LTileLayer, LMarker, LPopup } from "vue2-leaflet";
import { latLng, icon } from "leaflet";

export default Vue.extend({
  name: "MapComponent",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
  },
  data() {
    return {
      mapParams: {
        zoom: 3,
        center: latLng(46.2321929, 2.2096669),
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        mapOptions: {
          zoomSnap: 0.5,
        },
        positions: [],
      },
    };
  },
});
</script>

<style scoped>
.mapContent {
  width: 100%;
  height: 100%;
  background: rebeccapurple;
}
</style>