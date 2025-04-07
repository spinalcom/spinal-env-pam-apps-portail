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
        const data = this.$store.state.appDataStore.StripeDataList;
        const seletectedZone = this.$store.state.appDataStore.zoneSelected.name;
        console.log("data", data);
        console.log("seletectedZone", seletectedZone);
          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, seletectedZone);
          XLSX.writeFile(workbook, `${seletectedZone}-convention_nomage.xlsx`);

      },
  
      formatToExcel() {
        const entete = Object.keys(this.data[0]).map((h) => ({
          key: h,
          header: h,
        }));
        return {
          name: "",
          author: "",
          data: [{ name: "sheet 1", header: entete, rows: this.data }],
        };
      },
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