<template>
  <div class="RC" style="min-height: 480px">
    <div class="MC">
      <LoadingPage v-if="isLoading"/>
      <div class="content">
        <div style="z-index: 1;" v-if="temporality.name !== 'Décennie'">
          <!-- <TemporalFilter 
          v-if="temporality.name !== 'Décennie'"
          @time-change="handleTimeChange"
          :start-time="startTime"
          :end-time="endTime"
        /> -->
        <!--   <v-time-picker v-model="startTime" format="24hr" label="Heure de début" @change="onTimeChange"></v-time-picker>
          <v-time-picker v-model="endTime" format="24hr" label="Heure de fin" @change="onTimeChange"></v-time-picker> -->
        </div>
        <LineChart 
          v-if="chart.label && chart.data && ['Journée', 'Trimestre', 'Valeur Courante'].includes(temporality.name)"
          :title="title"
          :subtitle="subtitle"
          :labels="chart.label" 
          :datasets="chart.data" 
          :next="temporality.name !== 'Valeur Courante' ? temporality.next : ''" 
          :prev="temporality.name !== 'Valeur Courante' ? temporality.prev : ''" 
          @nav="nav"
          @time-change="handleTimeChange"
          :current-date="getCurrentDate()"
          :temporality="temporality.name"
          @date-change="handleDateChange"
          :stacked="false" 
          style="max-height: 530px;"
          class="BR"
        />
        <BarChart
          v-else-if="chart.label && chart.data"
          :title="title"
          :subtitle="subtitle"
          :labels="chart.label" 
          :temporality="temporality.name"
          :datasets="chart.data" 
          :prev_next="true"
          @nav="nav"
          @time-change="handleTimeChange"
          :current-date="getCurrentDate()"
          @date-change="handleDateChange"
          :stacked="true"
          :isYear="temporality.name==='Année' || temporality.name==='Trimestre'"
          :next="temporality.name !== 'Valeur Courante' ? temporality.next : ''" 
          :prev="temporality.name !== 'Valeur Courante' ? temporality.prev : ''"
          style="max-height: 530px;"
        />
        <FloorOccupancyDetail 
          ref="floorOccupancyDetail" 
          :space="space" 
          :temporality="temporality" 
          :startTime="startTime"
          :endTime="endTime"
          @time-change="handleTimeChange"
        />
        
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import LineChart from './LineCard.vue';
import { getData } from '../services/floorOccupancyService';
import { initializeSources , cachedRoomEntryPoints} from '../services/calculationUtils';  
import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import BarChart from './BarCard.vue';
import LoadingPage from './LoadingPage.vue'; 
import FloorOccupancyDetail from './FloorOccupancyDetail.vue';
import { ISpaceSelectorItem } from './SpaceSelector/interfaces/ISpaceSelectorItem';
import { TemporalityModel } from '../models/Temporality.model';
import { LegendModel } from '../models/Legend.model';
import {config} from '../config'; 
import { ChartData, tempoFilter } from '../components/interfaces/types';
import TemporalFilter from './TemporalFilter.vue';
import { getRoomData } from '../services/index';
import moment from 'moment';
import 'moment/locale/fr'; 

moment.locale('fr'); 
 
@Component({
  components: {
    BarChart,
    LineChart,
    FloorOccupancyDetail,
    LoadingPage,
    TemporalFilter,
  },
})
class App extends Vue {
  title = config.title;
  subtitle = config.subtitle;
  chart:  {
            label: string[];
            data: ChartData[];
          } = {
                label: [],
                data: [] as ChartData[],  
                          };
  currentTimestamp = {valueTime: 0};
  controlEndpointList: LegendModel[] = [];
  startTime = '00:00';
  endTime = '23:59';

  defaultTimeChip = '';

  dialog = false;
  days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
  weeks = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18', 'S19', 'S20', 'S21', 'S22', 'S23', 'S24', 'S25', 'S26', 'S27', 'S28', 'S29', 'S30', 'S31', 'S32', 'S33', 'S34', 'S35', 'S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42', 'S43', 'S44', 'S45', 'S46', 'S47', 'S48', 'S49', 'S50', 'S51', 'S52'];
  months = [ {name: 'Janvier', value: '01'}, {name: 'Février', value: '02'}, {name: 'Mars', value: '03'}, {name: 'Avril', value: '04'}, {name: 'Mai', value: '05'}, {name: 'Juin', value: '06'}, {name: 'Juillet', value: '07'}, {name: 'Août', value: '08'}, {name: 'Septembre', value: '09'}, {name: 'Octobre', value: '10'}, {name: 'Novembre', value: '11'}, {name: 'Décembre', value: '12'}];
  trimester = ['T1', 'T2', 'T3', 'T4'];
  years = ['2025', '2024','2023', '2022', '2021'];
  selectedFilter: tempoFilter[] = [];

