<template>
  <v-card elevation="1">
    <div>
      <span style="font-size: large" class="font-weight-bold"
        >{{ ticket.name }} /</span
      >
      <span>{{ ticket.process.name }}</span>
    </div>
    <div>Créé le {{ creationDate }}</div>
    <div>Status: {{ status.name }} le {{ status.date }}</div>
    <v-card-actions>
      <v-btn @click="$emit('display', ticket)">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
      <v-btn
        dark
        :disabled="!ticket.elementSelected"
        @click="$emit('locate', ticket)"
      >
        <v-icon>mdi-map-marker</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import moment from "moment";

export default {
  name: "ticket-component",

  props: {
    ticket: {
      Type: Object,
      require: true,
    },
  },

  computed: {
    status() {
      if (!this.ticket.log_list.length)
        return {
          name: this.ticket.step.name,
          date: moment(this.ticket.directModificationDate).format(
            "DD[/]MM[/]YYYY"
          ),
        };
      const lastStatus = [...this.ticket.log_list].reverse()[0];
      return {
        name: lastStatus.event,
        date: moment(this.ticket.directModificationDate).format(
          "DD[/]MM[/]YYYY"
        ),
      };
    },
    creationDate() {
      return moment(this.ticket.creationDate).format("DD[/]MM[/]YYYY");
    },
  },
};
</script>

<style></style>
