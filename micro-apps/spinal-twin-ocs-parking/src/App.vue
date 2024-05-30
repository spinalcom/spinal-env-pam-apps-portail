<template>
  <v-app id="application">
    <div class="d-flex justify-end">
      <sc-download-button
        :file-name="getTable(index).file"
        :data="getTable(index).data"
        class="mr-1"
      ></sc-download-button>
      <div class="selectors">
        <div class="Hx1">
          <space-selector
            :open.sync="openSpaceSelector"
            :maxDepth="-1"
            :GetChildrenFct="() => []"
            v-model="el"
            label="ESPACE"
          />
        </div>
        <div class="Hx2">
          <space-selector
            :edge="false"
            :open.sync="openTimeSelector"
            :maxDepth="-1"
            :GetChildrenFct="() => []"
            v-model="period"
            label="TEMPORALITÉ"
          />
        </div>
      </div>
    </div>

    <div class="main-app d-flex flex-column justify-space-between">
      <div
        style="height: 20%"
        v-if="showAffluence"
        class="d-flex flex-row justify-space-between"
      >
        <sc-capacity-table
          v-if="loaded"
          class="d-flex"
          style="width: calc(70% - 12px)"
          title="Capacité du parking"
          :values="capacities"
        ></sc-capacity-table>
        <sc-loading-card
          v-else
          style="width: calc(70% - 12px)"
        ></sc-loading-card>
        <sc-estimation-card
          v-if="loaded"
          style="width: 30%"
          title="Affluence"
          :estimations="estimations"
          :labels="estimations.map((e, i) => i + 'h')"
          :step="6"
          :currentValue="20"
          currentLabel="13h"
        ></sc-estimation-card>
        <sc-loading-card v-else style="width: 30%"></sc-loading-card>
      </div>
      <div
        style="height: 20%"
        v-else
        class="d-flex flex-row justify-space-between"
      >
        <sc-capacity-table
          v-if="loaded"
          class="d-flex"
          style="width: 100%"
          title="Capacité du parking"
          :values="capacities"
        ></sc-capacity-table>
        <sc-loading-card v-else style="width: 100%"></sc-loading-card>
      </div>
      <sc-line-card
        style="height: calc(80% - 12px); max-height: calc(100% - 197px)"
        title="État courant"
        v-if="loaded"
        nav-enabled
        @nav="nav"
        :nav-text="getDate(index)"
        switch-enabled
        :switch-value.sync="switchValue"
        switch-false-icon="mdi-numeric"
        switch-true-icon="mdi-percent"
        :step="step"
        :labels="labels"
        :datasets="getDatasets(unit)"
        :optional="{ unit }"
      ></sc-line-card>
      <sc-loading-card
        v-else
        style="height: calc(80% - 12px); max-height: calc(100% - 197px)"
      ></sc-loading-card>
    </div>
  </v-app>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { SpaceSelector } from "./components/SpaceSelector";
import config from "../config.js";

export default {
  name: "App",

  components: { SpaceSelector },

  data() {
    return {
      index: 0,
      switchValue: false,
      period: { name: "Valeur courante", value: "day" },
      openSpaceSelector: false,
      openTimeSelector: false,
      el: { name: config.category },
      loaded: false,
      showAffluence: config.affluence,
      estimations: [
        1, 1, 1, 1, 1, 2, 4, 8, 15, 20, 26, 32, 31, 34, 33, 24, 20, 17, 15, 9,
        3, 1, 1, 1,
      ],
    };
  },

  computed: {
    ...mapState({
      capacities: (state) => state.capacities,
      labels: (state) => state.labels,
      step: (state) => state.step,
    }),
    ...mapGetters({
      getDatasets: "getDatasets",
      getDate: "getCurrentDate",
      getTable: "getDataTable",
    }),
    unit() {
      return this.switchValue ? "%" : "";
    },
  },

  methods: {
    ...mapActions({
      initData: "initData",
      updateChart: "updateChart",
    }),

    async nav(payload) {
      this.index += payload;
    },
  },

  async mounted() {
    await this.initData();
    this.loaded = true;
  },

  watch: {
    async index(i) {
      await this.updateChart(i);
    },
  },
};
</script>

<style scoped>
#application {
  background: linear-gradient(121deg, #f8fafa, #d6e2e6);
  position: absolute;
  width: 100%;
  height: 100%;
}

.main-app {
  position: fixed;
  height: calc(100% - 70px);
  top: 70px;
  bottom: 0;
  left: 0;
  right: 0;
}

.Hx1 {
  position: absolute;
  width: 66%;
  right: 0px;
  top: -1px;
  height: 60px;
}
.Hx2 {
  position: absolute;
  width: 34%;
  right: calc(66%);
  top: -1px;
  height: 60px;
}
.selectors {
  position: relative;
  display: flex;
  height: 60px;
  width: 50%;
  background: #14202c;
  border: 1px solid #f5f5f5;
  border-radius: 12px;
}
</style>
