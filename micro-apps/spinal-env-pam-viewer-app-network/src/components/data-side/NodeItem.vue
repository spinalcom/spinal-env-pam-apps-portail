<!--
Copyright 2024 SpinalCom - www.spinalcom.com

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
  <div :class="fullContainerClass">
    <div class="displayn" :class="nodeInspectorClass">
      <NodeVisualization
        :dataprop="data"
        @toggle-full-view="toggleFullView"
      ></NodeVisualization>
    </div>
    <div :class="fullDataClass">
      <div class="stat-hide-container">
        <div class="header-title">Analyse Statistique</div>
        <div @click="toggleStats" style="display: flex; flex-direction: row">
          <div
            :title="
              statsVisible
                ? 'Masquer les statistiques'
                : 'Afficher les statistiques'
            "
            class="toggle-img"
            :class="{ rotated: statsVisible }"
          ></div>
        </div>
      </div>
      <div class="stat">
        <div
          class="stat-card"
          :style="{ height: statsVisible ? '150px' : '0px' }"
        >
          <StatCard
            :dataprop="data"
            @changeRoute="changeApp"
            :config="config"
            :showDetailsProp.sync="showDetailsProp"
          ></StatCard>
        </div>
        <div class="stat-card2" :style="{ height: false ? '150px' : '0px' }">
          <TypeCard
            :dataprop="data"
            :showDetailsProp.sync="showDetailsProp"
          ></TypeCard>
        </div>
      </div>
      <div
        style="
          background-color: #14202c;
          width: 100%;
          height: 1px;
          opacity: 0.2;
        "
      ></div>
      <!-- <div class="stat-hide-container">
        <div>
          <div class="header-title">Context Hardware</div>
          <div class="description-text">
            Les contextes hardware disponible sur l'étage
          </div>
        </div>
      </div>
      <div class="hardware">
        <HardwareContext
          :data="hardwareContextData"
          :selectedDynamicId="selectedHardwareContext"
          @update-selected="updateSelectedContext"
        />
      </div> -->

      <div class="header">
        <div class="header-left">
          <div v-if="selectedNodeName == null" class="header-title">
            Réseau du {{ selectedHardwareContextName }}
          </div>
          <!-- <div v-if="selectedNodeName !== null" class="header-title">
            {{ selectedNodeName }}
          </div> -->
          <div class="description-text">
            Les contextes hardware disponible sur l'étage
          </div>
        </div>
        <div class="header-right">
          <HardwareContext
            :data="hardwareContextData"
            :selectedDynamicId="selectedHardwareContext"
            @update-selected="updateSelectedContext"
          />
          <!-- <div class="header-title">{{ datatoShow.length }}</div>
          <div class="description-text">automates</div> -->
        </div>
      </div>
      <TreeTable
        :data="data"
        :config="config"
        @node-click="handleNodeClickofCard"
      />
      <!-- <Table :data="data" /> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";
import Component from "vue-class-component";
import Table from "./Table.vue";
import TreeTable from "./TreeTable.vue";

import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { Watch } from "vue-property-decorator";
import { log } from "console";
import NodeVisualization from "./NodeVisualtion.vue";
import StatCard from "./statistique-components/StatCard.vue";
import TypeCard from "./statistique-components/TypeCard.vue";

import HardwareContext from "./HardwareContext.vue";
import { IConfig } from "../../interfaces/IConfig";

@Component({
  name: "NodeItem",
  components: {
    Table,
    NodeVisualization,
    StatCard,
    TypeCard,
    HardwareContext,
    TreeTable,
  },
})
class NodeItem extends Vue {
  @Prop() data: any[];
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;
  @Prop() config: IConfig;
  @Prop() hardwareContextData: any[]; // Receive hardware context data
  @Prop() selectedHardwareContext: number; // Receive selected hardware context
  showDetailsProp: boolean = false;
  datatoShow: any = [];
  history: any[] = [];
  filteredData: any = [];
  selectedNodeIndex: number | null = null;
  selectedNodeName: string | null = null;
  dynamicId: number = 0;
  selectedStatus: string = "all";
  statsVisible: boolean = false;

