<template>
  <v-app id="application">
    <sc-space-selector class="ma-1 pa-1" v-model="el" :path.sync="path" :max-depth="3" :onopen="expand"></sc-space-selector>
    <v-main>
      <sc-paginated-table :height="tableHeight" :title="'Liste des tickets'" :table-data="tickets"></sc-paginated-table>
    </v-main>
  </v-app>
</template>

<script>

import { mapActions, mapState } from "vuex";
import { getUserBos } from "../../../src/requests/userData";
import { getBuildingAsync, getFloorListAsync, getRoomListAsync, getWorkflowListAsync } from "./api-requests";
import SpaceSelector from "spinal-components/src/components/SpaceSelector.vue"

export default {
  name: 'App',

  components: { SpaceSelector },

  data: () => ({
    el: { title: 'Selection', name: 'Bâtiment'},
    path: {},
  }),

  computed: {
    ...mapState({
      tickets: (state) => state.tickets
    }),
    tableHeight() {
      return window.innerHeight;
    },
  },

  methods: {
    ...mapActions({
      getTickets: "getTickets",
      updateTickets: "updateTickets"
    }),
    async expand(item) {
      switch (item.level) {
        case 0:
          return [await getBuildingAsync()].map(b => { return { name: b.name, dynamicId: b.dynamicId, color: '#2598df' } })
        case 1:
          return (await getFloorListAsync(item.dynamicId)).map(b => { return { name: b.name, dynamicId: b.dynamicId, color: '#2598df' } })
        case 2:
          return (await getRoomListAsync(item.dynamicId)).map(b => { return { name: b.name, dynamicId: b.dynamicId, color: '#2598df' } })
      }
    }
  },

  async mounted() {
    //await getBuildingAsync().then(b => this.el.title = title: b.name);
    await this.getTickets();
  },

  watch: {
    async el(v) {
      await this.updateTickets(v.dynamicId)
    }
  }
};
</script>

<style scoped>
html{
  overflow-y: auto !important;
}

#application {
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
}

.v-main {
  position: fixed;
  width: 100%;
  top: 7%;
  bottom: 0px;
}
</style>