<template>
  <div
    ref="tableContainer"
    style="height: calc(100% - 40px)"
    class="d-flex flex-column"
  >
    <div style="height: 100%; width: 100%" class="d-flex flex-column">
      <div
        v-if="false"
        style="background-color: #eaeef0; width: calc(50% - 16px)"
        class="d-flex flex-row mx-2 pa-2 align-stretch rounded"
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
        style="width: calc(100% - 16px)"
        class="d-flex flex-row justify-space-between mt-5 mx-2"
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
          :items="domains"
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
          :items="steps"
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
      <div class="d-flex flex-column mx-2 flex-fill overflow-y-auto">
        <ticket-component
          v-for="ticket in stepFilteredTickets"
          :key="ticket.dynamicId"
          style="background-color: #fff"
          class="my-1 pa-1"
          :ticket="ticket"
          @display="viewClicked"
          @locate="locateClicked"
        ></ticket-component>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { toManageableTicket } from "../services/store/ticketDataStore/mutations";
import TicketComponent from "./TicketComponent.vue";

export default {
  name: "ticket-table",

  components: {
    TicketComponent,
  },

  props: {
    spaceIds: {
      Type: Array,
      default: () => [],
    },
  },

  data: () => ({
    domain_filter: [],
    step_filter: [],
  }),

  computed: {
    ...mapState({ tickets: (state) => state.ticketDataStore.tickets }),
    ...mapGetters({ getTickets: "newGetTickets" }),
    tableData() {
      return this.spaceIds.length
        ? this.spaceIds
            .map((id) => this.getTickets(id))
            .reduce((e1, e2) => [...e1, ...e2], [])
        : this.tickets;
    },
    domains() {
      return [...new Set(this.tableData.map((t) => t.process.name))];
    },
    domainFilteredTickets() {
      if (this.domain_filter.length === 0 || this.tableData.length === 0)
        return this.tableData;
      return this.tableData.filter((d) =>
        this.domain_filter.includes(d.process.name)
      );
    },
    steps() {
      return [...new Set(this.domainFilteredTickets.map((t) => t.step.name))];
    },
    stepFilteredTickets() {
      if (this.step_filter.length === 0 || this.tableData.length === 0)
        return this.domainFilteredTickets;
      return this.domainFilteredTickets.filter((d) =>
        this.step_filter.includes(d.step.name)
      );
    },
    downloadList() {
      return this.stepFilteredTickets.map((t2) => {
        t = toManageableTicket(t2);
        const { Nom, Étape, Domaine, Déclarant } = t;
        return {
          Nom,
          "Date de création": t["Date de création"],
          "Dernière modification": t["Dernière modification"],
          Étape,
          Domaine,
          Déclarant,
          bosId: t2?.staticId || 0,
          gmaoId: t2?.gmaoId || 0,
          description: t2?.description || "",
          targetName: t2?.elementSelected?.name || "",
          targetId: t2?.elementSelected?.staticId || 0,
        };
      });
    },
  },

  methods: {
    compareDate(date1, date2) {
      const e1 = date1.split("/");
      const e2 = date2.split("/");
      return e1[2] - e2[2] || e1[1] - e2[1] || e1[0] - e2[0];
    },

    viewClicked(event) {
      this.$emit("display", event);
    },

    locateClicked(event) {
      this.$emit("locate", event);
    },
  },
};
</script>

<style></style>
