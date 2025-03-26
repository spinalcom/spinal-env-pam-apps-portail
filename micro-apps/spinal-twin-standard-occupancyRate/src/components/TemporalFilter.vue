<template>
  <v-container>
    <v-row justify="space-around">
      <v-col cols="11" sm="5">
        <v-menu
          v-model="startMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="startTime"
              label="Start Time"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-time-picker v-model="startTime" @change="startMenu = false"></v-time-picker>
        </v-menu>
      </v-col>
      <v-col cols="11" sm="5">
        <v-menu
          v-model="endMenu"
          :close-on-content-click="false"
          :nudge-right="40"
          transition="scale-transition"
          offset-y
          min-width="290px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="endTime"
              label="End Time"
              prepend-icon="mdi-clock-time-four-outline"
              readonly
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-time-picker v-model="endTime" @change="endMenu = false"></v-time-picker>
        </v-menu>
      </v-col>
    </v-row>
    <v-row justify="center" class="mt-3">
      <v-btn color="primary" @click="submit">Valider</v-btn>
    </v-row>
    <v-alert v-if="error" type="error" dense class="mt-3">
      L'heure de fin doit être après l'heure de début.
    </v-alert>
  </v-container>
</template>

<script>
import { ref, watch } from 'vue';
import moment from 'moment';

export default {
  name: 'TemporalFilter',
  props: {
    temporality: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const startTime = ref(null);
    const endTime = ref(null);
    const startMenu = ref(false);
    const endMenu = ref(false);
    const error = ref(false);

    const validateTimes = () => {
      if (startTime.value && endTime.value) {
        const start = moment(startTime.value, 'HH:mm');
        const end = moment(endTime.value, 'HH:mm');
        if (start.isSameOrAfter(end)) {
          error.value = true;
          return false;
        }
      }
      error.value = false;
      return true;
    };

    const submit = () => {
      if (validateTimes()) {
        emit('submit', { startTime: startTime.value, endTime: endTime.value });
      }
    };

    watch(() => props.temporality, () => {
      error.value = false;
    });

    return {
      startTime,
      endTime,
      startMenu,
      endMenu,
      error,
      submit
    };
  }
};
</script>

<style scoped>
.v-application {
  font-family: "Charlevoix Pro";
}
</style>