<!--
Copyright 2023 SpinalCom - www.spinalcom.com

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
  <v-card elevation="4" class="cardContainer">
    <div
      class="dataContainer d-flex flex-column py-4"
      style="height: 100%; width: 100%"
      v-if="pageSate === PAGE_STATES.loaded && !isBuildingSelected"
    >
      <div
        style="background-color: #eaeef0; width: calc(50% - 16px)"
        class="d-flex flex-row pa-2 mx-4 align-stretch rounded"
      >
        <v-btn elevation="0" style="background-color: #fff; height: 100%">
          <v-icon>mdi-book-plus-outline</v-icon>
        </v-btn>
        <div class="d-flex flex-column ml-2">
          <div>déclaration d'un</div>
          <div class="font-weight-bold">TICKET DE MAINTENANCE</div>
        </div>
      </div>
      <div
        style="width: calc(100% - 32px)"
        class="d-flex flex-row justify-space-between mt-5 mx-4"
      >
        <v-select
          color="#14202C"
          background-color="#eaeef0"
          style="width: calc(50% - 8px)"
          solo
          flat
          @click.stop
          v-model="domain_filter"
          label="Domaine"
          placeholder="Domaine"
          :items="domains()"
          append-icon="mdi-chevron-down"
          clearable
          clear-icon="mdi-close-circle-outline"
          multiple
          menu-props="offset-y"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip
              @click:close="
                domain_filter = domain_filter.filter((d) => d !== item)
              "
              close
              :close-icon="'mdi-close-circle'"
              style="
                font-size: 11px;
                height: 24px;
                max-width: calc(100% - 50px);
              "
              v-if="index < 1"
            >
              <span style="max-width: 90%; overflow: hidden">{{ item }}</span>
            </v-chip>

            <span
              v-if="index === 1"
              class="text-grey text-caption align-self-center"
            >
              (+{{ domain_filter.length - 1 }})
            </span>
          </template>
        </v-select>
        <v-select
          color="#14202C"
          background-color="#eaeef0"
          style="width: calc(50% - 8px)"
          solo
          flat
          @click.stop
          v-model="step_filter"
          label="Étape"
          placeholder="Étape"
          :items="steps()"
          append-icon="mdi-chevron-down"
          clearable
          clear-icon="mdi-close-circle-outline"
          multiple
          menu-props="offset-y"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip
              @click:close="step_filter = step_filter.filter((s) => s !== item)"
              close
              :close-icon="'mdi-close-circle'"
              style="
                font-size: 11px;
                height: 24px;
                max-width: calc(100% - 50px);
              "
              v-if="index < 1"
            >
              <span style="max-width: 90%; overflow: hidden">{{ item }}</span>
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
      <!-- SAMPLE -->
      <div class="d-flex flex-column flex-fill overflow-y-auto mx-2">
        <TicketComponent
          v-for="(d, i) in sortedTickets()"
          :key="i"
          :data="d"
          @locate="locateTicket"
          @display="showDetails"
        />
      </div>
      <!-- \SAMPLE -->
    </div>

    <div
      class="centered"
      v-else-if="pageSate === PAGE_STATES.loaded && isBuildingSelected"
    >
      Aucune donnée à afficher ! veuillez selectionner un étage ou une pièce.
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.loading">
      <v-progress-circular
        :size="70"
        :width="3"
        color="purple"
        indeterminate
      ></v-progress-circular>
    </div>

    <div class="centered" v-else-if="pageSate === PAGE_STATES.error">
      <div>
        <v-icon color="red" style="font-size: 5em"
          >mdi-alert-circle-outline</v-icon
        >
      </div>
      <div color="red">
        Quelque chose s'est mal passé ! Veuillez
        <v-btn small outlined color="red" @click="retriveData('building')"
          >réessayer
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { Prop, Vue, Watch } from "vue-property-decorator";
import { PAGE_STATES } from "../../interfaces/pageStates";
import Component from "vue-class-component";
import { IConfig } from "../../interfaces/IConfig";
import { ISpaceSelectorItem } from "global-components";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import lodash from "lodash";
import { State } from "vuex-class";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { mapState } from "vuex";
import { regroupTicketByRoom } from "../../services/store/appDataStore/utils/ticketUtils";

import SpriteComponent from "./SpriteComponent.vue";
import TicketComponent from "./TicketComponent.vue";

@Component({
  components: { TicketComponent },
  filters: {},
})
class dataSideApp extends Vue {
  // @State data!: any[];

  @Prop() config!: IConfig;
  @Prop() selectedZone: ISpaceSelectorItem;
  @Prop() data: any[];

