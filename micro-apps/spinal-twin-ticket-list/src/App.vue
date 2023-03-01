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
    <div style="width: 100%" class="d-flex justify-end">
      <sc-download-button
        class="ma-1 pa-1"
        :file-name="'Tickets'"
        :data="tableData"
      ></sc-download-button>
      <sc-space-selector
        class="ma-1 pa-1"
        v-model="el"
        :path.sync="path"
        :max-depth="1"
        :onopen="expand"
        :first-tile="firstTile"
      ></sc-space-selector>
    </div>
    <v-card
      class="ticket-table ma-2 d-flex flex-column table-card rounded-lg flex-grow-1"
      elevation="5"
      outlined
    >
      <v-card-title style="height: 56px" class="text-uppercase ma-2"
        >Liste des tickets</v-card-title
      >
      <div style="height: calc(100% - 56px)" class="d-flex flex-column">
        <div class="d-flex flex-row ml-6 mr-2">
          <div style="width: 20%">
            <v-select
              v-model="domain_filter"
              label="Domaine"
              :items="domains"
              append-icon="mdi-chevron-down"
              clearable
              clear-icon="mdi-close-circle-outline"
              deletable-chips
              small-chips
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
                  style="font-size: 12px; height: 24px"
                  v-if="index < 1"
                >
                  <span>{{ item }}</span>
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
              deletable-chips
              small-chips
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
                  style="font-size: 12px; height: 24px"
                  v-if="index < 1"
                >
                  <span>{{ item }}</span>
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
        <v-data-table
          item-key="name"
          class="elevation-1 table-data d-flex flex-column flex-grow-1 flex-shrink-1 justify-space-between ml-6 mr-6 mb-6"
          loading-text="Chargement des données"
          :loading="!loaded"
          fixed-header
          :headers="headers"
          :height="tableHeight"
          :items="stepFilteredTickets"
          :custom-sort="customSort"
          :footer-props="{
            prevIcon: 'mdi-menu-left',
            nextIcon: 'mdi-menu-right',
            showCurrentPage: true,
            itemsPerPageAllText: 'Tout',
          }"
        >
          <v-progress-linear
            v-show="!loaded"
            slot="progress"
            color="accent"
            class="progress-bar"
            indeterminate
          ></v-progress-linear>
          <template v-slot:no-data> Pas de données disponibles </template>
        </v-data-table>
      </div>
    </v-card>
  </v-app>
</template>

<script>
import { gradiant, HSVtoRGB, RGBtoHexa } from "spinal-components/src/colors";
import { mapActions, mapGetters } from "vuex";
import { getBuildingAsync } from "./api-requests";

export default {
  name: "App",

  data: () => ({
    el: { name: "Bâtiment" },
    path: {},
    firstTile: {},
    domain_filter: [],
    step_filter: [],
    loaded: false,
    tableHeight: 96,
  }),

  computed: {
    ...mapGetters({
      getTickets: "getTickets",
    }),
    tableData() {
      return this.loaded ? this.getTickets(this.el.dynamicId) : [];
    },
    headers() {
      const widths = [20, 20, 20, 13, 13, 13];
      return [
        "Nom",
        "Domaine",
        "Étape",
        "Date de création",
        "Dernière modification",
        "Déclarant",
      ].map((e, i) => ({ text: e, value: e, width: widths[i] + "%" }));
    },
    tableHeight() {
      return window.innerHeight;
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
  },

  methods: {
    ...mapActions({
      loadTickets: "loadTickets",
      floors: "getFloorList",
      setTickets: "setFloorTickets",
    }),
    async expand(item) {
      switch (item.level) {
        case 0:
          const floors = await this.floors();
          const colors = gradiant(floors.length);
          return floors.map((f, i) => {
            const { r, g, b } = HSVtoRGB(colors[i] / 100, 1, 1);
            return {
              name: f.name,
              dynamicId: f.dynamicId,
              color: RGBtoHexa(r, g, b),
            };
          });
      }
    },
    customSort(items, index, isDesc) {
      items.sort((a, b) => {
        if (["Date de création", "Dernière modification"].includes(index[0])) {
          if (!isDesc[0]) return this.compareDate(b[index], a[index]);
          return this.compareDate(a[index], b[index]);
        }
        if (a[index]) {
          if (!isDesc[0])
            return a[index].toLowerCase().localeCompare(b[index].toLowerCase());
          return b[index].toLowerCase().localeCompare(a[index].toLowerCase());
        }
      });
      return items;
    },

    compareDate(date1, date2) {
      const e1 = date1.split("/");
      const e2 = date2.split("/");
      return e1[2] - e2[2] || e1[1] - e2[1] || e1[0] - e2[0];
    },
  },

  async mounted() {
    const { name, dynamicId } = await getBuildingAsync();
    this.el = { name: name, dynamicId: dynamicId };
    this.firstTile = { name: name, dynamicId: dynamicId };
    await this.loadTickets();
    const table = document.querySelector(".v-data-table");
    this.tableHeight = table.clientHeight - 59;
    this.loaded = true;
  },

  watch: {
    async el() {
      this.loaded = false;
      await this.setTickets(this.el.dynamicId);
      this.loaded = true;
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
  width: clac(100% - 8px);
  height: calc(100% - 84px);
  top: 68px;
  bottom: 8px;
  left: 0;
  right: 0;
}

.table-card {
  background-color: #f9f9f9;
}

.v-data-table {
  font-size: 14px;
}
</style>
