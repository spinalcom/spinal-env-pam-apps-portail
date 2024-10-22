<template>
  <div style="display: flex; transform: translate(-1%);">
    <div class="temperature-control2">
      <div class="dashedline"></div>
    </div>
    <div class="temperature-control">
      <!-- SVG en haut -->
      <div :style="{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2px',
        fontSize: '60px',
        borderRadius: '10px',
        backgroundColor: color,
        width: '90px',
        height: '90px',
        marginBottom: '20px',
        transform: 'translate(40%)',
        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px'
      }">
        <!-- Utilisation de l'image SVG provenant des assets -->
        <img :src="svgPath" alt="icon" style="width: 60px; height: 60px;" />
      </div>



      <div style="margin-top: 20px;" class="triangle" @click="increaseTemperature">
        <div class="shodowbox"></div>
        <div class="showdowbox2"></div>
        <div class="showdowbox3"></div>
        <div :style="{
          all: 'unset',
          zIndex: 99,
          width: '20px',
          height: '20px',
          position: 'absolute',
          backgroundColor: color, // Utilisation de la prop color
          borderRadius: '50px',
          transform: 'translate(27px, 11px) skewX(26deg) scale(1, -1.1)',
        }"></div>
      </div>


      <input type="range" :min="minTemperature" :max="maxTemperature" v-model="currentTemperature" :style="sliderStyle"
        class="slider" orient="vertical" @input="updateTemperaturePosition" @change="onSliderChange" ref="slider" />

      <div :style="temperatureStyle">
        {{ currentTemperature }}{{ unit }}
      </div>

      <!-- Affichage de la température actuelle -->
      <div class="temperature-display"></div>
      <!-- <div style="position: absolute;top: 40vh;transform: translate(-70px);font-size: 25px;">{{ currentTemperature }}°C</div> -->
      <!-- Bouton pour diminuer la température (triangle vers le bas) -->
      <div class="inverse_triangle" @click="decreaseTemperature">
        <div :style="{
          position: 'absolute',
          backgroundColor: lastColor, // Utilisation de la couleur minimale
          width: '20px',
          height: '20px',
          borderRadius: '20px',
          zIndex: 99,
          transform: 'translate(29px, 11px) skewX(11deg) skewY(20deg)'
        }"></div>
      </div>




    </div>

    <div>

      <div class="button_selection">

        <div class="btn_clic" style="
">

          <div v-for="(item, index) in objet" :key="index"
            style="background-color: white;width: 100px;height: 32px;border-radius: 15px;box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;font-size: 21px;display: flex;flex-direction: row;margin-bottom: 10px; color: #bdbdbd;font-weight: bold;">

            <div @click="editvalue(item.value)"
              style="width: 30%; justify-content: center;align-items: center;display: flex;padding-top: 12px;">
              <!-- Utilisation de la couleur dynamique -->
              <v-badge :color="item.color"></v-badge>
            </div>
            <div @click="editvalue(item.value)" style="width: 70%; margin-left: 13px;margin-top: 2px;">
              <!-- Utilisation de la valeur dynamique -->
              {{ item.value }}{{ unit }}
            </div>

          </div>



        </div>


      </div>
    </div>
  </div>


</template>

