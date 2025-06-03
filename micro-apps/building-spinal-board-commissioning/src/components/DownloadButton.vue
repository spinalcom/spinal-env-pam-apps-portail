<template>
    <div>
      <v-card
        @click.prevent="download"
        v-ripple
        class="main-button card-colored outer-card"
        style="background: #14202C; border-radius: 10px !important;"
        :class="{ 'enter-button': hover }"
        @mouseover="hover = true"
        @mouseleave="hover = false"
        elevation="8"
      >
        <v-card
          v-ripple
          class="first-nested card-colored inner-card"
        style="background: #14202C; margin: auto;"
          :class="{ inside: hover }"
          elevation="8"
        >
          <v-icon :class="{ inside: hover }" style="color: #bfbfbf; padding: 3px">mdi-file-download</v-icon
          >
        </v-card>
      </v-card>
    </div>
  </template>
  
  <script>
  import * as XLSX from 'xlsx';
import { MutationTypes } from '../services/store/appDataStore/mutations';
  
  export default {
    name: "DownloadButton",
  
    data: () => ({
      hover: false,
    }),
  
    methods: {
     async download() {
       
        this.downloadCSV();
      },
async downloadCSV() {
  // Démarrer le loader
  this.$store.commit(MutationTypes.SET_LOADING, {
    message: "Initialisation...",
    completed: 0,
    total: 0,
    progress: 0,
  });
  this.$store.commit(MutationTypes.SET_LOADER, true);

  await this.$nextTick(); 

  // Récupérer les données
  let data = this.$store.state.appDataStore.data.data;
  const stripeData = this.$store.state.appDataStore.StripeDataList;
  let completed = 0;
  const total = data.length;
  const resultFinaldata = [];

  const chunkSize = 100; // nombre d'éléments traités à chaque itération
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);

    chunk.forEach(item => {
      completed++;
      const stripeDataItem = stripeData.find((str) =>
        item.sources.find((src) => src.dynamicId === str.dynamicId)
      );
      if (stripeDataItem) {
        resultFinaldata.push(item);
      }
    });

    // Mise à jour du loader à chaque chunk
    this.$store.commit(MutationTypes.SET_LOADING, {
      message: "Récupération des données...",
      completed: completed,
      total: total,
      percent: Math.round((completed / total) * 100),
    });

    await new Promise(resolve => setTimeout(resolve, 0)); // Pause pour laisser l'UI respirer
  }

  // Fichier prêt à être télécharger 
  this.$store.commit(MutationTypes.SET_LOADING, {
    message: "Préparation du fichier...",
    completed: total,
    total: total,
    percent: 100,
  });

  await new Promise(resolve => setTimeout(resolve, 300)); // petite pause pour que l'utilisateur voit l'étape de préparation du fichier

  const selectedZone = this.$store.state.appDataStore.zoneSelected.name;
  // Convertir les données en format CSV
  const flatData = this.convertCSV(resultFinaldata);

  // Créer un fichier Excel
  const worksheet = XLSX.utils.json_to_sheet(flatData);
  // Ajout  des en-têtes
  const workbook = XLSX.utils.book_new();
  // Ajout des colonnes
  XLSX.utils.book_append_sheet(workbook, worksheet, selectedZone);

  XLSX.writeFile(workbook, `${selectedZone}-convention_nomage.xlsx`);

  // Télechargement terminé
  this.$store.commit(MutationTypes.SET_LOADING, {
    message: "Téléchargement terminé",
    completed: 0,
    total: 0,
    progress: 0,
    isSuccess: true
  });

  // Laisse le temps à l'utilisateur de voir le message
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Réinitialiser le loader
  this.$store.commit(MutationTypes.SET_LOADER, false);
}
,
 extractForCSV(obj) {
        const row = {
          dynamicId: obj.dynamicId,
          name: obj.name,
          room: obj.info?.room?.name || "",
          roomStaticId: obj.info?.room?.staticId || "",
          floor: obj.info?.floor?.name || "",
          floorStaticId: obj.info?.floor?.staticId || "",
        };

        // Ajouter une colonne pour chaque source
        obj.sources.forEach((source, index) => {
          row[`${source.name}`] = source.value;
        });

  return row;
},
    convertCSV(arr) {
      let flat = arr.map(this.extractForCSV);
      return flat;
     
      ;
    }
    
      
    },
  };
  </script>
  
  <style scoped>
  .card-colored {
    background-color: #14202c;
  }
  .outer-card {
    border-radius: 10px;
    height: 60px;
    width: 60px;
  }
  .inner-card {
    border-radius: 5px;
    height: 32px;
    width: 32px;
    border: 1px solid #bfbfbf;
    position: absolute;
    top: 13px;
    left: 13px;
  }
  .enter-button {
    cursor: pointer;
  }
  .inside {
    color: #fff !important;
  }
  </style>