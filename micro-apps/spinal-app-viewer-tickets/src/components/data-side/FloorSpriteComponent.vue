<template>
  <div :style="dynamicStyle">
    <div id="floor-sprite" class="sprite_container_ticket pa-1" :class="{ pentagon: type === 'geographicBuilding' }"
      :style="computedGradient" @click.stop="onClick" @clickExteriorSprite="_isNotSelected()">

      <div :class="{ pentagon: type === 'geographicBuilding' }"
        class="sprite_color_ticket_ticket d-flex flex-grow-1 align-center justify-center" :style="{
          background: '#14202C',
          color: '#fff',
          height: '24px',
          'text-align': 'center',
        }">
        {{ buildingTicketNumber }}
      </div>
    </div>
  </div>
</template>


<script>
import {
  EmitterViewerHandler,
  VIEWER_SPRITE_CLICK,
} from "spinal-viewer-event-manager";
import { store } from "../../services/store";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { MutationTypes } from "../../services/store/appDataStore/mutations";
import { EventBus } from "../SpaceSelector/eventBus";

export default {
  props: {
    tickets: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      default: "geographicBuilding",
    },
    buildingTicketNumber: {
      type: Number,
      default: 0,
    },
    isPriority: {
      type: Boolean,
      default: true,
    },
  },
  filters: {
    round(value) {
      try {
        if (typeof value === "string" && value.length === 0) return "";
        var num = Number(value);
        var rounded = num.toFixed(2);
        return Number(rounded);
      } catch (error) {
        console.error(error);
        return "";
      }
    },
  },
  data: () => ({
    fav: true,
    menu: false,
    message: false,
    hints: true,
    dynamicStyle: {
      boxShadow: "none",
    },
    Selected: false,
  }),

  computed: {
    filteredTickets() {
      return this.tickets.filter(ticket =>
        ticket.elementSelected?.type === this.type
      );
    },
    computedGradient() {
      return !this.isPriority ? this.getPriorityGradient() : this.getStepGradient();
    },

  },
  mounted() {
    EventBus.$on("clear-sprite-selection", () => {
      this._isNotSelected();
    });
  },


  methods: {
    onClick() {
      if (this.type === 'geographicBuilding') {
        const filteredBuildingTickets = this.tickets.filter(ticket => ticket.elementSelected?.type === 'geographicBuilding');
        EventBus.$emit("move-tickets-top", filteredBuildingTickets);
        this._isSelected();
        store.dispatch(ActionTypes.SELECT_SPRITES, []);
        return;
      } else if (this.type === 'geographicFloor') {
        const filteredRoomTickets = this.tickets.filter(ticket => ticket.elementSelected?.type === 'geographicFloor');
        EventBus.$emit("move-tickets-top", filteredRoomTickets);
        this._isSelected();
        store.dispatch(ActionTypes.SELECT_SPRITES, []);
        return;
      }
    },
    _isSelected() {
      this.selected = true;
      // this.dynamicStyle = {
      //   boxShadow: "0px 0px 10px 2px #00A2FF",
      // };
      this.dynamicStyle = {
        filter: "drop-shadow(0px 0px 10px #00A2FF)"
      };
    },

    _isNotSelected() {
      this.selected = false;
      // this.dynamicStyle = {
      //   boxShadow: "none",
      // };
      this.dynamicStyle = {
        filter: "none"
      };
    },
    getPriorityGradient() {
      const relevantTickets = this.filteredTickets;
      const priorityCounts = this.getPriorityCounts();
      const len = relevantTickets?.length || 1;
      const low = priorityCounts[0] || 0;
      const mid = priorityCounts[1] || 0;
      const first = Math.round(360 * (low / len));
      const last = first + Math.round(360 * (mid / len));
      return {
        background: `conic-gradient(green ${first}deg, orange ${first}deg ${last}deg, red ${last}deg)`
      };
    },
    getStepGradient() {
      const relevantTickets = this.filteredTickets;
      const len = relevantTickets?.length || 1;
      if (len === 0) return { background: "" };

      const summary = this.getStepSummary();
      const total = summary.reduce((acc, item) => acc + item.count, 0);
      let currentAngle = 0;

      const segments = summary.map(step => {
        const angle = Math.round((step.count / total) * 360);
        const start = currentAngle;
        const end = currentAngle + angle;
        currentAngle = end;
        return `${step.color} ${start}deg ${end}deg`;
      });

      return {
        background: `conic-gradient(${segments.join(", ")})`
      };
    },

    getPriorityCounts() {
      const counts = { 0: 0, 1: 0, 2: 0 };

      this.filteredTickets.forEach(ticket => {
        const prio = ticket.priority;
        if (prio in counts) {
          counts[prio]++;
        } else {
          counts[prio] = 1; // fallback in case a new priority value appears
        }
      });
      return counts;
    },
    getStepSummary() {
      const stepMap = new Map();

      this.filteredTickets.forEach(ticket => {
        const step = ticket.step;
        if (!step || !step.name) return;

        const key = step.name;

        if (!stepMap.has(key)) {
          stepMap.set(key, {
            name: step.name,
            count: 1,
            order: step.order || 0,
            color: step.color || "#000000",
          });
        } else {
          stepMap.get(key).count++;
        }
      });

      // Convert map to array and sort by step order
      return Array.from(stepMap.values()).sort((a, b) => a.order - b.order);
    }

  },
  watch: {
    handler(newVal, oldVal) {
      // Add any additional logic you want to execute when type changes
    },
    immediate: true,
  },
};
</script>

<style scoped>
.sprite_container_ticket {
  aspect-ratio: 1/1;
  box-shadow: none;
  color: transparent;
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* Hexagon for Buildings */
.pentagon {
  clip-path: polygon(50% 0%,
      /* Top Middle */
      100% 35%,
      /* Top Right */
      85% 100%,
      /* Bottom Right */
      15% 100%,
      /* Bottom Left */
      0% 35%
      /* Top Left */
    );
}

.sprite_color_ticket {
  aspect-ratio: 1/1;
}
</style>
