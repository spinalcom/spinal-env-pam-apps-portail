<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
      <Stripe/>
      <spinal-table/>

      <div class="pies">
          <PieCard style="width: 100%;" class="flex-grow-1" :title="'ÉTAT DES SALLES'" :pie-chart-data="domainPie"/>
          <PieCard style="width: 100%;" class="flex-grow-1" :title="'ÉTAT GLOBAL'" :pie-chart-data="domainPie"/>
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
    // LoadingCard,
    // SmallLegend,
  },
})
class App extends Vue {

  title = env.title;
  subtitle = env.subtitle;
  unit = env.unit;
  controlEndpoints = env.controlEndpoints;
  cards = env.cards;
  totalTitle = env.totalCardTitle;
  totalSubtitle = env.totalCardSubtitle;
  averageTitle = env.averageCardTitle;
  averageSubtitle = env.averageCardSubtitle;
  todaysTitle = env.todaysCardTitle;
  todaysSubtitle = env.todaysCardSubtitle;
  
  domainPie = [
    {
        "label": "BATIMENT/SECOND ŒUVRE/CLOS COU",
        "value": 3,
        "color": "#FF4A3B"
    },
    {
        "label": "CHAUFFAGE - CLIMATISATION",
        "value": 4,
        "color": "#93876E"
    },
    {
        "label": "CONTRÔLE REGLEMENTAIRE",
        "value": 2,
        "color": "#74BDCB"
    },
    {
        "label": "COURANTS FAIBLES",
        "value": 6,
        "color": "#EFE7BC"
    },
    {
        "label": "COURANTS FORTS",
        "value": 11,
        "color": "#FFA384"
    },
    {
        "label": "ESPACE VERTS",
        "value": 1,
        "color": "#E7F2F8"
    },
    {
        "label": "PLOMBERIE",
        "value": 1,
        "color": "#ECF87F"
    },
    {
        "label": "PROPRETE ENTRETIEN HYG DECHET",
        "value": 1,
        "color": "#B99095"
    },
    {
        "label": "SERRURERIE/MENUISERIE",
        "value": 1,
        "color": "#93B9B8"
    },
    {
        "label": "SERVICE RESIDENT",
        "value": 2,
        "color": "#FDA649"
    },
    {
        "label": "TRAVAUX D'AMENAGEMENT",
        "value": 1,
        "color": "#5050C8"
    }
]

  @Prop({type: Object as () => ISpaceSelectorItem, required: true})
  space: ISpaceSelectorItem;

  async mounted() {
  }
  


  @Watch('space')
  async spaceChange() {
    
    // this.spreadData();
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