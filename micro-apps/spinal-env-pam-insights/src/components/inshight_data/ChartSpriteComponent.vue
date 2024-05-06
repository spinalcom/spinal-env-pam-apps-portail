<template>
  <div class="card-menu">
    <ul class="cards">
      <div class="card">
        <div
          style="display: flex; flex-direction: column; padding-right: 5px"
          class="mt-4 ml-4"
        >
          <span
            @click.stop="onClick"
            style="
              font-size: 15px;
              color: rgb(0, 0, 0);
              position: absolute;
              right: 15px;
              font-weight: bold;
            "
          >
            X
          </span>
          <span style="font-size: 13px; color: rgb(20, 32, 44)">
            {{ data.name }}
          </span>
        </div>
        <LineChart
          class="mx-2"
          :data="{
            labels: data.series.map(() => ''),
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
                display: false,
              },
              legend: {
                display: false,
              },
            },
          }"
        />
      </div>
    </ul>
  </div>
</template>

<script>
import { store } from "../../services/store";
import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { Line as LineChart } from "vue-chartjs";

export default {
  name: "SpriteComponent",
  components: {
    LineChart,
  },
  props: {
    data: {},
  },
  data: () => ({
    dynamicStyle: {
      border: "3px solid #F9F9F9",
      boxShadow: "none",
    },
  }),
  methods: {
    onClick() {
      store.dispatch(ActionTypes.REMOVE_ALL_SPRITES);
    },
    _isSelected() {},
    _isNotSelected() {},
  },
  mounted() {
    console.log(this.data);
  },
};
</script>

<style scoped>
.card-menu {
  top: 50%;
  border-radius: 0px 12px 12px 12px !important;
  position: absolute;
  background-color: white;
  width: 310px;
  height: 200px;
  -webkit-animation: scale-in-tl 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  animation: scale-in-tl 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  z-index: 99999 !important;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  color: "#14202C";
  font-size: 10px;
}

@-webkit-keyframes scale-in-tl {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

@keyframes scale-in-tl {
  0% {
    -webkit-transform: scale(0);
    transform: scale(0);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }

  100% {
    -webkit-transform: scale(1);
    transform: scale(1);
    -webkit-transform-origin: 0% 0%;
    transform-origin: 0% 0%;
    opacity: 1;
  }
}

.cards {
  padding-left: 0 !important;
}

.card {
  position: relative;
  display: block;
  height: 100%;
  border-radius: calc(var(--curve) * 1px);
  overflow: hidden;
  text-decoration: none;
}

.card__image {
  width: 100%;
  height: auto;
}

.card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  border-radius: calc(var(--curve) * 1px);
  background-color: var(--surface-color);
  transform: translateY(100%);
  transition: 0.2s ease-in-out;
}

.card__header:hover {
  background-color: rgb(230, 230, 230);
}

.card__arc {
  width: 80px;
  height: 80px;
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1;
}

.card__arc path {
  fill: var(--surface-color);
  d: path("M 40 80 c 22 0 40 -22 40 -40 v 40 Z");
}

.card__thumb {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.card__title {
  font-size: 1.5em;
  margin: 0 0 0.3em;
  color: #000000;
}

.card__tagline {
  display: block;
  margin: 1em 0;
  font-family: "MockFlowFont";
  font-size: 0.8em;
  color: #d7bdca;
}

.card__status {
  font-size: 0.9em;
  color: #616161;
}

.card__description {
  padding: 0 2em 2em;
  margin: 0;
  color: #000000;
  font-family: "MockFlowFont";
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  /*/ background-color: rgb(138, 29, 29);*/
  border-bottom-left-radius: 15px;
  font-size: 11px;
  /*background-color: rgb(244, 244, 244);*/
}
/* 
.sprite_container:hover {
  cursor: pointer;
} */
</style>
