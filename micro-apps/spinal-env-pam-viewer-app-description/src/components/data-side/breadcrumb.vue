<template>
  <v-breadcrumbs v-if="etage"  divider=">">
    <!-- Affiche le premier niveau (étage) si 'etage' est défini -->
    <v-breadcrumbs-item v-if="etage" @click="setPosition(id_etage, etage)" class="breadcrumb-item">
      {{ etage }}
    </v-breadcrumbs-item>

    <!-- Affiche le deuxième niveau (pièce) si 'piece' est défini -->
    <v-breadcrumbs-item v-if="piece" @click="setPosition(id_piece, piece)" class="breadcrumb-item">
      {{ piece }}
    </v-breadcrumbs-item>

    <!-- Affiche le troisième niveau (équipement) si 'equipement' est défini -->
    <v-breadcrumbs-item v-if="equipement" @click="setPosition('equipement')" class="breadcrumb-item">
      {{ equipement }}
    </v-breadcrumbs-item>
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
  padding: 0px;
}

.v-breadcrumbs__divider {
  color: #9e9e9e;
  margin: 0 8px;
}
.breadcrumb-item {
  cursor: pointer;
  color: #14202C;
  transition: color 0.3s ease;
  text-decoration: none;
  max-width: 400px;
  padding-left: 7px;
  padding-right: 7px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex; /* On garde flex */
  justify-content: center; /* Centre le contenu horizontalement */
  align-items: center; /* Centre le contenu verticalement */
  border: 1px solid rgb(206, 206, 206);
  height: 40px;
  background-color: rgb(241, 241, 241);
  /* border-radius: 3px; */
  
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
import { ActionTypes } from "../../interfaces/vuexStoreTypes";// Assurez-vous que l'import des actions est correct
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";


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
      currentPosition: '', // Valeur par défaut pour la position actuelle
      elementDynamicId: null,// Exemple d'ID dynamique, à ajuster selon votre contexte
      etage: null,
      piece: null,
      equipement: null,
      id_etage: null,
      id_piece: null,
    };
  },
  async mounted() {
    // console.error('////////////////////////////////////////////////');
    // console.error('////////////////////////////////////////////////');
  },
  watch: {
    ids: {
      handler: async function (newIds) {
        const buildingId = localStorage.getItem("idBuilding");
        console.log('%c Oh my heavens! ', 'background: yellow; color: #bada55');

        console.log('Le changement de ids a été effectué :', newIds);
        console.log('Le changement de ids a été effectué :', this.type);

        try {
          if (this.type === 'BIMObject') {
            const parentPromise = [
              this.$store.dispatch(ActionTypes.GET_POSTION_EQUIPEMENT, {
                buildingId: buildingId,
                referenceIds: newIds,
              }),
            ];
            const resultParent = await Promise.all(parentPromise);
            this.etage = resultParent[0].info.floor.name;
            this.id_etage = resultParent[0].info.floor.dynamicId
            this.id_piece = resultParent[0].info?.room?.dynamicId
            this.piece = resultParent[0].info?.room?.name;
            this.equipement = resultParent[0].name;

            console.log('Résultat Équipement:', resultParent);
          } else if (this.type === 'geographicRoom') {
            const parentPromise = [
              this.$store.dispatch(ActionTypes.GET_POSTION_ROOM, {
                buildingId: buildingId,
                referenceIds: newIds,
              }),
            ];
            const resultParent = await Promise.all(parentPromise);

            this.etage = resultParent[0].info.floor.name;
            this.id_etage = resultParent[0].info.floor.dynamicId
            this.id_piece = resultParent[0].dynamicId
            this.piece = resultParent[0].name;
            this.equipement = null;
            console.log('Résultat Room:', resultParent);
          }else{
            this.etage = null
            this.piece = null
            this.equipement = null
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des données:', error);
        }
      },
      immediate: true // Ceci déclenchera le watch dès que le composant est monté
    }
  }
  ,
  methods: {
    setPosition(id, position: string) {
      const buildingId = localStorage.getItem("idBuilding");
      const item = {
        color: '#ded638',
        dynamicId: id,
        buildingId: buildingId,
        // dbid: dbid,
        // bimFileId: bimFileId,
        name: position,
        // position: new THREE.Vector3(Number(X), Number(Y), Number(Z)),
        // data: result[0],
        // config: this.config
      }
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { navigate: 'la page', node: item });
      this.currentPosition = position;
      console.log('Nouvelle position:', window.parent.router.query.app);


      const query = {
        app: window.parent.router.query.app,
        buildingId: buildingId,
        spaceSelectedId: id,
        name: position
      };

      // Remplacer ou pousser la nouvelle URL
      window.parent.routerFontion.customPush(window.parent.router.path, query)

    }
  }
});
</script>
