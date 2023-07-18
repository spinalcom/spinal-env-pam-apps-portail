<template>
  <div class="spt" ref="test">
    <div class="card-title text-uppercase flex-shrink-1 pa-3" ref="selected">
      ÉTAGES SÉLECTIONNÉS
    </div>
    <div style="margin-left: 40px" ref="filter">
      <span class="card-header-text">Filtre</span>
      <div class="d-flex flex-row">
        <SmallLegend
          @toggle="gotClick"
          v-for="(level, index) in levels"
          :value="levels[index].check"
          class="pr-4" 
          :text="level.name" 
          :color="level.color" 
          :size="14"
          />
      </div>
    </div>
    <div class="flex-grow-1" style="height: 0;">
      <v-data-table
        fixed-header
        style="height: 100%; display: flex; flex-direction: column; box-shadow: none !important;"
        :headers="headers"
        loadingText="Chargement des données"
        :items="filtered"
        :items-per-page="10"
        :footer-props="{
          prevIcon: 'mdi-menu-left',
          nextIcon: 'mdi-menu-right',
          itemsPerPageText: '',
          showCurrentPage: true,
          itemsPerPageAllText: 'Toutes les lignes',
          itemsPerPageOptions: [5, 10, 15, -1],
          pageText: '',
        }"
      >
        <template v-slot:[`item.endpoints.currentValue`]="{ item }">
          <div style="display: flex; flex-direction: row" v-if="item.endpoints">
            <div
              :style="{'background': colorCode(item.endpoints.currentValue)}"
              :class="[colorCode(item.endpoints.currentValue)]"
              class="rectanlge-small"
              style="margin-right: 10px"
            ></div>
            <div>
              {{ item.endpoints.currentValue.toFixed(1) }}
              <span class="grey-color">{{ unit }}</span>
            </div>
          </div>
        </template>
       </v-data-table>
    </div>
    
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import SmallLegend from './SmallLegend.vue'
import { Prop, Vue, Watch } from 'vue-property-decorator';
import env from '../../config';
import { watch } from 'fs';



@Component({
  components: {
    SmallLegend
  },
})
class App extends Vue {
  unit = env.unit;
  columnName = env.columnName;
  levels = env.level.map((item: any) => ({ ...item, check: true }));
  colorF = Array.from( this.levels ).fill(true);
  headers = [
    {
      text: "Nom",
      align: "start",
      sortable: true,
      value: "roomName",
    },
    { text: "Étage", sortable: true, value: "floorName" },
    {
      text: this.columnName,
      align: "start",
      sortable: true,
      value: "endpoints.currentValue",
    },
  ];

  filtered: any[] = [];
  @Prop({required: true})
  data: any[];
  
  mounted() {
    for (let i = 0; i < this.data.length; i++) {
      for (let l = 0; l < this.levels.length; l++) {
        if (this.data[i].endpoints.currentValue < this.levels[l].interval.max && this.data[i].endpoints.currentValue > this.levels[l].interval.min) {
          this.data[i].currentLevel = this.levels[l].name;
        }
      }
    }
    this.filtered = this.data;
  }

  gotClick(v: any) {
    let index = this.levels.findIndex((l: any) => l.name === v.name);
    if (index !== -1) {      
      this.levels[index].check = !this.levels[index].check;
    }
    this.filtered = [];
    console.log(this.levels);
    
    for (let i = 0; i < this.data.length; i++) {      
      if (this.levels[this.levels.findIndex((e: any) => e.name === this.data[i].currentLevel)].check === true){
        this.filtered.push(this.data[i]);
      }
    }
    this.$emit('dataChange', this.filtered);
  }

  colorCode(v) {
    for (let i = 0; i < this.levels.length; i++) {
      if (v < this.levels[i].interval.max && v > this.levels[i].interval.min)
        return this.levels[i].color;
    };
  }

  @Watch('data')
  dataChange(v) {
    this.filtered = [];
    for (let i = 0; i < this.data.length; i++) {      
      if (this.levels[this.levels.findIndex((e: any) => e.name === this.data[i].currentLevel)].check === true){
        this.filtered.push(this.data[i]);
      }
    }
    this.$emit('dataChange', this.filtered);
  }

}
export default App;
</script>
<style scoped>
.spt {
  font-family: "Charlevoix Pro";
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 400px;
  flex-grow: 1;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0px 3px 10px #49545C29 !important;
  padding: 4px;
}

.card-title {
  font-family: "Charlevoix Pro";
  letter-spacing: 1.1px !important;
  color: #000000DE !important;
  font-size: 20px !important;
}

::v-deep .v-data-table__wrapper {
  flex-grow: 1;
  height: 0;
  overflow-y: auto !important;
}

.green-color {
  background-color: #11eda9;
}
.yellow-color {
  background-color: #ffe600;
}

.orange-color {
  background-color: #ffa400;
}

.red-color {
  background-color: #ff000b;
}

.rectanlge-small {
  height: 20px;
  width: 10px;

  border-radius: 3px;
}
</style>