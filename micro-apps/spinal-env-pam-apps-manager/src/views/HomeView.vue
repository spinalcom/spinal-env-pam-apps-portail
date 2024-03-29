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
  <div class="mainContent">
    <AppListComponent :categorySelected="categorySelected"
                      :apps="apps"
                      @select="selectCategory"
                      @create="goToCreationPage"
                      @upload="uploadApp"
                      @edit="goToCreationPage"
                      @delete="deleteApp"
                      v-if="page === pages.list" />

    <CreationComponent v-else-if="page === pages.creation"
                       @create="createApp"
                       @edit="editApp"
                       @cancel="cancelCreation"
                       :edit="edition"
                       :title="title"
                       :appSelected="appSelected" />

    <LoadingComponent v-else-if="page === pages.loading" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { Action, State } from "vuex-class";
import AppListComponent from "../components/appsComponent.vue";
import LoadingComponent from "../components/loading.vue";
import CreationComponent from "../components/creation.vue";
import categories from "../store/data";
import { IApp } from "../types/interfaces";
import { sendEventToParent } from "../event";
type updateFunc = ({
  id,
  newValue,
}: {
  id: string;
  newValue: IApp;
}) => Promise<void>;

type creationFunc = (app: IApp) => Promise<void>;

@Component({
  components: {
    AppListComponent,
    LoadingComponent,
    CreationComponent,
  },
})
class HomeView extends Vue {
  pages = Object.freeze({
    list: 1,
    creation: 2,
    loading: 3,
  });

  edition: boolean = false;
  appSelected: IApp = null;

  page: number = this.pages.list;
  categorySelected: any = null;
  apps: IApp[] = [];

  @State portofolioApps!: IApp[];
  @State buildingApps!: IApp[];
  @State adminApps!: IApp[];

  @Action getAllPortofolioApps!: () => Promise<void>;
  @Action getAllBuildingApps!: () => Promise<void>;
  @Action getAllAdminApps!: () => Promise<void>;
  @Action createPortofolioApps!: creationFunc;
  @Action createBuildingApps!: creationFunc;
  @Action createAdminApps!: creationFunc;

  @Action deletePortofolioApp!: (id: string) => Promise<void>;
  @Action deleteBuildingApp!: (id: string) => Promise<void>;
  @Action deleteAdminApp!: (id: string) => Promise<void>;

  @Action updatePortofolioApp!: updateFunc;
  @Action updateBuildingApp!: updateFunc;
  @Action updateAdminApp!: updateFunc;

  @Action uploadPortofolioFile!: (file: FormData) => Promise<void>;
  @Action uploadAdminFile!: (file: FormData) => Promise<void>;
  @Action uploadBuildingFile!: (file: FormData) => Promise<void>;

  async mounted() {
    this.page = this.pages.loading;

    await Promise.all([
      this.getAllPortofolioApps(),
      this.getAllBuildingApps(),
      this.getAllAdminApps(),
    ]);

    this.page = this.pages.list;
    const selected = this.categorySelected || categories.portofolio;
    this.selectCategory(selected);
  }

  selectCategory(item?: any) {
    this.categorySelected = item;

    switch (item.id) {
      case categories.portofolio.id:
        this.apps = this.portofolioApps;
        break;

      case categories.bos.id:
        this.apps = this.buildingApps;
        break;

      case categories.admin.id:
        this.apps = this.adminApps;
        break;

      default:
        this.apps = [];
        break;
    }
  }

  goToCreationPage(item: IApp) {
    if (item) {
      this.edition = true;
      this.appSelected = item;
    }

    this.page = this.pages.creation;
  }

  async createApp(appInfo: IApp) {
    if (typeof appInfo.icon !== "string" && (<any>appInfo.icon).name)
      appInfo.icon = `mdi-${(<any>appInfo.icon).name}`;

    let isSuccess;
    try {
      this.page = this.pages.loading;

      switch (this.categorySelected.id) {
        case categories.portofolio.id:
          await this.createPortofolioApps(appInfo);
          break;

        case categories.bos.id:
          await this.createBuildingApps(appInfo);
          break;

        case categories.admin.id:
          await this.createAdminApps(appInfo);
          break;
      }
      isSuccess = true;
    } catch (error) {
      isSuccess = false;
    }

    this.page = this.pages.list;
    this.$swal({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      icon: isSuccess ? "success" : "error",
      text: isSuccess
        ? "application ajoutée"
        : "oups, une erreur s'est produite !",
    });
    sendEventToParent("reload_portofolio");
  }

