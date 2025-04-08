<template>
  <div class="main-container" style="min-height: 480px">
    <div class="content">
      <div class="header">
        <div class="title">
          <div v-if="!sconfig.entryPoint" style="display: flex; align-items: center;">
            <span style="display: inline; width: 750px; display: flex; align-items: center;">Détails des éléments connectés sur </span>
            <SpinalbreadCrumb @loadData="loadDataContext" v-if="!sconfig.entryPoint"  :contextList="context" :categoryList="selectedZone.categoryList" :groupList="selectedZone.groupList" />
          </div>
          <div v-else>
            <span style="display: flex; align-items: center;">Détails des éléments connectés sur  {{ sconfig.entryPoint.context }} / {{  sconfig.entryPoint.category }} / {{ sconfig.entryPoint.group }}</span>
          </div>
          </div>
          <div class="legend">
            <SmallLegend :size="12" color="#14202C" text="Connecté et fonctionnel"/>
            <SmallLegend :size="12" color="#9830F2" text="Pas de convention de nommage"/>
            <SmallLegend :size="12" color="#EF8BC5" text="Convention de nommage incorrect"/>          
            <SmallLegend :size="12" color="#FF000B" text="Données incohérentes"/>
            <SmallLegend :size="12" color="#898F95" text="Données non remontées / champ indéfini"/>
          </div>
        </div>

        <div class="main">
          <div class="left-box" v-if="showLeftBox">
            <DotsGrid :dotsList="ItemList" />
          </div>
          <div class="right-box" :style="showLeftBox ? 'width: 70%' : 'width: 100%'">
            <div class="header-left">
              <span>Analyse par {{ statisticTimeline.setup.type }} sur {{ statisticSource.name }} </span> :
              <span style="background-color: #f2f2f2 ; padding: 4px; color: #14202C; font-weight: 700; border-radius: 5px;" class="ml-2">
                <span>{{ statisticTimeline.setup.value }}</span>
              </span>
              <template>
  <v-row class="ml-2">
    <v-dialog
      v-model="editedregex"
      persistent
      max-width="290"
    >
      <template v-slot:activator="{ on, attrs }">
       <v-icon v-bind="attrs" v-on="on">mdi-pencil-box</v-icon>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">Modifier la Regex</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-select
                v-model="statisticSource.name"
                :items="sources.map((src) => src.name)"
                label="Colonne"
                text-value="id"
                outlined
                dense
              ></v-select>
              <v-text-field
                v-model="statisticTimeline.setup.value"
                label="Regex"
                outlined
                dense
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="editedregex = false"
          >
            Annuler
          </v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="changeRegex"
          >
            Valider
          </v-btn>
        </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </template>
            </div>
            <div class="stripe">
              <Stripe :stripeList="stripeData" />
            </div>

            <div class="table">
              <SpinalTable :item="formateditems" :headers="dynamicHeaders" />
            </div>
          </div>
        </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import { Prop, Vue, Watch } from 'vue-property-decorator';
import SmallLegend from './SmallLegend.vue';
import SpinalTable from './SpinalTable.vue';
import { ActionTypes } from '../interfaces/vuexStoreTypes';
import Stripe from './Stripe.vue';
import DotsGrid from './DotsGrid.vue';
import { config } from '../../config';
import { MutationTypes } from '../services/store/appDataStore/mutations';
import SpinalbreadCrumb from './SpinalbreadCrumb.vue';
import { getContext, getDataInContextSpatial } from '../services';
@Component({
  components: {
    SmallLegend,
    SpinalTable,
    Stripe,
    DotsGrid,
    SpinalbreadCrumb,
  }
})
class App extends Vue {

  @Prop({type: Array, default: [], required: true}) items: any[];

 selectedZone: any = {}
 ItemList: any[] = []
 formateditems: any[] = []
 dynamicHeaders: any[] = []
 stripeData: any[] = []
 showLeftBox: boolean = true
 editedregex: boolean = false
  statisticTimeline = config.bilan.timeline;
  sources = config.sources;
  statisticSource = config.sources.find((src) => src.id === config.bilan.timeline.sourceId);
  sconfig = config;
  context = [];
  showLoader = true;

