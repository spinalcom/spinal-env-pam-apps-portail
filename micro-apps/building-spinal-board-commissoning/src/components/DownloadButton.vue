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
  
  export default {
    name: "DownloadButton",
  
    data: () => ({
      hover: false,
    }),
  
    methods: {
      download() {
        this.downloadCSV();
      },
      downloadCSV() {
          // Récupérer les données du store
        let data = this.$store.state.appDataStore.data;
        const stripeData = this.$store.state.appDataStore.StripeDataList;
        const resultFinaldata = data.filter((item) => {
          const stripeDataItem = stripeData.find((str) => item.sources.find((src) => src.dynamicId === str.dynamicId));
          if(stripeDataItem) {
            return true;
          }
          else {
            return false;
          }
        })
        
        const selectedZone = this.$store.state.appDataStore.zoneSelected.name;

        // Convertir les données en format de tableau adapté pour Excel
        const flatData = this.convertCSV(resultFinaldata);
     
        const worksheet = XLSX.utils.json_to_sheet(flatData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, selectedZone);
        // Télécharger le fichier Excel
        XLSX.writeFile(workbook, `${selectedZone}-convention_nomage.xlsx`);
        
      
        

      },
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