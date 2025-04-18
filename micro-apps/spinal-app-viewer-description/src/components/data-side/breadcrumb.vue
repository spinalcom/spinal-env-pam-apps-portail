<template>
  <v-breadcrumbs v-if="building || etage || piece || equipement || show" divider=">">
    <div class="breadcrumb-item" @click="setPosition(id_building, building, 'building');">
      <v-breadcrumbs-item v-if="building">
        {{ building }}
      </v-breadcrumbs-item>
    </div>
    <div class="breadcrumb-item" @click="setPosition(id_etage, etage, 'geographicFloor'); clearRoom()">
      <v-breadcrumbs-item v-if="etage">
        {{ etage }}
      </v-breadcrumbs-item>
    </div>
    <div v-if="piece" @click="setPosition(id_piece, piece, 'geographicRoom')" class="breadcrumb-item">
      <v-breadcrumbs-item>
        {{ piece }}
      </v-breadcrumbs-item>
    </div>
    <div v-if="equipement" class="breadcrumb-item">
      <v-breadcrumbs-item>
        {{ equipement }}
      </v-breadcrumbs-item>
    </div>
  </v-breadcrumbs>
</template>





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
  async mounted() {
    // console.error('////////////////////////////////////////////////');
    // console.error('////////////////////////////////////////////////');
    console.warn("combinedIdsAndQuery", this.combinedIdsAndQuery);
  },
  watch: {
    combinedIdsAndQuery: {
      immediate: true,
      handler([newIds, newSpaceSelectedId]) {
        this.handleBreadcrumbUpdate(newIds, newSpaceSelectedId);
      }
    },

    // 👇 Ce nouveau watch déclenche aussi handleBreadcrumbUpdate quand `type` change
    type(newType) {
      const [newIds, newSpaceSelectedId] = this.combinedIdsAndQuery;
      this.handleBreadcrumbUpdate(newIds, newSpaceSelectedId, newType);
    }
  }
  ,
  computed: {
    combinedIdsAndQuery() {
      return [this.ids, window.parent.routerFontion.apps[0]._route.query.spaceSelectedId];
    }
  }

  ,
  methods: {

    async handleBreadcrumbUpdate(newIds, newSpaceSelectedId, currentType = this.type) {
      console.warn("🔁 handleBreadcrumbUpdate avec type:", currentType);

      if (!currentType || !newIds || newIds === 0) {
        console.warn("⛔️ Données insuffisantes pour traiter le breadcrumb");
        return;
      }

      try {
        const buildingId = localStorage.getItem("idBuilding");
        const res1 = await this.$store.dispatch(ActionTypes.GET_BUILDING_INFO, { buildingId });
        this.id_building = res1.dynamicId;
        this.building = res1.name;

        if (this.id_building == newIds) {
          this.etage = null;
          this.id_etage = null;
          this.id_piece = null;
          this.id_building = null;
          this.piece = null;
          this.equipement = null;
          this.building = null;
          this.show = false;
          return;
        }

        switch (currentType) {
          case 'BIMObject': {
            const result = await this.$store.dispatch(ActionTypes.GET_POSTION_EQUIPEMENT, {
              buildingId,
              referenceIds: newIds,
            });
            console.warn("✅ [BIMObject] Résultat :", result);

            this.etage = result.info.floor?.name || null;
            this.id_etage = result.info.floor?.dynamicId || null;
            this.piece = result.info.room?.name || null;
            this.id_piece = result.info.room?.dynamicId || null;
            this.equipement = result.name || null;
            this.building = result.info.building?.name || null;
            break;
          }

          case 'geographicRoom': {
            const result = await this.$store.dispatch(ActionTypes.GET_POSTION_ROOM, {
              buildingId,
              referenceIds: newIds,
            });
            console.warn("✅ [Room] Résultat :", result);

            this.etage = result.info.floor?.name || null;
            this.id_etage = result.info.floor?.dynamicId || null;
            this.piece = result.name || null;
            this.id_piece = result.dynamicId || null;
            this.equipement = null;
            this.building = result.info.building?.name || null;
            break;
          }

          case 'building': {
            if (!newSpaceSelectedId) break;

            const result = await this.$store.dispatch(ActionTypes.GET_NODE_READ, {
              buildingId,
              referenceIds: [newSpaceSelectedId],
            });
            console.warn("✅ [Building] Résultat :", result);

            if (result.type === 'geographicFloor') {
              this.etage = result.name || null;
              this.id_etage = result.dynamicId || null;
              this.piece = null;
              this.equipement = null;
              this.show = true;
            } else {
              this.show = false;
            }
            break;
          }

          case 'etage':
          case 'geographicFloor': {
            if (!newSpaceSelectedId) break;

            const result = await this.$store.dispatch(ActionTypes.GET_NODE_READ, {
              buildingId,
              referenceIds: [newIds],
            });
            console.warn("✅ [Etage] Résultat :", result);

            if (result.type === 'geographicFloor') {
              this.etage = result.name || null;
              this.id_etage = result.dynamicId || null;
              this.piece = null;
              this.equipement = null;
              this.show = true;
            } else {
              this.show = false;
            }
            break;
          }

          default:
            console.warn("❓ Type non pris en charge :", currentType);
            this.etage = null;
            this.piece = null;
            this.equipement = null;
            break;
        }
      } catch (error) {
        console.error('❌ Erreur breadcrumb:', error);
      }

      console.log("📌 BREADCRUMB DEBUG:");
      console.log("building:", this.building);
      console.log("etage:", this.etage);
      console.log("piece:", this.piece);
      console.log("equipement:", this.equipement);
      console.log("show:", this.show);
    }
    ,
    clearRoom() {
      if (localStorage.getItem("viewer_loaded") == 'unload')
        return
      this.piece = null;
      this.equipement = null;

    },
    clearFLoor() {
      this.piece = null;
      this.equipement = null;
      this.show = false;
      this.etage = null;
    },

    setPosition(id, position: string , type: string) {
      if (localStorage.getItem("viewer_loaded") == 'unload')
        return
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
        type: type,
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
