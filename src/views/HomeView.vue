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
  <v-container class="appContainer"
               fluid>
    <div class="header">
      <div class="description">
        <p>Consultez toutes les données de vos bâtiments connectés.</p>
        <p>Vous pouvez garder en favoris une visualisation en cliquant sur
          <v-btn outlined
                 small
                 disabled
                 class="favorisBtn">
            <v-icon>mdi-cards-diamond</v-icon>
          </v-btn>
        </p>
      </div>

      <v-row class="search">
        <v-col cols="8"
               class="searchCol">
          <v-text-field solo
                        flat
                        placeholder="rechercher"
                        prepend-inner-icon="mdi-magnify"
                        v-model="filtersData.search">
          </v-text-field>
        </v-col>
        <v-col cols="4">
          <v-select solo
                    flat
                    v-model="filtersData.category"
                    append-icon=""
                    prepend-inner-icon="mdi-chevron-down"
                    :items="selects"
                    item-text="name"
                    item-value="value"
                    label="Select"
                    persistent-hint
                    return-object
                    single-line></v-select>
        </v-col>

      </v-row>
    </div>

    <v-layout class="apps">
      <v-flex style="overflow: auto">
        <GridComponent :groups="groups"
                       :categories="categoriesDisplayed"
                       @goToApp="goToApp"
                       @exploreApp="exploreApp"
                       @addAppToFavoris="addAppToFavoris" />
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
import Vue from "vue";
// import { groups, categories } from "./data";
import GridComponent from "../components/gridComponent.vue";
import * as lodash from "lodash";
import { mapActions, mapState } from "vuex";

export default Vue.extend({
  name: "Home",
  components: {
    GridComponent,
  },
  data() {
    this.defaultCategory = {
      name: "Toutes les categories",
      value: "",
    };
    return {
      filtersData: {
        category: this.defaultCategory,
        search: "",
      },
      groups: [],
      categories: [],
      categoriesDisplayed: [],
      selects: [],
    };
  },
  created() {
    this.debounceFilter = lodash.debounce(this.filterCategories, 400);
  },
  async mounted() {
    // await this.init();
    // this.filterCategories();
    // this.selects = [
    //   this.defaultCategory,
    //   ...categories.map((el) => {
    //     el.name = el.name || el.name;
    //     el.value = el.value || el.name;
    //     return el;
    //   }),
    // ];
  },
  methods: {
    // ...mapActions("userDataStore", ["getApps", "getBos"]),

    init() {
      return Promise.all([this.getApps(), this.getBos()]);
    },
    filterCategories() {
      this.categoriesDisplayed = this.categories.reduce((liste, item) => {
        const categoryName = this.filtersData.category.value;
        if (categoryName && categoryName !== item.name) return liste;
        const searchData = this.filtersData.search.toLowerCase();
        let appsItem = !searchData ? item : this.filterApps(searchData, item);

        liste.push(appsItem);
        return liste;
      }, []);
    },

    filterApps(searchText, item) {
      let obj = {};
      for (const key in item) {
        if (Object.hasOwnProperty.call(item, key)) {
          const value = item[key];

          obj[key] =
            typeof value === "string"
              ? value
              : value.filter((el) =>
                  el.name.toLowerCase().includes(searchText.toLowerCase())
                );
        }
      }

      return obj;
    },

    goToApp(item) {
      this.$router.push({ name: "App", query: { id: item.id }, params: item });
    },
    exploreApp(item) {
      console.log("exploreApp", item);
    },
    addAppToFavoris(item) {
      console.log("addAppToFavoris", item);
    },
  },
  computed: {
    ...mapState("userDataStore", ["appsFormatted"]),
  },
  watch: {
    appsFormatted({ data, groups }) {
      this.groups = groups;
      this.categories = data;
      this.filterCategories();
      this.selects = [
        this.defaultCategory,
        ...data.map((el) => {
          el.name = el.name || el.name;
          el.value = el.id || el.name;
          return el;
        }),
      ];
    },
    "filtersData.category": function () {
      this.filterCategories();
    },

    "filtersData.search": function () {
      this.debounceFilter();
    },
  },
});
</script>


<style scoped>
.appContainer {
  width: 100%;
  height: 100%;
  padding: 0px;
}

.appContainer .header {
  width: 50%;
  height: 150px;
}

.appContainer .header .description {
  margin-bottom: 20px;
}

.appContainer .header .description p {
  margin-bottom: 0px;
}

.appContainer .header .search .searchCol {
  padding-right: 0px;
}

.appContainer .apps {
  width: 100%;
  height: calc(100% - 150px);
}

.appContainer .favorisBtn {
  min-width: unset !important;
  width: 35px;
  height: 35px !important;
  border-radius: 10px;
}
</style>

<style>
/* .appContainer
  .header
  .v-text-field.v-text-field--enclosed
  .v-text-field__details,
.v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
  > .v-input__control
  > .v-input__slot {
  position: unset;
} */

.appContainer .favorisBtn i {
  font-size: 15px;
}
</style>