  uploadApp() {
    const maxSize = 25000000;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = false;
    input.click();
    input.addEventListener(
      "change",
      (event: any) => {
        const [file] = event.target.files;
        if (file.size >= maxSize) {
          alert(
            "The selected file is too large. The maximum size must not exceed 25 MB"
          );
          return;
        }
        if (!/.*\.xlsx$/.test(file.name)) {
          alert("The selected file must an excel file");
          return;
        }
        var formData = new FormData();
        formData.append("file", file);
        this.uploadFile(formData);
      },
      false
    );
  }

  async uploadFile(formData: FormData) {
    let isSuccess;
    try {
      this.page = this.pages.loading;

      switch (this.categorySelected.id) {
        case categories.portofolio.id:
          await this.uploadPortofolioFile(formData);
          break;

        case categories.bos.id:
          await this.uploadBuildingFile(formData);
          break;

        case categories.admin.id:
          await this.uploadAdminFile(formData);
          break;
      }
      isSuccess = true;
    } catch (error) {
      isSuccess = false;
    }

    this.page = this.pages.list;
    this.$swal({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      icon: isSuccess ? "success" : "error",
      text: isSuccess ? "fichier ajouté" : "oups, une erreur s'est produite !",
    });

    sendEventToParent("reload_portofolio");
  }

  async editApp(item: IApp) {
    const id: any = this.appSelected.id;
    let isSuccess;
    try {
      this.page = this.pages.loading;

      switch (this.categorySelected.id) {
        case categories.portofolio.id:
          await this.updatePortofolioApp({ id, newValue: item });
          break;

        case categories.bos.id:
          await this.updateBuildingApp({ id, newValue: item });
          break;

        case categories.admin.id:
          await this.updateAdminApp({ id, newValue: item });
          break;
      }
      isSuccess = true;
    } catch (error) {
      isSuccess = false;
    }

    this.page = this.pages.list;
    this.$swal({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      icon: isSuccess ? "success" : "error",
      text: isSuccess
        ? "application modifiée"
        : "oups, une erreur s'est produite !",
    });

    sendEventToParent("reload_portofolio");
  }

  deleteApp(item: IApp) {
    return this.$swal({
      title: "Supprimer",
      text: `Êtes-vous sûre de vouloir supprimer ${item.name} ?`,
      type: "warning",
      showCancelButton: true,
      confirmButtonClass: "successBtn",
      cancelButtonClass: "errorBtn",
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
      buttonsStyling: false,
      icon: "warning",
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.page = this.pages.loading;
        let isSuccess;
        try {
          switch (this.categorySelected.id) {
            case categories.portofolio.id:
              await this.deletePortofolioApp(<any>item.id);
              break;

            case categories.bos.id:
              await this.deleteBuildingApp(<any>item.id);
              break;

            case categories.admin.id:
              await this.deleteAdminApp(<any>item.id);
              break;
          }
          isSuccess = true;
        } catch (error) {
          isSuccess = false;
        }

        this.page = this.pages.list;

        this.$swal({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          icon: isSuccess ? "success" : "error",
          text: isSuccess
            ? "Application supprimée"
            : "oups, une erreur s'est produite !",
        });
        sendEventToParent("reload_portofolio");
      }
    });
  }

  cancelCreation() {
    this.edition = false;
    this.page = this.pages.list;
  }

  get title() {
    if (!this.categorySelected) return "";

    if (this.edition) return "Modifier une application";

    const begin = "Créer une application";
    switch (this.categorySelected.id) {
      case categories.portofolio.id:
        return `${begin} de portofolio`;
      case categories.bos.id:
        return `${begin} de batiment`;

      case categories.admin.id:
        return `${begin} d'administration`;
    }
  }

  @Watch("portofolioApps")
  watch_portofolioApps() {
    if (
      this.categorySelected &&
      this.categorySelected.id === categories.portofolio.id
    ) {
      this.apps = this.portofolioApps;
    }
  }

  @Watch("buildingApps")
  watch_buildingApps() {
    if (this.categorySelected && this.categorySelected.id === categories.bos.id)
      this.apps = this.buildingApps;
  }

  @Watch("adminApps")
  watch_adminApps() {
    if (
      this.categorySelected &&
      this.categorySelected.id === categories.admin.id
    ) {
      this.apps = this.adminApps;
    }
  }
}

export default HomeView;
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
// $header-height: 70px;
// $header-margin: 10px;
// $card-background: #f8f9f9;

.mainContent {
  width: 100%;
  height: 100%;
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