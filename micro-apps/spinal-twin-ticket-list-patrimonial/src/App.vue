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
  <v-app id="application">
    <!--Download & selector-->
    <div style="width: 100%" class="d-flex justify-end">
      <sc-download-button
        class="ma-1 pa-1"
        :file-name="'Tickets'"
        :data="stepFilteredTickets"
      ></sc-download-button>
      <sc-space-selector
        class="ma-1 pa-1"
        v-model="el"
        :max-depth="1"
        :onopen="expand"
        :first-tile="selector"
      ></sc-space-selector>
    </div>

    <!--Ticket table-->
    <v-card
      class="ticket-table ma-2 d-flex flex-column table-card rounded-lg flex-grow-1"
      elevation="5"
      outlined
    >
      <v-card-title style="height: 56px" class="text-uppercase ma-2"
        >Liste des tickets</v-card-title
      >
      <div
        ref="tableContainer"
        style="height: calc(100% - 56px)"
        class="d-flex flex-column"
      >
        <div
          ref="tableHead"
          class="d-flex flex-row ml-6 mr-2"
          style="height: 60px"
        >
          <div style="width: 20%">
            <v-select
              v-model="domain_filter"
              label="Domaine"
              :items="domains"
              append-icon="mdi-chevron-down"
              clearable
              clear-icon="mdi-close-circle-outline"
              multiple
              outlined
            >
              <template v-slot:selection="{ item, index }">
                <v-chip
                  @click:close="
                    domain_filter = domain_filter.filter((d) => d !== item)
                  "
                  close
                  :close-icon="'mdi-close-circle'"
                  style="
                    font-size: 12px;
                    height: 24px;
                    max-width: calc(90% - 25px);
                  "
                  v-if="index < 1"
                >
                  <span style="max-width: 90%; overflow: hidden">{{
                    item
                  }}</span>
                </v-chip>

                <span
                  v-if="index === 1"
                  class="text-grey text-caption align-self-center"
                >
                  (+{{ domain_filter.length - 1 }})
                </span>
              </template>
            </v-select>
          </div>
          <div style="width: 20%" class="ml-5">
            <v-select
              v-model="step_filter"
              label="Étape"
              :items="steps"
              append-icon="mdi-chevron-down"
              clearable
              clear-icon="mdi-close-circle-outline"
              multiple
              outlined
            >
              <template v-slot:selection="{ item, index }">
                <v-chip
                  @click:close="
                    step_filter = step_filter.filter((s) => s !== item)
                  "
                  close
                  :close-icon="'mdi-close-circle'"
                  style="
                    font-size: 12px;
                    height: 24px;
                    max-width: calc(90% - 25px);
                  "
                  v-if="index < 1"
                >
                  <span style="max-width: 90%; overflow: hidden">{{
                    item
                  }}</span>
                </v-chip>
                <span
                  v-if="index === 1"
                  class="text-grey text-caption align-self-center"
                >
                  (+{{ step_filter.length - 1 }})
                </span>
              </template>
            </v-select>
          </div>
        </div>
        <div ref="dataTable" class="d-flex ml-6 mr-6 mb-6 flex-fill">
          <v-data-table
            item-key="name"
            class="elevation-1 table-data d-flex flex-column flex-grow-1 justify-space-between"
            loading-text="Chargement des données"
            :loading="!loaded"
            fixed-header
            :headers="headers"
            :height="tableHeight"
            :items="stepFilteredTickets"
            :footer-props="{
              prevIcon: 'mdi-menu-left',
              nextIcon: 'mdi-menu-right',
              showCurrentPage: true,
              itemsPerPageAllText: 'Tout',
            }"
            @click:row="rowClicked"
          >
            <v-progress-linear
              v-show="!loaded(el.dynamicId)"
              slot="progress"
              color="accent"
              class="progress-bar"
              indeterminate
              style="margin-left: -16px; width: calc(100% + 32px)"
            ></v-progress-linear>
            <template v-slot:no-data> Pas de données disponibles</template>
            <template v-slot:item.Bâtiment="{ item }">
              <div
                class="mr-1 rounded-circle ps-3 pt-3 d-inline-block"
                :style="{
                  background: item.buildingColor + ' no-repeat padding-box',
                }"
              ></div>
              {{ item.Bâtiment }}
            </template>
            <template v-slot:item.Étape="{ item }">
              <div
                class="mr-1 rounded-circle ps-3 pt-3 d-inline-block"
                :style="{
                  background: item.stepColor + ' no-repeat padding-box',
                }"
              ></div>
              {{ item.Étape }}
            </template>
            <template v-slot:item.attachement="{ item }">
              <div class="text-center">
                <v-icon v-if="item.attachement" color="#0f0">
                  mdi-check-circle-outline
                </v-icon>
                <v-icon v-else color="#f00">mdi-close-circle-outline</v-icon>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </v-card>

    <!--Dialog background-->
    <div
      v-show="showDialog"
      class="dialog-background"
      @click="switchPopUp"
    ></div>

    <!--Dialog box to display the details of the tcket-->
    <v-card
      v-if="detailedTicket"
      elevation="24"
      v-show="showDialog"
      class="dialog-box"
    >
      <v-card-title class="bold px-4">
        <div style="width: calc(50% - 230px)" class="overflow-hidden">
          {{ detailedTicket.name || "Nom" }}
        </div>
        <div style="width: 460px" class="text-center">
          Créé le: {{ dispDateCreation }} Modifié le: {{ dispDateModif }}
        </div>
        <div style="width: calc(50% - 230px)" class="text-right">
          Priorité: {{ detailedTicket.priority }}
        </div>
      </v-card-title>

      <v-divider></v-divider>
      <v-card-text
        style="height: calc(100% - 130px)"
        class="d-flex flex-column overflow-y-auto overflow-x-hidden"
      >
        <div
          style="height: 60%"
          class="d-flex flex-row pb-4 justify-space-between"
        >
          <div style="width: 40%" class="d-flex flex-column">
            <div class="mb-4">
              <div class="font-weight-bold">
                <v-icon>mdi-account</v-icon>
                Déclarant
              </div>
              <div class="pl-8">
                {{ detailedTicket.userName || "Non défini" }}
              </div>
            </div>
            <div class="mb-4">
              <div class="font-weight-bold">
                <v-icon>mdi-map-marker</v-icon>
                Espace
              </div>
              <div class="pl-8">
                {{
                  detailedTicket.buildingName +
                  " : " +
                  detailedTicket.elementSelected.name
                }}
              </div>
            </div>
            <div class="mb-4">
              <div class="font-weight-bold">
                <v-icon>mdi-sitemap</v-icon>
                Workflow & Process
              </div>
              <div class="pl-8">
                {{ detailedTicket.workflowName }} |
                {{ detailedTicket.process.name }}
              </div>
            </div>
            <div class="mb-4">
              <div class="font-weight-bold">
                <v-icon>mdi-step-forward</v-icon>
                Étape
              </div>
              <div class="pl-8">
                <div
                  class="mr-1 rounded-circle ps-3 pt-3 d-inline-block"
                  :style="{
                    background:
                      detailedTicket.step.color + ' no-repeat padding-box',
                  }"
                ></div>
                {{ detailedTicket.step.name }}
              </div>
            </div>
            <div class="d-flex flex-column overflow-y-hidden">
              <div class="font-weight-bold">
                <v-icon>mdi-text-box</v-icon>
                Description
              </div>
              <div class="pl-8 overflow-y-auto">
                {{ detailedTicket.description }}
              </div>
            </div>
          </div>
          <!--carousel-->
          <div
            v-if="image_list.length > 0"
            style="width: 59%"
            class="d-flex flex-column"
          >
            <div
              class="d-flex justify-center flex-shrink-1"
              style="background-color: rgba(0, 0, 0, 0.6)"
            >
              <div class="text-center my-2">
                <a
                  style="color: white"
                  :href="image_list[c_index].src"
                  target="_blank"
                  :download="image_list[c_index].name"
                  >{{ image_list[c_index].name }}
                  <v-icon class="ml-1" style="color: white">
                    mdi-tray-arrow-down
                  </v-icon>
                </a>
              </div>
            </div>
            <div
              class="d-flex flex-row flex-grow-1 justify-space-between"
              style="
                background-color: #bbb;
                background-size: contain;
                background-position: center center;
              "
              :style="{
                'background-image': 'url(' + image_list[c_index].src + ')',
              }"
            >
              <div class="d-flex align-center px-2">
                <v-btn
                  style="color: white; background-color: rgba(0, 0, 0, 0.3)"
                  fab
                  @click="
                    c_index =
                      (c_index + image_list.length - 1) % image_list.length
                  "
                >
                  <v-icon large>mdi-chevron-left</v-icon>
                </v-btn>
              </div>
              <div class="d-flex align-center px-2">
                <v-btn
                  style="color: white; background-color: rgba(0, 0, 0, 0.3)"
                  fab
                  @click="c_index = (c_index + 1) % image_list.length"
                >
                  <v-icon large>mdi-chevron-right</v-icon>
                </v-btn>
              </div>
            </div>
            <div
              class="d-flex justify-center flex-shrink-1"
              style="background-color: rgba(0, 0, 0, 0.6)"
            >
              <div
                v-for="(img, i) in image_list"
                :key="i"
                class="d-flex align-center justify-center rounded-circle ma-1"
                style="width: 18px; height: 18px"
                :style="{
                  'background-color': `rgba(255,255,255,${
                    c_index === i ? '0.3' : '0'
                  })`,
                }"
              >
                <v-btn
                  fab
                  style="background-color: white; width: 10px; height: 10px"
                  @click="c_index = i"
                ></v-btn>
              </div>
            </div>
          </div>
          <div v-else id="carousel-vide"></div>
        </div>
        <!--Tableaux-->
        <div style="height: 40%" class="d-flex flex-row justify-space-between">
          <div style="width: 49%" class="text-center py-1">
            <div
              style="background-color: gray"
              class="py-2 font-weight-bold rounded-t-lg"
            >
              LOGS
            </div>
            <v-data-table
              style="border: 1px solid gray"
              :headers="logsHeaders"
              :items="logsValues"
              :items-per-page="5"
              :height="169"
              fixed-header
              :footer-props="{
                'disable-items-per-page': true,
              }"
            >
            </v-data-table>
          </div>
          <div style="width: 49%" class="text-center py-1">
            <div
              style="background-color: gray"
              class="py-2 font-weight-bold rounded-t-lg"
            >
              ANNOTATIONS
            </div>
            <v-data-table
              style="border: 1px solid gray"
              :headers="annotationsHeaders"
              :items="annotationsValues"
              :items-per-page="5"
              :height="169"
              fixed-header
              :footer-props="{
                'disable-items-per-page': true,
              }"
            ></v-data-table>
          </div>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="pa-4" style="height: 64px">
        <v-btn text color="primary" @click="downloadPDF()">
          Imprimer le ticket
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn @click="switchPopUp" color="blue darken-4" text class="bold">
          FERMER
        </v-btn>
      </v-card-actions>
    </v-card>

    <!--Content of the pdf file to be downloaded-->
    <div id="pdf-div" v-if="detailedTicket" v-show="showPDF" class="pa-4">
      <div class="text-center title font-weight-bold mb-10 downloadable" id="0">
        Détails du ticket n° {{ detailedTicket.dynamicId }}
      </div>
      <div class="mb-4 downloadable" id="1">
        <div class="font-weight-bold">
          <v-icon>mdi-ticket</v-icon>
          Nom du ticket
        </div>
        <div class="pl-8">
          {{ detailedTicket.name }}
        </div>
      </div>
      <div class="mb-4 downloadable" id="2">
        <div class="font-weight-bold">
          <v-icon>mdi-calendar-range</v-icon>
          Date de création
        </div>
        <div class="pl-8">
          {{ dispDateCreation }}
        </div>
      </div>
      <div class="mb-4 downloadable" id="3">
        <div class="font-weight-bold">
          <v-icon>mdi-update</v-icon>
          Dernière mise à jour
        </div>
        <div class="pl-8">
          {{ dispDateModif }}
        </div>
      </div>
      <div class="mb-4 downloadable" id="4">
        <div class="font-weight-bold">
          <v-icon>mdi-priority-high</v-icon>
          Priorité
        </div>
        <div class="pl-8">
          {{ detailedTicket.priority }}
        </div>
      </div>
      <div class="mb-4 downloadable" id="5">
        <div class="font-weight-bold">
          <v-icon>mdi-account</v-icon>
          Déclarant
        </div>
        <div class="pl-8">
          {{ detailedTicket.userName || "Non défini" }}
        </div>
      </div>
      <div class="mb-4 downloadable" id="6">
        <div class="font-weight-bold">
          <v-icon>mdi-map-marker</v-icon>
          Espace
        </div>
        <div class="pl-8">
          {{
            detailedTicket.buildingName +
            " : " +
            detailedTicket.elementSelected.name
          }}
        </div>
      </div>
      <div class="mb-4 downloadable" id="7">
        <div class="font-weight-bold">
          <v-icon>mdi-sitemap</v-icon>
          Workflow & Process
        </div>
        <div class="pl-8">
          {{ detailedTicket.workflowName }} |
          {{ detailedTicket.process.name }}
        </div>
      </div>
      <div class="mb-4 downloadable" id="8">
        <div class="font-weight-bold">
          <v-icon>mdi-step-forward</v-icon>
          Étape
        </div>
        <div class="pl-8">
          <div
            class="mr-1 rounded-circle ps-3 pt-3 d-inline-block"
            :style="{
              background: detailedTicket.step.color + ' no-repeat padding-box',
            }"
          ></div>
          {{ detailedTicket.step.name }}
        </div>
      </div>
      <div class="downloadable" id="9">
        <div class="font-weight-bold">
          <v-icon>mdi-text-box</v-icon>
          Description
        </div>
        <div class="pl-8">{{ detailedTicket.description }}</div>
      </div>
      <div class="my-4 downloadable" id="10">
        <div class="font-weight-bold">LOGS</div>
        <v-simple-table class="text-left">
          <template v-slot:default>
            <thead>
              <tr>
                <th
                  v-for="item in logsHeaders"
                  :key="item.value"
                  style="border: 1px solid gray"
                >
                  {{ item.text }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in logsValues" :key="i">
                <td style="border: 1px solid gray">{{ item.event }}</td>
                <td style="border: 1px solid gray">{{ item.date }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
      <div
        v-if="detailedTicket.annotation_list.length > 0"
        class="my-4 downloadable"
        id="11"
      >
        <div class="font-weight-bold">ANNOTATIONS</div>
        <v-simple-table class="text-left">
          <template v-slot:default>
            <thead>
              <tr>
                <th
                  v-for="item in annotationsHeaders"
                  :key="item.value"
                  style="border: 1px solid gray"
                >
                  {{ item.text }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in annotationsValues" :key="i">
                <td style="border: 1px solid gray">{{ item.userName }}</td>
                <td style="border: 1px solid gray">{{ item.date }}</td>
                <td style="border: 1px solid gray">{{ item.message }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>
      <div v-if="detailedTicket.file_list.length > 0" class="mt-4">
        <div class="font-weight-bold my-3 downloadable" id="12">
          PIÈCES JOINTES
        </div>
        <img
          v-for="(image, i) in image_list"
          :key="i"
          :src="image.src"
          class="pa-3 downloadable"
          :id="13 + i"
          style="max-width: 100%; height: auto"
        />
      </div>
    </div>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { getFileAsync } from "./api-requests";
import { displayDate } from "./store/index";
import html2canvas from "html2canvas";

export default {
  name: "App",

  data: () => ({
    el: {
      name: "Patrimoine",
      dynamicId: JSON.parse(localStorage.getItem("patrimoine")).id,
    },
    domain_filter: [],
    step_filter: [],
    tableHeight: 96,
    showDialog: false,
    images: [],
    selectedId: 0,
    c_index: 0,
    showPDF: false,
    PDFparts: [],
  }),

  computed: {
    ...mapGetters({
      selector: "selector",
      tickets: "getTickets",
      tableTickets: "tableTickets",
      loaded: "isLoaded",
    }),
    dispDateCreation() {
      return displayDate(this.detailedTicket.creationDate);
    },
    dispDateModif() {
      return this.detailedTicket.log_list.length > 0
        ? displayDate([...this.detailedTicket.log_list].reverse()[0]?.date)
        : this.dispDateCreation;
    },
    tableData() {
      return this.tableTickets(this.el.dynamicId);
    },
    detailedTicket() {
      return this.tickets(this.el.dynamicId).find((t) => {
        return t.dynamicId === this.selectedId;
      });
    },
    image_list() {
      return this.images;
    },
    headers() {
      const widths = [17, 10, 16, 16, 10, 10, 13, 8];
      return [
        "Nom",
        "Bâtiment",
        "Domaine",
        "Étape",
        "Date de création",
        "Dernière modification",
        "Déclarant",
        { text: "Pièces jointes", value: "attachement" },
      ].map((e, i) => ({
        text: e.text || e,
        value: e.value || e,
        width: widths[i] + "%",
        sort: [3, 4].includes(i) ? (a, b) => this.compareDate(a, b) : null,
      }));
    },
    logsHeaders() {
      return [
        { text: "Évenement", value: "event" },
        { text: "Date", value: "date", sort: (a, b) => this.compareDate(a, b) },
      ];
    },
    logsValues() {
      return this.detailedTicket.log_list.map((l) => ({
        event: l.event,
        date: displayDate(l.date),
      }));
    },
    annotationsHeaders() {
      return [
        { text: "Déclarant", value: "userName" },
        { text: "Date", value: "date", sort: (a, b) => this.compareDate(a, b) },
        { text: "Message", value: "message", width: "70%" },
      ];
    },
    annotationsValues() {
      return this.detailedTicket.annotation_list.map((a) => ({
        userName: a.userName || "Non défini",
        date: displayDate(a.date),
        message: a.message,
      }));
    },
    domains() {
      return [...new Set(this.tableData.map((t) => t.Domaine))];
    },
    domainFilteredTickets() {
      if (this.domain_filter.length === 0 || this.tableData.length === 0)
        return this.tableData;
      return this.tableData.filter((d) =>
        this.domain_filter.includes(d.Domaine)
      );
    },
    steps() {
      return [...new Set(this.domainFilteredTickets.map((t) => t["Étape"]))];
    },
    stepFilteredTickets() {
      if (this.step_filter.length === 0 || this.tableData.length === 0)
        return this.domainFilteredTickets;
      return this.domainFilteredTickets.filter((d) =>
        this.step_filter.includes(d["Étape"])
      );
    },
    isDownloadable() {
      const requiredLength = document.querySelectorAll(".downloadable").length;
      const currentLength = this.PDFparts.length;
      return requiredLength > 0 && currentLength === requiredLength;
    },
  },

  methods: {
    ...mapActions({
      loadTickets: "loadTickets",
    }),
    async expand(item) {
      switch (item.level) {
        case 0:
          return this.selector.buildings;
      }
    },

    compareDate(date1, date2) {
      const e1 = date1.split("/");
      const e2 = date2.split("/");
      return e1[2] - e2[2] || e1[1] - e2[1] || e1[0] - e2[0];
    },

    async rowClicked(event) {
      this.selectedId = event.id;
      const images = [];
      for (const file of this.detailedTicket.file_list) {
        images.push({
          name: file.Name,
          src: await getFileAsync(
            this.detailedTicket.buildingId,
            file.dynamicId
          ),
        });
      }
      this.images = images;
      this.switchPopUp();
    },

    switchPopUp() {
      this.showDialog = !this.showDialog;
    },

    async downloadPDF() {
      this.showPDF = !this.showPDF;
      setTimeout(() => {
        const docs = document.querySelectorAll(".downloadable");
        this.showPDF = !this.showPDF;
        for (const el of docs)
          html2canvas(el).then((canvas) => {
            const b64 = canvas.toDataURL();
            this.PDFparts.push({
              index: el.id,
              html: `<div><img style="margin-bottom: 12px; max-width: 100%; height: auto" src="${b64}" /></div>`,
            });
          });
      }, 10);
    },
  },

  async mounted() {
    const { dataTable, tableContainer, tableHead } = this.$refs;
    this.tableHeight = dataTable.clientHeight - 59;
    window.onresize = () => {
      this.tableHeight =
        tableContainer.clientHeight - (tableHead.clientHeight + 85);
    };
    await this.loadTickets();
  },

  watch: {
    async isDownloadable(v) {
      if (v) {
        const mywindow = window.open("", "PRINT", "height=1000,width=900");

        mywindow.document.write(
          `<html><head><title> ${this.detailedTicket.name} </title>`
        );
        mywindow.document.write("</head><body >");
        for (const part of this.PDFparts.sort((a, b) => a.index - b.index)) {
          mywindow.document.writeln(part.html);
        }
        await mywindow.document.writeln("</body></html>");

        mywindow.document.close();
        mywindow.focus();
        mywindow.print();
        this.PDFparts = [];
      }
    },
  },
};
</script>

<style scoped>
html {
  overflow-y: auto !important;
}

#application {
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
  position: absolute;
  width: 100%;
  height: 100%;
}

.ticket-table {
  position: fixed;
  height: calc(100% - 92px);
  top: 70px;
  bottom: 0;
  left: 0;
  right: 0;
}

.table-card {
  background-color: #f9f9f9;
}

.v-data-table {
  font-size: 14px;
}

.dialog-background {
  position: fixed;
  width: 3000px;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.1);
}

.dialog-box {
  position: absolute;
  width: 85%;
  height: calc(100% - 120px);
  top: 70px;
  left: 7.5%;
}

#pdf-div {
  z-index: 999;
  position: absolute;
  background-color: white;
  width: 50%;
  top: 70px;
  left: 25%;
}

a {
  color: white;
}

a:hover {
  font-size: 15px;
  font-weight: bold;
  text-decoration: none;
}

#carousel-vide {
  width: 59%;
  background-image: url("../asset/img/No-Image-Placeholder.png");
  background-color: #eee;
  background-size: contain;
  background-position: center center;
}
</style>