  defaultFilter: tempoFilter = {name: '', color: '#00000', value: '', lock: false, star: true};
  selectedReference: number = 0;
  colors =  [ '#FF4A3B', '#93876E', '#74BDCB', '#EFE7BC', '#FFA384', '#E7F2F8',
              '#ECF87F', '#B99095', '#93B9B8', '#FDA649', '#5050C8', '#0D698B',
              '#29A0B1', '#FFAEBC', '#B4F8C8', '#FBE7C6', '#3D5B59', '#A0E7E5',
              '#25C1AF', '#C37BCF', '#CC4D92', '#8A78FB', '#9DD6FF', '#D67D7D',
              '#FFD056', '#584A4A', '#C1CC80', '#AA2424', '#9DAABD', '#802877'
            ];

  selectedDomain = -1;
  domain: any = {name: '', color: ''};
  domainList: any[] = [];
  isLoading = true;

  @Prop({ type: Object as () => ISpaceSelectorItem, required: true })
  space!: ISpaceSelectorItem;

  @Prop({ type: Object as () => TemporalityModel, required: true })
  temporality!: TemporalityModel;
  selectedYear: any;

  interval() {
    this.currentTimestamp = {valueTime: this.currentTimestamp.valueTime = moment().valueOf()};
    this.spreadData();
  }

        async spreadData() {
          try {
            this.isLoading = true;
        
            // Vérifiez si les sources sont initialisées
            if (!cachedRoomEntryPoints || cachedRoomEntryPoints.length === 0) {
              console.warn("Les sources ne sont pas initialisées. Appel de initializeSources...");
              await initializeSources(); // Initialisez les sources si nécessaire
            }
        
            const roomData = await getRoomData();
            const roomIds = Object.values(roomData).flat();
        
            if (this.space.type === 'building') {
              const res = await getData(this.space, this.temporality.name, this.currentTimestamp.valueTime, roomIds, this.startTime, this.endTime);
              if (res && res.length >= 3) {
                this.chart.label = res[0] || [];
                this.chart.data = res[1] || [];
                this.defaultFilter.name = res[1] && res[1][0] ? res[1][0].label : '';
              } else {
                console.warn('Les données de getData sont manquantes ou mal formatées.');
              }
            }
          } catch (error) {
            console.error("Erreur lors de l'exécution de spreadData:", error);
          } finally {
            this.isLoading = false;
          }
        }

  onTimeChange() {
    if (this.startTime && this.endTime) {
      const start = moment(this.startTime, 'HH:mm');
      const end = moment(this.endTime, 'HH:mm');
      
      if (start.isAfter(end)) {
        alert('L\'heure de début doit être inférieure à l\'heure de fin');
        return;
      }
    }
    this.spreadData();
  }
  getCurrentDate() {
    const timestamp = this.currentTimestamp.valueTime || moment().valueOf(); 
    if (this.temporality.name === 'Journée') {
      return moment(timestamp).format('YYYY-MM-DD'); 
    } else if (this.temporality.name === 'Mois') {
      return moment(timestamp).format('YYYY-MM'); 
    } else if (this.temporality.name === 'Année') {
      return moment(timestamp).format('YYYY'); 
    }
    return moment(timestamp).format('YYYY-MM-DD'); 
  }
    async handleTimeChange({ startTime, endTime }) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.onTimeChange();
  
    if (this.$refs.floorOccupancyDetail) {
      const floorOccupancyDetail = this.$refs.floorOccupancyDetail as Vue & {
        fetchFloorData: (name: string, timestamp: number, startTime: string, endTime: string) => void;
        fetchSecondFloorData: (timestamp: number, startTime: string, endTime: string, roomData: Record<string, string[]>) => void;
        fetchThirdChartFloorData: (timestamp: number, startTime: string, endTime: string) => void;
      };
  
      const roomData = await getRoomData(); 
  
      floorOccupancyDetail.fetchFloorData(this.temporality.name, moment().valueOf(), startTime, endTime);
      floorOccupancyDetail.fetchSecondFloorData(moment().valueOf(), startTime, endTime, roomData); 
      floorOccupancyDetail.fetchThirdChartFloorData(moment().valueOf(), startTime, endTime);
    }
  }
