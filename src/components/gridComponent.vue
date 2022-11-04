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
  <v-data-table fixed-header
                class="dataTable"
                dense
                disable-pagination
                hide-default-footer
                :headers="headers"
                :items="categories"
                height="100%"
                :style="getWidth">
    <template v-slot:body="{ items }">
      <tr v-for="(item, index) in items"
          class="categoriesRows"
          :key="index">
        <td v-for="(header, index2) in headers"
            :key="index2">
          <div class="categoryName"
               v-if="header.value === 'name'">
            {{ item[header.value] }}
          </div>

          <div class="card"
               v-else
               v-for="(applicationData, index3) in item[header.value]"
               :key="index3"
               :style="cardStyle">
            <ApplicationCard :data="applicationData"
                             @goToApp="goToApp"
                             @exploreApp="exploreApp"
                             @addAppToFavoris="addAppToFavoris" />
          </div>
        </td>
      </tr>
    </template>
  </v-data-table>
</template>

<script>
import ApplicationCard from "./applicationCard.vue";

export default {
  name: "GridComponent",
  components: {
    ApplicationCard,
  },
  props: {
    groups: { default: () => [] },
    categories: { default: () => [] },
  },
  data() {
    return {
      headers: [],
    };
  },
  mounted() {
    this.headers = this.formatHeaders(this.groups);
  },
  methods: {
    formatHeaders(headers) {
      return [{ text: "", value: "name" }, ...headers].map((el, index) => ({
        // width: index === 0 ? "100px" : "25% !important",
        text: el.text || el.name,
        value: el.id || el.value || el.name,
        sortable: false,
      }));
    },

    exploreApp(item) {
      this.$emit("exploreApp", item);
    },

    addAppToFavoris(item) {
      this.$emit("addAppToFavoris", item);
    },

    goToApp(item) {
      this.$emit("goToApp", item);
    },

    isMobile() {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        return true;
      } else {
        return false;
      }
    },
  },
  computed: {
    getWidth() {
      const headerLength = this.groups.length + 1;

      return {
        width: "100%",
        // width: headerLength <= 4 ? 20 * headerLength + "vw" : "100%",
      };
    },

    cardStyle() {
      const headerLength = this.groups.length;
      const width = headerLength < 2 && !this.isMobile() ? 32 : 100;

      return {
        width: `${width}%`,
        "margin-right": "10px",
      };
    },
    // firstColumnStyle() {
    //   return {
    //     width: "150px",
    //     background: "yellow",
    //   };
    // },
    // cardStyle() {
    //   return {
    //     width: `calc(${100 / this.groups.length}% - 100px)`,
    //     background: "yellow !important",
    //   };
    // },
  },
  watch: {
    groups() {
      this.headers = this.formatHeaders(this.groups);
    },
  },
};
</script>

<style lang="scss">
.dataTable {
  width: 100%;
  height: 98%;
  background-color: #f0f4f5 !important;
  table {
    margin-top: 10px;
    table-layout: fixed;
    border-collapse: separate !important;
    border-spacing: 15px 0 !important;

    thead {
      tr {
        th {
          background: #f0f4f5 !important;
          text-transform: uppercase;
          font-size: 0.8em !important;
          vertical-align: bottom;
          padding: 0px !important;
          font-weight: bolder;
          color: #6aa0ad !important;
          box-shadow: unset !important;
        }

        th:first-child {
          width: 20vw;
          max-width: 20vw;
        }
      }
    }

    tr.categoriesRows {
      td {
        height: 100px !important;
        border-top: 1px solid #adc8ce;
        > * {
          // width: 100%;
          display: inline-block;
          vertical-align: top;
        }
      }

      td:first-child {
        max-width: 20vw !important;
      }

      .categoryName {
        text-transform: uppercase;
        font-size: 0.6em;
        font-weight: bolder;
        color: #6aa0ad;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        /* width: 100px; */
      }
    }
  }
}
</style>

