<template>
  <div class="sprite_container_ticket pa-1" :style="{
    background: data.legend
      ? (data.type === 'room' ? gradient3.conic : squareGradient)
      : fallbackGradient,
    borderRadius: data.type === 'room' ? '50%' : '0',
  }" @click.stop="onClick()">
    <div class="sprite_color_ticket d-flex align-center justify-center" :style="{
      background: '#14202C',
      color: '#FFFFFF',
      borderRadius: data.type === 'room' ? '50%' : '0',
      'text-align': 'center',
      ...dynamicStyle,
    }">
      {{ data.data.length }}
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
    data: {},
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
  }),

  computed: {
    gradient() {
      const len = this.data.data.length;
      const low = this.data.data.filter((d) => d.priority == 2).length;
      const mid = this.data.data.filter((d) => d.priority == 1).length;
      const first = Math.round(360 * (low / len));
      const last = first + Math.round(360 * (mid / len));
      return {
        firstStep: first,
        lastStep: last,
      };
    },
    gradient2() {
      const len = this.data.data.length;
      const low = this.data.data.filter((d) => d.priority == 2).length;
      const mid = this.data.data.filter((d) => d.priority == 1).length;
      const first = Math.round(360 * (low / len));
      const last = first + Math.round(360 * (mid / len));
      return {
        firstStep: first,
        lastStep: last,
      };
    },
    fallbackGradient() {
      const { firstStep, lastStep } = this.gradient;
      return `conic-gradient(green ${firstStep}deg, orange ${firstStep}deg ${lastStep}deg, red ${lastStep}deg)`;
    },
    gradient3() {
      const len = this.data.data.length;
      if (!len) return { conic: "", steps: [] };

      const anglePerStep = 360 / len;
      let currentAngle = 0;

      const gradientSteps = this.data.data.map((d) => {
        const color = d.step?.color || "#000"; // fallback to black if color missing
        const start = currentAngle;
        const end = currentAngle + anglePerStep;
        currentAngle = end;
        return `${color} ${start}deg ${end}deg`;
      });

      return {
        conic: `conic-gradient(${gradientSteps.join(", ")})`,
      };
    },
    squareGradient() {
      const len = this.data.data.length;
      if (!len) return "";

      const stepPercent = 100 / len;
      let current = 0;

      const segments = this.data.data.map((d) => {
        const color = d.step?.color || "#000";
        const start = current;
        const end = current + stepPercent;
        current = end;
        return `${color} ${start}% ${end}%`;
      });

      return `linear-gradient(to right, ${segments.join(", ")})`;
    }


  },

  mounted() {
  },
  methods: {
    onClick() {
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { node: this.data });
      store.dispatch(ActionTypes.SELECT_SPRITES, [this.data.dynamicId]);
      store.commit(
        MutationTypes.SET_SELECTED_TICKETS,
        this.data.data.map((d) => d.dynamicId)
      );
      const floor = document.querySelector("#floor-sprite");
      floor.dispatchEvent(new Event("clickExteriorSprite"));
      EventBus.$emit("showRecapCard", this.data.dynamicId);
    },
    _isSelected() {
      this.dynamicStyle = {
        boxShadow: "0px 0px 10px 2px #00A2FF",
      };
      this.isSelected = true
    },
    _isNotSelected() {
      this.dynamicStyle = {
        boxShadow: "none",
      };
      this.isSelected = false;
    },
  },
};
</script>

<style scoped>
.p1 {
  width: 55px;
  height: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
}



.sprite_container_ticket {
  width: "fit-content";
  height: "fit-content";
  box-shadow: none;
  color: transparent;

  display: flex;
  flex-direction: row;
  align-items: center;
  /* border-radius: 100%; */
  position: relative;
  cursor: pointer;
  z-index: 2;
}

.sprite_color_ticket {
  width: 20px;
  height: 20px;
  /* border-radius: 100%; */
}
</style>