  selectedType: string = "all";
  query: {
    app: string;
    mode: string;
    name: string;
    spaceSelectedId: string;
    buildingId: string;
  } = {
    app: "",
    mode: "null",
    name: "",
    spaceSelectedId: "",
    buildingId: "",
  };

  isFullViewActive: boolean = false;
  isNormalViewActive: boolean = true;

  selectedHardwareContextName: string = "";

  updateSelectedContext(dynamicId: number) {
    this.$emit("updateSelectedHardwareContext", dynamicId);
    this.$store.dispatch(ActionTypes.REMOVE_ALL_LINES);
  }
  toggleStats(show: boolean) {
    this.statsVisible = !this.statsVisible;
  }
  toggleFullView() {
    console.log(
      "toggleFullView",
      this.isFullViewActive,
      this.isNormalViewActive
    );
    if (!this.isFullViewActive && this.isNormalViewActive) {
      this.isFullViewActive = true;
      this.isNormalViewActive = false;
    } else {
      this.isFullViewActive = false;
      this.isNormalViewActive = true;
    }
  }
  toggleNode(index: number) {
    // this.history.push([...this.datatoShow]); // Save current state to history
    this.history.push({
      data: [...this.datatoShow],
      name: this.selectedNodeName,
      dynamicId: this.dynamicId,
    });
    console.log("history", this.history);
    this.selectedNodeIndex = index; // Set the selected node index
    this.selectedNodeName = this.datatoShow[index].name;
    this.dynamicId = this.datatoShow[index].dynamicId;
    this.$store.dispatch(ActionTypes.SELECT_SPRITES, [
      String(this.datatoShow[index].dynamicId),
    ]);
    if (this.datatoShow[index].nodes) {
      this.datatoShow = this.datatoShow[index].nodes || [];
      this.selectedNodeIndex = null;
    }
    this.filterData();
  }
  filterData() {
    this.filteredData = this.datatoShow.filter((d) => {
      const statusMatch =
        this.selectedStatus === "all" || d.status === this.selectedStatus;
      const typeMatch =
        this.selectedType === "all" || d.type === this.selectedType;
      return statusMatch && typeMatch;
    });
  }
  async mounted() {
    this.datatoShow = this.data;
    for (let i = 0; i < this.hardwareContextData.length; i++) {
      if (
        this.hardwareContextData[i].dynamicId === this.selectedHardwareContext
      ) {
        this.selectedHardwareContextName = this.hardwareContextData[i].nodes[0];
      }
    }
    this.filterData();
  }
  handleNodeClickofCard(node: any) {
    this.$emit("node-click", node);
  }

  changeApp(e) {
    this.query.app = e;
    console.log("changeApp", e);
    this.changeRoute();
  }
  changeRoute() {
    console.log("changeRoute", this.query);
    window.parent.routerFontion.customPush(
      window.parent.router.path,
      this.query
    );
  }

  @Watch("DActive")
  onDActiveChanged(newVal: boolean, oldVal: boolean) {
    // console.log(`DActive changed from ${oldVal} to ${newVal}`);
  }

  @Watch("ActiveData")
  onActiveDataChanged(newVal: boolean, oldVal: boolean) {
    // console.log(`ActiveData changed from ${oldVal} to ${newVal}`);
  }
  get fullDataClass() {
    return {
      "Full-data": !this.DActive && this.ActiveData,
      "normal-inspector": !this.isNormalViewActive,
    };
  }
  get nodeInspectorClass() {
    return {
      dod: !this.DActive && this.ActiveData,
      "full-inspector": this.isFullViewActive,
    };
  }
  get fullContainerClass() {
    return {
      fullContainer: !this.DActive && this.ActiveData,
    };
  }
}

export { NodeItem };
export default NodeItem;
</script>

