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
  <v-card class="card-container">
    <div class="name_div"
         :title="`${data.name} : ${data.address}`">

      <div class="color"
           :style="{'background': data.color}"></div>
      <div class="name">{{data.name}} : <span
              class="text-caption">{{data.address}}</span></div>

    </div>

    <div class="content">
      <div class="left">
        <div class="area numbers">
          {{getFloorsArea}} <span class="unit">m<sup>2</sup></span>
        </div>
        <div class="description">
          {{data.description || "no description"}}
        </div>
      </div>
      <div class="right numbers">
        {{getFloorsCount}} <span class="unit">étage(s)</span>
      </div>
    </div>

    <div class="actions">
      <div class="state">
        <div class="state-color"
             :class="{'connected': isConnected, 'disconnected': !isConnected}">
        </div>
        <div class="state-text text-caption">
          {{isConnected ? "Connected" : "Disconnected"}}
        </div>
      </div>

      <div class="buttons">
        <v-btn class="button"
               title="View on map"
               icon
               outlined
               color="indigo"
               @click="viewOnMap">
          <!-- <v-icon>mdi-map-outline</v-icon> -->
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>

        <v-btn class="button"
               title="edit building"
               icon
               outlined
               color="indigo"
               @click="editBuilding">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-btn class="button"
               title="delete building"
               icon
               outlined
               color="error"
               @click="deleteBuilding">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>

      <!-- <button class="button">Connect</button>
      <button class="button">Refresh</button>
      <button class="button danger">Delete</button> -->
    </div>
  </v-card>
</template>

<script>
import { io } from "socket.io-client";

export default {
  name: "BuildingCard",
  props: {
    data: {
      required: true,
    },
  },
  data() {
    return {
      isConnected: false,
    };
  },
  mounted() {
    const socket = io(this.data.apiUrl, { transports: ["websocket"] });
    socket.on("connect", () => (this.isConnected = true));
    socket.on("disconnect", () => (this.isConnected = false));
  },
  methods: {
    getRandomColor() {
      return "#" + Math.floor(Math.random() * 16777215).toString(16);
    },

    viewOnMap() {
      this.$emit("viewOnMap", Object.assign({}, this.data));
    },
    editBuilding() {
      this.$emit("edit", Object.assign({}, this.data));
    },
    deleteBuilding() {
      this.$emit("delete", Object.assign({}, this.data));
    },
  },
  computed: {
    getFloorsCount: function () {
      if (!this.data.detail) return 0;

      return this.data.detail["geographicFloor"] || 0;
    },
    getFloorsArea: function () {
      return Number(this.data.detail?.area || 0).toFixed(2);
    },
  },
};
</script>

<style scoped>
.card-container {
  width: 90%;
  height: 200px;
  background: #fff;
  border-radius: 10px;
  padding: 5px;
  margin: auto;
  margin-bottom: 15px;
}

.card-container .name_div {
  width: 100%;
  height: 40px;
  display: flex;
  padding: 5px;
  text-transform: uppercase;
  font-size: 1.2em;
  border-bottom: 1px solid #eaeef0;
  position: relative;
}

.card-container .name_div .color {
  width: 10px;
  height: 90%;
  background: red;
  margin-right: 10px;
}

.card-container .name_div .name {
  width: calc(100% - 10px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-container .content {
  width: 100%;
  height: calc(100% - 100px);
  padding: 10px;
  display: flex;
}

.card-container .content .left,
.card-container .content .right {
  flex: 0 0 50%;
}

.card-container .content .numbers {
  font-size: 1.6em;
  margin-bottom: 5px;
}

.card-container .content .numbers .unit {
  color: #adb5bd;
}

.card-container .content .description {
  width: 100%;
  max-height: 60px;
  margin-top: 10px;
  font-size: 13px;
  text-overflow: ellipsis;
  display: block;
  overflow: hidden;
}

.card-container .actions {
  width: 100%;
  height: 50px;
  padding: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-container .actions .state {
  display: flex;
  align-items: center;
}

.card-container .actions .state .state-color {
  width: 15px;
  height: 15px;
  border-radius: 100%;
}

.card-container .actions .state .state-color.connected {
  background: green;
}

.card-container .actions .state .state-color.disconnected {
  background: red;
}

.card-container .actions .state .state-text {
  margin-left: 5px;
  color: grey;
  font-size: 0.8em !important;
}

.card-container .actions .buttons .button {
  /*  background: #eaeef0;
  min-width: 100px;
  min-height: 40px; 
  color: #82959e; 
  margin: 5px;
  border-radius: 10px;
  text-transform: uppercase;*/
  margin-right: 10px;
}

/* .card-container .buttons .button.danger {
  color: white;
  background: #ff5252 !important;
} */
</style>