<script>
export default {
  props: {
    data: Object,
    commandName: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      default: "ampoule"
    },
    objet: {
      type: Array,
      required: true
    },
    unit: {
      type: String,
      default: "%"
    },
    step: {
      type: Number,
      default: 1
    },
    color: {
      type: String,
      default: "#ff9b9b"
    },
    currentData: {
      type: Number,
      default: 20
    }
  },
  data: () => ({
    currentTemperature: null, // Température initiale
    temperatureTop: 0
  }),
  computed: {

    lastColor() {
      // Accéder directement au dernier élément de l'objet
      return this.objet.length > 0 ? this.objet[this.objet.length - 1].color : '';
    },
    minTemperature() {
      // Récupérer la plus petite valeur "value" dans l'objet vstore
      return Math.min(...this.objet.map(item => item.value));
    },
    maxTemperature() {
      // Récupérer la plus grande valeur "value" dans l'objet vstore
      return Math.max(...this.objet.map(item => item.value));
    },
    svgPath() {
      // Mappage des noms de SVG
      const svgMap = {
        ampoule: require('../../assets/ampoule.svg'),
        thermometer: require('../../assets/temp.svg'),
        store: require('../../assets/store.svg'),
        // Ajoute ici les autres SVG connus
      };
      return svgMap[this.icon] || ''; // Retourne le chemin du SVG correspondant ou une chaîne vide si non trouvé
    },
    temperatureStyle() {
      const pageHeight = window.innerHeight; // Récupère la hauteur de la fenêtre
      const translateY = (pageHeight / 100) * 28; // 28vh basé sur la hauteur de la fenêtre

      return {
        position: 'absolute',
        top: '50%', // applique la position calculée
        transform: `translate(-70px, 30px)`, // Utilise une valeur dynamique pour translateY
        fontSize: '25px',
      };
    },


    sliderStyle() {
      // Trouver la valeur de l'objet la plus proche de `currentTemperature`
      const closestItem = this.objet.reduce((prev, curr) => {
        return (Math.abs(curr.value - this.currentTemperature) < Math.abs(prev.value - this.currentTemperature) ? curr : prev);
      });

      // Retourner la couleur associée à l'élément le plus proche
      return {
        '--slider-thumb-color': closestItem.color
      };
    }

  },
  mounted() {
    this.updateTemperaturePosition();// Appelle une première fois au chargement
  },
  created() {
    // Assigne la valeur de currentTemperature dans le hook `created`
    this.currentTemperature = this.currentData;
  },
  methods: {
    onSliderChange() {
      console.log('l emit');

      this.$emit('update', {
        command: this.commandName,
        value: this.currentTemperature
      });
    },

    editvalue(value) {
      this.currentTemperature = value;
      this.$emit('update', {
        command: this.commandName,
        value: this.currentTemperature
      });
    },
    updateTemperaturePosition() {
      const slider = this.$refs.slider;
      const sliderRect = slider.getBoundingClientRect(); // Récupère la hauteur réelle du slider
      const range = slider.max + slider.min;
      const sliderValue = slider.value + slider.min;

      // Calculer la position en pourcentage de la hauteur du slider
      const percentage = (sliderValue / range);

      // Inverser le pourcentage pour que la température monte avec le slider
      const thumbHeight = 20; // Taille du bouton définie dans le CSS
      const thumbPosition = (1 - percentage) * (sliderRect.height - thumbHeight);

      // Appliquer la position calculée
      this.temperatureTop = thumbPosition;
    },
    increaseTemperature() {
      if (this.currentTemperature + Number(this.step) <= this.maxTemperature) {
        this.currentTemperature += Number(this.step);
      } else {
        this.currentTemperature = this.maxTemperature;
      }
      this.$emit('update', {
        command: this.commandName,
        value: this.currentTemperature
      });
    },
    decreaseTemperature() {
      if (this.currentTemperature - Number(this.step) >= this.minTemperature) {
        this.currentTemperature -= Number(this.step);
      } else {
        this.currentTemperature = this.minTemperature;
      }
      this.$emit('update', {
        command: this.commandName,
        value: this.currentTemperature
      });
    },
    close() {
      this.$emit('close');
    }
  },
  watch: {
    currentData(newVal) {
      // Mettre à jour currentTemperature lorsque currentData change
      this.currentTemperature = parseFloat(parseFloat(newVal).toFixed(0));
    }
  }
};
</script>

<style scoped>
.btn_clic {
  height: 27vh;
  width: 100px;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  display: flex;
  align-content: space-between;
}


.slider {
  -webkit-appearance: none;
  appearance: none;
  margin-top: 14vh;
  margin-bottom: 116px;
  transform: rotate(-90deg);
  width: 25vh;
}

