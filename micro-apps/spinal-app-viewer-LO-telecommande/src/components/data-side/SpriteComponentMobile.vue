<template>
  <div>
    <div style=" backdrop-filter: blur(4px);width: 100%;height: 100%;top: 0px;left: 0px;position: absolute;">

    </div>
    <div class="total">

      <div class="menu">

        <div style="display: flex;">

          <div class="text_title">
            <span class="mdi mdi-map-marker marker"></span>
            {{ postion_name }}
          </div>
          <div id="curved-corner-topleft"></div>
          <div style="position: absolute; background-color: white;cursor: pointer;display: flex;
          justify-content: center;
          align-items: center; width: 50px;height: 50px;
    border-radius: 50px;
    border: 1px solid #C8C8C8;
    font-weight: 900;
    font-size: 23px;
    right: 0;
    transform: translate(20px, -20px);
   " @click="close()"> X</div>
        </div>
        <div style="display: flex; align-items: center;justify-content: center; margin-top: 20px;">

          <EditCommande2 :symbole="true" :activable="activable" @update="handleUpdate" :step="1" :commandName="'COMMAND_TEMPERATURE'"
            :currentData="COMMAND_TEMPERATURE" :objet="temp" :unit="'°C'" :icon="'thermometer'" :color="'#FF9685'"
            style="border-right: 2px dashed #a1a1a1;
    padding-right: 3%;"></EditCommande2>
          <EditCommande2 :activable="activable" @update="handleUpdate" :step="5" :commandName="'COMMAND_LIGHT'" :currentData="COMMAND_LIGHT"
            :objet="lumi" :unit="'%'" :icon="'ampoule'" :color="'#EDE474'" style="margin-left: 6%;    border-right: 2px dashed #a1a1a1;
    padding-right: 3%"></EditCommande2>
          <EditCommande2 :activable="activable" @update="handleUpdate" :step="5" :commandName="'COMMAND_BLIND'" :currentData="COMMAND_BLIND"
            :objet="store" :unit="'%'" :icon="'store'" :color="'#A8DDF4'" style="margin-left: 6%;"></EditCommande2>
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
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import EditCommande from "./EditCommande.vue"
import EditCommande2 from "./EditCommande2.vue"
import { LOADIPHLPAPI } from "dns";


export default {
  props: {
    data: {},
    selectedItem: null,

  },
  components: {
    EditCommande2,
    EditCommande, // Ajout du composant ici
  },


  data: () => ({
    COMMAND_TEMPERATURE: null,
    COMMAND_LIGHT: null,
    COMMAND_BLIND: null,
    postion_name: null,
    postion_id: null,
    activable : false,
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
      { value: 100, color: '#A8DDF4' },
      { value: 75, color: '#85B0C4' },
      { value: 50, color: '#628395' },
      { value: 25, color: '#3E5665' },
      { value: 0, color: '#14202C' },
    ],
  }),
  mounted() {
    this.handleSelectedItemChange(this.selectedItem)
  },
  methods: {
    handleUpdate({ command, value }) {
      this.postCommand(command, value)
    },


    async postCommand(command, value) {
      const buildingId = localStorage.getItem("idBuilding");

      const referenceIds = {
        propertyReference: [
          {
            dynamicId: this.postion_id,
            keys: [
              {
                key: command,
                value: value.toString()
              }
            ]
          }
        ]
      };
      const promises = [
        this.$store.dispatch(ActionTypes.POST_NODE_COMMAND, {
          buildingId,
          referenceIds: referenceIds
        }),
      ];
    },

    extractCommandValues(controleEndpoint) {
      const commandProfile = controleEndpoint.find(profile => profile.profileName === "Command");

      if (!commandProfile) {
        console.log("Aucun profil 'Command' trouvé.");
        return;
      }

      const commands = {
        "COMMAND_TEMPERATURE": "COMMAND_TEMPERATURE",
        "COMMAND_LIGHT": "COMMAND_LIGHT",
        "COMMAND_BLIND": "COMMAND_BLIND"
      };

      commandProfile.endpoints
        .filter(endpoint => Object.keys(commands).includes(endpoint.name))
        .forEach(endpoint => {
          this[commands[endpoint.name]] = endpoint.value;
        });

      console.log(this.COMMAND_TEMPERATURE, this.COMMAND_LIGHT, this.COMMAND_BLIND);


      // return result;
    },

    getIfActivable(controlEndpoint) {
      // Trouver le profil avec profileName === "Command" à changer dans la config
      const Profile = controlEndpoint.find(profile => profile.profileName === "Command");

      if (!Profile) {
        console.log("Aucun profil trouvé.");
        return false;
      }

      // Trouver l'endpoint avec le nom "CONTROLABLE" à changer dna sla config
      const controlableEndpoint = Profile.endpoints.find(endpoint => endpoint.name === "STORE_CONTROLABLE");

      if (!controlableEndpoint) {
        console.log("Aucun endpoint CONTROLABLE trouvé.");
        return false;
      }

      return controlableEndpoint.value;
    },




    close() {
      this.$emit('close');
    },




    async handleSelectedItemChange(newVal) {
      const buildingId = localStorage.getItem("idBuilding");
      const promises = [
        this.$store.dispatch(ActionTypes.GET_STATIC_DETAILS_EQUIPEMENT, {
          buildingId,
          referenceIds: [newVal]
        }),
      ];

      const result = await Promise.all(promises);
      this.postion_name = result[0].name
      this.postion_id = result[0].dynamicId



      this.activable = this.getIfActivable(result[0].controlEndpoint);


      this.extractCommandValues(result[0].controlEndpoint);

    }
  },

  watch: {
    selectedItem(newVal) {
      this.handleSelectedItemChange(newVal);
    }
  }
};

</script>

<style scoped>
.menu {
  position: absolute;
  overflow: visible;
  left: 50%;
  top: 50%;
  width: 90%;
  max-height: 850px;
  max-width: 1200px;
  height: 80vh;
  background-color: white;
  border: 1px solid rgb(204, 204, 204);
  transform: translate(-50%, -50%);
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  background: transparent linear-gradient(242deg, #EAEEF0 0%, #DAECF5 100%) 0% 0% no-repeat padding-box;
  /* overflow: hidden; */
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
  font-size: 36px;
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