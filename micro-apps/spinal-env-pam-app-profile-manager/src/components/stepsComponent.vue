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
  <div class="stepContent">
    <v-stepper class="stepDiv" v-model="stepperData" vertical flat>
      <v-stepper-step step="1" editable>
        Gestion d'autorisation de bâtiments
      </v-stepper-step>

      <v-stepper-content step="1">
        <table-component
          v-if="buildingsState === states.loaded"
          :headers="buildingsHeaders"
          title="Veuillez selectionner les bâtiments à autoriser"
          :items="buildingPortofolios"
          :itemToSelect="getAllItemToSelect('buildings')"
          childrenKey="buildings"
          :edit="edit"
        ></table-component>

        <v-progress-linear
          v-else
          indeterminate
          color="green"
        ></v-progress-linear>
      </v-stepper-content>

      <v-stepper-step step="2" editable>
        Gestion d'autorisation d'applications
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-expansion-panels
          v-if="apisState === states.loaded"
          class="expansionPanel"
          elevation="0"
        >
          <v-expansion-panel v-for="item in apisPortofolios" :key="item.id">
            <v-expansion-panel-header>
              {{ item.name }}
            </v-expansion-panel-header>
            <v-expansion-panel-content class="expansionContent">
              <table-component
                v-if="apisState === states.loaded"
                :headers="appsHeaders"
                title="Veuillez selectionner les routes à autoriser"
                :items="item.apis"
                :itemToSelect="getAllItemToSelect('apis', item.id)"
                childrenKey="children"
                :edit="edit"
              ></table-component>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-progress-linear
          v-else
          indeterminate
          color="green"
        ></v-progress-linear>
      </v-stepper-content>
    </v-stepper>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {Component, Prop, Watch} from 'vue-property-decorator';
import TableComponent from './tableComponent';

@Component({
  components: {
    TableComponent,
  },
})
class StepperComponent extends Vue {
  @Prop() buildingPortofolios!: any[];
  @Prop() apisPortofolios!: any[];

  @Prop() edit!: boolean;
  @Prop() profileSelected!: any;

  states = {
    loading: 0,
    loaded: 1,
  };

  buildingsState: number = this.states.loading;
  apisState: number = this.states.loading;

  stepperData: number = 1;

  appsHeaders = [
    {
      text: 'Nom',
      sortable: false,
      value: 'name',
    },
  ];

  buildingsHeaders = [
    {
      text: 'Nom',
      sortable: false,
      value: 'name',
    },
  ];

  mounted() {
    // if (this.edit && this.portofolios) this.selectItems();
  }

  // selectItems() {
  //   for (const portofolio of this.portofolios) {
  //     this._selectPortofolio(portofolio.id);
  //     // this._selectPortofolioBuilding(portofolio.id, portofolio.buildings);
  //   }
  // }

  getAllItemToSelect(type: 'apis' | 'buildings', portofolioId: string = '') {
    if (!this.edit) return [];

    return type === 'buildings'
      ? this._getBuildingsSelected()
      : this._getApisSelected(portofolioId);
  }

  _getApisSelected(portofolioId: string) {
    const portofolio = this.profileSelected.authorized.find(
      (el) => el.id === portofolioId
    );
    if (!portofolio) return [];

    return portofolio.apis.reduce((obj, item) => {
      if (obj[item.tag]) obj[item.tag].push(item.id);
      else obj[item.tag] = [item.id];

      return obj;
    }, {});
  }

  _getBuildingsSelected() {
    return this.buildingPortofolios.reduce((obj, {id}) => {
      obj[id] = this.getItemToSelect(id, 'buildings');

      return obj;
    }, {});
  }

  getItemToSelect(portofolioId: string, type: 'apis' | 'buildings'): any[] {
    if (!this.edit) return [];

    const found = this.profileSelected.authorized.find(
      (el: any) => el.id === portofolioId
    );

    if (!found) return [];

    return found[type].map((el) => el.id) || [];
  }

  createObj(liste) {
    const obj: any = {};

    for (const item of liste) {
      obj[item.id] = item;
    }

    return obj;
  }

  @Watch('buildingPortofolios')
  watchbuildingPortofolios() {
    if (this.buildingPortofolios) {
      // this.selectItems();
      this.buildingsState = this.states.loaded;
    }
  }

  @Watch('apisPortofolios')
  watchappPortofolios(value) {
    if (this.apisPortofolios) {
      // this.selectItems();
      this.apisState = this.states.loaded;
    }
  }
}

export default StepperComponent;
</script>

<style lang="scss" scoped>
.stepContent {
  width: 100%;
  height: 100%;
  .stepDiv {
    width: 100%;
    height: 100%;
    padding-bottom: 0px;
    background: transparent;
    .v-stepper__content {
      max-height: calc(100% - 130px);
    }

    .expansionPanel {
    }
    .expansionContent {
      height: 380px;
    }
  }
}
</style>