.dashedline {
  content: "";
  z-index: -1;
  border-left: 2px dashed #444;
  height: 28vh;
  margin-top: 32vh;
  position: relative;
  top: 0;
  bottom: 0;
  transform: translate(100px, -100px);
}


@media (max-height: 910px) {
  .dashedline {
    height: 29vh;
    margin-top: 34vh;
  }
}

@media (max-height: 842px) {
  .dashedline {
    height: 19vh;
    margin-top: 38vh;
  }

  .slider {
    width: 14vh;
    margin-top: 9vh;
    margin-bottom: 6vh;
  }
}

.button_selection {
  padding-top: 25vh;
}

@media (min-height: 1000px) {
  .dashedline {
    height: 25vh;
    margin-top: 26vh;
  }

  .button_selection {
    padding-top: 17vh;
  }

  .slider {
    appearance: none;
    width: 17vh;
    margin-top: 10vh;
    margin-bottom: 110px;
    transform: rotate(-90deg);
  }

  .btn_clic{
    height: 20vh;
  }
}

@media (min-height: 1070px) {
  .dashedline {
    height: 19vh;
    margin-top: 23vh;
  }

}

/* @media (max-height: 832px) {
  .dashedline {
    margin-top: 38vh;
  }
} */

@media (max-height: 701px) {
  .dashedline {
    height: 14vh;
    margin-top: 38vh;
  }

  .slider {
    margin-bottom: -2vh;
    width: 11vh;
    margin-top: 7vh;
  }
}

.temperature-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* width: 100px; */
  /* Largeur de votre composant */
  padding: 20px;

  border-radius: 10px;
  width: 150px;
}

.temperature-control2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* width: 100px; */
  /* Largeur de votre composant */
  padding: 20px;

  border-radius: 10px;
  width: 50px;
}

.icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.triangle {
  position: relative;
  background-color: rgb(255, 255, 255);
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
  width: 60px;
  height: 60px;
  border-top-right-radius: 50%;
}

.triangle {
  transform: rotate(-60deg) skewX(-30deg) scale(1, .866);
  /* box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px; */
  /* box-shadow: rgba(0, 0, 0, 0.25) 0px 0.0625em 0.0625em, rgba(0, 0, 0, 0.25) 0px 0.125em 0.5em, rgba(255, 255, 255, 0.1) 0px 0px 0px 1px inset; */
  z-index: 1;
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


.showdowbox2 {
  z-index: -1;
  background-color: #981c1c00;
  border-radius: 50px;
  width: 130%;
  height: 2px;
  position: absolute;
  top: 63px;
  left: 22px;
  rotate: 270deg;
  box-shadow: 0 2px 8px #00000040;
}

.showdowbox3 {
  z-index: -1;
  background-color: #0000;
  border-radius: 50px;
  width: 160%;
  height: 2px;
  position: absolute;
  top: 36px;
  left: -32px;
  rotate: 45deg;
  box-shadow: 0 2px 8px #00000040;
}

.shodowbox {
  z-index: -1;
  background-color: #0000;
  border-radius: 50px;
  width: 130%;
  height: 2px;
  position: absolute;
  top: -1px;
  left: -43px;
  rotate: 180deg;
  box-shadow: 0 2px 8px #00000040;
}






.slider::-webkit-slider-runnable-track {
  width: 1px !important;
  background-color: #f78d8d00;
  /* Couleur du trait */
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
  background-color: var(--slider-thumb-color);
  /* Couleur du bouton */
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #333;
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background-color: var(--slider-thumb-color);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #333;
}

.slider::-ms-thumb {
  width: 20px;
  height: 20px;
  background-color: var(--slider-thumb-color);
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid #333;
}















.temperature-display {
  font-size: 18px;
  margin: 10px 0;
  margin-left: 30px;
}










.inverse_triangle {
  position: relative;
  background-color: rgb(255, 255, 255);
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
  width: 60px;
  height: 60px;
  border-top-right-radius: 50%;
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
