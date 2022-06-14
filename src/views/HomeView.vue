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
                       :categories="categoriesDisplayed" />
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
import Vue from "vue";
import { groups, categories } from "./data";
import GridComponent from "../components/gridComponent.vue";
import * as lodash from "lodash";

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
      groups: groups,
      categoriesDisplayed: categories,
      selects: [],
    };
  },
  created() {
    this.debounceFilter = lodash.debounce(this.filterCategories, 400);
  },
  mounted() {
    this.selects = [
      this.defaultCategory,
      ...categories.map((el) => {
        el.name = el.name || el.name;
        el.value = el.value || el.name;
        return el;
      }),
    ];
  },
  methods: {
    filterCategories() {
      this.categoriesDisplayed = categories.reduce((liste, item) => {
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
  },
  watch: {
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
.appContainer .favorisBtn i {
  font-size: 15px;
}
</style>