  async mounted (){
    const buildingId = localStorage.getItem('idBuilding');
    const context = await getContext(buildingId!);
    this.context = context;
    this.selectedZone = this.$store.state.appDataStore.zoneSelected;
    this.showLeftBox = config.bilan.dotsGrid ? true : false;
  }

// Methods

async getDataItem(newVal: any = this.items) {
  const buildingId: string = localStorage.getItem('idBuilding') as string;
  this.ItemList = newVal;
    const baseHeaders = [
    { text: 'Etage', value: 'info.floor.name', align: 'start' },
      { text: 'Nom', value: 'name', align: 'start' },
  ];
  if(this.ItemList.length > 0) {
    const endpoints = this.ItemList[0].sources || [];
    const sourceFiltered = config.sources.find((src) => src.id === this.statisticTimeline.sourceId);
    const endpointHeaders = endpoints.map((endpoint: any) => ({
      text: endpoint.name,
      value: endpoint.name.toLowerCase().replace(/ /g, "-"),
      align: 'start',
      isEndpoint: true,
      filterable: endpoint.name.toLowerCase() === sourceFiltered?.name.toLocaleLowerCase() ? true: false
    }));
    this.dynamicHeaders = [...baseHeaders, ...endpointHeaders];
  } else {
    this.dynamicHeaders = baseHeaders;
  }

  // Ajouter les headers pour les endpoints
  // const endpointHeaders = this.ItemList.sources.map((endpoint: any) => ({
  //   text: endpoint.name,
  //   value: endpoint.name.toLowerCase().replace(/ /g, "-"),
  //   align: 'start',
  //   isEndpoint: true
  // }));

  // this.dynamicHeaders = [...baseHeaders, ...endpointHeaders];


  if (newVal.length > 0) {
    this.formateditems = newVal.map((item) => {
      const formated = { ...item };
      // Vérifier si endpoints existe avant de boucler
      (item.sources || []).forEach((endpoint: any) => {
        const key = endpoint.name.toLowerCase().replace(/ /g, "-");
        const type = typeof endpoint.value;
   
        if(type === 'number') {
          formated[key] = endpoint.value.toFixed(2);
        }
        else {
          formated[key] = `${endpoint.value}`;

        }
        
      });
      return formated;
    });
  } else {
    this.formateditems = [];
  }

      this.$store.commit(MutationTypes.SET_STRIPE_DATA, this.stripeData);
      
}



changeRegex() {
  this.editedregex = false;

  
  this.getDataItem();
}

async loadDataContext(){
  const buildingId = localStorage.getItem('idBuilding');
  const context = this.$store.state.appDataStore.context;
  const categories = this.$store.state.appDataStore.categoriesContext;
  const groupEquipement = this.$store.state.appDataStore.groupContext;

  await getDataInContextSpatial(buildingId!, this.selectedZone.name, this.selectedZone.type)
}




// Computed
  public get zoneSelected() {
    return this.$store.state.appDataStore.zoneSelected;
}



  @Watch('zoneSelected')
  async onZoneSelectedChange() {
    this.selectedZone = this.zoneSelected;
    await this.getDataItem();
  }

  @Watch('items')
  onEquipementsChange(newVal: any[]) {
    // Headers dynamiques
    this.getDataItem(newVal);
}

}
export default App;
</script>

<style scoped>
.main-container {
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
.content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0px;
  gap: 10px;
  background: #F9F9F9;
  border: 1px solid #F7F7F7;
  box-shadow: 0px 3px 10px rgba(73, 84, 92, 0.16);
  border-radius: 10px;
  width: 100%;
  flex: none;
  order: 0;
  align-self: stretch;
  flex-grow: 0;
  overflow-y: hidden;
}
.header {
  width: 100%;
  min-height: 25px;
  padding: 10px;
  padding-left: 25px;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

}
.header .legend {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}
.header > .title {
text-align: left;
font: normal normal normal 11px/13px Charlevoix Pro;
letter-spacing: 1.1px;
color: #214353;
opacity: 1;
text-transform: uppercase;
padding-top: 10px;
display: flex;

}
.main {
  width: 100%;
  height: calc(100% - 45px);
  display: flex;
  flex-direction: row;
  align-items: start;
  padding: 10px;
  gap: 20px;
  overflow: hidden;
}
.main > .left-box {
  width: 30%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 5px;
}
.main > .right-box {
  box-sizing: border-box;
  width: 70%;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 5px;
  border: 1px solid #F9F9F9;
  align-self: stretch;
  flex: none;
  flex-grow: 1;
}
.main > .right-box .header-left {
  width: 100%;
  height: 40px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: #ffffff;
  border-bottom: #F9F9F9 1px solid;
  font: normal normal normal 11px/13px Charlevoix Pro;
  letter-spacing: 1.1px;
  color: #214353;
  opacity: 1;
  padding: 10px;
  text-transform: uppercase;

}
.main > .right-box .table {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 400px;
  padding: 0 10px;
  gap: 1px;
  flex: none;
  order: 2;
  align-self: stretch;
  flex-grow: 1;
  padding-top: 20px;
  background-color: #ffffff;
  overflow: hidden;
  overflow-y: auto;
  position: relative;
}
.main .stripe {
  width: 100%;
  height: 70px;
  background-color: #F9F9F9;
  border-radius: 5px;
}
</style>