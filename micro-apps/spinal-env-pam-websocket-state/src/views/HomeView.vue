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
  <v-container class="_container"
               fluid>
    <v-card v-if="page === pages.normal"
            class="normalState"
            elevation="4">
      <div class="header">
        <v-card class="stateCard"
                elevation="4">
          <div class="_circle online"></div>
          <div class="message"><span>En ligne :</span></div>
          <div class="count online">{{ nbEnligne }}</div>
        </v-card>

        <v-card class="stateCard"
                elevation="4">
          <div class="_circle offline"></div>
          <div class="message"><span>Hors ligne :</span></div>
          <div class="count offline">{{ nbHorsligne }}</div>
        </v-card>
      </div>

      <div class="content">
        <!-- <TableComponent :logs="logs" /> -->

        <v-tabs vertical
                class="tabsContainer">
          <v-tab v-for="item of webSocketLogs"
                 :key="item.building.id">
            <!-- <v-icon left
                    :color="getLogType(item)">
              {{getIcon(item)}}
            </v-icon> -->
            <div class="_circle"
                 left
                 :class="getLogType(item)"></div>
            {{item.building.name}}
          </v-tab>

          <v-tab-item v-for="item of webSocketLogs"
                      :key="item.id">
            <TableComponent :logs="item.logs" />
          </v-tab-item>
        </v-tabs>

        <!--   <div class="state">
          <h1>Etat Actuel</h1>
          <div class="icon">

            <v-icon size="100px"
                    color="success">mdi-checkbox-marked-circle-outline</v-icon>

            <div class="message">
              Une plateforme d'authentification a dejà été enregistée
            </div>
          </div> 
        </div>-->

        <!-- <div class="logs"> 
         <v-alert shaped
                   outlined
                   v-for="log in logs"
                   :type="getLogType(log)"
                   :key="log.date">

            <div class="message">
              {{log.message}}
            </div>

            <div class="date">
              {{getDate(log)}}
            </div>

          </v-alert> 

        </div> -->
      </div>

    </v-card>

    <div class="loading"
         v-else-if="page === pages.loading">
      <v-progress-circular :size="70"
                           color="primary"
                           indeterminate></v-progress-circular>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import TableComponent from "../components/tableComponent.vue";
import { mapActions, mapState } from "vuex";
import { logTypes } from "../store/constants";

export default Vue.extend({
  name: "HomeComponent",
  components: {
    TableComponent,
  },
  data() {
    this.pages = Object.freeze({
      normal: 1,
      loading: 2,
    });
    return {
      page: this.pages.normal,
    };
  },
  async mounted() {
    this.page = this.pages.loading;
    await this.createPoolingRequest();
    this.page = this.pages.normal;
    console.log(this.webSocketLogs);
  },

  methods: {
    ...mapActions(["getWebSocketLogs"]),

    async createPoolingRequest() {
      await this.getWebSocketLogs();
      // setInterval(async () => {
      //   await this.getWebSocketLogs();
      // }, 10000);
    },

    getIcon(item) {
      return item.state === logTypes.Normal
        ? "mdi-check"
        : "mdi-alert-circle-outline";
    },
    getLogType(item) {
      // return item.state === logTypes.Normal ? "green" : "#ff5252";
      return {
        online: item.state === logTypes.Normal,
        offline: item.state !== logTypes.Normal,
      };
    },
  },
  computed: {
    ...mapState(["webSocketLogs"]),
    nbEnligne() {
      return (this.webSocketLogs || []).filter(
        (el) => el.state === logTypes.Normal
      ).length;
    },
    nbHorsligne() {
      return (this.webSocketLogs || []).filter(
        (el) => el.state !== logTypes.Normal
      ).length;
    },
  },
  watch: {},
});
</script>

<style lang="scss">
._container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: end;

  ._circle {
    width: 15px;
    height: 15px;
    border-radius: 100% !important;
    margin-right: 5px;
  }

  ._circle.online {
    background: green;
  }

  ._circle.offline {
    background: #ff5252;
  }

  .normalState {
    width: 99%;
    height: calc(100% - 60px);
    padding: 10px;
    background: transparent !important;
    .header {
      width: 100%;
      height: 130px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      .stateCard {
        width: 25%;
        height: 80%;
        margin-right: 15px;
        background: transparent;
        display: flex;
        align-items: center;
        padding: 0 30px;
      }

      .count {
        font-size: 3em;
      }

      .count.online {
        color: green !important;
      }
      .count.offline {
        color: #ff5252 !important;
      }
      .message {
        // height: 100%;
        margin: 0 15px;
        font-size: 25px;
      }
    }

    .content {
      width: 100%;
      height: calc(100% - 150px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 5px;

      .tabsContainer {
        background: transparent !important;
      }

      .tabsContainer {
        .v-tabs-bar,
        .v-tabs-items {
          height: 100%;
          background: transparent !important;
          overflow: auto;
        }

        .v-tabs-items {
          width: calc(100% - 160px);
        }

        .v-tabs-bar {
          width: 160px;
          border-right: 1px dashed grey;
        }
      }

      .state {
        width: 100%;
        height: 20%;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .logs {
        width: 100%;
        max-height: calc(80% - 60px);
        padding: 10px;
        overflow: auto;

        .date {
          text-align: right;
        }
      }
    }
  }

  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>

<style>
.successBtn {
  width: 60px !important;
  height: 40px;
  border: 1px solid green;
  color: green !important;
  border-radius: 5px;
  margin: 5px;
}

.errorBtn {
  width: 75px !important;
  height: 40px;
  border: 1px solid #ff5252;
  color: #ff5252 !important;
  border-radius: 5px;
  margin: 5px;
}
</style>
