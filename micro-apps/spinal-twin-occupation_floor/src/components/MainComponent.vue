<!--
Copyright 2023 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
  <div class="RC" style="min-height: 480px" :class="loading ? 'loading' : 'not-loading'">
    <div class="MC">
      <HeatCal
        v-if="calendar"
        :next="temporality.next" 
        :prev="temporality.prev"
        :data="calendar"
        :source="space.source"
        @source="spread($event)"
        @nav="nav($event)"
        @chart-sent="handleChart"
        @call-trigger="callTrigger"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import env from '../../config';
import HeatCal from './HeatCal.vue';
// import LoadingCard from './LoadingCard.vue';
import { ISpaceSelectorItem } from './SpaceSelector/index';
import { TemporalityModel } from '../models/Temporality.model';
import { LegendModel } from '../models/Legend.model';
import { CalendarModel } from '../models/Calendar.model';
import { getHeatCal } from '../services';
import moment from 'moment';
import { ISource } from '../services/interfaces';


interface state {
  year: string;
  space: {
    type: string; // [controlEndpoint, endpoint]
    Name: string;
    profile: string;
    dynamicId: number;
    capacity: number;
    min: number;
    max: number;
  };
  calculus: string;
}

@Component({
  components: {
    // LoadingCard,
    HeatCal,
  },
})
class App extends Vue {
  loading = false;
  defaultSource = 0;
  currentTimestamp = {valueTime: 0};
  calendar: any = null;
  @Prop({type: Object as () => ISpaceSelectorItem, required: true})
  space: ISpaceSelectorItem;

  @Prop({type: Object as () => TemporalityModel, required: true})
  temporality: TemporalityModel;


  mounted() {
    this.currentTimestamp = {valueTime: this.currentTimestamp.valueTime = moment().valueOf()};
    this.spread(this.defaultSource);
  }

  async spread(source: number) {
    this.space.source
    this.loading = true;
    this.defaultSource = source;
    const data = this.space.source[source];
    const buildingId = data.type === "building" ? data.dynamicId : data.type === "floor" ? data.patrimoineId : undefined;
    this.calendar = await getHeatCal(this.space, this.temporality.name, this.currentTimestamp.valueTime, data,undefined,buildingId);

    this.loading = false;
  }

  async callTrigger(interval = {start: null, end: null}) {
    // console.log(interval.start);
    // console.log(interval.end);
    // console.log(this.calendar.rawData);
    
    this.loading = true;

    const data = this.space.source[this.defaultSource];
    const buildingId = data.type === "building" ? data.dynamicId : data.type === "floor" ? data.patrimoineId : undefined;

    this.calendar = await getHeatCal(this.space, this.temporality.name, this.currentTimestamp.valueTime, data, { data: this.calendar.rawData, start: interval.start, end: interval.end }, buildingId);
    this.loading = false;
  }

  nav(payload: number) {
    if (this.temporality.name === 'Année') {
      this.currentTimestamp = {valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'years').valueOf()};
    }
    this.spread(this.defaultSource);
  }

  handleChart(output: any) {
    this.$emit('chart-sent', output);
  }

  @Watch("temporality")
  watchTemporality() {
    this.spread(0);
  }

  @Watch("space")
  watchSpace() {
    this.spread(0);
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

.loading {
  cursor: wait;
}

.not-loading {
  cursor: default;
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