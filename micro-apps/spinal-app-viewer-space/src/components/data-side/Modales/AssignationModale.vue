<template>
  <div class="menu">
    <div ref="container" class="container">
      <div
        @click="close()"
        style="
          justify-content: center;
          align-items: center;
          display: flex;
          background-color: white;
          cursor: pointer;
          border-radius: 25px;
          width: 20px;
          height: 20px;
          position: absolute;
          right: -100px;
          font-size: 13px;
          z-index: 9;
          top: 3px;
          font-weight: bold;
          border: 1px solid gray;
          color: #14202c;
        "
      >
        x</div
      >
      <div class="card">
        <div class="top-section">
          <div class="border"></div>
          <div class="icons">
            <div class="logo">
              Total: {{ viewerSelectedRooms.length }} pièces
            </div>
            <div class="social-media"> {{ totalArea.toFixed(2) }} m² </div>
          </div>
            
              <div class="group-container">
                <div
                  v-for="(count, group, index) in groupCount"
                  :key="group"
                  class="group-item"
                >
                  <div class="group-title">{{ group }}</div>
                  <div class="group-count">{{ count }}</div>
                </div>
              </div>
              <div style="display: flex; margin-top: 10px; margin-bottom: 10px">
              </div>
            
        
        </div>

        <div class="bottom-section">
          <span class="title">Assignation</span>
          <div class="row row1">
            <div
              style="
                border-right: 1px solid rgb(215, 215, 215);
                border-top: 1px solid rgb(215, 215, 215);
                background-color: rgb(230, 230, 230);
              "
              class="item"
            >
              <v-btn
                style="
                  background-color: #f9f9f9;
                  color: black;
                  font-weight: bold;
                  border-radius: 5px;
                  font-size: 12px;
                "
                @click.stop="multipleUnassignation()"
              >
                Dé-assigner
              </v-btn>
            </div>
            <div
              style="
                border-right: 1px solid rgb(215, 215, 215);
                border-top: 1px solid rgb(215, 215, 215);
                background-color: rgb(230, 230, 230);
              "
              class="item"
            >
              <v-btn
                style="
                  background-color: #14202c;
                  color: white;
                  font-weight: bold;
                  border-radius: 5px;
                  font-size: 12px;
                "
                @click.stop="multipleAssignation()"
              >
                Assigner
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { VBtn } from 'vuetify/lib';

export default {
  components: {
    VBtn,
  },
  props: {
    viewerSelectedRooms: {
      type: Array,
      default: () => [],
    },
  },

  data: () => ({}),

  computed: {
    groupCount() {
      const countMap = {};
      this.viewerSelectedRooms.forEach((room) => {
        let group = room.parentTitle;
        if(!group) group = 'Non assigné';
        if (countMap[group]) {
          countMap[group] += 1;
        } else {
          countMap[group] = 1;
        }
      });
      return countMap;
    },

    totalArea(){
        return this.viewerSelectedRooms.reduce((acc,curr) => acc+curr.area,0)
    }
  },
  mounted() {
    console.log('recieved data:', this.viewerSelectedRooms);
  },
  methods: {
    close() {
      this.$emit('closeAssignationModale');
    },
    multipleAssignation(){
        this.$emit('multipleAssignation')
    },
    multipleUnassignation(){
        this.$emit('multipleUnassignation')
    }
  },
};
</script>

<style scoped>
.category {
  background-color: rgb(245, 245, 245);
  margin-top: 8px;
  overflow: hidden;
  border-radius: 3px;
  border: 1px solid rgb(220, 220, 220);
}

.attribute {
  font-size: 10px;
  margin-left: 10px;
}

