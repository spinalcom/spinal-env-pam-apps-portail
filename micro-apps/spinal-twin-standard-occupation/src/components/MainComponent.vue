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
        @calculus="calculus"
        @unit-switch="unitSwitch"
        :defaultSource="defaultSource"
      />
      <LoadingCard v-else style="width: 100%; height: 485px;"/>
      <div class="stat-heat">
        <div class="stats">
          <StatsCard v-if="calendar && calendar.d" :value="unit.shortName === '%' ? stat.value : stat.maxCapacity" :unit="unit.shortName" :title="stat.text"/>
          <LoadingCard v-else style="width: 100%; height: 74px;"/>
        </div>
        <div class="heat">
          <HeatWeek v-if="weekData" :data="weekData" :unit="unit" :calculus="calcul"/>
          <LoadingCard v-else style="height: 286px;"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import env from '../../config';
import HeatCal from './HeatCal.vue';
import HeatWeek from './HeatWeek.vue';
import StatsCard from './StatsCard.vue';
import LoadingCard from './LoadingCard.vue';
import { ISpaceSelectorItem } from './SpaceSelector/index';
import { TemporalityModel } from '../models/Temporality.model';
import { LegendModel } from '../models/Legend.model';
import { CalendarModel } from '../models/Calendar.model';
import { getHeatCal } from '../services/index.js';
import moment from 'moment';


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
    LoadingCard,
    HeatCal,
    HeatWeek,
    StatsCard
  },
})
class App extends Vue {

  loading = false;

  defaultSource = 0;

  currentTimestamp = {valueTime: 0};

  calendar: any = null;

  weekData: any = null;

  stat: { value: number, maxCapacity: number, text: string } = {value: 0, maxCapacity: 0, text: ''};

  unit = env.unit.default ? env.unit.right : env.unit.left;

  calcul = 'Maximum';

  weekConfig = env.weekmap;

  @Prop({type: Object as () => ISpaceSelectorItem, required: true})
  space: ISpaceSelectorItem;


  @Prop({type: Object as () => TemporalityModel, required: true})
  temporality: TemporalityModel;

  @Prop({type: Object as () => any, required: false})
  sourceList: any;


  mounted() {
    // console.log(this.space);
    
    this.currentTimestamp = {valueTime: this.currentTimestamp.valueTime = moment().valueOf()};
    this.spread(this.defaultSource);
  }


  async spread(source: number) {
    this.loading = true;
    this.defaultSource = source;
    this.calendar = await getHeatCal(this.space, this.temporality.name, this.currentTimestamp.valueTime, this.space.source[source]);
    this.loading = false;
    this.calculus(this.calcul);
    
  }


  async callTrigger(interval = {start: null, end: null}) {
    // console.log(interval.start);
    // console.log(interval.end);
    // console.log(this.calendar.rawData);
    
    this.loading = true;
    this.calendar = await getHeatCal(this.space, this.temporality.name, this.currentTimestamp.valueTime, this.space.source[this.defaultSource], {data: this.calendar.rawData, start: interval.start, end: interval.end});
    this.loading = false;
  }


  calculus(calc) {
    this.calcul = calc;
    const weekDays = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];
    let colors = ['#D6E9FB', '#B7D7F5', '#97C4EF', '#72AFE8', '#519BE1', '#3A87D0', '#2F72B1', '#245D93', '#194773', '#0E3255'];
    if (this.weekConfig.colors)
      colors = this.weekConfig.colors
    const capacity = env.source[this.defaultSource].capacity;
    let result;
    if (calc === 'Maximum') {
      this.stat.text = 'Taux d\'occupation maximum';
      let maxOverall = 0;      

      result = weekDays.map(day => {
        return Array.from({ length: 24 }, (_, hourIndex) => {
          const valuesForHour = this.calendar.rawData.filter(item => {
            const itemDay = moment(item.date).format('ddd');
            const itemHour = moment(item.date).hours();
            return itemDay === day && itemHour === hourIndex;
          });

          if (valuesForHour.length > 0) {
            const max = Math.max(...valuesForHour.map(item => item.value));
            const min = Math.min(...valuesForHour.map(item => item.value));
            const maxItem = valuesForHour.find(item => item.value === max);
            const formattedDate = moment(maxItem.date).format('D MMMM YYYY');

            const interval = (max - min) / colors.length;
            const intervalIndex = Math.floor((max - min) / interval);
            const colorIndex = Math.min(Math.max(intervalIndex, 0), 9);
            
            let color = '';

            const maxCapacity = (max * capacity) / 100;

            if (max > maxOverall) {
              maxOverall = max;
              this.stat.value = maxOverall;
              this.stat.maxCapacity = maxCapacity;
            }
            return { date: formattedDate, value: max, color: color, maxCapacity: maxCapacity };
          } else {
            return null;
          }
        });
      });
    }