async handleDateChange(newDate) {
  
  // Mettez à jour le timestamp pour la date sélectionnée
  this.currentTimestamp.valueTime = moment(newDate).valueOf();

  // Mettez à jour les graphiques globaux
  await this.spreadData();

  // Récupérer roomData
  const roomData = await getRoomData();
  if (!roomData || Object.keys(roomData).length === 0) {
    console.error("roomData est vide ou non défini.");
    return;
  }

  // Mettez à jour les graphiques par étage
  if (this.$refs.floorOccupancyDetail) {
    const floorOccupancyDetail = this.$refs.floorOccupancyDetail as Vue & {
      fetchFloorData: (period: string, timestamp: number, startTime: string, endTime: string) => void;
      fetchSecondFloorData: (timestamp: number, startTime: string, endTime: string, roomData: Record<string, string[]>) => void;
      fetchThirdChartFloorData: (timestamp: number, startTime: string, endTime: string) => void;
    };

    const timestamp = moment(newDate).valueOf();



    await floorOccupancyDetail.fetchFloorData(this.temporality.name, timestamp, this.startTime, this.endTime);
    await floorOccupancyDetail.fetchSecondFloorData(timestamp, this.startTime, this.endTime, roomData); // Passer roomData
    await floorOccupancyDetail.fetchThirdChartFloorData(timestamp, this.startTime, this.endTime);
  }
}


    async mounted() {
    try {

  
      this.selectedYear = moment().format('YYYY');
      this.defaultTimeChip = moment().format('MM/YYYY');
      this.defaultFilter = {
        name: moment().format('MMMM YYYY'),
        value: moment().format('MM/YYYY'),
        color: '#000000', 
        lock: false,
        star: true
      };
       await initializeSources(); 
      this.interval();
      this.domainList.push({name: this.selectedYear, color: '#000000'});
      this.domain = {name: this.selectedYear, color: '#000000'};
    } catch (error) {
      console.error("Erreur lors de l'initialisation des sources :", error);
    }
  }

    @Watch('temporality')
    async temporalityChange() {
    this.chart.data = [];
    this.selectedFilter = [];
    this.selectedReference = 0;
    this.defaultFilter.star = true;
  
    // Propager les plages horaires pour les graphiques globaux
    this.handleTimeChange({ startTime: this.startTime, endTime: this.endTime });
  
    // Mettre à jour les graphiques par étage
    if (this.$refs.floorOccupancyDetail) {
      const floorOccupancyDetail = this.$refs.floorOccupancyDetail as Vue & {
        fetchFloorData: (period: string, timestamp: number, startTime: string, endTime: string) => void;
        fetchSecondFloorData: (timestamp: number, startTime: string, endTime: string, roomData: Record<string, string[]>) => void;
        fetchThirdChartFloorData: (timestamp: number, startTime: string, endTime: string) => void;
      };
  
      const timestamp = moment().valueOf();
  
      // Récupérer roomData
      const roomData = await getRoomData();
  
      floorOccupancyDetail.fetchFloorData(this.temporality.name, timestamp, this.startTime, this.endTime);
      floorOccupancyDetail.fetchSecondFloorData(timestamp, this.startTime, this.endTime, roomData); // Passer roomData
      floorOccupancyDetail.fetchThirdChartFloorData(timestamp, this.startTime, this.endTime);
    }
  }

  @Watch('selectedYear')
  async selectedFilterChange(v) {
    this.weeks = [];
    for (var week = 1; week <= 52; week++) {
      var startDate = moment().year(+this.selectedYear).isoWeek(week).startOf('isoWeek').format('DD/MM/YYYY');
      var endDate = moment().year(+this.selectedYear).isoWeek(week).endOf('isoWeek').format('DD/MM/YYYY');
      var weekString = 'S' + week + ' (' + startDate + ' - ' + endDate + ')';
      this.weeks.push(weekString);
    }
  }

  @Watch('chart', { deep: true })
  emitChartChange(newChart) {
    let output: any[] = [];
    for (let c = 0; c < newChart.data.length; c++) {
      output.push({
        'Temporalité': newChart.data[c].label,
      })
      for (let i = 0; i < newChart.label.length; i++) {
        const label = ''+newChart.label[i];
        const data = newChart.data[c].data[i];
        output[c][label] = data;
      }
      const modifiedData = {
        Temporalité: output[c].Temporalité,
        ...output[c],
      };
    }
    this.$emit('chart-sent', output);
  }

    async nav(payload: number): Promise<void> {
    // Mise à jour du timestamp en fonction de la temporalité
    if (this.temporality.name === 'Journée' || this.temporality.name === 'Valeur Courante') {
      if (!this.defaultFilter.lock) {
        this.currentTimestamp = { valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'days').valueOf() };
      }
      for (let i = 0; i < this.selectedFilter.length; i++) {
        let date = moment(this.selectedFilter[i].value, 'DD/MM/YYYY');
        if (this.selectedFilter[i].lock === false) {
          date.add(payload, 'days');
        }
        this.selectedFilter[i].name = date.format('DD MMMM YYYY');
        this.selectedFilter[i].value = date.format('DD/MM/YYYY');
      }
    } else if (this.temporality.name === 'Semaine') {
      if (!this.defaultFilter.lock) {
        this.currentTimestamp = { valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'weeks').valueOf() };
      }
      for (let i = 0; i < this.selectedFilter.length; i++) {
        let date = moment(this.selectedFilter[i].value, 'WW/YYYY');
        if (this.selectedFilter[i].lock === false) {
          date.add(payload, 'weeks');
        }
        this.selectedFilter[i].name = 'S' + date.format('WW YYYY');
        this.selectedFilter[i].value = date.format('WW/YYYY');
      }
    } else if (this.temporality.name === 'Mois') {
      if (!this.defaultFilter.lock) {
        this.currentTimestamp = { valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'months').valueOf() };
      }
      for (let i = 0; i < this.selectedFilter.length; i++) {
        let date = moment(this.selectedFilter[i].value, 'MM/YYYY');
        if (this.selectedFilter[i].lock === false) {
          date.add(payload, 'months');
        }
        this.selectedFilter[i].name = date.format('MMMM YYYY');
        this.selectedFilter[i].value = date.format('MM/YYYY');
      }
    } else if (this.temporality.name === 'Trimestre') {
      if (!this.defaultFilter.lock) {
        this.currentTimestamp = { valueTime: moment(this.currentTimestamp.valueTime).add(payload * 3, 'months').valueOf() };
      }
      for (let i = 0; i < this.selectedFilter.length; i++) {
        let t = this.selectedFilter[i].value.split('/');
        let date;
        switch (t[0]) {
          case 'T1': date = moment(`01/01/${t[1]}`, 'DD/MM/YYYY'); break;
          case 'T2': date = moment(`01/04/${t[1]}`, 'DD/MM/YYYY'); break;
          case 'T3': date = moment(`01/07/${t[1]}`, 'DD/MM/YYYY'); break;
          case 'T4': date = moment(`01/10/${t[1]}`, 'DD/MM/YYYY'); break;
        }
        if (this.selectedFilter[i].lock === false) {
          date.add(payload * 3, 'months');
        }
        let currentMM = date.format('MM');
        let T = 'T' + Math.ceil(+currentMM / 3);
        this.selectedFilter[i].name = `${T} ${date.format('YYYY')}`;
        this.selectedFilter[i].value = `${T}/${date.format('YYYY')}`;
      }
    } else if (this.temporality.name === 'Année') {
      if (!this.defaultFilter.lock) {
        this.currentTimestamp = { valueTime: moment(this.currentTimestamp.valueTime).add(payload, 'years').valueOf() };
      }
      for (let i = 0; i < this.selectedFilter.length; i++) {
        let date = moment(this.selectedFilter[i].value, 'YYYY');
        if (this.selectedFilter[i].lock === false) {
          date.add(payload, 'years');
        }
        this.selectedFilter[i].name = date.format('YYYY');
        this.selectedFilter[i].value = date.format('YYYY');
      }
    }
  
    // Récupération des nouvelles données pour les graphiques globaux
    await this.spreadData();
  
    // Réappliquer les plages horaires sélectionnées pour tous les graphiques
    this.handleTimeChange({ startTime: this.startTime, endTime: this.endTime });
  
    // Mise à jour des graphiques par étage
    if (this.$refs.floorOccupancyDetail) {
      const floorOccupancyDetail = this.$refs.floorOccupancyDetail as Vue & {
        fetchFloorData: (name: string, timestamp: number, startTime: string, endTime: string) => void;
        fetchSecondFloorData: (timestamp: number, startTime: string, endTime: string) => void;
        fetchThirdChartFloorData: (timestamp: number, startTime: string, endTime: string) => void;
      };
  
      const timestamp = this.currentTimestamp.valueTime;
  
      // Mise à jour des données pour les graphiques par étage
      await floorOccupancyDetail.fetchFloorData(this.temporality.name, timestamp, this.startTime, this.endTime);
      await floorOccupancyDetail.fetchSecondFloorData(timestamp, this.startTime, this.endTime);
      await floorOccupancyDetail.fetchThirdChartFloorData(timestamp, this.startTime, this.endTime);
    }
  }
  
};

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

.MC {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  width: 100%;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  overflow-y: auto;
}

.content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.BR {
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
  background: transparent !important;
  position: absolute;
  top: 180px;
  left: 40px;
  font-size: 14px !important;
  border-radius: 10px;
  min-width: 36px !important;
  box-shadow: none;
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
  border-color: green;
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

::v-deep .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot fieldset {
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