<template>
  <v-breadcrumbs v-if="etage || show" divider=">">
    <div class="breadcrumb-item" @click="setPosition(id_building, building);">
      <v-breadcrumbs-item v-if="building">
        {{ building }}
      </v-breadcrumbs-item>
    </div>
    <div class="breadcrumb-item" @click="setPosition(id_etage, etage); clearRoom()">
      <v-breadcrumbs-item v-if="etage">
        {{ etage }}
      </v-breadcrumbs-item>
    </div>
    <div v-if="piece" @click="setPosition(id_piece, piece)" class="breadcrumb-item">
      <v-breadcrumbs-item>
        {{ piece }}
      </v-breadcrumbs-item>
    </div>
    <div v-if="equipement" @click="setPosition('equipement')" class="breadcrumb-item">
      <v-breadcrumbs-item>
        {{ equipement }}
      </v-breadcrumbs-item>
    </div>
  </v-breadcrumbs>
</template>


<style scoped>
.v-breadcrumbs {
  font-family: 'Roboto', sans-serif;
  font-size: 16px;
  display: flex;
  align-items: center;
  margin-top: 20px;
  margin-left: 19px;
  margin-right: 10px;
  padding: 0;
}

.v-breadcrumbs__divider {
  color: #9e9e9e;
  margin: 0 8px;
}

.breadcrumb-item {
  cursor: pointer;
  color: #14202C;
  transition: color 0.3s ease;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border: 1px solid rgb(206, 206, 206);
  height: 40px;
  background-color: rgb(241, 241, 241);
  flex: 1 1 0;
  min-width: 0;
  width: 20px;
}

.breadcrumb-item:hover {
  color: #14202C;
  text-decoration: underline;
  background-color: rgb(214, 214, 214);
}

.breadcrumb-item:active {
  color: #0d47a1;
}
</style>


<script lang="ts">
import { defineComponent, watch } from 'vue';
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";
import { error, warn } from 'console';


export default defineComponent({
  props: {
    type: {
      type: String,
      required: true
    },
    ids: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      currentPosition: '',
      elementDynamicId: null,
      etage: null,
      piece: null,
      equipement: null,
      id_etage: null,
      id_piece: null,
      building: null,
      id_building: null,
      show: false
    };
  },
  // async mounted() {
  //   // console.error('////////////////////////////////////////////////');
  //   // console.error('////////////////////////////////////////////////');
  // },GET_BUILDING_INFO
  watch: {
    combinedIdsAndQuery: {

      handler: async function ([newIds, newSpaceSelectedId]) {
        const buildingId = localStorage.getItem("idBuilding");
        const res1 = await this.$store.dispatch(ActionTypes.GET_BUILDING_INFO, {
          buildingId,
        });
        this.id_building = res1.dynamicId
        this.building = res1.name

        if (this.id_building == newIds) {
          this.etage = null;
          this.id_etage = null;
          this.id_piece = null;
          this.id_building = null;
          this.piece = null;
          this.equipement = null;
          this.building = null;
          this.show = false

          return
        }



        try {

          if (this.type === 'BIMObject') {
            const resultParent = await this.$store.dispatch(ActionTypes.GET_POSTION_EQUIPEMENT, {
              buildingId,
              referenceIds: newIds,
            });

            this.etage = resultParent.info.floor.name;
            this.id_etage = resultParent.info.floor.dynamicId;
            this.id_piece = resultParent.info?.room?.dynamicId;
            this.id_building = resultParent.info?.building?.dynamicId;
            this.piece = resultParent.info?.room?.name;
            this.equipement = resultParent.name;
            this.building = resultParent.info.building.name;

          } else if (this.type === 'geographicRoom') {
            const resultParent = await this.$store.dispatch(ActionTypes.GET_POSTION_ROOM, {
              buildingId,
              referenceIds: newIds,
            });

            this.etage = resultParent.info.floor.name;
            this.id_etage = resultParent.info.floor.dynamicId;
            this.id_piece = resultParent.dynamicId;
            this.id_building = resultParent.info?.building?.dynamicId;
            this.piece = resultParent.name;
            this.equipement = null;
            this.building = resultParent.info.building.name;

          } else if (this.type === 'building') {


            const resultParent = await this.$store.dispatch(ActionTypes.GET_NODE_READ, {
              buildingId,
              referenceIds: [newSpaceSelectedId],
            });

            if (resultParent.type === "geographicFloor") {

              this.etage = resultParent.name;
              this.id_etage = resultParent.dynamicId;
              this.piece = null;
              this.equipement = null;
              this.show = true;

            } else {
              this.show = false;
            }
          } else if (this.type === 'etage' || this.type === 'geographicFloor' && newSpaceSelectedId) {

            const resultParent = await this.$store.dispatch(ActionTypes.GET_NODE_READ, {
              buildingId,
              referenceIds: [newIds],
            });

            if (resultParent.type === "geographicFloor") {
              this.etage = resultParent.name;
              this.id_etage = resultParent.dynamicId;
              this.show = true;
              this.piece = null;
              this.equipement = null;
            } else {
              this.show = false;
            }
          } else {
            this.etage = null;
            this.piece = null;
            this.equipement = null;
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
        }
      },
      immediate: true,
    }
  },
  computed: {
    combinedIdsAndQuery() {
      return [this.ids, window.parent.routerFontion.apps[0]._route.query.spaceSelectedId];
    }
  }

  ,
  methods: {
    clearRoom() {
      this.piece = null;
      this.equipement = null;

    },
    clearFLoor() {
      this.piece = null;
      this.equipement = null;
      this.show = false;
      this.etage = null;
    },

    setPosition(id, position: string) {
      const currentQuery = { ...window.parent.routerFontion.apps[0]._route.query }
      if (id == currentQuery.spaceSelectedId)
        return
      const buildingId = localStorage.getItem("idBuilding");
      const item = {
        color: '#ded638',
        dynamicId: id,
        buildingId: buildingId,
        // dbid: dbid,
        // bimFileId: bimFileId,
        name: position,
      }
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { navigate: 'la page', node: item });
      this.currentPosition = position;

      const query = {
        app: window.parent.router.query.app,
        buildingId: buildingId,
        spaceSelectedId: id,
        name: position
      };

      window.parent.routerFontion.customPush(window.parent.router.path, query)

    }
  }
});
</script>
