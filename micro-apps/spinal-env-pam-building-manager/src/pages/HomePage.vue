<!--
Copyright 2022 SpinalCom - www.spinalcom.com

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
  <v-container class="homeContainer"
               fluid>
    <HomeView v-if="page === pages.list"
              @createPortofolio="goToCreationPage"
              @editPortofolio="goToEditPage"
              @deletePortofolio="deletePortofolio"
              @addBuilding="goToAddBuildingPage"
              @editBuilding="goToEditBuildingPage"
              @deleteBuilding="deleteBuilding" />

    <PortofolioCreation v-else-if="page === pages.creation"
                        :edit="edition"
                        @cancel="goToListPage"
                        @save="createPortofolio"
                        @edit="editPortofolio"
                        :portofolioSelected="portofolioSelected" />

    <BuildingCreation v-else-if="page === pages.addBuilding"
                      :edit="edition"
                      :portofolioSelected="portofolioSelected"
                      :buildingSelected="buildingSelected"
                      @save="addBuilding"
                      @cancel="goToListPage"
                      @edit="editBuilding" />

    <div class="content loadingContent"
         v-else-if="page === pages.loading">
      <v-progress-circular :size="70"
                           color="primary"
                           indeterminate></v-progress-circular>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { IBuilding, IPortofolio } from "../interfaces/IBuilding";
import { IPortofolioCreation } from "../interfaces/IPortofolioCreation";

import HomeView from "../views/HomeView.vue";
import PortofolioCreation from "../views/portofolio/PortofolioCreationView.vue";
import BuildingCreation from "../views/buildings/addBuildingView.vue";
import { sendEventToParent } from "../event";

// const portofolioModule = namespace("portofolioStore");

@Component({
  name: "HomePage",
  components: {
    HomeView,
    PortofolioCreation,
    BuildingCreation,
  },
})
class HomePage extends Vue {
  pages = Object.freeze({
    list: 0,
    loading: 1,
    creation: 2,
    error: 3,
    addBuilding: 4,
  });
  page: number = this.pages.list;

  edition: boolean = false;
  portofolioSelected: IPortofolio = null;
  buildingSelected: IPortofolio = null;

  async mounted() {}

  // change page
  goToCreationPage() {
    this.edition = false;
    this.page = this.pages.creation;
  }

  goToEditPage(item: IPortofolio) {
    this.edition = true;
    this.portofolioSelected = item;
    this.page = this.pages.creation;
  }

  goToLoadingPage() {
    this.page = this.pages.loading;
  }

  goToListPage() {
    this.edition = false;
    this.page = this.pages.list;
  }

  goToAddBuildingPage(item: IPortofolio) {
    this.edition = false;
    this.portofolioSelected = item;
    this.page = this.pages.addBuilding;
  }

  goToEditBuildingPage({ portofolio, building }: any) {
    this.edition = true;
    this.portofolioSelected = portofolio;
    this.buildingSelected = building;
    this.page = this.pages.addBuilding;
  }

  // CRUD
  async createPortofolio(data: IPortofolioCreation) {
    await this.toastWithCallback(
      "Portefeuille Ajouté",
      "oups, une erreur s'est produite !",
      async () => {
        await this.$store.dispatch("portofolioStore/createPortofolio", data);
        sendEventToParent("reload_portofolio");
      }
    );

    // let isSuccess;
    // try {
    //   this.goToLoadingPage();
    //   await this.$store.dispatch("portofolioStore/createPortofolio", data);
    //   isSuccess = true;
    // } catch (error) {
    //   isSuccess = false;
    // }

    // this.goToListPage();
    // let text = isSuccess
    //   ? "Portefolio Ajouté"
    //   : "oups, une erreur s'est produite !";
    // this.toast(text, isSuccess);
  }

  async editPortofolio(data: any) {
    await this.toastWithCallback(
      "Portefeuille mis à jour",
      "oups, une erreur s'est produite !",
      async () => {
        await this.$store.dispatch("portofolioStore/editPortofolio", data);
        sendEventToParent("reload_portofolio");
      }
    );
    // let isSuccess;
    // try {
    //   this.goToLoadingPage();
    //   await this.$store.dispatch("portofolioStore/editPortofolio", data);
    //   isSuccess = true;
    // } catch (error) {
    //   isSuccess = false;
    // }

    // this.goToListPage();
    // let text = isSuccess
    //   ? "Portefolio mis à jour"
    //   : "oups, une erreur s'est produite !";
    // this.toast(text, isSuccess);
  }

