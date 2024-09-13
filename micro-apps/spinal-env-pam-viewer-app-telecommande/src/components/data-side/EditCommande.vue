<template>
  <div class="temperature-control">
    <!-- Icône en haut -->
    <div
      style="display: flex;justify-content: center;align-items: center;padding: 2px ; font-size: 32px; border-radius: 10px;background-color: palevioletred; width: 50px; height: 50px;">
      <span class="mdi mdi-thermometer-low"></span>
    </div>
    <!-- Bouton pour augmenter la température (triangle vers le haut) -->
    <!-- <button class="up-button" @click="increaseTemperature">
      ▲
    </button> -->
    <div style="margin-top: 20px;" class="triangle" @click="increaseTemperature"></div>

    <!-- Slider vertical pour ajuster la température -->
    <input type="range" min="10" max="40" v-model="currentTemperature" class="slider" orient="vertical" />

    <!-- Affichage de la température actuelle -->
    <div class="temperature-display">{{ currentTemperature }}°C</div>

    <!-- Bouton pour diminuer la température (triangle vers le bas) -->
    <div class="inverse_triangle" @click="decreaseTemperature">
      
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object
  },
  data: () => ({
    currentTemperature: 20, // Température initiale
  }),
  methods: {
    increaseTemperature() {
      if (this.currentTemperature < 40) {
        this.currentTemperature++;
      }
    },
    decreaseTemperature() {
      if (this.currentTemperature > 10) {
        this.currentTemperature--;
      }
    },
    close() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.temperature-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  /* Largeur de votre composant */
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
}

.icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.triangle {
  position: relative;
  background-color: orange;
  text-align: left;
}

.triangle:before,
.triangle:after {
  content: '';
  position: absolute;
  background-color: inherit;
}

.triangle,
.triangle:before,
.triangle:after {
  width: 30px;
  height: 30px;
  border-top-right-radius: 30%;
}

.triangle {
  transform: rotate(-60deg) skewX(-30deg) scale(1, .866);
  box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
}

.triangle:before {
  transform: rotate(-135deg) skewX(-45deg) scale(1.414, .707) translate(0, -50%);
}

.triangle:after {
  transform: rotate(135deg) skewY(-45deg) scale(.707, 1.414) translate(50%);
}

.up-button:hover {
  transform: scale(1.1);
  /* Effet au survol */
}









.slider {
  -webkit-appearance: none;
  appearance: none;
  /* width: 4px; Largeur de la piste */
  /* height: 150px; Hauteur pour rendre le slider vertical */
  background: none; /* Supprimer la barre par défaut */
  margin: 10px 0;
  margin-top: 100px !important;
    margin-bottom: 46px;
  transform: rotate(-90deg); /* Forcer l'orientation verticale */
}

.slider::-webkit-slider-runnable-track {
  width: 1px !important;
  background-color: #f78d8d00; /* Couleur du trait */
  border-radius: 2px;
}

.slider::-moz-range-track {
  width: 1px;
  background-color: #9b0c0c;
  border-radius: 2px;
}

.slider::-ms-track {
  width: 1px;
  background-color: #927e0a;
  border-radius: 2px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background-color: orange; /* Couleur du bouton */
  border-radius: 50%;
  cursor: pointer;
  /* border: 2px solid #333; */
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background-color: orange;
  border-radius: 50%;
  cursor: pointer;
  /* border: 2px solid #333; */
}

.slider::-ms-thumb {
  width: 20px;
  height: 20px;
  background-color: orange;
  border-radius: 50%;
  cursor: pointer;
  /* border: 2px solid #333; */
}















.temperature-display {
  font-size: 18px;
  margin: 10px 0;
}


















.inverse_triangle {
  position: relative;
  background-color: orange;
  text-align: left;
}

.inverse_triangle:before,
.inverse_triangle:after {
  content: '';
  position: absolute;
  background-color: inherit;
}

.inverse_triangle,
.inverse_triangle:before,
.inverse_triangle:after {
  width: 30px;
  height: 30px;
  border-top-right-radius: 30%;
}

.inverse_triangle {
  transform: rotate(120deg) skewX(-30deg) scale(1, .866);
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset;
}

.inverse_triangle:before {
  transform: rotate(-135deg) skewX(-45deg) scale(1.414, .707) translate(0, -50%);
}

.inverse_triangle:after {
  transform: rotate(135deg) skewY(-45deg) scale(.707, 1.414) translate(50%);
}


</style>