<style lang="scss">
.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.header-right {
  width: 48%;
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: end;
}
.header-left {
  width: 52%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
}
.header-title {
  font-size: 1.3rem;
  font-weight: bold;
}
.description-text {
  font-size: 0.9rem;
  color: #8a8a8a;
  margin-top: -5px;
}
.list {
  list-style-type: none;
  padding-left: 0 !important;
  margin: 0;
}
.listChildren {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.v-application ol,
.v-application ul {
  padding-left: 0px;
}
.childrenButton {
  background-image: url("../viewer/assets/down-arrow.svg");
  background-size: contain;
  width: 15px;
  height: 15px;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
.nodeItem {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0px;
  border-bottom: 1px solid #f1f1f1;
  cursor: pointer;
}
.nodeItem:hover {
  background: #f1f1f1;
}
.nodeItem > span,
.nodeItem > div,
.nodeItem > button {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nodeItem.selected {
  background-color: #e0e0e0;
}
.dataHeader {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 25px;
  margin-bottom: 10px;
}
.inner-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 65px;
  padding: 1px;
  font-family: charlevoix, sans-serif !important;
  font-weight: 600;
  font-size: 13px;
}

// .inner-circle {
//   width: 9px;
//   height: 9px;
//   border-radius: 50%;
// }

.status-active {
  border-color: #d2fece;
  background-color: #d2fece;
  color: #325e4b;
  border-radius: 10px;
}

.status-inactive {
  border-color: #ffe3eb;
  background-color: #ffe3eb;
  color: #d7270c;
  border-radius: 8px;
}
.status-unknown {
  border-color: #ffebd4;
  background-color: #ffebd4;
  color: #f49700;
  border-radius: 8px;
}
.backButton {
  margin-bottom: 8px;
}
.stat {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.stat-card {
  width: 100%;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-top: 2px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
  transition: height 0.5s ease;
  overflow: hidden; /* Ensures content doesn't overflow when height is 0 */
  // height: 200px !important; /* Default height */
  margin-bottom: 10px;
}
.stat-card2 {
  width: 0%;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-top: 2px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
  transition: height 0.5s ease;
  overflow: hidden; /* Ensures content doesn't overflow when height is 0 */
  // height: 200px !important; /* Default height */
  margin-bottom: 10px;
}
.Full-data {
  width: 40%;
  transition: width 0.5s ease;
  opacity: 1;
}
.displayn {
  display: none;
}
.dod {
  width: 58%;
  // margin-right: 2%;
  height: 100%;
  // background: red;
  display: block;
  transition: width 0.5s ease;
}

.normal-inspector {
  width: 0%;

  opacity: 0;
  transition: width 0.5s ease;
}

.full-inspector {
  width: 100%;
  transition: width 0.5s ease;
}

.fullContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
  height: 100% !important;
}
.hardware {
  height: 80px;
  width: 100%;
  margin-bottom: 10px;
}
.stat-hide-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

// Hide the "Show Stats" or "Hide Stats" buttons
.stat-hide-container p {
  display: inline-block;
  cursor: pointer;
}

.stat-hide-container p:nth-child(2) {
  display: none;
}

.stat-hide-container p:first-child {
  display: none;
}

.stat-hide-container p:last-child {
  display: inline-block;
}
// .show-img {
//   height: 15px;
//   width: 15px;
//   background-image: url("./assets/right-blue.svg");
//   background-size: contain;
//   background-position: center;
//   cursor: pointer;
//   transform: rotate(90deg);
// }
// .hide-img {
//   height: 15px;
//   width: 15px;
//   background-image: url("./assets/right-blue.svg");
//   background-size: contain;
//   background-position: center;
//   cursor: pointer;
//   transform: rotate(270deg);
// }
.toggle-img {
  height: 15px;
  width: 15px;
  background-image: url("./assets/right-blue.svg");
  background-size: contain;
  background-position: center;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
}

.toggle-img.rotated {
  transform: rotate(270deg);
}

.toggle-img:not(.rotated) {
  transform: rotate(90deg);
}
</style>