  deletePortofolio(item: IPortofolio) {
    return this.$swal({
      title: "Supprimer",
      text: `Êtes-vous sûre de vouloir supprimer ce Portefeuille ?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "successBtn",
      cancelButtonClass: "errorBtn",
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
      buttonsStyling: false,
      icon: "warning",
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      let success;

      try {
        this.goToLoadingPage();
        await this.$store.dispatch("portofolioStore/removePortofolio", item.id);
        success = true;
      } catch (error) {
        success = false;
      }

      this.goToListPage();

      let text = success
        ? "Portefeuille supprimé"
        : "oups, une erreur s'est produite !";
      this.toast(text, success);
      sendEventToParent("reload_portofolio");
    });
  }

  // Building
  async addBuilding(data: { portofolioId: string; building: IBuilding }) {
    await this.toastWithCallback(
      "batiment ajouté",
      "oups, une erreur s'est produite !",
      async () => {
        await this.$store.dispatch(
          "portofolioStore/addBuildingToPortofolio",
          data
        );
        sendEventToParent("reload_portofolio");
      }
    );
    // let isSuccess;
    // try {
    //   this.goToLoadingPage();

    //   await this.$store.dispatch(
    //     "portofolioStore/addBuildingToPortofolio",
    //     data
    //   );
    //   isSuccess = true;
    // } catch (error) {
    //   isSuccess = false;
    // }

    // this.goToListPage();
    // let text = isSuccess
    //   ? "batiment ajouté"
    //   : "oups, une erreur s'est produite !";
    // this.toast(text, isSuccess);
  }

  viewOnMap(item: IBuilding) {}

  async editBuilding(data: {
    portofolioId: string;
    buildingId: string;
    data: any;
  }) {
    await this.toastWithCallback(
      "batiment modifié",
      "oups, une erreur s'est produite !",
      async () => {
        await this.$store.dispatch("portofolioStore/editBuilding", data);
        sendEventToParent("reload_portofolio");
      }
    );

    // // let isSuccess;
    // // try {
    // //   this.goToLoadingPage();

    // //   await this.$store.dispatch("portofolioStore/editBuilding", data);
    // //   isSuccess = true;
    // // } catch (error) {
    // //   isSuccess = false;
    // // }

    // // this.goToListPage();
    // // let text = isSuccess
    // //   ? "batiment ajouté"
    // //   : "oups, une erreur s'est produite !";
    // // this.toast(text, isSuccess);
  }

  deleteBuilding({
    portofolio,
    building,
  }: {
    portofolio: IPortofolio;
    building: any;
  }) {
    return this.$swal({
      title: "Supprimer",
      text: `Êtes-vous sûre de vouloir supprimer ce bâtiment ?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "successBtn",
      cancelButtonClass: "errorBtn",
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
      buttonsStyling: false,
      icon: "warning",
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      let success;

      try {
        this.goToLoadingPage();
        await this.$store.dispatch("portofolioStore/deleteBuilding", {
          portofolioId: portofolio.id,
          buildingId: building.id,
        });
        success = true;
      } catch (error) {
        success = false;
      }

      this.goToListPage();

      let text = success
        ? "bâtiment supprimé"
        : "oups, une erreur s'est produite !";
      this.toast(text, success);
      sendEventToParent("reload_portofolio");
    });
  }

  // Another

  async toastWithCallback(
    successMessage: string,
    errorMessage: string,
    callback: () => Promise<any>
  ) {
    let isSuccess;
    try {
      this.goToLoadingPage();
      await callback();
      isSuccess = true;
    } catch (error) {
      isSuccess = false;
    }

    this.goToListPage();
    let text = isSuccess ? successMessage : errorMessage;
    this.toast(text, isSuccess);
  }

  toast(text: string, isSuccess: boolean = true) {
    this.$swal({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      icon: isSuccess ? "success" : "error",
      text: text,
    });
  }
}

export default HomePage;
</script>

<style scoped lang="scss">
.homeContainer {
  width: 100vw;
  height: 100vh;
  margin: 0px !important;
  padding: 0px !important;
  display: flex;

  .content.loadingContent {
    width: 100%;
    height: 98vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>

<style>
.successBtn {
  width: 60px !important;
  height: 40px;
  border: 1px solid green;
  color: green;
  border-radius: 5px;
  margin: 5px;
}

.errorBtn {
  width: 75px !important;
  height: 40px;
  border: 1px solid #ff5252;
  color: #ff5252;
  border-radius: 5px;
  margin: 5px;
}
</style>