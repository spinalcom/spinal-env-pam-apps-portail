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
      <NodeVisualization :dataprop="data"></NodeVisualization>
    </div>
    <div :class="fullDataClass">
      <div class="stat">
        <div class="stat-card">
          <StatCard :dataprop="data"></StatCard>
        </div>
        <div class="stat-card"></div>
      </div>
      <div class="header">
        <div>
          <div v-if="selectedNodeName == null" class="header-title">
            Réseau des automates
          </div>
          <div v-if="selectedNodeName !== null" class="header-title">
            {{ selectedNodeName }}
          </div>
          <div class="">Description de l'application</div>
        </div>
        <div class="stats">
          <div class="header-title">{{ datatoShow.length }}</div>
          <div>automates</div>
        </div>
      </div>

      <Table :data="data" />
    </div>
  </div>
</template>

<script lang="ts">
import { Prop, Vue } from "vue-property-decorator";
import Component from "vue-class-component";
import Table from "./Table.vue";

import { ActionTypes } from "../../interfaces/vuexStoreTypes";
import { Watch } from "vue-property-decorator";
import { log } from "console";
import NodeVisualization from "./NodeVisualtion.vue";
import StatCard from "./statistique-components/StatCard.vue";

@Component({
  name: "NodeItem",
  components: { Table, NodeVisualization, StatCard },
})
class NodeItem extends Vue {
  @Prop() data: any[];
  @Prop() DActive: boolean;
  @Prop() ActiveData: boolean;

  datatoShow: any = [];
  history: any[] = [];
  filteredData: any = [];
  selectedNodeIndex: number | null = null;
  selectedNodeName: string | null = null;
  dynamicId: number = 0;
  selectedStatus: string = "all";

  selectedType: string = "all";

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
    this.filterData();
    console.log("DAvtibe", this.DActive, "Active Data", this.ActiveData);
  }

  @Watch("DActive")
  onDActiveChanged(newVal: boolean, oldVal: boolean) {
    console.log(`DActive changed from ${oldVal} to ${newVal}`);
  }

  @Watch("ActiveData")
  onActiveDataChanged(newVal: boolean, oldVal: boolean) {
    console.log(`ActiveData changed from ${oldVal} to ${newVal}`);
  }
  get fullDataClass() {
    return {
      "Full-data": !this.DActive && this.ActiveData,
    };
  }
  get nodeInspectorClass() {
    return {
      dod: !this.DActive && this.ActiveData,
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
.stats {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: end;
}
.header-title {
  font-size: 1.5rem;
  font-weight: bold;
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
  font-family: Charlevoix Pro !important;
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
  margin-bottom: 10px;
}
.stat-card {
  width: 48%;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 10px;
}
.Full-data {
  width: 40%;
}
.displayn {
  display: none;
}
.dod {
  width: 58%;
  // margin-right: 2%;
  height: 500px;
  // background: red;
  display: block;
}
.fullContainer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px;
}
</style>
