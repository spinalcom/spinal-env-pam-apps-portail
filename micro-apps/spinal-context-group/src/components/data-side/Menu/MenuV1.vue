<template>
  <div>
    <div class="menu-wrapper">
      <!-- Main cell that toggles the sub-menu visibility -->
      <div class="cell-main" @click="toggleMenu">
        <div class="icon">
          <v-icon color="secondary">{{ mainCell.icon }}</v-icon>
        </div>
        </div>
          <div v-if="menuVisible" class="subs">
            <div
              v-for="(item, index) in subItems"
              :title="item.title"
              :key="index"
              :class="['sub-circle', `position-${index + 1}`, { 'selected': item.toggeable&&selectedItems.includes(item.value) }]"
              @click="selectItem(item.value)"
            >
              <div class="icon">
                <v-icon color="secondary">{{ item.icon }}</v-icon>
              </div>
            </div>
          </div>
      </div>
  </div>
</template>

<script lang="ts">
// * Vuetify
//import { VIcon } from 'vuetify/lib'

export default {
  components: {
    //VIcon
  },
  props: {
    mainCell: {
      type: Object,
      default: () => {
        return {
          title: '',
          icon: 'mdi-cog-outline',
        };
      },
      required: false,
      validator: (obj: Object) => {
        return Object.hasOwn(obj, 'title') && Object.hasOwn(obj, 'icon');
      },
    }
  },
  data() {
    return {
      isChecked: false,
      menuVisible: false,
      selectedItems : [7] as number[], 
      subItems: [
        { value: 1, icon: 'mdi-format-list-bulleted-type', title: "Sélection catégorie/groupe", toggeable: false },
        { value: 2, icon: 'mdi-map-legend', title: "Afficher la légende", toggeable: true },
        { value: 3, icon: 'mdi-radar', title: "Mode Radar/Tableau" ,toggeable: true },
        { value: 4, icon: 'mdi-swap-horizontal', title: "Changer l'unité de mesure" ,toggeable: true },
        { value: 5, icon: 'mdi-format-list-bulleted', title: "Filtre nomenclature" , toggeable: false },
        { value: 6,  icon: 'mdi-math-log', title: "Surface normal/logarithmique" , toggeable: true},
        { value: 7,  icon: 'mdi-filter-outline', title: "Filtrer sur l'étage sélectionné" , toggeable: true}
      ],
    };
  },
  methods: {
    clickGroupManager() {
      this.$emit('clickGroupManager');
    },
    clickNomenclature() {
      this.$emit('clickNomenclature');
    },
    clickDisplayLegend() {
      this.$emit('clickDisplayLegend');
    },
    clickChangeUnit(){
      this.$emit('clickChangeUnit');
    },
    clickSwitchDataViz(){
      this.$emit('clickSwitchDataViz');
    },
    clickLogarithm(){
      this.$emit('clickLogarithm');
    },
    clickFilterFloor(){
      this.$emit('clickFilterFloor');
    },
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
    selectItem(value :number) {
      const index = this.selectedItems.indexOf(value);
      if (index > -1) {
        this.selectedItems.splice(index, 1); // Remove item if already selected
      } else {
      this.selectedItems.push(value); // Add item if not selected
      }
      switch(value) {
        case 1:
          this.clickGroupManager();
          break;
        case 2:
          this.clickDisplayLegend();
          break;
        case 3:
          this.clickSwitchDataViz();
          break;
        case 4:
          this.clickChangeUnit();
          break;
        case 5:
          this.clickNomenclature();
          break;
        case 6:
          this.clickLogarithm();
          break;
        case 7:
          this.clickFilterFloor();
          break;
        default:
          break;
      }
      
    },
  },
};
</script>

<style scoped>
.subs {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  
}

.sub-circle {
  z-index: 0;
  position: absolute;
  height: 40px;
  width: 40px;
  justify-content: center;
  align-items: center;
  display: flex;
  border-radius: 50%;
  background-color: black;
  box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease; /* Added transition for smooth scaling */
}
.sub-circle.selected { 
  border: 4px solid rgb(62, 155, 59);
}
.sub-circle :hover {
  transform: scale(1.1);
}

.sub-circle.position-1 {
  border-radius: 0.7em;
  width:70px;
  opacity: 1;
  animation: moveW 0.3s forwards;
}
.sub-circle.position-7 {
  opacity: 1;
  animation: moveW2 0.5s forwards;
}

.sub-circle.position-2 {
  opacity: 1;
  animation: moveNW 0.5s forwards;
}

.sub-circle.position-3 {
  opacity: 1;
  animation: moveN 0.7s forwards;
}

.sub-circle.position-6 {
  height: 35px;
  width: 35px;
  opacity: 1;
  animation: moveN2 0.7s forwards;
}

.sub-circle.position-4 {
  opacity: 1;
  animation: moveNE 0.5s forwards;
}

.sub-circle.position-5 {
  border-radius: 0.7em;
  width:70px;
  opacity: 1;
  animation: moveE 0.3s forwards;
}


@keyframes moveW {
  to {
    transform: translate(-100px, 0px);
  }
}
@keyframes moveW2 {
  to {
    transform: translate(-175px, 0px);
  }
}

@keyframes moveNW {
  to {
    transform: translate(-50px, -50px);
  }
}
@keyframes moveN {
  to {
    transform: translate(0px, -100px);
  }
}

@keyframes moveN2 {
  to {
    transform: translate(0px, -150px);
  }
}
@keyframes moveNE {
  to {
    transform: translate(50px, -50px);
  }
}

@keyframes moveE {
  to {
    transform: translate(100px, 0px);
  }
}


</style>
<style lang="scss" scoped>
.menu-wrapper {
  // Increase this value in order to scale the components
  --global-font-size: 15px;

  --cell-max-height: 4em;
  --cell-max-width: 8em;

  --cell-main-height: 4em;
  --cell-main-width: 4em;

  --cell-z-index: 60;
  --component-z-index: 59;

  width: fit-content;
  position: relative;
  z-index: var(--component-z-index);

  // Increase this value for responsivness
  font-size: var(--global-font-size);

  .v-icon {
    font-size: 2em !important;
  }

  .cell-main {
    display: flex;
    margin: 0 1em;
    justify-content: center;
    align-items: center;
    width: var(--cell-main-width);
    height: var(--cell-main-height);
    background: black;
    transform: rotate(45deg);
    border-radius: 0.7em;
    transition: transform 200ms ease;
    cursor: pointer;

    z-index: var(--cell-z-index);

    &:hover {
      transform: rotate(45deg) scale(1.1);
    }
    &:active,
    &:focus {
      transform: rotate(45deg) scale(0.9);
    }
  }
}
</style>