    if (calc === 'Minimum') {
      this.stat.text = 'Taux d\'occupation minimum';
      let minOverall = Infinity;

      result = weekDays.map(day => {
        return Array.from({ length: 24 }, (_, hourIndex) => {
          const valuesForHour = this.calendar.rawData.filter(item => {
            const itemDay = moment(item.date).format('ddd');
            const itemHour = moment(item.date).hours();
            return itemDay === day && itemHour === hourIndex;
          });

          if (valuesForHour.length > 0) {
            const min = Math.min(...valuesForHour.map(item => item.value));
            const minItem = valuesForHour.find(item => item.value === min);
            const formattedDate = moment(minItem.date).format('D MMMM YYYY');
            let color = '';

            const minCapacity = (min * capacity) / 100;

            if (min < minOverall) {
              minOverall = min;
              this.stat.value = minOverall;
              this.stat.maxCapacity = minCapacity;
            }

            return { date: formattedDate, value: min, color: color, maxCapacity: minCapacity };
          } else {
            return null;
          }
        });
      });
    }

    if (calc === 'Moyenne') {
      this.stat.text = 'Taux d\'occupation moyen';
      let sumOverall = 0;
      let countOverall = 0;

      result = weekDays.map(day => {
        return Array.from({ length: 24 }, (_, hourIndex) => {
          const valuesForHour = this.calendar.rawData.filter(item => {
            const itemDay = moment(item.date).format('ddd');
            const itemHour = moment(item.date).hours();
            return itemDay === day && itemHour === hourIndex;
          });

          if (valuesForHour.length > 0) {
            const sum = valuesForHour.reduce((acc, item) => acc + item.value, 0);
            const average = sum / valuesForHour.length;
            const formattedDate = moment(valuesForHour[0].date).format('D MMMM YYYY');
            let color = '';

            const avgCapacity = (average * capacity) / 100;

            sumOverall += sum;
            countOverall += valuesForHour.length;
            const overallAverage = sumOverall / countOverall;

            this.stat.value = overallAverage;
            this.stat.maxCapacity = (avgCapacity * capacity) / 100;

            return { date: formattedDate, value: average, color: color, maxCapacity: avgCapacity };
          } else {
            return null;
          }
        });
      });
    }

    const flatArray = result.flat();

    /**
     * calculate the minimum if it is not defined in config.js file
    */ 
    let max = 0, min = 0;
    if (this.weekConfig.min === null) {
      min = flatArray.reduce((minValue, obj) => {
        if (obj !== null) {
          return Math.min(minValue, obj.value);
        }
        return minValue;
      }, Infinity);
    }
    else {
      min = this.weekConfig.min;
    }


    /**
     * calculate the max if it is not defined in config.js file
    */ 

    if (this.weekConfig.max === null) {
      max = flatArray.reduce((maxValue, obj) => {
        if (obj !== null) {
          return Math.max(maxValue, obj.value);
        }
        return maxValue;
      }, -Infinity);
    }
    else {
      max = this.weekConfig.max;
    }

    const interval = (max - min) / 10;

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < 24; j++) {
        if(result[i][j] === null) {result[i][j] = {color: colors[0], value: 0, maxCapacity: 0, unit: ''};}
        else if (result[i][j].value < min + interval || result[i][j].value == 0) result[i][j].color = colors[0];
        else if (result[i][j].value < min + interval * 2) result[i][j].color = colors[1];
        else if (result[i][j].value < min + interval * 3) result[i][j].color = colors[2];
        else if (result[i][j].value < min + interval * 4) result[i][j].color = colors[3];
        else if (result[i][j].value < min + interval * 5) result[i][j].color = colors[4];
        else if (result[i][j].value < min + interval * 6) result[i][j].color = colors[5];
        else if (result[i][j].value < min + interval * 3) result[i][j].color = colors[6];
        else if (result[i][j].value < min + interval * 4) result[i][j].color = colors[7];
        else if (result[i][j].value < min + interval * 5) result[i][j].color = colors[8];
        else result[i][j].color = colors[9];
      }
    }
    this.weekData = result;
  }



  unitSwitch(unit) {
    this.unit = unit;
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


  @Watch('space')
  async spaceChange(v) {
    this.loading = true;
    this.defaultSource = 0;
    this.calendar = await getHeatCal(this.space, this.temporality.name, this.currentTimestamp.valueTime, this.space.source[0]);
    this.loading = false;
    this.calculus(this.calcul);
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

.stat-heat {
  display: flex;
  flex-direction: row;
  gap: 10px;

  width: 100%;
}

.stats {
  width: 50%;
}
.heat {
  width: 50%;
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