  PAGE_STATES: typeof PAGE_STATES = PAGE_STATES;
  pageSate: PAGE_STATES = PAGE_STATES.loading;
  isBuildingSelected: boolean = true;
  retry: Function;
  domain_filter = <string[]>[];
  step_filter = <string[]>[];

  domains() {
    return [...new Set(this.data.map((t) => t.process.name))];
  }

  domainFilteredTickets() {
    if (this.domain_filter.length === 0 || this.data.length === 0)
      return this.data;
    return this.data.filter((d) => this.domain_filter.includes(d.process.name));
  }
  steps() {
    return [...new Set(this.domainFilteredTickets().map((t) => t.step.name))];
  }
  stepFilteredTickets() {
    if (this.step_filter.length === 0 || this.data.length === 0)
      return this.domainFilteredTickets();
    return this.domainFilteredTickets().filter((d) =>
      this.step_filter.includes(d.step.name)
    );
  }

  sortedTickets() {
    this.$emit("download", this.stepFilteredTickets());
    return [...this.stepFilteredTickets()].sort(
      (a, b) => a.priority - b.priority || a.creationDate - b.creationDate
    );
  }

  async mounted() {
    await this.retriveData("building");
    // this.pageSate = PAGE_STATES.loaded;
    // this.isBuildingSelected = true;
    // const buildingId = localStorage.getItem("idBuilding");
    // await this.$store.dispatch(ActionTypes.LOAD_TICKETS, {buildingId, config: this.config});
  }

  async retriveData(type: "building" | "geographicFloor" | "geographicRoom") {
    try {
      this.pageSate = PAGE_STATES.loading;
      const buildingId = localStorage.getItem("idBuilding");
      if (type == "building") {
        const promises = [
          this.$store.dispatch(ActionTypes.LOAD_TICKETS, {
            buildingId,
            config: this.config,
          }),
        ];
        const result = await Promise.all(promises);
        this.$store.commit(MutationTypes.SET_DATA, result[0]);
      } else if (type == "geographicFloor" || type == "geographicRoom") {
        const promises = [
          this.$store.dispatch(ActionTypes.FILTER_TICKETS, {
            buildingId,
            dynamicId: this.selectedZone.dynamicId,
          }),
        ];
        const result = await Promise.all(promises);
        this.$store.commit(MutationTypes.SET_DATA, result[0]);
      }
      this.pageSate = PAGE_STATES.loaded;
    } catch (err) {
      this.retry = this.retriveData;
      this.pageSate = PAGE_STATES.error;
    }
  }

  selectDataView(item) {
    this.$emit("clickOnDataView", item);
  }

  showDetails(ticket) {
    this.$emit("display", ticket);
  }

  locateTicket(ticket) {
    const buildingId = localStorage.getItem("idBuilding");
    this.$store.dispatch(ActionTypes.SELECT_ITEMS, {
      ...ticket.elementSelected,
      buildingId,
    });
  }

  /**
   * Watch
   */

  @Watch("selectedZone")
  watchSelectedZone() {
    this.selectedZone.type == "building"
      ? (this.isBuildingSelected = true)
      : (this.isBuildingSelected = false);
    this.retriveData(this.selectedZone.type);
    // if (this.selectedZone.type === "building") {
    //   this.isBuildingSelected = true;
    //   this.$store.commit(MutationTypes.SET_DATA, []);
    //   return;
    // }

    // this.isBuildingSelected = false;
    // this.retriveData();
  }

  @Watch("data")
  watchData() {
    const buildingId = localStorage.getItem("idBuilding");

    if (this.config.sprites)
      this.$store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    if (this.isBuildingSelected) return;
    if (this.config.sprites && !this.isBuildingSelected) {
      const regrouped_tickets = regroupTicketByRoom(this.data);
      const items = new Array();
      for (const key of Object.keys(regrouped_tickets)) {
        const [X, Y, Z] = regrouped_tickets[key]["XYZ center"].split(";");
        items.push({
          buildingId,
          dynamicId: key,
          data: regrouped_tickets[key].ticketList,
          position: new THREE.Vector3(Number(X), Number(Y), Number(Z)),
        });
      }
      this.$store.dispatch(ActionTypes.ADD_COMPONENT_AS_SPRITES, {
        items: items,
        buildingId: buildingId,
        component: SpriteComponent,
      });
      return;
    }
    // const buildingId = localStorage.getItem("idBuilding");
    // this.$store.dispatch(ActionTypes.COLOR_ITEMS, {
    //   items: [],
    //   buildingId: buildingId || this.selectedZone.staticId,
    // });
  }
}

export { dataSideApp };
export default dataSideApp;
</script>
<style lang="scss"></style>
