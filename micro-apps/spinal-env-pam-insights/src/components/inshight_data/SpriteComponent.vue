<template>
  <div class="sprite_container" ref="container" @click.stop="onClick">
    <div
      class="sprite_color"
      :style="{ background: data.color, ...dynamicStyle }"
    ></div>
    <div class="sprite_value_unit" :style="dynamicStyle">
      {{ roundedValue }}
    </div>
    <div
      class="dropleft pa-3"
      v-if="showAttr && data.series"
      style="
        color: black;
        width: 300px;
        background-color: rgb(255, 255, 255);
        left: 340px;
        top: -80px;
        position: absolute;
        border-radius: 10px;
      "
    >
      <LineChart
        :data="{
          labels: data.series.map((el) => ''),
          datasets: [
            {
              label: '',
              data: data.series.map((el) => el.value),
              borderColor: '#00A2FF',
              backgroundColor: data.color,
              fill: false,
            },
          ],
        }"
        :options="{
          pointStyle: false,
          plugins: {
            title: {
              display: true,
              text: data.name + ' (' + data.unit + ')',
            },
            legend: {
              display: false,
            },
          },
        }"
      />
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
import { Line as LineChart } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
} from "chart.js";
import { point } from "leaflet";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler
);

export default {
  name: "SpriteComponent",
  components: {
    LineChart,
  },
  props: {
    data: {},
  },
  data: () => ({
    fav: true,
    menu: false,
    message: false,
    hints: true,
    dynamicStyle: {
      border: "3px solid #F9F9F9",
      boxShadow: "none",
    },
    showAttr: false,
    forward: false,
  }),
  computed: {
    roundedValue() {
      const value = Number(this.data.displayValue);
      return value || value === 0
        ? `${Number(value.toFixed(2))} ${this.data.unit}`
        : "";
    },
  },
  mounted() {},
  methods: {
    onClick() {
      const emitterHandler = EmitterViewerHandler.getInstance();
      emitterHandler.emit(VIEWER_SPRITE_CLICK, { node: this.data });
      store.dispatch(ActionTypes.SELECT_SPRITES, [this.data.dynamicId]);
      store.dispatch(ActionTypes.SELECT_ITEMS, this.data);
      this.showAttr = !this.showAttr;
      const el = document.querySelector(".dataContainer");
      el.dispatchEvent(
        new CustomEvent("onSpriteClick", { detail: { ...this.data } })
      );
    },
    _isSelected() {
      this.dynamicStyle = {
        border: "3px solid #00A2FF",
        boxShadow: "0px 0px 10px 2px #00A2FF",
      };
      const enfant = this.$refs.container;
      if (enfant && enfant.parentElement) {
        enfant.parentElement.style.zIndex = "2";
      }
      this.showAttr = true;
    },
    _isNotSelected() {
      this.dynamicStyle = {
        border: "3px solid #F9F9F9",
        boxShadow: "none",
      };
      const enfant = this.$refs.container;
      if (enfant && enfant.parentElement) {
        enfant.parentElement.style.zIndex = "1";
      }
      this.showAttr = false;
    },
  },
};
</script>

<style scoped>
.sprite_container {
  width: "fit-content";
  height: "fit-content";
  background: none;
  box-shadow: none;
  color: transparent;
  /* border-radius: 100%; */
  display: flex;
  flex-direction: row;
  align-items: center;
}
.sprite_color {
  width: 20px;
  height: 20px;
  border-radius: 100%;
  /* border: 3px solid #F9F9F9; */
  /* border: 3px solid; */
  z-index: 2;
}
.sprite_value_unit {
  /* border: 2px solid #F9F9F9; */
  /* border: 2px solid;  */
  border-radius: 100px;
  color: #14202c;
  margin-left: -15px;
  padding-left: 15px;
  padding-right: 5px;
  padding-bottom: 1px;
  height: 15px;
  font-size: 14px;
  background: #f9f9f9;
  z-index: 1;
}

.dropleft {
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  /*left: 200px;*/
  -webkit-animation: scale-in-hor-left 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)
    both;
  animation: scale-in-hor-left 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

@-webkit-keyframes scale-in-hor-left {
  0% {
    -webkit-transform: scaleX(0);
    transform: scaleX(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

@keyframes scale-in-hor-left {
  0% {
    -webkit-transform: scaleX(0);
    transform: scaleX(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scaleX(1);
    transform: scaleX(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}
/* 
.sprite_container:hover {
  cursor: pointer;
} */
</style>