.dropleft {
  position: absolute;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  left: 200px;
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

.card-menu {
  left: 50%;
  top: 50%;
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  border-top-right-radius: 12px !important;
  position: absolute;
  background-color: white;
  min-width: 310px;
  height: auto;
  z-index: 99999 !important;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  color: black;
  font-size: 10px;
  overflow: visible;
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

.container {
  z-index: 9999;
  width: 200px;
}

.new-class {
  width: 200px;
  height: 200px;
}

.sprite_color {
  background-color: #13a9e0;
  width: 13px;
  height: 13px;
  border-radius: 100%;
  z-index: 0 !important;
}

.sprite_value_unit {
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

.cards {
  padding-left: 0 !important;
  width: 360px;
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

.card__header {
  position: relative;
  left: 0px;
  display: flex;
  align-items: center;
  gap: 2em;
  padding: 2em;
  border-radius: calc(var(--curve) * 1px) 0 0 0;
  background-color: var(--surface-color);
  transform: translateY(-100%);
  transition: 0.2s ease-in-out;
  background-color: rgb(211, 211, 211);
  border-top-left-radius: 10px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
  cursor: pointer;
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
  d: path('M 40 80 c 22 0 40 -22 40 -40 v 40 Z');
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
  font-family: 'MockFlowFont';
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
  font-family: 'MockFlowFont';
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  border-bottom-left-radius: 15px;
  font-size: 11px;
}

.menu {
  overflow: visible;
  position: fixed;
  top: 40%;
  left: 0;
}

.card {
  border: 1px solid rgb(179, 179, 179);
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
  width: 280px;
  border-bottom-left-radius: 12px !important;
  border-bottom-right-radius: 12px !important;
  border-top-right-radius: 12px !important;
  background: #f1f1f1;
  padding-left: 5px;
  padding-right: 5px;
  padding-top: 5px;
  overflow: hidden;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 20px 0px;
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative !important;
}

.card .top-section {
  height: 200px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card .top-section .border {
  height: 51px;
  width: 75%;
  background: #fff;
  border-bottom-right-radius: 10px;
  position: relative;
  transform: skew(-40deg);
  box-shadow: -2px -20px #fff;
  left: -67px;
  top: -5px;
}

.card .top-section .border::before {
  content: '';
  position: absolute;
  width: 15px;
  height: 15px;
  top: 0;
  right: -15px;
  background: rgba(255, 255, 255, 0);
  border-top-left-radius: 10px;
  box-shadow: -5px -5px 0 2px #ffffff;
}

.card .top-section::before {
  content: '';
  position: absolute;
  top: 30px;
  left: 0;
  background: rgba(255, 255, 255, 0);
  height: 15px;
  width: 15px;
  border-top-left-radius: 15px;
  box-shadow: -5px -5px 0 2px #ffffff;
}

.card .top-section .icons {
  position: absolute;
  top: 0;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: space-between;
}

.card .top-section .icons .logo {
  height: 100%;
  aspect-ratio: 1;
  white-space: nowrap;
  font-weight: 15px;
  color: #14202c;
  font-weight: bold;
  font-size: 15;
  margin-top: 6px;
}

.card .top-section .icons .logo .top-section {
  height: 100%;
}

.card .top-section .icons .social-media {
  height: 100%;
  padding: 8px 0px;
  display: flex;
  gap: 7px;
  font-weight: bold;
  color: #14202c;
}

.card .top-section .icons .social-media .svg {
  height: 100%;
  fill: #1b233d;
}

.card .top-section .icons .social-media .svg:hover {
  fill: rgb(185, 185, 185);
}

.card .bottom-section {
  margin-top: 15px;
  padding: 10px 5px;
}

.card .bottom-section .title {
  display: block;
  font-size: 14px;
  font-weight: bolder;
  color: #14202c;
  text-align: center;
  letter-spacing: 2px;
}

.card .bottom-section .row {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.card .bottom-section .row .item {
  flex: 33%;
  text-align: center;
  padding: 5px;
  color: #14202c;
}

.card .bottom-section .row .item .big-text {
  font-size: 12px;
  display: block;
}

.card .bottom-section .row .item .regular-text {
  font-size: 9px;
}

.card .bottom-section .row .item:nth-child(2) {
  border-left: 1px solid rgba(255, 255, 255, 0.126);
  border-right: 1px solid rgba(255, 255, 255, 0.126);
}

.group-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-height: 150px; /* Ajustez selon les besoins */
  overflow-y: auto; /* Active le défilement vertical */
}
.group-item {
  border: 1px solid #14202c;
  border-radius: 5px;
  color: orange;
  font-size: 11px;
  font-weight: bold;
  width: 49%; /* Ajustez légèrement moins de 50% pour éviter les problèmes de marge */
  margin-bottom: 10px;
}
.group-title {
  background: #14202c;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.group-count {
  background: white;
  color: #14202c;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
