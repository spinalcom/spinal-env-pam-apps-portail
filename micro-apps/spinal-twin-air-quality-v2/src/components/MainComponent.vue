<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
      <Stripe :data="floorLevels"/>
      <spinal-table v-if="floorTable !== null" :data="floorTable" @dataChange="dataChange"/>
      <div class="pies">
          <PieCard style="width: 100%;" class="flex-grow-1" :title="'ÉTAT DES SALLES'" :pie-chart-data="roomStatus"/>
          <PieCard style="width: 100%;" class="flex-grow-1" :title="'ÉTAT GLOBAL'" :pie-chart-data="globalStatus"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import env from '../../config';
import Stripe from './Stripe.vue';
import SpinalTable from './SpinalTable.vue';
import PieCard from './PieCard.vue';
import SmallLegend from "./SmallLegend.vue";
import LoadingCard from './LoadingCard.vue';
import { ISpaceSelectorItem } from './SpaceSelector/index';
// import { getData, getTodaysData, getSolo, getTempoSuggestion } from '../services/index.js';
import moment from 'moment';



@Component({
  components: {
    Stripe,
    SpinalTable,
    PieCard,
  },
})
class App extends Vue {

  title = env.title;
  subtitle = env.subtitle;
  unit = env.unit;
  controlEndpoints = env.controlEndpoints;
  levels = env.level;
  floorLevels: any[] = [];
  floorTable: any = null;
  stripeLoaded = false;
  roomStatus: any[] = [];

  globalStatus: any[] = [
    {
      label: "Équipé d'un capteur",
      value: 0,
      color: "#14202c"
    },
    {
      label: "Entretien requis",
      value: 0,
      color: "#00c4ff"
    },
    {
      label: "Aucun capteur trouvé",
      value: 0,
      color: "#cadee2"
    }
  ];

  @Prop({type: Object as () => ISpaceSelectorItem, required: true})
  space: ISpaceSelectorItem;

  @Prop({required: true})
  data: any[];

  mounted() {
    this.floorTable = this.data;
    this.updateStripe();
  }

  @Watch('space')
  spaceChange(v) {
    if (v.type === 'building')
      this.floorTable = this.data;
    else
      this.floorTable = this.data.filter(e => e.floorName === this.space.name);

    console.log(this.floorTable);
    
    this.updateStripe();
  }

  updateStripe() {
    this.floorLevels = [];
    this.roomStatus = [];
    this.globalStatus[0].value = 0;this.globalStatus[1].value = 0;this.globalStatus[2].value = 0;
    this.stripeLoaded = false;
    var counter = 0;
    for (let i = 0; i < this.levels.length; i++) {
      for (let j = 0; j < this.floorTable.length; j++) {
        if (this.floorTable[j].endpoints?.currentValue < this.levels[i].interval.max && this.floorTable[j].endpoints?.currentValue > this.levels[i].interval.min) {
          counter ++;
        }
      }

      this.floorLevels.push({name: this.levels[i].name, color: this.levels[i].color, value: counter, percentage: ((counter * 100) / this.floorTable.length).toFixed(1)+'%'});
      this.roomStatus.push({label: this.levels[i].name, color: this.levels[i].color, value: counter});
      counter = 0;
    };


    // {
    //     "label": "Équipé d'un capteur de Co2",
    //     "value": 3,
    //     "color": "#14202c"
    // },
    // {
    //     "label": "Entretien requis",
    //     "value": 1,
    //     "color": "#00c4ff"
    // },
    // {
    //     "label": "Aucun capteur trouvé",
    //     "value": 2,
    //     "color": "#cadee2"
    // }
  

    for (let i = 0; i < this.floorTable.length; i++) {
      if (this.floorTable[i].endpoints && this.floorTable[i].endpoints.currentValue && this.floorTable[i].endpoints.currentValue > 0) {
        this.globalStatus[0].value++;
      }
      else if (this.floorTable[i].endpoints && this.floorTable[i].endpoints.currentValue && this.floorTable[i].endpoints.currentValue === 0) {
        this.globalStatus[1].value++;
      }
      else {
        this.globalStatus[2].value++;
      }
    }
    this.stripeLoaded = true;
    
    return this.levels;
  }

  dataChange(data: any[]): void {
    this.$emit('dataChange', data);
  }

}
export default App;
</script>

<style scoped>
.RC {
  font-family: Charlevoix;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 80px 10px 10px;
  gap: 10px;
  height: 100vh;
  width: 100%;
  background: linear-gradient(111.34deg, #F8FAFA 0%, #D6E2E6 100%);
}
/* main container */
.MC {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  /* background: #F9F9F9; */
  /* border: 1px solid #F7F7F7; */
  /* box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.16); */
  border-radius: 10px;
  width: 100%;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  overflow-y: auto;
}

.pies {
  display: flex;
  gap: 10px;
  height: 280px;
  width: 100%;
}

.BR {
  /* height: 100%; */
  flex-grow: 1;
  width: 100%;
  margin: 0 !important;
  padding: 0 !important;
  min-height: 300px;
}

.cards {
  gap: 10px;
  width: 100%;
}

.v-application .ma-2 {
  margin: 0 !important;
}

.v-application .elevation-5 {
  box-shadow: 0px 3px 10px #49545C29 !important;
}

.plus-button {
  /* background: #f9f9f9 !important; */
  background: transparent !important;
  position: absolute;
  top: 180px;
  left: 40px;
  font-size: 14px !important;
  border-radius: 10px;
  min-width: 36px !important;
  box-shadow: none;
  /* border: 1px solid #EAEEF0 !important; */
  width: 48px !important;
  height: 36px !important;
}

.plus-button:hover {
  background: transparent !important;
}

.g {
  gap: 10px;
}

.active-select {
  border-color: green ; /* set the border color to red when the select is active */

}

::v-deep .v-application .primary--text {
  color: #000000DE !important;
}
::v-deep .v-menu__content {
  border-radius: 10px !important;
}
::v-deep .v-label {
  font-size: 14px !important;
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
}

::v-deep .v-list-item__title {
  font-size: 14px !important;
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
}

::v-deep  .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot fieldset {
  color: #E3E7E8 !important;
}

::v-deep .theme--light.v-icon {
  color: #E3E7E8;
}

::v-deep .v-menu__content {
  top: 188px !important;
}

::v-deep .v-list-item--link:before {
  background: #fff !important;
}
</style>