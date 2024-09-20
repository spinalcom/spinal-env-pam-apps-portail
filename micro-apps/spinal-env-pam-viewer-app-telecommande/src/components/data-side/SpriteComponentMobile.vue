<template>
  <div>
    <div style=" backdrop-filter: blur(4px);width: 100%;height: 100%;top: 0px;left: 0px;position: absolute;">
   
    </div>
    <div class="total">
      <div @click="close()"
        style="background-color: white; width: 50px; height: 50px; position: absolute; bottom: 20px; right: 20px; z-index: 9999; border-radius: 5px; border: 2px solid rgb(20, 32, 44); justify-content: center; align-items: center; display: flex;">
        X</div>
      <div class="menu">

        <div style="display: flex;">

          <div class="text_title">
            <span class="mdi mdi-map-marker marker"></span>
            POSITION N°10.5C
          </div>
          <div id="curved-corner-topleft"></div>
        </div>
        <div style="display: flex; align-items: center;justify-content: center; margin-top: 20px;">

          <EditCommande :step="1" :currentData="1" :objet="temp" :unit="'°C'" :icon="'thermometer'" :color="'#FF9685'"
            style="border-right: 2px dashed #a1a1a1;
    padding-right: 3%;"></EditCommande>
          <EditCommande :step="5" :currentData="50" :objet="lumi" :unit="'%'" :icon="'ampoule'" :color="'#EDE474'"
            style="margin-left: 2%;    border-right: 2px dashed #a1a1a1;
    padding-right: 3%"></EditCommande>
          <EditCommande :step="5" :currentData="50" :objet="store" :unit="'%'" :icon="'store'" :color="'#A8DDF4'"
            style="margin-left: 2%;"></EditCommande>
          <!-- <EditCommande></EditCommande> -->
        </div>
      </div>
    </div>

  </div>
</template>
<script>

import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";

import EditCommande from "./EditCommande.vue"


export default {
  props: {
    data: {},

  },
  components: {
    EditCommande, // Ajout du composant ici
  },


  data: () => ({
    temp: [
      { value: 2, color: '#F0715C' },
      { value: 1, color: '#FF9685' },
      { value: 0, color: '#FFA685' },
      { value: -1, color: '#FFB985' },
      { value: -2, color: '#FAD9AD' },
    ],
    lumi: [
      { value: 100, color: '#EDE474' },
      { value: 75, color: '#B7B362' },
      { value: 50, color: '#818250' },
      { value: 25, color: '#4A513E' },
      { value: 0, color: '#14202C' },
    ],
    store: [
      { value: 0, color: '#A8DDF4' },
      { value: 25, color: '#85B0C4' },
      { value: 50, color: '#628395' },
      { value: 75, color: '#3E5665' },
      { value: 100, color: '#14202C' },
    ],
  }),
  mounted() {

  },
  methods: {


    close() {
      this.$emit('close');
    },



  },
};

</script>

<style scoped>
.menu {
  position: absolute;
  overflow: visible;
  left: 50%;
  top: 50%;
  width: 80%;
  height: 80vh;
  background-color: white;
  border: 1px solid rgb(204, 204, 204);
  transform: translate(-50%, -50%);
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  background: transparent linear-gradient(242deg, #EAEEF0 0%, #DAECF5 100%) 0% 0% no-repeat padding-box;
}

.total {
  /* position: absolute; */
  width: 100vw;
  height: 100vh;
  /* background-color: rgba(128, 128, 128, 0.493); */
  top: 0px;
  left: 0px;
  /* margin: none;
  padding: none; */
}

.text_title {
  width: 80%;
  height: 120px;
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  border-bottom-right-radius: 30px;
  display: flex;
  align-items: center;
  font-size: 40px;
  color: #14202c;
}

#curved-corner-topleft:before {
  top: 0;
  left: 0;
  box-shadow: -50px -50px 0 0 rgb(255, 255, 255);
}

#curved-corner-topleft:before {
  content: "";
  display: block;
  width: 200%;
  height: 200%;
  position: absolute;
  border-radius: 25%;
}

#curved-corner-topleft {
  width: 50px;
  height: 50px;
  overflow: hidden;
  position: relative;
}

.marker {
  font-size: 50px;
  width: 50px;
  margin: 25px;
}
</style>