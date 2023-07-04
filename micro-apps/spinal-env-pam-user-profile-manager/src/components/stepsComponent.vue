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
        <table-component
          v-if="appsState === states.loaded"
          :headers="appsHeaders"
          title="Veuillez selectionner les applications à autoriser"
          :items="appsPortofolios"
          :itemToSelect="getAllItemToSelect('apps')"
          childrenKey="apps"
          :edit="edit"
        ></table-component>

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
  @Prop() appsPortofolios!: any[];

  @Prop() edit!: boolean;
  @Prop() profileSelected!: any;

  states = {
    loading: 0,
    loaded: 1,
  };

  buildingsState: number = this.states.loading;
  appsState: number = this.states.loading;

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

  getAllItemToSelect(type: 'apps' | 'buildings') {
    const portofolios =
      type === 'apps' ? this.appsPortofolios : this.buildingPortofolios;

    return portofolios.reduce((obj, {id}) => {
      obj[id] = this.getItemToSelect(id, type);

      return obj;
    }, {});
  }

  getItemToSelect(portofolioId: string, type: 'apps' | 'buildings'): any[] {
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

  @Watch('appsPortofolios')
  watchappPortofolios(value) {
    if (this.appsPortofolios) {
      // this.selectItems();
      this.appsState = this.states.loaded;
    }
  }
}

export default StepperComponent;
</script>

<style lang="scss">
.stepContent {
  width: 100%;
  height: 100%;
  .stepDiv {
    background: transparent !important;
  }
}
</style>
