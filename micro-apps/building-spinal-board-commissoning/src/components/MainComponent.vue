<template>
  <div class="main-container" style="min-height: 480px">
    <div class="content">
        <div class="header">
          <div class="title">
            <span>Détails des éléments connectés</span>
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
            <DotsGrid :dotsList="equipements" />
          </div>
          <div class="right-box" :style="showLeftBox ? 'width: 70%' : 'width: 100%'">
            <div class="header-left">
              <span>Détails</span>
            </div>
            <div class="stripe">
              <Stripe :stripeList="stripeData" />
            </div>

            <div class="table">
              <SpinalTable :item="formateditems" :attributeList="stripeData" :headers="dynamicHeaders" />
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

@Component({
  components: {
    SmallLegend,
    SpinalTable,
    Stripe,
    DotsGrid
  }
})
class App extends Vue {

 selectedZone: any = {}
 equipements: any[] = []
 formateditems: any[] = []
 dynamicHeaders: any[] = []
 stripeData: any[] = []
  showLeftBox: boolean = true
  async mounted (){
    this.selectedZone = this.$store.state.appDataStore.zoneSelected;
    config.bilan.dotsGrid ? this.showLeftBox = true : this.showLeftBox = false;
    const buildingId = localStorage.getItem('idBuilding')
    if(this.selectedZone.type === 'building') {
      await this.getBuildingEquipements();
    }
    else {
      await this.getFloorEquipements();
    }
  }

// Methods

async getBuildingEquipements() {
  const buildingId = localStorage.getItem('idBuilding');
  const floors = await this.$store.dispatch(ActionTypes.GET_FLOORS, {
        buildingId: buildingId,
        patrimoineId: this.selectedZone.staticId
      })

      const equipement = await this.$store.dispatch(ActionTypes.GET_BUILDING_EQUIPMENTS, {
        buildingId: buildingId,
        floors: floors
      })
          
      // const res = await this.$store.dispatch(ActionTypes.GET_CONTROL_POINT_MULTIPLE, {
      //   buildingId: buildingId,
      //   item: equipement
      // })
      this.equipements = equipement;
      this.stripeData = await this.equipements.map((item) => {
          return item.attribute
      })
      this.$store.commit(MutationTypes.SET_STRIPE_DATA, this.stripeData);
      this.$store.commit(MutationTypes.SET_DATA, this.equipements);
      
}


async getFloorEquipements() {
  const buildingId = localStorage.getItem('idBuilding');
      const floor = this.selectedZone;
      const equipement = await  this.$store.dispatch(ActionTypes.GET_FLOOR_EQUIPMENTS, {
        buildingId: buildingId,
        floor: floor
      });
      this.equipements = equipement;
      this.$store.commit(MutationTypes.SET_DATA, this.equipements);
      this.stripeData = await this.equipements.map((item) => {
          return item.attribute
      })
      this.$store.commit('SET_STRIPE_DATA', this.stripeData);
}






// Computed
  public get zoneSelected() {
    return this.$store.state.appDataStore.zoneSelected;
}



  @Watch('zoneSelected')
  async onZoneSelectedChange() {
    this.selectedZone = this.zoneSelected;

    if(this.selectedZone.type === 'building') {
      await this.getBuildingEquipements();
    }
    else {
      await this.getFloorEquipements();
    }
  }

  @Watch('equipements')
  onEquipementsChange(newVal: any[]) {
    // Headers dynamiques
    const baseHeaders = [
    { text: 'Etage', value: 'floorName', align: 'start' },
      { text: 'Nom', value: 'name', align: 'start' },
  ];

  // Ajouter les headers pour les endpoints
  const endpointHeaders = this.equipements[0].endpoints.map((endpoint: any) => ({
    text: endpoint.name,
    value: endpoint.name.toLowerCase().replace(/ /g, "-"),
    align: 'start',
    isEndpoint: true
  }));

  this.dynamicHeaders = [...baseHeaders, ...endpointHeaders];


  if (newVal.length > 0) {
    this.formateditems = newVal.map((item) => {
      const formated = { ...item };
      // Vérifier si endpoints existe avant de boucler
      (item.endpoints || []).forEach((endpoint: any) => {
        const key = endpoint.name.toLowerCase().replace(/ /g, "-");
        const type = typeof endpoint.currentValue;
   
        if(type === 'number') {
          formated[key] = endpoint.currentValue.toFixed(2);
        }
        else {
          formated[key] = `${endpoint.currentValue}`;

        }
        
      });
      return formated;
    });
  } else {
    this.formateditems = [];
  }
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
}
.main .stripe {
  width: 100%;
  height: 70px;
  background-color: #F9F9F9;
  border-radius: 5px;
}
</style>