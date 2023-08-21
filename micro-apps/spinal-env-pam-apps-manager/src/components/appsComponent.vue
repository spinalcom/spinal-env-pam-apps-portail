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
  <div class="_content">
    <div class="app_header">
      <!-- <Select @selected="selectCategory" /> -->
    </div>

    <v-card class="cardContent" elevation="4">
      <v-tabs
        class="tabsHeader"
        v-model="tab"
        background-color="transparent"
        color="primary"
        grow
      >
        <v-tab v-for="item in tabItems" :key="item">
          {{ item }}
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab" class="tabsItems">
        <v-tab-item>
          <app-list-component
            :apps="portofolioApps"
            @create="createApp"
            @upload="uploadApp"
            @edit="editApp"
            @delete="deleteApp"
          />
        </v-tab-item>

        <v-tab-item>
          <app-list-component
            :apps="adminApps"
            @create="createApp"
            @upload="uploadApp"
            @edit="editApp"
            @delete="deleteApp"
          />
        </v-tab-item>
      </v-tabs-items>

      <!-- <app-list-component
        :apps="apps"
        :category="categorySelected"
        @create="createApp"
        @upload="uploadApp"
        @edit="editApp"
        @delete="deleteApp"
      /> -->
    </v-card>
  </div>
</template>

<script lang="ts">
import {IApp} from '../types/interfaces';
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import AppListComponent from '../components/appList.vue';
import Select from '../components/select.vue';
import categories from '../store/data';

@Component({
  components: {
    AppListComponent,
    Select,
  },
})
class HomeView extends Vue {
  @Prop() categorySelected!: {name: string; id: string};
  @Prop() portofolioApps!: IApp[];
  @Prop() adminApps!: IApp[];
  // @Prop() apps!: IApp[];

  tabsObject = Object.freeze({
    portofolio: 'Applications Patrimoniales',
    admin: "Applications d'adminstration",
  });

  tabItems: string[] = Object.values(this.tabsObject);
  tab = this.tabsObject.portofolio;

  selectCategory(item: {name: string; id: string}) {
    this.$emit('select', item);
  }

  createApp() {
    this.$emit('create');
  }

  uploadApp() {
    this.$emit('upload');
  }

  editApp(app: IApp) {
    this.$emit('edit', app);
  }

  deleteApp(app: IApp) {
    this.$emit('delete', app);
  }

  @Watch('tab')
  watchTab() {
    const key = Object.keys(this.tabsObject)[this.tab];
    const t = categories[key];
    this.selectCategory(t);

    // switch (this.tabItems[this.tab]) {
    // case this.tabsObject.Batiments:
    // this.selectCategory(t);
    // break;

    // case this.tabsObject.Adminstration:
    // const ca = categories[this.tab]
    // this.selectCategory(t);
    // break;
    // }
  }
}

export default HomeView;
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
$header-height: 70px;
$header-margin: 10px;
$card-background: #f8f9f9;

._content {
  width: 100%;
  height: 100%;

  .app_header {
    height: $header-height;
    margin-bottom: $header-margin;
    // display: flex;
    // align-items: center;
    // justify-content: flex-end;
    // .head {
    //   width: 500px;
    //   height: 100%;
    // }
  }

  .cardContent {
    width: 98%;
    height: calc(
      100% - #{$header-height+ $header-margin + $header-margin + 10px}
    );
    margin: auto;
    background: transparent !important;
    border-radius: 10px;
    padding: 10px;

    .tabsHeader {
      width: 100%;
      height: 50px;
    }

    .tabsItems {
      width: 100%;
      height: calc(100% - 50px);
      overflow: auto;
      background: transparent !important;
    }
  }
}
</style>
