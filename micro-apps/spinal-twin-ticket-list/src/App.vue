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
  <v-app>
    <div style="width: 100%" class="d-flex justify-end">
      <sc-download-button
        class="ma-1 pa-1"
        :file-name="'Tickets'"
        :data="tickets"
      ></sc-download-button>
      <sc-space-selector
        class="ma-1 pa-1"
        v-model="el"
        :path.sync="path"
        :max-depth="3"
        :onopen="expand"
      ></sc-space-selector>
    </div>

    <v-main class="application pt-2 pl-1 pr-1" style="z-index: 1">
      <sc-paginated-table
        :height="tableHeight"
        :title="'Liste des tickets'"
        :table-data="tickets"
      ></sc-paginated-table>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import {
  getBuildingAsync,
  getFloorListAsync,
  getRoomListAsync,
} from "./api-requests";

export default {
  name: "App",

  data: () => ({
    el: { title: "Selection", name: "Bâtiment" },
    path: {},
  }),

  computed: {
    ...mapGetters({
      getTickets: "getTickets",
    }),
    tickets() {
      return this.getTickets(this.el.dynamicId) ?? [{}];
    },
    tableHeight() {
      return window.innerHeight;
    },
  },

  methods: {
    ...mapActions({
      loadTickets: "loadTickets",
    }),
    async expand(item) {
      switch (item.level) {
        case 0:
          return [await getBuildingAsync()].map((b) => {
            return { name: b.name, dynamicId: b.dynamicId, color: "#2598df" };
          });
        case 1:
          return (await getFloorListAsync(item.dynamicId)).map((b) => {
            return { name: b.name, dynamicId: b.dynamicId, color: "#2598df" };
          });
        case 2:
          return (await getRoomListAsync(item.dynamicId)).map((b) => {
            return { name: b.name, dynamicId: b.dynamicId, color: "#2598df" };
          });
      }
    },
  },

  async mounted() {
    this.el.title = (await getBuildingAsync()).name;
    await this.loadTickets();
  },
};
</script>

<style scoped>
html {
  overflow-y: auto !important;
}

.v-main {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 60px;
  bottom: 0px;
  left: 0;
  right: 0;
}
</style>
